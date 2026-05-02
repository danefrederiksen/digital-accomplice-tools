// Post-publish JSON-LD schema audit.
// Fetches a published article URL, extracts every <script type="application/ld+json"> block,
// and validates each against the GEO skill's required fields.
// Run: node scripts/audit-schema.js https://www.digitalaccomplice.com/post/<slug>

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = join(__dirname, '..', 'audits');

const url = process.argv[2];
if (!url || !url.startsWith('http')) {
  console.error('Usage: node scripts/audit-schema.js <full-https-url>');
  process.exit(1);
}

const ISO_8601_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/;

function extractJsonLdBlocks(html) {
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function validate(schema, idx) {
  const issues = { errors: [], warnings: [] };
  const type = schema['@type'];
  if (!type) {
    issues.errors.push('Missing @type field');
    return { type: 'Unknown', issues };
  }

  if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    if (!schema.headline) issues.errors.push('Article: missing headline');
    if (!schema.description) issues.warnings.push('Article: missing description (recommended)');
    if (!schema.author?.name) issues.errors.push('Article: missing author.name');
    if (!schema.publisher?.name) issues.warnings.push('Article: missing publisher.name');
    if (!schema.datePublished) issues.errors.push('Article: missing datePublished');
  } else if (type === 'FAQPage') {
    const entities = schema.mainEntity;
    if (!Array.isArray(entities) || entities.length === 0) {
      issues.errors.push('FAQPage: mainEntity missing or empty');
    } else {
      entities.forEach((q, i) => {
        if (!q.name) issues.errors.push(`FAQPage Q${i + 1}: missing question name`);
        if (!q.acceptedAnswer?.text) issues.errors.push(`FAQPage Q${i + 1}: missing acceptedAnswer.text`);
      });
    }
  } else if (type === 'VideoObject') {
    if (!schema.name) issues.errors.push('VideoObject: missing name');
    if (!schema.description) issues.warnings.push('VideoObject: missing description (recommended)');
    if (!schema.thumbnailUrl) issues.errors.push('VideoObject: missing thumbnailUrl');
    if (!schema.contentUrl) issues.errors.push('VideoObject: missing contentUrl');
    if (!schema.uploadDate) {
      issues.errors.push('VideoObject: missing uploadDate');
    } else if (!ISO_8601_TZ.test(schema.uploadDate)) {
      issues.errors.push(`VideoObject: uploadDate "${schema.uploadDate}" is not ISO 8601 with timezone (expected YYYY-MM-DDTHH:MM:SS-07:00 or Z)`);
    }
  }

  return { type, issues };
}

function detectDuplicates(results) {
  const counts = {};
  results.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
  const dupes = [];
  for (const [type, n] of Object.entries(counts)) {
    if (n > 1 && type !== 'FAQPage') {
      dupes.push(`${n}× ${type} schemas detected (Wix may be auto-generating one on top of yours — non-blocking but worth knowing)`);
    }
  }
  return dupes;
}

function buildReport(results, duplicates, fetchedUrl) {
  const lines = [];
  const stamp = new Date().toISOString();
  lines.push('═══════════════════════════════════════════');
  lines.push(' GEO Schema Audit');
  lines.push('═══════════════════════════════════════════');
  lines.push(`URL:     ${fetchedUrl}`);
  lines.push(`Audited: ${stamp}`);
  lines.push(`Schemas: ${results.length} found`);
  lines.push('');

  let totalErrors = 0;
  let totalWarnings = 0;

  results.forEach((r, i) => {
    const status = r.parseError
      ? 'INVALID JSON'
      : r.issues.errors.length
      ? 'FAIL'
      : r.issues.warnings.length
      ? 'WARN'
      : 'PASS';
    lines.push(`── Schema ${i + 1}: ${r.type} [${status}] ──`);
    if (r.parseError) {
      lines.push(`  JSON parse error: ${r.parseError}`);
      totalErrors++;
    } else {
      r.issues.errors.forEach(e => { lines.push(`  ✗ ${e}`); totalErrors++; });
      r.issues.warnings.forEach(w => { lines.push(`  ⚠ ${w}`); totalWarnings++; });
      if (!r.issues.errors.length && !r.issues.warnings.length) lines.push('  All required fields present.');
    }
    lines.push('');
  });

  if (duplicates.length) {
    lines.push('── Duplicates ──');
    duplicates.forEach(d => lines.push(`  ⚠ ${d}`));
    lines.push('');
  }

  const summary = totalErrors
    ? `RESULT: FAIL — ${totalErrors} error(s), ${totalWarnings} warning(s)`
    : totalWarnings
    ? `RESULT: PASS WITH WARNINGS — ${totalWarnings} warning(s)`
    : `RESULT: PASS — all schemas valid`;
  lines.push('═══════════════════════════════════════════');
  lines.push(summary);
  lines.push('═══════════════════════════════════════════');

  return { text: lines.join('\n'), totalErrors, totalWarnings };
}

function slugFromUrl(u) {
  const path = new URL(u).pathname;
  const last = path.split('/').filter(Boolean).pop() || 'page';
  return last.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
}

async function main() {
  console.log(`Fetching ${url} ...\n`);
  const res = await fetch(url, { headers: { 'User-Agent': 'DA-SchemaAudit/1.0' } });
  if (!res.ok) {
    console.error(`HTTP ${res.status} — ${res.statusText}`);
    process.exit(1);
  }
  const html = await res.text();
  const blocks = extractJsonLdBlocks(html);

  if (blocks.length === 0) {
    console.error('No <script type="application/ld+json"> blocks found on page.');
    console.error('If this is a Wix post, confirm the post is published and Structured Data is filled in under SEO → Advanced.');
    process.exit(2);
  }

  const results = blocks.map((raw, i) => {
    try {
      const parsed = JSON.parse(raw);
      const v = validate(parsed, i);
      return { type: v.type, issues: v.issues, raw };
    } catch (e) {
      return { type: 'Invalid', parseError: e.message, issues: { errors: [], warnings: [] }, raw };
    }
  });

  const duplicates = detectDuplicates(results);
  const { text, totalErrors, totalWarnings } = buildReport(results, duplicates, url);

  console.log(text);

  if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const outPath = join(AUDIT_DIR, `${slugFromUrl(url)}-${date}.txt`);
  writeFileSync(outPath, text);
  console.log(`\nReport saved to: ${outPath}`);

  process.exit(totalErrors ? 1 : 0);
}

main().catch(e => {
  console.error('Audit failed:', e.message);
  process.exit(1);
});
