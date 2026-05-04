// One-command interview publisher. Chains: N shorts → long-form → re-publish shorts → audit → YouTube metadata.
// Solves the order-of-operations gotcha: shorts need the long-form Wix URL in their body, but
// the long-form URL doesn't exist until publish. So we publish shorts first with a placeholder,
// publish the long-form, then re-publish the shorts with the real URL substituted in.
//
// Markdown files MUST contain these literal placeholders:
//   In <guest>-article.md:        __SHORT_1_WIX_URL__, __SHORT_2_WIX_URL__, ... __SHORT_N_WIX_URL__
//   In each <guest>-short-*.md:   __LONGFORM_WIX_URL__
//
// Files are discovered by guest-slug from output-samples/. The number of shorts is detected
// dynamically — drop in 2, 3, 4, 5+ short markdown files and the orchestrator handles it.
//
// Run: node --env-file=.env scripts/publish-interview.js --guest <slug> [flags]
//
// Flags:
//   --dry-run                          Print the plan without making API calls
//   --skip-audit                       Skip the post-publish schema audit
//   --youtube-only                     Skip Wix entirely; only patch YouTube metadata.
//                                      Use this to re-patch YouTube without re-publishing
//                                      (and re-duplicating) Wix posts.
//   --youtube-longform-id <videoId>    Patch this YouTube video with long-form metadata
//   --youtube-short-N-id <videoId>     Patch short N (where N is 1, 2, 3, 4, ...) with metadata
//
// YouTube patches require <guest>-youtube-metadata.md in output-samples/ AND .env credentials
// (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN). Each ID is independent —
// pass any subset.
//
// Example (Wix only):
//   node --env-file=.env scripts/publish-interview.js --guest christopher-penn
//
// Example (Wix + all 5 YouTube videos for a 4-short guest):
//   node --env-file=.env scripts/publish-interview.js --guest kaleigh-moore \
//     --youtube-longform-id <id> \
//     --youtube-short-1-id <id> --youtube-short-2-id <id> \
//     --youtube-short-3-id <id> --youtube-short-4-id <id>

import { readFile, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import {
  extractTitle,
  extractJsonLdScripts,
  buildSeoData,
  markdownToRicosWithVideo,
} from '../lib/markdown-to-ricos.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '..', 'output-samples');

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;
const MEMBER_ID = process.env.WIX_MEMBER_ID || 'b45d7151-61b1-41c1-88a7-570ee03bcc1e';

// ───────────────────────── arg parsing ─────────────────────────

const args = process.argv.slice(2);
function flag(name) { return args.includes(`--${name}`); }
function value(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
}

const guest = value('guest');
const dryRun = flag('dry-run');
const skipAudit = flag('skip-audit');
const youtubeOnly = flag('youtube-only');

// YouTube video IDs — all optional. Each enables one PUT to the YouTube Data API after Wix publish.
// Long-form is fixed; short IDs are parsed dynamically (--youtube-short-N-id for any N).
const youtubeIds = {
  longform: value('youtube-longform-id'),
  shorts: {}, // populated after we know how many shorts there are
};

if (!guest) {
  console.error('Usage: node scripts/publish-interview.js --guest <slug> [flags]');
  console.error('');
  console.error('Looks in output-samples/ for these files:');
  console.error('  <guest>-article.md');
  console.error('  <guest>-short-N-*.md   (any number of shorts; N starts at 1)');
  console.error('  <guest>-youtube-metadata.md  (only if any --youtube-*-id is passed)');
  console.error('');
  console.error('Optional flags: --dry-run --skip-audit');
  console.error('YouTube flags:  --youtube-longform-id  --youtube-short-N-id (for each short N)');
  process.exit(1);
}

if (!dryRun && (!API_KEY || !SITE_ID)) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID in .env');
  process.exit(1);
}

// ───────────────────────── file discovery ─────────────────────────

const files = await readdir(OUTPUT_DIR);
const longformPath = files.find(f => f === `${guest}-article.md`);

