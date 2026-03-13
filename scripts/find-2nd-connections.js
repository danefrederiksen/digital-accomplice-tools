const fs = require('fs');

// Source 1: Main dashboard prospects
console.log('=== SOURCE 1: MAIN DASHBOARD (warming-app) ===');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/warming-app copy/data/prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);

  const notConnectedICP = prospects.filter(p => {
    const isNotConnected = (p.connected === false || p.connected === 'false' || p.connected === undefined || p.connected === null || p.connected === '');
    const isICP = (p.tier && (p.tier === 1 || p.tier === '1' || p.tier === 2 || p.tier === '2')) ||
                  (p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes('icp'))) ||
                  (p.icp === true) ||
                  (p.sequence_type === 'not_connected');
    return isNotConnected && isICP;
  });

  console.log('Total prospects in file:', prospects.length);
  console.log('Not-connected ICP found:', notConnectedICP.length);
  console.log('---');
  notConnectedICP.forEach(p => {
    console.log(JSON.stringify({
      name: p.name || p.full_name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || p.role || 'N/A',
      linkedin: p.linkedin || p.linkedin_url || p.linkedinUrl || 'N/A',
      tier: p.tier || 'N/A',
      status: p.status || 'N/A',
      connected: p.connected,
      sequence_type: p.sequence_type || 'N/A',
      tags: p.tags || [],
      icp: p.icp
    }));
  });
} catch(e) { console.log('Error reading main dashboard:', e.message); }

console.log('\n');

// Source 2: B2B 2nd connections
console.log('=== SOURCE 2: TOOL #3 — B2B 2nd Connections ===');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/b2b-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  console.log('---');
  prospects.forEach(p => {
    console.log(JSON.stringify({
      name: p.name || p.full_name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || p.role || 'N/A',
      linkedin: p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || 'N/A',
      tier: p.tier || 'N/A',
      status: p.status || 'N/A',
      tags: p.tags || []
    }));
  });
} catch(e) { console.log('File not found or error:', e.message); }

console.log('\n');

// Source 3: Cyber 2nd connections
console.log('=== SOURCE 3: TOOL #4 — Cyber 2nd Connections ===');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/cyber-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  console.log('---');
  prospects.forEach(p => {
    console.log(JSON.stringify({
      name: p.name || p.full_name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || p.role || 'N/A',
      linkedin: p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || 'N/A',
      tier: p.tier || 'N/A',
      status: p.status || 'N/A',
      tags: p.tags || []
    }));
  });
} catch(e) { console.log('File not found or error:', e.message); }

console.log('\n');

// Source 4: Referral 2nd connections
console.log('=== SOURCE 4: TOOL #6 — Referral 2nd Connections ===');
try {
  const data = JSON.parse(fs.readFileSync('/Users/danefrederiksen/Desktop/Claude code/referral-2nd-prospects.json', 'utf8'));
  const prospects = Array.isArray(data) ? data : (data.prospects || []);
  console.log('Total prospects:', prospects.length);
  console.log('---');
  prospects.forEach(p => {
    console.log(JSON.stringify({
      name: p.name || p.full_name || 'N/A',
      company: p.company || 'N/A',
      title: p.title || p.role || 'N/A',
      linkedin: p.linkedin || p.linkedin_url || p.linkedinUrl || p.profileUrl || 'N/A',
      tier: p.tier || 'N/A',
      status: p.status || 'N/A',
      tags: p.tags || []
    }));
  });
} catch(e) { console.log('File not found or error:', e.message); }
