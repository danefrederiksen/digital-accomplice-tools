const fs = require('fs');

// ========================================
// SOURCE 1: Main Dashboard
// ========================================
let dashboardResults = { tier1WithLinkedIn: [], tier1NoLinkedIn: [], tier2WithLinkedIn: [], tier2NoLinkedIn: [] };

try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/warming-app copy/data/prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);

  const notConnectedICP = prospects.filter(p => {
    const isNotConnected = (p.connected === false || p.connected === 'false' || p.connected === undefined || p.connected === null || p.connected === '');
    const isICP = (p.tier && (p.tier === 1 || p.tier === '1' || p.tier === 2 || p.tier === '2'));
    return isNotConnected && isICP;
  });

  notConnectedICP.forEach(p => {
    const hasLinkedIn = p.linkedin && p.linkedin !== 'N/A' && p.linkedin !== '' && p.linkedin.includes('linkedin.com');
    const entry = {
      name: p.name || p.full_name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || p.role || 'N/A',
      linkedin: hasLinkedIn ? p.linkedin : null,
      tier: p.tier,
      status: p.status || 'N/A',
      tags: p.tags || []
    };

    if (p.tier === 1 || p.tier === '1') {
      if (hasLinkedIn) dashboardResults.tier1WithLinkedIn.push(entry);
      else dashboardResults.tier1NoLinkedIn.push(entry);
    } else {
      if (hasLinkedIn) dashboardResults.tier2WithLinkedIn.push(entry);
      else dashboardResults.tier2NoLinkedIn.push(entry);
    }
  });

  console.log('================================================================');
  console.log('SOURCE 1: MAIN DASHBOARD (warming-app copy)');
  console.log('================================================================');
  console.log('Total not-connected ICP:', notConnectedICP.length);
  console.log('  Tier 1 with LinkedIn URL:', dashboardResults.tier1WithLinkedIn.length);
  console.log('  Tier 1 without LinkedIn URL:', dashboardResults.tier1NoLinkedIn.length);
  console.log('  Tier 2 with LinkedIn URL:', dashboardResults.tier2WithLinkedIn.length);
  console.log('  Tier 2 without LinkedIn URL:', dashboardResults.tier2NoLinkedIn.length);

  console.log('\n--- TIER 1, HAS LINKEDIN URL ---');
  dashboardResults.tier1WithLinkedIn.forEach(p => {
    console.log(`  ${p.name} | ${p.title} | ${p.company} | ${p.linkedin} | Status: ${p.status}`);
  });

  console.log('\n--- TIER 1, NO LINKEDIN URL ---');
  dashboardResults.tier1NoLinkedIn.forEach(p => {
    console.log(`  ${p.name} | ${p.title} | ${p.company} | Status: ${p.status}`);
  });

  console.log('\n--- TIER 2, HAS LINKEDIN URL ---');
  dashboardResults.tier2WithLinkedIn.forEach(p => {
    console.log(`  ${p.name} | ${p.title} | ${p.company} | ${p.linkedin} | Status: ${p.status}`);
  });

  console.log('\n--- TIER 2, NO LINKEDIN URL ---');
  dashboardResults.tier2NoLinkedIn.forEach(p => {
    console.log(`  ${p.name} | ${p.title} | ${p.company} | Status: ${p.status}`);
  });
} catch(e) { console.log('Error:', e.message); }

// ========================================
// SOURCE 2: B2B 2nd Connections
// ========================================
console.log('\n\n================================================================');
console.log('SOURCE 2: TOOL #3 — B2B 2nd Connections (b2b-2nd-prospects.json)');
console.log('================================================================');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/b2b-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  if (prospects.length > 0) {
    console.log('Sample fields:', Object.keys(prospects[0]).join(', '));
    console.log('---');
    prospects.forEach(p => {
      const linkedin = p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || p.url || 'N/A';
      console.log(`  ${p.name || p.full_name || 'N/A'} | ${p.title || p.role || 'N/A'} | ${p.company || 'N/A'} | ${linkedin} | Tier: ${p.tier || 'N/A'} | Status: ${p.status || 'N/A'}`);
    });
  } else {
    console.log('No prospects in this file.');
  }
} catch(e) { console.log('File not found or error:', e.message); }

// ========================================
// SOURCE 3: Cyber 2nd Connections
// ========================================
console.log('\n\n================================================================');
console.log('SOURCE 3: TOOL #4 — Cyber 2nd Connections (cyber-2nd-prospects.json)');
console.log('================================================================');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/cyber-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  if (prospects.length > 0) {
    console.log('Sample fields:', Object.keys(prospects[0]).join(', '));
    console.log('---');
    prospects.forEach(p => {
      const linkedin = p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || p.url || 'N/A';
      console.log(`  ${p.name || p.full_name || 'N/A'} | ${p.title || p.role || 'N/A'} | ${p.company || 'N/A'} | ${linkedin} | Tier: ${p.tier || 'N/A'} | Status: ${p.status || 'N/A'}`);
    });
  } else {
    console.log('No prospects in this file.');
  }
} catch(e) { console.log('File not found or error:', e.message); }

// ========================================
// SOURCE 4: Referral 2nd Connections
// ========================================
console.log('\n\n================================================================');
console.log('SOURCE 4: TOOL #6 — Referral 2nd Connections (referral-2nd-prospects.json)');
console.log('================================================================');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/referral-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  if (prospects.length > 0) {
    console.log('Sample fields:', Object.keys(prospects[0]).join(', '));
    console.log('---');
    prospects.forEach(p => {
      const linkedin = p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || p.url || 'N/A';
      console.log(`  ${p.name || p.full_name || 'N/A'} | ${p.title || p.role || 'N/A'} | ${p.company || 'N/A'} | ${linkedin} | Tier: ${p.tier || 'N/A'} | Status: ${p.status || 'N/A'}`);
    });
  } else {
    console.log('No prospects in this file.');
  }
} catch(e) { console.log('File not found or error:', e.message); }

// ========================================
// GRAND SUMMARY
// ========================================
console.log('\n\n================================================================');
console.log('GRAND SUMMARY');
console.log('================================================================');
const t1wl = dashboardResults.tier1WithLinkedIn.length;
const t1nl = dashboardResults.tier1NoLinkedIn.length;
const t2wl = dashboardResults.tier2WithLinkedIn.length;
const t2nl = dashboardResults.tier2NoLinkedIn.length;
console.log(`Main Dashboard: ${t1wl + t1nl + t2wl + t2nl} total not-connected ICP`);
console.log(`  Tier 1: ${t1wl + t1nl} (${t1wl} have LinkedIn, ${t1nl} missing)`);
console.log(`  Tier 2: ${t2wl + t2nl} (${t2wl} have LinkedIn, ${t2nl} missing)`);