// Discover all shorts dynamically: <guest>-short-N-*.md for any positive integer N.
const shortFileRegex = new RegExp(`^${guest.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}-short-(\\d+)-.+\\.md$`);
const discoveredShorts = files
  .map(f => {
    const m = f.match(shortFileRegex);
    return m ? { name: f, index: parseInt(m[1], 10) } : null;
  })
  .filter(Boolean)
  .sort((a, b) => a.index - b.index);

if (!longformPath) bail(`Long-form not found: expected ${guest}-article.md in output-samples/`);
if (discoveredShorts.length === 0) bail(`No shorts found: expected ${guest}-short-1-*.md (and optionally short-2, short-3, ...) in output-samples/`);

// Sanity-check: short indexes should be contiguous starting at 1 (1, 2, 3, ... no gaps).
for (let i = 0; i < discoveredShorts.length; i++) {
  if (discoveredShorts[i].index !== i + 1) {
    bail(`Short numbering is not contiguous: found ${discoveredShorts.map(s => s.index).join(', ')}. Shorts must be numbered 1..N with no gaps.`);
  }
}

const SHORT_COUNT = discoveredShorts.length;

const longform = { name: longformPath, path: join(OUTPUT_DIR, longformPath), md: await readFile(join(OUTPUT_DIR, longformPath), 'utf8') };
const shorts = await Promise.all(discoveredShorts.map(async (s) => ({
  index: s.index,
  name: s.name,
  path: join(OUTPUT_DIR, s.name),
  md: await readFile(join(OUTPUT_DIR, s.name), 'utf8'),
})));

// Now that we know how many shorts there are, parse all --youtube-short-N-id flags.
for (let n = 1; n <= SHORT_COUNT; n++) {
  const id = value(`youtube-short-${n}-id`);
  if (id) youtubeIds.shorts[n] = id;
}
const anyYoutube = Boolean(youtubeIds.longform) || Object.keys(youtubeIds.shorts).length > 0;

const youtubeMetadataPath = files.find(f => f === `${guest}-youtube-metadata.md`);
if (anyYoutube && !youtubeMetadataPath) {
  bail(`YouTube IDs passed but ${guest}-youtube-metadata.md not found in output-samples/. Generate it via youtube-upload-optimizer first.`);
}

// ───────────────────────── placeholder validation ─────────────────────────

const SHORT_PLACEHOLDERS = Array.from({ length: SHORT_COUNT }, (_, i) => `__SHORT_${i + 1}_WIX_URL__`);
const LONGFORM_PLACEHOLDER = '__LONGFORM_WIX_URL__';

const longformPlaceholderHits = SHORT_PLACEHOLDERS.filter(p => longform.md.includes(p));
const longformMissing = SHORT_PLACEHOLDERS.filter(p => !longform.md.includes(p));

const shortsPlaceholderHits = shorts.map(s => s.md.includes(LONGFORM_PLACEHOLDER));

console.log('═══════════════════════════════════════════');
console.log(` publish-interview — ${guest}${dryRun ? '  [DRY RUN]' : ''}`);
console.log('═══════════════════════════════════════════');
console.log(`Long-form:  ${longform.name}`);
shorts.forEach(s => console.log(`Short ${s.index}:    ${s.name}`));
console.log('');
console.log(`Detected ${SHORT_COUNT} short${SHORT_COUNT === 1 ? '' : 's'}.`);
console.log(`Long-form placeholders found: ${longformPlaceholderHits.length}/${SHORT_COUNT}${longformMissing.length ? ' (missing: ' + longformMissing.join(', ') + ')' : ''}`);
shorts.forEach((s, i) => console.log(`Short ${s.index} placeholder found:        ${shortsPlaceholderHits[i] ? 'yes' : 'NO — short will publish without long-form backlink substitution'}`));
console.log('');

if (anyYoutube) {
  console.log('YouTube IDs to patch:');
  if (youtubeIds.longform) console.log(`  Long-form: ${youtubeIds.longform}`);
  for (const [n, id] of Object.entries(youtubeIds.shorts)) {
    console.log(`  Short ${n}:   ${id}`);
  }
  console.log(`Metadata file: ${youtubeMetadataPath}`);
  console.log('');
}

