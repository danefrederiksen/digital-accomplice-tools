// Wix API auth diagnostic.
// Tests three endpoints to pinpoint where auth/config fails.
// Run: node --env-file=.env scripts/wix-auth-test.js

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;
const ACCOUNT_ID = process.env.WIX_ACCOUNT_ID;

if (!API_KEY || !SITE_ID || !ACCOUNT_ID) {
  console.error('❌ Missing one of: WIX_API_KEY, WIX_SITE_ID, WIX_ACCOUNT_ID in .env');
  process.exit(1);
}

async function callWix(label, url, headers) {
  console.log(`\n— ${label} —`);
  console.log(`GET ${url}`);
  console.log(`Headers: ${Object.keys(headers).join(', ')}`);
  const res = await fetch(url, { headers });
  const body = await res.text();
  if (res.ok) {
    console.log(`✅ HTTP ${res.status}`);
    let parsed;
    try { parsed = JSON.parse(body); } catch { parsed = null; }
    if (parsed) {
      // Print just the keys + counts so output stays small.
      const summary = {};
      for (const [k, v] of Object.entries(parsed)) {
        summary[k] = Array.isArray(v) ? `Array(${v.length})` : typeof v;
      }
      console.log('Top-level keys:', summary);
      // For sites list, show site IDs found.
      if (parsed.sites?.length) {
        console.log('Sites found:');
        parsed.sites.forEach(s => {
          console.log(`  - ${s.displayName || '(no name)'} | id=${s.id} | metasiteId=${s.metaSiteId || s.metasiteId || 'n/a'}`);
        });
      }
    } else {
      console.log('Body (first 300 chars):', body.slice(0, 300));
    }
    return { ok: true, body };
  } else {
    console.error(`❌ HTTP ${res.status}`);
    console.error('Body:', body.slice(0, 500));
    return { ok: false, status: res.status, body };
  }
}

console.log(`Account ID: ${ACCOUNT_ID}`);
console.log(`Site ID: ${SITE_ID}`);
console.log(`API key (first 20 chars): ${API_KEY.slice(0, 20)}...`);

// Test 1: Account-level — list sites. Confirms API key works at all.
await callWix(
  'TEST 1: List sites (account-level)',
  'https://www.wixapis.com/site-list/v2/sites/query',
  {
    'Authorization': API_KEY,
    'wix-account-id': ACCOUNT_ID,
    'Content-Type': 'application/json',
  },
);

// Test 2: Site-level Blog Draft Posts — site-id only.
await callWix(
  'TEST 2: Blog draft posts (site-id only)',
  'https://www.wixapis.com/blog/v3/draft-posts',
  {
    'Authorization': API_KEY,
    'wix-site-id': SITE_ID,
  },
);

// Test 3: Site-level Blog Draft Posts — both account-id + site-id.
await callWix(
  'TEST 3: Blog draft posts (both account-id + site-id)',
  'https://www.wixapis.com/blog/v3/draft-posts',
  {
    'Authorization': API_KEY,
    'wix-account-id': ACCOUNT_ID,
    'wix-site-id': SITE_ID,
  },
);

console.log('\nDone.');
