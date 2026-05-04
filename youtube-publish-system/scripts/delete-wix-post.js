// Delete a published Wix blog post by slug.
//
// Run: node --env-file=.env scripts/delete-wix-post.js <slug>
//
// Example:
//   node --env-file=.env scripts/delete-wix-post.js the-3-sites-llms-trust-most-kaleigh-moore-on-ai-search-1

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

if (!API_KEY || !SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID in .env');
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/delete-wix-post.js <slug>');
  process.exit(1);
}

const headers = { 'Authorization': API_KEY, 'wix-site-id': SITE_ID };

// 1. Look up the post by slug.
const lookup = await fetch(
  `https://www.wixapis.com/blog/v3/posts/slugs/${encodeURIComponent(slug)}`,
  { headers },
);
if (!lookup.ok) {
  console.error(`Lookup failed: HTTP ${lookup.status} — ${await lookup.text()}`);
  process.exit(1);
}
const { post } = await lookup.json();
console.log(`Found post: ${post.id}  "${post.title}"`);

// 2. Delete it.
const del = await fetch(
  `https://www.wixapis.com/blog/v3/posts/${post.id}`,
  { method: 'DELETE', headers },
);
if (!del.ok) {
  console.error(`Delete failed: HTTP ${del.status} — ${await del.text()}`);
  process.exit(1);
}
console.log(`Deleted ${post.id}.`);