if (dryRun) {
  console.log('Dry run — no API calls. Plan:');
  console.log(`  1. Publish ${SHORT_COUNT} short${SHORT_COUNT === 1 ? '' : 's'} (with __LONGFORM_WIX_URL__ still in body)`);
  console.log(`  2. Substitute the ${SHORT_COUNT} short URL${SHORT_COUNT === 1 ? '' : 's'} into long-form body`);
  console.log('  3. Publish long-form');
  console.log('  4. Substitute long-form URL into each short, update-and-republish');
  console.log(skipAudit ? '  5. (audit skipped via --skip-audit)' : `  5. Audit all ${SHORT_COUNT + 1} published URLs`);
  if (anyYoutube) console.log('  6. Patch YouTube metadata for each provided video ID');
  process.exit(0);
}

// ───────────────────────── Wix API helpers ─────────────────────────

async function createDraft(md) {
  const title = extractTitle(md);
  if (!title) throw new Error('No H1 found in markdown');
  const richContent = markdownToRicosWithVideo(md);
  const jsonLdScripts = extractJsonLdScripts(md);
  const seoData = jsonLdScripts.length ? buildSeoData(jsonLdScripts) : undefined;

  const res = await fetch('https://www.wixapis.com/blog/v3/draft-posts', {
    method: 'POST',
    headers: { 'Authorization': API_KEY, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftPost: { title, memberId: MEMBER_ID, richContent, ...(seoData ? { seoData } : {}) } }),
  });
  if (!res.ok) throw new Error(`createDraft HTTP ${res.status}: ${(await res.text()).slice(0, 800)}`);
  const { draftPost } = await res.json();
  return { draftId: draftPost.id, title };
}

async function publishDraft(draftId) {
  const res = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': API_KEY, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`publishDraft HTTP ${res.status}: ${(await res.text()).slice(0, 800)}`);
  const { postId } = await res.json();

  const getRes = await fetch(`https://www.wixapis.com/blog/v3/posts/${postId}`, {
    headers: { 'Authorization': API_KEY, 'wix-site-id': SITE_ID },
  });
  if (!getRes.ok) throw new Error(`fetch published post HTTP ${getRes.status}`);
  const { post } = await getRes.json();
  return { postId, slug: post.slug, url: `https://www.digitalaccomplice.com/post/${post.slug}` };
}

