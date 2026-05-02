// Find a member ID we can use as the blog post owner.
// Tries the Members API first, falls back to listing existing draft posts to crib an authorId.
//
// Run: node --env-file=.env scripts/wix-find-member.js

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

const headers = {
  'Authorization': API_KEY,
  'wix-site-id': SITE_ID,
  'Content-Type': 'application/json',
};

async function tryQueryMembers() {
  console.log('— Members API: query —');
  const res = await fetch('https://www.wixapis.com/members/v1/members/query', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: { paging: { limit: 10 } } }),
  });
  const body = await res.text();
  console.log(`HTTP ${res.status}`);
  if (!res.ok) {
    console.log('Body:', body.slice(0, 400));
    return;
  }
  const parsed = JSON.parse(body);
  const members = parsed.members || [];
  console.log(`Members found: ${members.length}`);
  members.slice(0, 5).forEach(m => {
    console.log(`  - id=${m.id} | loginEmail=${m.loginEmail || '(none)'} | nickname=${m.profile?.nickname || '(none)'}`);
  });
}

async function tryListDrafts() {
  console.log('\n— Existing draft posts (look for memberId on any) —');
  const res = await fetch('https://www.wixapis.com/blog/v3/draft-posts?paging.limit=10', { headers });
  const body = await res.text();
  console.log(`HTTP ${res.status}`);
  if (!res.ok) {
    console.log('Body:', body.slice(0, 400));
    return;
  }
  const parsed = JSON.parse(body);
  const posts = parsed.draftPosts || [];
  console.log(`Drafts found: ${posts.length}`);
  posts.slice(0, 5).forEach(p => {
    console.log(`  - id=${p.id} | memberId=${p.memberId || '(none)'} | title=${p.title?.slice(0, 50) || '(no title)'}`);
  });
}

async function tryListPublished() {
  console.log('\n— Existing published posts (look for memberId) —');
  const res = await fetch('https://www.wixapis.com/blog/v3/posts?paging.limit=10', { headers });
  const body = await res.text();
  console.log(`HTTP ${res.status}`);
  if (!res.ok) {
    console.log('Body:', body.slice(0, 400));
    return;
  }
  const parsed = JSON.parse(body);
  const posts = parsed.posts || [];
  console.log(`Posts found: ${posts.length}`);
  posts.slice(0, 5).forEach(p => {
    console.log(`  - id=${p.id} | memberId=${p.memberId || '(none)'} | title=${p.title?.slice(0, 50) || '(no title)'}`);
  });
}

await tryQueryMembers();
await tryListDrafts();
await tryListPublished();
