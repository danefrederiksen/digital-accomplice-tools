// MVP: take an article markdown file, create a Wix Blog draft post (title + body only).
// YouTube embed and structured-data injection come in follow-up steps.
//
// Run: node --env-file=.env scripts/publish-to-wix.js path/to/article.md

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  extractTitle,
  extractYouTubeUrl,
  extractJsonLdScripts,
  buildSeoData,
  markdownToRicosWithVideo,
} from '../lib/markdown-to-ricos.js';

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;
const MEMBER_ID = process.env.WIX_MEMBER_ID || 'b45d7151-61b1-41c1-88a7-570ee03bcc1e';

if (!API_KEY || !SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID in .env');
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/publish-to-wix.js path/to/article.md');
  process.exit(1);
}

const absPath = resolve(inputPath);
const md = await readFile(absPath, 'utf8');

const title = extractTitle(md);
if (!title) {
  console.error(`No H1 found in ${absPath} — skill output should start with "# Title".`);
  process.exit(1);
}

const richContent = markdownToRicosWithVideo(md);
const youtubeUrl = extractYouTubeUrl(md);
const jsonLdScripts = extractJsonLdScripts(md);
const seoData = jsonLdScripts.length ? buildSeoData(jsonLdScripts) : undefined;

console.log(`Source: ${absPath}`);
console.log(`Title:  ${title}`);
console.log(`Video:  ${youtubeUrl || '(none found)'}`);
console.log(`Body:   ${richContent.nodes.length} top-level nodes`);
console.log(`SEO:    ${jsonLdScripts.length} JSON-LD script(s)`);

const res = await fetch('https://www.wixapis.com/blog/v3/draft-posts', {
  method: 'POST',
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    draftPost: {
      title,
      memberId: MEMBER_ID,
      richContent,
      ...(seoData ? { seoData } : {}),
    },
  }),
});

const body = await res.text();

if (!res.ok) {
  console.error(`\nHTTP ${res.status}`);
  console.error(body.slice(0, 1500));
  process.exit(1);
}

const parsed = JSON.parse(body);
const post = parsed.draftPost;
console.log(`\nHTTP ${res.status} — draft created`);
console.log(`Draft ID: ${post.id}`);
console.log(`Status:   ${post.status}`);
console.log(`\nReview at: https://manage.wix.com/dashboard/${SITE_ID}/blog/posts/drafts`);
