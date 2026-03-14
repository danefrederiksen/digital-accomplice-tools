const fs = require('fs');

// Load all affected files
const cyber = JSON.parse(fs.readFileSync('data/cyber-prospects.json', 'utf8'));
const cyber2nd = JSON.parse(fs.readFileSync('data/cyber-2nd-prospects.json', 'utf8'));
const b2b = JSON.parse(fs.readFileSync('data/b2b-prospects.json', 'utf8'));

function normalize(s) {
  return (s || '').toLowerCase().trim();
}

let removed = [];

// 1. Remove from Tool 4 (cyber-2nd) anyone who already exists in Tool 2 (cyber-1st) with active status
const cyberNames = new Set(cyber.prospects.map(p => normalize(p.name)));
const before4 = cyber2nd.prospects.length;
cyber2nd.prospects = cyber2nd.prospects.filter(p => {
  if (cyberNames.has(normalize(p.name))) {
    removed.push({ name: p.name, from: 'Tool 4', reason: 'duplicate in Tool 2 (cyber 1st)' });
    return false;
  }
  return true;
});
console.log('Tool 4: removed ' + (before4 - cyber2nd.prospects.length) + ' duplicates of Tool 2 prospects');

// 2. Remove Joe/Joseph Marquette duplicate within Tool 4
const marquettes = cyber2nd.prospects.filter(p => normalize(p.name).includes('marquette'));
if (marquettes.length > 1) {
  // Keep the one with more data (connection_sent > not_started)
  const keepIdx = marquettes.findIndex(p => p.status === 'connection_sent');
  const keep = marquettes[keepIdx >= 0 ? keepIdx : 0];
  cyber2nd.prospects = cyber2nd.prospects.filter(p => {
    if (normalize(p.name).includes('marquette') && p.id !== keep.id) {
      removed.push({ name: p.name, from: 'Tool 4', reason: 'duplicate of ' + keep.name });
      return false;
    }
    return true;
  });
  console.log('Tool 4: removed duplicate Marquette entry');
}

// 3. Remove Maria Velasquez from Tool 1 (b2b) — she belongs in Tool 2 (cyber/Brinqa)
const beforeB2B = b2b.prospects.length;
b2b.prospects = b2b.prospects.filter(p => {
  if (normalize(p.name).includes('maria velasquez')) {
    removed.push({ name: p.name, from: 'Tool 1', reason: 'duplicate - keeping in Tool 2 (Brinqa = cyber)' });
    return false;
  }
  return true;
});
console.log('Tool 1: removed ' + (beforeB2B - b2b.prospects.length) + ' Maria Velasquez entry');

// 4. Remove Maria Velasquez from Tool 4 (not_started, stale copy)
const before4b = cyber2nd.prospects.length;
cyber2nd.prospects = cyber2nd.prospects.filter(p => {
  if (normalize(p.name).includes('maria velasquez')) {
    removed.push({ name: p.name, from: 'Tool 4', reason: 'duplicate - keeping in Tool 2 (replied status)' });
    return false;
  }
  return true;
});
console.log('Tool 4: removed ' + (before4b - cyber2nd.prospects.length) + ' Maria Velasquez entry');

// 5. Remove duplicates that moved to B2B from Tool 2 cleanup but were already in Tool 1
// (Whitney Parker Mitchell, Valerie Zargarpur, Yvette C., Ashley McGuckin)
const dupeNames = ['whitney parker mitchell', 'valerie zargarpur', 'yvette c.', 'ashley mcguckin'];
const beforeB2B2 = b2b.prospects.length;
// For each dupe name, keep the one with more activity (has dm_sent date or higher status)
dupeNames.forEach(dupeName => {
  const matches = b2b.prospects.filter(p => normalize(p.name) === dupeName);
  if (matches.length > 1) {
    // Keep the one with dm_sent status or more data
    const best = matches.find(p => p.status === 'dm_sent') || matches.find(p => p.dmSentDate) || matches[0];
    b2b.prospects = b2b.prospects.filter(p => {
      if (normalize(p.name) === dupeName && p.id !== best.id) {
        removed.push({ name: p.name, from: 'Tool 1', reason: 'duplicate within Tool 1 (kept better record)' });
        return false;
      }
      return true;
    });
  }
});
console.log('Tool 1: removed ' + (beforeB2B2 - b2b.prospects.length) + ' internal duplicates');

// Also remove Kenan Frager from Tool 1 if present (ASIMILY is cyber, should be in Tool 2 only)
const beforeKF = b2b.prospects.length;
b2b.prospects = b2b.prospects.filter(p => {
  if (normalize(p.name) === 'kenan frager') {
    removed.push({ name: p.name, from: 'Tool 1', reason: 'ASIMILY is cyber - already in Tool 2' });
    return false;
  }
  return true;
});
if (beforeKF > b2b.prospects.length) {
  console.log('Tool 1: removed Kenan Frager (belongs in Tool 2)');
}

// Also remove Nick Mueller from Tool 1 if present (Material Security is cyber)
const beforeNM = b2b.prospects.length;
b2b.prospects = b2b.prospects.filter(p => {
  if (normalize(p.name) === 'nick mueller') {
    removed.push({ name: p.name, from: 'Tool 1', reason: 'Material Security is cyber - already in Tool 2' });
    return false;
  }
  return true;
});
if (beforeNM > b2b.prospects.length) {
  console.log('Tool 1: removed Nick Mueller (belongs in Tool 2)');
}

// Save
fs.writeFileSync('data/cyber-2nd-prospects.json', JSON.stringify(cyber2nd, null, 2));
fs.writeFileSync('data/b2b-prospects.json', JSON.stringify(b2b, null, 2));

console.log('\n=== SUMMARY ===');
console.log('Total removed: ' + removed.length);
removed.forEach(r => console.log('  [' + r.from + '] ' + r.name + ' — ' + r.reason));
console.log('\nFinal counts:');
console.log('  Tool 1 (B2B 1st): ' + b2b.prospects.length);
console.log('  Tool 2 (Cyber 1st): ' + cyber.prospects.length);
console.log('  Tool 4 (Cyber 2nd): ' + cyber2nd.prospects.length);
