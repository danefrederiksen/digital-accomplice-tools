const fs = require('fs');

// ========================================
// SOURCE 1: Main Dashboard
// ========================================
console.log('================================================================');
console.log('SOURCE 1: MAIN DASHBOARD (warming-app copy)');
console.log('================================================================');

let dashTier1 = [], dashTier2 = [];

try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/warming-app copy/data/prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);

  const notConnectedICP = prospects.filter(p => {
    const isNotConnected = (p.connected === false || p.connected === 'false' || p.connected === undefined || p.connected === null || p.connected === '');
    const isICP = (p.tier === 1 || p.tier === '1' || p.tier === 2 || p.tier === '2');
    return isNotConnected && isICP;
  });

  notConnectedICP.forEach(p => {
    const linkedinUrl = p.linkedin_url || p.linkedin || 'NO URL';
    const hasUrl = linkedinUrl && linkedinUrl !== 'NO URL' && linkedinUrl.includes('linkedin.com');
    const entry = {
      name: p.name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || 'N/A',
      linkedin_url: hasUrl ? linkedinUrl : 'NO URL',
      linkedin_username: p.linkedin_username || '',
      tier: p.tier,
      status: p.status || 'N/A',
      tags: (p.tags || []).join(', ')
    };

    if (p.tier === 1 || p.tier === '1') dashTier1.push(entry);
    else dashTier2.push(entry);
  });

  console.log(`Total not-connected ICP: ${notConnectedICP.length}`);
  console.log(`  Tier 1: ${dashTier1.length} (${dashTier1.filter(p => p.linkedin_url !== 'NO URL').length} have LinkedIn URL)`);
  console.log(`  Tier 2: ${dashTier2.length} (${dashTier2.filter(p => p.linkedin_url !== 'NO URL').length} have LinkedIn URL)`);

  console.log('\n--- TIER 1 (Not Connected, ICP) ---');
  dashTier1.forEach((p, i) => {
    const urlStr = p.linkedin_url !== 'NO URL' ? p.linkedin_url : (p.linkedin_username ? `(username: ${p.linkedin_username})` : 'NO URL');
    console.log(`${i+1}. ${p.name} | ${p.title} | ${p.company} | ${urlStr} | Status: ${p.status}${p.tags ? ' | Tags: ' + p.tags : ''}`);
  });

  console.log('\n--- TIER 2 (Not Connected, ICP) ---');
  dashTier2.forEach((p, i) => {
    const urlStr = p.linkedin_url !== 'NO URL' ? p.linkedin_url : (p.linkedin_username ? `(username: ${p.linkedin_username})` : 'NO URL');
    console.log(`${i+1}. ${p.name} | ${p.title} | ${p.company} | ${urlStr} | Status: ${p.status}${p.tags ? ' | Tags: ' + p.tags : ''}`);
  });

} catch(e) { console.log('Error:', e.message); }

// ========================================
// SOURCES 2-4: 2nd Connection Tools
// ========================================
const toolFiles = [
  { name: 'TOOL #3 -- B2B 2nd Connections', file: 'b2b-2nd-prospects.json' },
  { name: 'TOOL #4 -- Cyber 2nd Connections', file: 'cyber-2nd-prospects.json' },
  { name: 'TOOL #6 -- Referral 2nd Connections', file: 'referral-2nd-prospects.json' }
];

let toolTotals = {};

toolFiles.forEach(tool => {
  console.log(`\n\n================================================================`);
  console.log(`SOURCE: ${tool.name} (${tool.file})`);
  console.log('================================================================');
  try {
    const raw = fs.readFileSync(`/Users/danefrederiksen/Desktop/Claude code/${tool.file}`, 'utf8');
    const data = JSON.parse(raw);
    const prospects = Array.isArray(data) ? data : (data.prospects || []);
    console.log('Total prospects:', prospects.length);
    toolTotals[tool.name] = prospects.length;

    if (prospects.length > 0) {
      console.log('Fields available:', Object.keys(prospects[0]).join(', '));
      console.log('---');
      prospects.forEach((p, i) => {
        const linkedin = p.linkedin_url || p.linkedin || p.linkedinUrl || p.profileUrl || p.url || 'NO URL';
        console.log(`${i+1}. ${p.name || p.full_name || 'N/A'} | ${p.title || p.role || 'N/A'} | ${p.company || 'N/A'} | ${linkedin} | Status: ${p.status || 'N/A'}`);
      });
    } else {
      console.log('(Empty -- no prospects loaded yet)');
    }
  } catch(e) {
    if (e.code === 'ENOENT') {
      console.log('FILE DOES NOT EXIST -- not yet populated');
      toolTotals[tool.name] = 'N/A';
    } else {
      console.log('Error:', e.message);
      toolTotals[tool.name] = 'error';
    }
  }
});

// ========================================
// GRAND SUMMARY
// ========================================
console.log('\n\n================================================================');
console.log('GRAND SUMMARY');
console.log('================================================================');
console.log(`Main Dashboard: ${dashTier1.length + dashTier2.length} not-connected ICP prospects`);
console.log(`  Tier 1: ${dashTier1.length} (${dashTier1.filter(p => p.linkedin_url !== 'NO URL').length} have LinkedIn URL)`);
console.log(`  Tier 2: ${dashTier2.length} (${dashTier2.filter(p => p.linkedin_url !== 'NO URL').length} have LinkedIn URL)`);
Object.entries(toolTotals).forEach(([name, count]) => {
  console.log(`${name}: ${count} prospects`);
});
