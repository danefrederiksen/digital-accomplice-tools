// Publish an existing Wix Blog draft post to live.
//
// Run: node --env-file=.env scripts/publish-draft.js <draftPostId>

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

if (!API_KEY || !SITE_ID) {
  console.error('Missing WIX_API_KEY or WIX_SITE_ID in .env');
  process.exit(1);
}

const draftId = process.argv[2];
if (!draftId) {
  console.error('Usage: node scripts/publish-draft.js <draftPostId>');
  process.exit(1);
}

const res = await fetch(`https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`, {
  method: 'POST',
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});

const body = await res.text();

if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  console.error(body.slice(0, 1500));
  process.exit(1);
}

const parsed = JSON.parse(body);
const postId = parsed.postId || parsed.post?.id;

if (!postId) {
  console.error('No postId in publish response:', body.slice(0, 500));
  process.exit(1);
}

const getRes = await fetch(`https://www.wixapis.com/blog/v3/posts/${postId}`, {
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
  },
});

if (!getRes.ok) {
  console.error(`HTTP ${res.status} publish OK but follow-up GET failed: ${getRes.status}`);
  console.error(`Post ID: ${postId}`);
  process.exit(1);
}

const post = (await getRes.json()).post;

console.log(`HTTP ${res.status} — published`);
console.log(`Post ID:  ${post.id}`);
console.log(`Title:    ${post.title}`);
console.log(`Slug:     ${post.slug}`);
console.log(`Live URL: https://www.digitalaccomplice.com/post/${post.slug}`);