async function updateDraft(draftId, md) {
  const title = extractTitle(md);
  const richContent = markdownToRicosWithVideo(md);
  const jsonLdScripts = extractJsonLdScripts(md);
  const seoData = jsonLdScripts.length ? buildSeoData(jsonLdScripts) : undefined;

  const res = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${draftId}`, {
    method: 'PATCH',
    headers: { 'Authorization': API_KEY, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftPost: { title, richContent, ...(seoData ? { seoData } : {}) } }),
  });
  if (!res.ok) throw new Error(`updateDraft HTTP ${res.status}: ${(await res.text()).slice(0, 800)}`);
}

// ───────────────────────── orchestration ─────────────────────────

const results = { shorts: [], longform: null };

if (youtubeOnly) {
  if (!anyYoutube) {
    bail('--youtube-only requires at least one --youtube-*-id flag.');
  }
  console.log('── --youtube-only mode: skipping Wix publish + substitution + audit ──');
  console.log('');
}

if (!youtubeOnly) {

console.log(`── Step 1: publish ${SHORT_COUNT} short${SHORT_COUNT === 1 ? '' : 's'} ──`);
for (const s of shorts) {
  process.stdout.write(`  Short ${s.index}: creating draft... `);
  const { draftId } = await createDraft(s.md);
  process.stdout.write(`draft ${draftId.slice(0, 8)}... publishing... `);
  const published = await publishDraft(draftId);
  console.log(`live`);
  console.log(`           ${published.url}`);
  results.shorts.push({ ...s, draftId, ...published });
}
console.log('');

console.log('── Step 2: substitute short URLs into long-form ──');
let longformMd = longform.md;
results.shorts.forEach((s, i) => {
  const placeholder = SHORT_PLACEHOLDERS[i];
  const hits = longformMd.split(placeholder).length - 1;
  longformMd = longformMd.split(placeholder).join(s.url);
  console.log(`  ${placeholder} → ${s.url}  (${hits} replacement${hits === 1 ? '' : 's'})`);
});
console.log('');

console.log('── Step 3: publish long-form ──');
process.stdout.write(`  creating draft... `);
const longformDraft = await createDraft(longformMd);
process.stdout.write(`draft ${longformDraft.draftId.slice(0, 8)}... publishing... `);
const longformPublished = await publishDraft(longformDraft.draftId);
console.log(`live`);
console.log(`  ${longformPublished.url}`);
results.longform = { ...longform, draftId: longformDraft.draftId, ...longformPublished };
console.log('');

console.log('── Step 4: substitute long-form URL into shorts and re-publish ──');
for (const s of results.shorts) {
  const newMd = s.md.split(LONGFORM_PLACEHOLDER).join(longformPublished.url);
  const replacements = s.md.split(LONGFORM_PLACEHOLDER).length - 1;
  process.stdout.write(`  Short ${s.index}: ${replacements} replacement${replacements === 1 ? '' : 's'}, updating draft... `);
  await updateDraft(s.draftId, newMd);
  process.stdout.write(`re-publishing... `);
  await publishDraft(s.draftId);
  console.log(`done`);
}
console.log('');

if (!skipAudit) {
  console.log('── Step 5: audit schemas ──');
  const auditScript = resolve(__dirname, 'audit-schema.js');
  const allUrls = [results.longform.url, ...results.shorts.map(s => s.url)];
  for (const url of allUrls) {
    console.log(`  Auditing ${url}`);
    try {
      execSync(`node "${auditScript}" "${url}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`  Audit failed for ${url} (continuing)`);
    }
  }
  console.log('');
} else {
  console.log('── Step 5: audit skipped (--skip-audit) ──\n');
}

} // end if (!youtubeOnly)

const youtubeResults = [];
if (anyYoutube) {
  console.log('── Step 6: patch YouTube metadata ──');
  const updateScript = resolve(__dirname, 'update-youtube-video.js');
  const metadataPath = join(OUTPUT_DIR, youtubeMetadataPath);
  const patches = [
    { id: youtubeIds.longform, label: 'Long-form', section: 'Long-Form Interview' },
    ...Array.from({ length: SHORT_COUNT }, (_, i) => ({
      id: youtubeIds.shorts[i + 1],
      label: `Short ${i + 1}`,
      section: `Short #${i + 1}`,
    })),
  ].filter(p => p.id);

  for (const p of patches) {
    console.log(`  ${p.label} (${p.id}) ← "${p.section}"`);
    try {
      // update-youtube-video.js needs YOUTUBE_* env vars — they're already loaded via --env-file=.env
      execSync(`node "${updateScript}" "${p.id}" "${metadataPath}" "${p.section}"`, { stdio: 'inherit' });
      youtubeResults.push({ ...p, ok: true });
    } catch (e) {
      console.error(`  YouTube patch failed for ${p.label} (continuing)`);
      youtubeResults.push({ ...p, ok: false });
    }
  }
  console.log('');
}

console.log('═══════════════════════════════════════════');
console.log(youtubeOnly ? ' YouTube-only patch complete' : ' Publish complete');
console.log('═══════════════════════════════════════════');
if (!youtubeOnly) {
  console.log(`Long-form: ${results.longform.url}`);
  results.shorts.forEach(s => console.log(`Short ${s.index}:   ${s.url}`));
}
if (youtubeResults.length) {
  if (!youtubeOnly) console.log('');
  console.log('YouTube metadata patches:');
  youtubeResults.forEach(r => console.log(`  ${r.label} (${r.id}): ${r.ok ? 'OK' : 'FAILED'}`));
}
if (!anyYoutube && !youtubeOnly) {
  console.log('');
  console.log('Next: upload videos to YouTube, then re-run with --youtube-*-id flags to patch metadata.');
}

function bail(msg) {
  console.error(msg);
  process.exit(1);
}
