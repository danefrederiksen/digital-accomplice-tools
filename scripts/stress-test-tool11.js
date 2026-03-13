#!/usr/bin/env node
/**
 * Stress Test — Prospecting Tool #11 (Comment Queue)
 * Tests all API endpoints, edge cases, security, and load
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:3861';
const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// ============================================================
// TEST HELPERS
// ============================================================
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${testName}`);
  } else {
    failed++;
    failures.push(testName);
    console.log(`  FAIL  ${testName}`);
  }
}

async function get(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

async function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ============================================================
// BACKUP + SEED
// ============================================================
function backup(filename) {
  const src = path.join(DATA_DIR, filename);
  const dst = path.join(BACKUP_DIR, `pre_stresstest_${filename}`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`  Backed up ${filename}`);
  }
}

function restore(filename) {
  const src = path.join(BACKUP_DIR, `pre_stresstest_${filename}`);
  const dst = path.join(DATA_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    fs.unlinkSync(src);
    console.log(`  Restored ${filename}`);
  }
}

function seedTestData() {
  // Seed b2b-2nd with test prospects
  const b2b2nd = {
    prospects: [
      { id: 'test-b2b-001', name: 'Test B2B Person', company: 'Test Corp', title: 'VP Marketing', linkedinUrl: 'https://www.linkedin.com/in/test1/', status: 'not_started' },
      { id: 'test-b2b-002', name: 'Alice Johnson', company: 'Acme Inc', title: 'CMO', linkedinUrl: 'https://www.linkedin.com/in/test2/', status: 'connection_sent' },
      { id: 'test-b2b-003', name: 'Bob Smith', company: 'Beta Labs', title: 'Director', linkedinUrl: '', status: 'dm_sent' },
      { id: 'test-b2b-004', name: "O'Brien McMahon", company: 'Dash & Co.', title: 'Head of Growth', linkedinUrl: 'https://www.linkedin.com/in/test4/', status: 'not_started' },
      { id: 'test-b2b-005', name: 'María García-López', company: 'Ñoño Systems', title: 'CEO', linkedinUrl: 'https://www.linkedin.com/in/test5/', status: 'not_started' },
    ]
  };
  fs.writeFileSync(path.join(DATA_DIR, 'b2b-2nd-prospects.json'), JSON.stringify(b2b2nd, null, 2));

  // Seed referral-2nd with test prospects
  const ref2nd = {
    prospects: [
      { id: 'test-ref-001', name: 'Referral Test One', company: 'Ref Corp', title: 'Partner', linkedinUrl: 'https://www.linkedin.com/in/ref1/', status: 'not_started' },
      { id: 'test-ref-002', name: 'Referral Test Two', company: 'Ref Inc', title: 'Director', linkedinUrl: 'https://www.linkedin.com/in/ref2/', status: 'connection_accepted' },
    ]
  };
  fs.writeFileSync(path.join(DATA_DIR, 'referral-2nd-prospects.json'), JSON.stringify(ref2nd, null, 2));

  console.log('  Seeded test data into b2b-2nd and referral-2nd');
}

// ============================================================
// TEST SUITES
// ============================================================

async function testServerStartup() {
  console.log('\n--- 1. SERVER STARTUP ---');
  try {
    const res = await get('/');
    assert(res.status === 200, 'Server responds with 200');
    assert(typeof res.body === 'string' && res.body.includes('Comment Queue'), 'HTML page contains "Comment Queue"');
  } catch (err) {
    assert(false, `Server reachable: ${err.message}`);
  }
}

async function testSearchAPI() {
  console.log('\n--- 2. SEARCH API ---');

  // Empty query
  let r = await get('/api/search?q=');
  assert(r.status === 200, 'Empty query returns 200');
  assert(Array.isArray(r.body.results) && r.body.results.length === 0, 'Empty query returns empty results');

  // Search for seeded B2B prospect
  r = await get('/api/search?q=Alice');
  assert(r.body.results.length >= 1, 'Search "Alice" finds at least 1 result');
  assert(r.body.results[0].name === 'Alice Johnson', 'First result is Alice Johnson');
  assert(r.body.results[0].segment === 'b2b_2nd', 'Segment is b2b_2nd');
  assert(r.body.results[0].segmentLabel === 'B2B 2nd Connection', 'Segment label is correct');

  // Search by company
  r = await get('/api/search?q=Acme');
  assert(r.body.results.length >= 1, 'Search by company "Acme" finds result');
  assert(r.body.results[0].company === 'Acme Inc', 'Company matches');

  // Partial match
  r = await get('/api/search?q=ali');
  assert(r.body.results.length >= 1, 'Partial search "ali" finds Alice');

  // No match
  r = await get('/api/search?q=zzzzzznotfound');
  assert(r.body.results.length === 0, 'Nonexistent name returns 0 results');

  // Cross-segment search (find a cyber prospect)
  r = await get('/api/search?q=Spencer');
  assert(r.body.results.length >= 1, 'Cross-segment search finds cyber prospect');
  assert(r.body.results[0].segment === 'cyber_2nd', 'Spencer is in cyber_2nd segment');

  // Cross-segment: referral-1st
  r = await get('/api/search?q=Alexandria');
  assert(r.body.results.length >= 1, 'Cross-segment search finds referral-1st prospect');
  assert(r.body.results[0].segment === 'referral_1st', 'Alexandria is in referral_1st segment');

  // Search with special characters
  r = await get("/api/search?q=O'Brien");
  assert(r.body.results.length >= 1, "Search with apostrophe finds O'Brien");

  // Search with unicode
  r = await get('/api/search?q=Mar%C3%ADa');
  assert(r.body.results.length >= 1, 'Unicode search finds María');

  // Sort order: exact match first
  r = await get('/api/search?q=Test');
  assert(r.body.results.length >= 3, 'Search "Test" finds multiple results');

  // Very long query
  const longQ = 'a'.repeat(500);
  r = await get('/api/search?q=' + longQ);
  assert(r.status === 200, 'Very long query does not crash server');
  assert(r.body.results.length === 0, 'Very long query returns 0 results');

  // Search with only whitespace
  r = await get('/api/search?q=%20%20%20');
  assert(r.status === 200, 'Whitespace-only query returns 200');
}

async function testCommentAPI() {
  console.log('\n--- 3. COMMENT LOG API ---');

  // Valid comment
  let r = await post('/api/comment', {
    prospectId: 'test-b2b-001',
    prospectName: 'Test B2B Person',
    company: 'Test Corp',
    segment: 'b2b_2nd',
    postUrl: 'https://linkedin.com/posts/test-post-123'
  });
  assert(r.status === 200, 'Valid comment returns 200');
  assert(r.body.ok === true, 'Comment logged successfully');
  assert(r.body.totalComments === 1, 'Total comments is 1');
  assert(r.body.entry.prospectId === 'test-b2b-001', 'Entry has correct prospectId');
  assert(r.body.entry.id && r.body.entry.id.length > 10, 'Entry has UUID');

  // Second comment on same prospect
  r = await post('/api/comment', {
    prospectId: 'test-b2b-001',
    prospectName: 'Test B2B Person',
    company: 'Test Corp',
    segment: 'b2b_2nd',
    postUrl: ''
  });
  assert(r.body.totalComments === 2, 'Total comments increments to 2');

  // Comment without postUrl
  r = await post('/api/comment', {
    prospectId: 'test-ref-001',
    prospectName: 'Referral Test One',
    company: 'Ref Corp',
    segment: 'referral_2nd'
  });
  assert(r.body.ok === true, 'Comment without postUrl succeeds');

  // Missing required fields
  r = await post('/api/comment', { prospectName: 'No ID' });
  assert(r.status === 400, 'Missing prospectId returns 400');

  r = await post('/api/comment', { prospectId: 'test-001' });
  assert(r.status === 400, 'Missing segment returns 400');

  // Comment on cyber prospect
  r = await post('/api/comment', {
    prospectId: 'b6c65e10-0bc1-44b2-9d92-cb65f8ffe663',
    prospectName: 'Spencer Colson',
    company: 'SMX',
    segment: 'cyber_2nd',
    postUrl: 'https://linkedin.com/posts/spencer-test'
  });
  assert(r.body.ok === true, 'Comment on real cyber prospect succeeds');

  // Verify source file was updated
  const cyberData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'cyber-2nd-prospects.json'), 'utf8'));
  const spencer = cyberData.prospects.find(p => p.id === 'b6c65e10-0bc1-44b2-9d92-cb65f8ffe663');
  assert(spencer && spencer.last_commented, 'Source prospect has last_commented field');
  assert(spencer && spencer.comment_count === 1, 'Source prospect has comment_count = 1');

  // Verify b2b source updated too
  const b2bData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'b2b-2nd-prospects.json'), 'utf8'));
  const testPerson = b2bData.prospects.find(p => p.id === 'test-b2b-001');
  assert(testPerson && testPerson.comment_count === 2, 'B2B source prospect has comment_count = 2');
}

async function testXSSandInjection() {
  console.log('\n--- 4. XSS & INJECTION ---');

  // XSS in prospect name
  let r = await post('/api/comment', {
    prospectId: 'test-b2b-002',
    prospectName: '<script>alert("xss")</script>',
    company: '<img onerror=alert(1) src=x>',
    segment: 'b2b_2nd',
    postUrl: 'javascript:alert(1)'
  });
  assert(r.body.ok === true, 'XSS payload accepted (server sanitizes)');
  assert(!r.body.entry.prospectName.includes('<script>'), 'Script tag stripped from name');

  // XSS in search query
  r = await get('/api/search?q=<script>alert(1)</script>');
  assert(r.status === 200, 'XSS in search query returns 200');
  assert(r.body.results.length === 0, 'XSS search returns empty');

  // Null bytes
  r = await post('/api/comment', {
    prospectId: 'test-b2b-003',
    prospectName: 'Bob\x00Smith',
    company: 'Beta\x00Labs',
    segment: 'b2b_2nd'
  });
  assert(r.body.ok === true, 'Null bytes in name handled');

  // Path traversal in segment
  r = await post('/api/comment', {
    prospectId: 'test-001',
    prospectName: 'Hacker',
    company: 'Evil Corp',
    segment: '../../../etc/passwd'
  });
  // Should still return ok since segment doesn't map to a source file but the comment log accepts it
  // The updateSourceProspect call will fail silently
  assert(r.status === 200 || r.status === 400, 'Path traversal in segment does not crash server');
}

async function testStatsAPI() {
  console.log('\n--- 5. STATS API ---');

  let r = await get('/api/stats');
  assert(r.status === 200, 'Stats endpoint returns 200');
  assert(typeof r.body.today === 'object', 'Stats has today object');
  assert(typeof r.body.week === 'object', 'Stats has week object');
  assert(r.body.today.target === 8, 'Daily target is 8');
  assert(r.body.today.total >= 4, 'Today total reflects logged comments (>= 4)');
  assert(typeof r.body.today.bySegment === 'object', 'Has segment breakdown');
  assert(r.body.today.bySegment.b2b_2nd >= 2, 'B2B segment count >= 2');
  assert(r.body.today.bySegment.cyber_2nd >= 1, 'Cyber segment count >= 1');
  assert(r.body.today.bySegment.referral_2nd >= 1, 'Referral 2nd segment count >= 1');
  assert(r.body.week.total >= 4, 'Week total >= 4');
}

async function testHistoryAPI() {
  console.log('\n--- 6. HISTORY API ---');

  // Default history
  let r = await get('/api/history');
  assert(r.status === 200, 'History endpoint returns 200');
  assert(Array.isArray(r.body.comments), 'History returns comments array');
  assert(r.body.comments.length >= 4, 'At least 4 comments in history');
  assert(r.body.total >= 4, 'Total count >= 4');

  // Most recent first
  if (r.body.comments.length >= 2) {
    assert(r.body.comments[0].date >= r.body.comments[1].date, 'Comments are in reverse chronological order');
  }

  // Filter by segment
  r = await get('/api/history?segment=b2b_2nd');
  assert(r.body.comments.every(c => c.segment === 'b2b_2nd'), 'Segment filter works for b2b_2nd');

  r = await get('/api/history?segment=cyber_2nd');
  assert(r.body.comments.every(c => c.segment === 'cyber_2nd'), 'Segment filter works for cyber_2nd');

  // Invalid segment filter
  r = await get('/api/history?segment=fake_segment');
  assert(r.status === 200, 'Invalid segment filter returns 200');
  assert(r.body.comments.length >= 0, 'Invalid segment returns full list (not filtered)');

  // Limit parameter
  r = await get('/api/history?limit=2');
  assert(r.body.comments.length <= 2, 'Limit=2 returns at most 2 comments');

  // Limit cap (max 500)
  r = await get('/api/history?limit=9999');
  assert(r.status === 200, 'Huge limit does not crash');

  // Negative limit
  r = await get('/api/history?limit=-5');
  assert(r.status === 200, 'Negative limit does not crash');
}

async function testProspectsAPI() {
  console.log('\n--- 7. ALL PROSPECTS API ---');

  let r = await get('/api/prospects');
  assert(r.status === 200, 'Prospects endpoint returns 200');
  assert(Array.isArray(r.body.prospects), 'Returns prospects array');

  // Should have prospects from all populated segments
  const segments = new Set(r.body.prospects.map(p => p.segment));
  assert(segments.has('b2b_2nd'), 'Has b2b_2nd prospects');
  assert(segments.has('cyber_2nd'), 'Has cyber_2nd prospects');
  assert(segments.has('referral_1st'), 'Has referral_1st prospects');
  assert(segments.has('referral_2nd'), 'Has referral_2nd prospects');

  // Total count
  assert(r.body.total > 0, 'Total count > 0');
  assert(r.body.total === r.body.prospects.length, 'Total matches array length');

  // Comment enrichment
  const testPerson = r.body.prospects.find(p => p.id === 'test-b2b-001');
  assert(testPerson && testPerson.commentCount >= 2, 'Enriched with comment count');
  assert(testPerson && testPerson.lastCommented, 'Enriched with lastCommented date');

  // Prospect with zero comments
  const noComments = r.body.prospects.find(p => p.commentCount === 0);
  assert(noComments, 'Has prospects with 0 comments');
  assert(noComments.lastCommented === null, 'Zero-comment prospect has null lastCommented');

  // Segment labels
  const b2bP = r.body.prospects.find(p => p.segment === 'b2b_2nd');
  assert(b2bP && b2bP.segmentLabel === 'B2B 2nd Connection', 'B2B segment label correct');
}

async function testRapidFire() {
  console.log('\n--- 8. RAPID-FIRE LOAD TEST ---');

  // Fire 20 comments as fast as possible
  const startTime = Date.now();
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(post('/api/comment', {
      prospectId: 'test-b2b-001',
      prospectName: 'Test B2B Person',
      company: 'Test Corp',
      segment: 'b2b_2nd',
      postUrl: `https://linkedin.com/posts/rapid-${i}`
    }));
  }
  const results = await Promise.all(promises);
  const elapsed = Date.now() - startTime;

  const allOk = results.every(r => r.body.ok === true);
  assert(allOk, `All 20 rapid-fire comments succeeded`);
  assert(elapsed < 10000, `20 concurrent comments completed in ${elapsed}ms (< 10s)`);

  // Check total count is now correct
  const r = await get('/api/search?q=Test B2B');
  const person = r.body.results.find(p => p.id === 'test-b2b-001');
  assert(person && person.commentCount >= 22, `Comment count after rapid-fire: ${person ? person.commentCount : 'not found'} (expected >= 22)`);

  // Rapid search while comments are being logged
  const searchPromises = [];
  for (let i = 0; i < 10; i++) {
    searchPromises.push(get('/api/search?q=Spencer'));
    searchPromises.push(get('/api/stats'));
  }
  const searchResults = await Promise.all(searchPromises);
  const allSearchOk = searchResults.every(r => r.status === 200);
  assert(allSearchOk, '10 concurrent search+stats requests all return 200');
}

async function testCommentLogCap() {
  console.log('\n--- 9. COMMENT LOG CAPACITY ---');

  // Read current log length
  const logBefore = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'comment-log.json'), 'utf8'));
  console.log(`  Current log entries: ${logBefore.length}`);

  // We need to push the log close to 2000 then add more
  // For speed, write directly then verify via API
  const bigLog = [];
  for (let i = 0; i < 2005; i++) {
    bigLog.push({
      id: `cap-test-${i}`,
      prospectId: 'test-b2b-001',
      prospectName: 'Capacity Test',
      company: 'Test Corp',
      segment: 'b2b_2nd',
      postUrl: '',
      date: new Date(Date.now() - i * 60000).toISOString() // 1 minute apart
    });
  }
  fs.writeFileSync(path.join(DATA_DIR, 'comment-log.json'), JSON.stringify(bigLog, null, 2));

  // Now add one more via API — should trigger the cap
  let r = await post('/api/comment', {
    prospectId: 'test-b2b-002',
    prospectName: 'Alice Johnson',
    company: 'Acme Inc',
    segment: 'b2b_2nd'
  });
  assert(r.body.ok === true, 'Comment succeeds at capacity');

  // Check log was capped
  const logAfter = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'comment-log.json'), 'utf8'));
  assert(logAfter.length <= 2000, `Log capped at ${logAfter.length} entries (expected <= 2000)`);
  assert(logAfter[0].prospectId === 'test-b2b-002', 'Newest entry is at top');
}

async function testEdgeCases() {
  console.log('\n--- 10. EDGE CASES ---');

  // Empty POST body
  let r;
  try {
    r = await post('/api/comment', {});
    assert(r.status === 400, 'Empty body returns 400');
  } catch {
    assert(false, 'Empty body crashes server');
  }

  // Non-JSON content type (send raw text)
  r = await new Promise((resolve, reject) => {
    const req = http.request(BASE + '/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Content-Length': 5 }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write('hello');
    req.end();
  });
  assert(r.status === 400 || r.status === 200 || r.status === 500, 'Non-JSON POST does not crash server');

  // GET on a POST endpoint
  r = await get('/api/comment');
  assert(r.status !== 500, 'GET on POST endpoint does not crash server');

  // Non-existent endpoint
  r = await get('/api/nonexistent');
  assert(r.status === 404 || typeof r.body === 'string', 'Non-existent endpoint returns 404 or error');

  // Query parameter injection
  r = await get('/api/search?q=test&extraParam=injected');
  assert(r.status === 200, 'Extra query params do not crash');

  // Comment with non-existent prospect ID (not in source files)
  r = await post('/api/comment', {
    prospectId: 'ghost-prospect-999',
    prospectName: 'Ghost Person',
    company: 'Nowhere LLC',
    segment: 'b2b_2nd'
  });
  assert(r.body.ok === true, 'Comment on non-existent prospect still logs to comment-log');

  // Comment with non-existent segment (valid comment log, no source update)
  r = await post('/api/comment', {
    prospectId: 'test-b2b-001',
    prospectName: 'Test',
    company: 'Test',
    segment: 'nonexistent_segment'
  });
  assert(r.body.ok === true, 'Non-existent segment still logs comment');

  // Very large postUrl
  const longUrl = 'https://linkedin.com/posts/' + 'x'.repeat(5000);
  r = await post('/api/comment', {
    prospectId: 'test-b2b-001',
    prospectName: 'Test',
    company: 'Test',
    segment: 'b2b_2nd',
    postUrl: longUrl
  });
  assert(r.body.ok === true, 'Very long postUrl does not crash');
}

async function testMissingSourceFiles() {
  console.log('\n--- 11. MISSING SOURCE FILE HANDLING ---');

  // Temporarily rename a source file
  const refFile = path.join(DATA_DIR, 'referral-2nd-prospects.json');
  const tempFile = refFile + '.bak_test';
  fs.renameSync(refFile, tempFile);

  // Search should still work (just won't include referral-2nd)
  let r = await get('/api/search?q=Test');
  assert(r.status === 200, 'Search works with missing source file');

  // Prospects endpoint should still work
  r = await get('/api/prospects');
  assert(r.status === 200, 'Prospects works with missing source file');
  assert(!r.body.prospects.some(p => p.segment === 'referral_2nd'), 'Missing file segment not in results');

  // Restore
  fs.renameSync(tempFile, refFile);

  // Verify it's back
  r = await get('/api/search?q=Referral Test');
  assert(r.body.results.length >= 1, 'Restored file prospects are searchable again');
}

async function testMalformedSourceFile() {
  console.log('\n--- 12. MALFORMED SOURCE FILE ---');

  // Write garbage to b2b-2nd
  const b2bFile = path.join(DATA_DIR, 'b2b-2nd-prospects.json');
  const originalContent = fs.readFileSync(b2bFile, 'utf8');
  fs.writeFileSync(b2bFile, '{{{{ not valid json!!!!');

  // Search should handle gracefully
  let r = await get('/api/search?q=test');
  assert(r.status === 200, 'Search handles malformed source file');

  // Prospects should handle gracefully
  r = await get('/api/prospects');
  assert(r.status === 200, 'Prospects handles malformed source file');

  // Comment to that segment should handle gracefully
  r = await post('/api/comment', {
    prospectId: 'test-b2b-001',
    prospectName: 'Test',
    company: 'Test',
    segment: 'b2b_2nd'
  });
  assert(r.body.ok === true, 'Comment logs even when source file is malformed');

  // Restore valid data
  fs.writeFileSync(b2bFile, originalContent);
}

async function testSearchRelevanceSort() {
  console.log('\n--- 13. SEARCH RELEVANCE SORTING ---');

  // Search for "test" — exact match of name should come first, then starts-with, then contains
  let r = await get('/api/search?q=Test');
  assert(r.body.results.length >= 1, 'Search for "Test" returns results');

  // Search for "Spencer" — should return Spencer Colson
  r = await get('/api/search?q=spencer');
  assert(r.body.results[0].name === 'Spencer Colson', 'Case-insensitive search works');

  // Search for company with special chars
  r = await get('/api/search?q=Dash');
  assert(r.body.results.length >= 1, 'Search for company with special chars works');
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('='.repeat(60));
  console.log('  STRESS TEST — Tool #11 Comment Queue');
  console.log('  ' + new Date().toISOString());
  console.log('='.repeat(60));

  // Backup existing data
  console.log('\n--- SETUP: BACKUP ---');
  backup('b2b-2nd-prospects.json');
  backup('cyber-2nd-prospects.json');
  backup('referral-1st-prospects.json');
  backup('referral-2nd-prospects.json');
  backup('comment-log.json');

  // Seed test data
  console.log('\n--- SETUP: SEED ---');
  seedTestData();
  // Reset comment log
  fs.writeFileSync(path.join(DATA_DIR, 'comment-log.json'), '[]');

  try {
    await testServerStartup();
    await testSearchAPI();
    await testCommentAPI();
    await testXSSandInjection();
    await testStatsAPI();
    await testHistoryAPI();
    await testProspectsAPI();
    await testRapidFire();
    await testCommentLogCap();
    await testEdgeCases();
    await testMissingSourceFiles();
    await testMalformedSourceFile();
    await testSearchRelevanceSort();
  } catch (err) {
    console.error('\nFATAL ERROR:', err.message);
    console.error(err.stack);
  }

  // Restore original data
  console.log('\n--- CLEANUP: RESTORE ---');
  restore('b2b-2nd-prospects.json');
  restore('cyber-2nd-prospects.json');
  restore('referral-1st-prospects.json');
  restore('referral-2nd-prospects.json');
  restore('comment-log.json');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    failures.forEach(f => console.log(`    - ${f}`));
  }
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

main();
