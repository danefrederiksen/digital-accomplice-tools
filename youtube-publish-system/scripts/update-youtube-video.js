// Update a YouTube video's title, description, and tags by parsing them out of a metadata
// markdown file (the format produced by the youtube-upload-optimizer / publish-system pipeline).
//
// Run: node --env-file=.env scripts/update-youtube-video.js <videoId> <metadata.md> "<section heading match>"
//
// Example:
//   node --env-file=.env scripts/update-youtube-video.js Q4TBpdvcsCY \
//     output-samples/christopher-penn-youtube-metadata.md "Short #1"
//
// The "section heading match" is a substring matched against the H2 (## ...) heading that
// introduces the video's metadata block. The script then picks the title/description/tags
// from the fenced code blocks under that H2.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, or YOUTUBE_REFRESH_TOKEN in .env');
  console.error('Run setup-youtube-auth.js first to obtain a refresh token.');
  process.exit(1);
}

const [videoId, mdPath, sectionMatch] = process.argv.slice(2);
if (!videoId || !mdPath || !sectionMatch) {
  console.error('Usage: node scripts/update-youtube-video.js <videoId> <metadata.md> "<section heading match>"');
  process.exit(1);
}

const md = await readFile(resolve(mdPath), 'utf8');

function extractSection(md, sectionMatch) {
  const sectionRe = new RegExp(`^##\\s+[^\\n]*${sectionMatch.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|\\Z)`, 'm');
  const m = md.match(sectionRe);
  if (!m) throw new Error(`Section not found: ${sectionMatch}`);
  return m[1];
}

function extractFencedAfterHeading(section, headingMatch) {
  const re = new RegExp(`^###\\s+[^\\n]*${headingMatch}[^\\n]*\\n+\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'm');
  const m = section.match(re);
  if (!m) throw new Error(`Fenced block under "${headingMatch}" not found`);
  return m[1].trim();
}

const section = extractSection(md, sectionMatch);
const title = extractFencedAfterHeading(section, 'Title');
const description = extractFencedAfterHeading(section, 'Description');
const tagsRaw = extractFencedAfterHeading(section, 'Tags');
const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

console.log(`Video ID:    ${videoId}`);
console.log(`Title:       ${title} (${title.length} chars)`);
console.log(`Description: ${description.length} chars`);
console.log(`Tags:        ${tags.length} tags\n`);

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }),
});

if (!tokenRes.ok) {
  console.error(`Refresh failed: HTTP ${tokenRes.status}`);
  console.error(await tokenRes.text());
  process.exit(1);
}

const { access_token } = await tokenRes.json();

const getRes = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`,
  { headers: { Authorization: `Bearer ${access_token}` } },
);

if (!getRes.ok) {
  console.error(`GET video failed: HTTP ${getRes.status}`);
  console.error(await getRes.text());
  process.exit(1);
}

const getJson = await getRes.json();
const item = getJson.items?.[0];
if (!item) {
  console.error(`Video ${videoId} not found (or not owned by authenticated account).`);
  process.exit(1);
}

const updatedSnippet = {
  ...item.snippet,
  title,
  description,
  tags,
};

const putRes = await fetch(
  'https://www.googleapis.com/youtube/v3/videos?part=snippet',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: videoId, snippet: updatedSnippet }),
  },
);

if (!putRes.ok) {
  console.error(`PUT failed: HTTP ${putRes.status}`);
  console.error(await putRes.text());
  process.exit(1);
}

const updated = await putRes.json();
console.log('✅ Video updated');
console.log(`Live: https://youtube.com/watch?v=${updated.id}`);
console.log(`Title now: ${updated.snippet.title}`);
