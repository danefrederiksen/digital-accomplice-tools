// Spike: create a Wix Blog draft post with hardcoded title + body.
// Goal — confirm POST /blog/v3/draft-posts accepts our auth and returns a draft ID.
// No markdown, no schemas, no video. That comes next.
//
// Run: node --env-file=.env scripts/wix-create-draft-spike.js

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;
const ACCOUNT_ID = process.env.WIX_ACCOUNT_ID;

if (!API_KEY || !SITE_ID || !ACCOUNT_ID) {
  console.error('Missing WIX_API_KEY, WIX_SITE_ID, or WIX_ACCOUNT_ID in .env');
  process.exit(1);
}

// Minimal Ricos document — one paragraph with one text node.
const richContent = {
  nodes: [
    {
      type: 'PARAGRAPH',
      id: 'p1',
      nodes: [
        {
          type: 'TEXT',
          id: 't1',
          nodes: [],
          textData: { text: 'Spike body — created via Wix Blog API.', decorations: [] },
        },
      ],
      paragraphData: {},
    },
  ],
};

// Dane's blog-author memberId (discovered via wix-find-member.js).
const DANE_MEMBER_ID = 'b45d7151-61b1-41c1-88a7-570ee03bcc1e';

const draftPost = {
  title: `API Spike — ${new Date().toISOString()}`,
  memberId: DANE_MEMBER_ID,
  richContent,
};

console.log('POST https://www.wixapis.com/blog/v3/draft-posts');
console.log('Body preview:', JSON.stringify({ title: draftPost.title }));

const res = await fetch('https://www.wixapis.com/blog/v3/draft-posts', {
  method: 'POST',
  headers: {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ draftPost }),
});

const body = await res.text();

if (!res.ok) {
  console.error(`\nHTTP ${res.status}`);
  console.error('Body:', body.slice(0, 1500));
  process.exit(1);
}

const parsed = JSON.parse(body);
const post = parsed.draftPost || parsed;
console.log(`\nHTTP ${res.status} OK`);
console.log('Draft ID:', post.id);
console.log('Title:', post.title);
console.log('Status:', post.status);
console.log('Editor URL:', post.editorUrl || '(not returned)');
console.log('\nFull response top-level keys:', Object.keys(parsed));
