// Update an existing Wix Blog draft post with new content from a markdown file, then publish it.
// Use this when a draft is already published but the source markdown has changed.
//
// Run: node --env-file=.env scripts/update-and-publish.js <draftPostId> path/to/article.md

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  extractTitle,
  extractJsonLdScripts,
  buildSeoData,
  markdownToRicosWithVideo,
} from '../lib/markdown-to-ricos.js';

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

if (!API_KEY || !SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID in .env');
  process.exit(1);
}

const [draftId, inputPath] = process.argv.slice(2);
if (!draftId || !inputPath) {
  console.error('Usage: node scripts/update-and-publish.js <draftPostId> path/to/article.md');
  process.exit(1);
}

const md = await readFile(resolve(inputPath), 'utf8');
const title = extractTitle(md);
const richContent = markdownToRicosWithVideo(md);
const jsonLdScripts = extractJsonLdScripts(md);
const seoData = jsonLdScripts.length ? buildSeoData(jsonLdScripts) : undefined;

console.log(`Draft:  ${draftId}`);
console.log(`Title:  ${title}`);
console.log(`Body:   ${richContent.nodes.length} top-level nodes`);
console.log(`SEO:    ${jsonLdScripts.length} JSON-LD script(s)`);

const patchRes = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${draftId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    draftPost: {
      title,
      richContent,
      ...(seoData ? { seoData } : {}),
    },
  }),
});

if (!patchRes.ok) {
  console.error(`\nPATCH failed: HTTP ${patchRes.status}`);
  console.error((await patchRes.text()).slice(0, 1500));
  process.exit(1);
}

console.log(`HTTP ${patchRes.status} — draft updated`);

const pubRes = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`, {
  method: 'POST',
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});

if (!pubRes.ok) {
  console.error(`\nPublish failed: HTTP ${pubRes.status}`);
  console.error((await pubRes.text()).slice(0, 1500));
  process.exit(1);
}

const { postId } = await pubRes.json();
const getRes = await fetch(`https://www.wixapis.com/blog/v3/posts/${postId}`, {
  headers: { 'Authorization': API_KEY, 'wix-site-id': SITE_ID },
});
const livePost = (await getRes.json()).post;

console.log(`\nHTTP ${pubRes.status} — re-published`);
console.log(`Post ID:  ${livePost.id}`);
console.log(`Slug:     ${livePost.slug}`);
console.log(`Live URL: https://www.digitalaccomplice.com/post/${livePost.slug}`);
