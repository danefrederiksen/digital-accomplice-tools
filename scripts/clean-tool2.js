const fs = require('fs');

const cyber = JSON.parse(fs.readFileSync('data/cyber-prospects.json', 'utf8'));
const b2b = JSON.parse(fs.readFileSync('data/b2b-prospects.json', 'utf8'));

// Companies that ARE cybersecurity / security-adjacent — keep in Tool 2
const cyberCompanyNames = new Set([
  // Already classified as cyber
  'cloudflare', 'horizon3.ai', 'qualys', 'crowdstrike', 'cyberhaven',
  'sumo logic', 'armis', 'netenrich', 'cyberark', 'ndatastor, inc.',
  'brinqa', 'hive pro, inc.', 'mind sequencing', 'upguard',
  'xm cyber', 'cyber ranges', 'underdefense cyber security',
  'asimily', 'material security', 'orca ai',
  'cyber security forum initiative',
  // From unknown list - actually cyber/security
  'f5',                          // network security
  'panaya',                      // enterprise SW (borderline, but keep)
  'iverify',                     // mobile security
  'anvilogic',                   // security analytics/SIEM
  'palo alto networks',          // cybersecurity
  'check point software',        // cybersecurity
  'graylog',                     // log management / security
  'igel technology',             // endpoint management / security
  'crypto council for innovation', // crypto/cyber policy
  'woodruff sawyer',             // insurance broker with cyber practice
]);

// Normalize for matching
function normalize(s) {
  return (s || '').toLowerCase().trim();
}

function isCyberCompany(company) {
  const lower = normalize(company);
  // Exact match on known set
  for (const c of cyberCompanyNames) {
    if (lower === c || lower.includes(c)) return true;
  }
  // Keyword match
  const cyberKeywords = ['security', 'cyber', 'defense', 'infosec', 'threat',
    'vulnerability', 'pentest', 'breach', 'malware', 'ransomware'];
  for (const kw of cyberKeywords) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

// Also check title for cyber relevance
function hasCyberTitle(title) {
  const lower = normalize(title);
  const keywords = ['security', 'cyber', 'ciso', 'infosec', 'threat', 'soc ',
    'vulnerability', 'penetration', 'incident response'];
  return keywords.some(kw => lower.includes(kw));
}

// Also check if someone is a valid B2B marketing prospect (has marketing/creative title)
function isMarketingTitle(title) {
  const lower = normalize(title);
  const keywords = ['marketing', 'cmo', 'brand', 'content', 'creative',
    'communications', 'pr ', 'public relations', 'demand gen', 'growth',
    'social media', 'digital market', 'field market', 'product market'];
  return keywords.some(kw => lower.includes(kw));
}

const keepInCyber = [];
const moveToB2B = [];  // Valid B2B marketing prospects, just not cyber
const remove = [];      // Not relevant at all

// Also fix remaining swapped fields (like Dominic Pedersen, David Kennedy, etc.)
const swapFixes = {
  'Dominic Pedersen': { company: 'UpGuard', title: 'Cyber Security Executive' },
  'David Kennedy': { company: 'Invictus Growth Partners', title: 'Guild Member and CSO' },
  'Eugene Brun': { company: 'Splunk', title: 'Staff Professional Services Consultant Security' },
  'Dr. Paul de Souza': { company: 'Cyber Security Forum Initiative', title: 'Founder Director President' },
  'Amy De Salvatore': { company: 'The Cyber Guild', title: 'Board of Directors' },
  'Cathy Johnson': { company: 'Women in Security', title: 'Chair' },
  'Stephen Goldblatt': { company: 'Partners in Crime LLC', title: 'Founder' },
  'Paul Xavier': { company: 'ContentCreator.com', title: 'Co-Founder' },
  'Frederick Felman': { company: 'Sage Partners', title: 'Partner' },
  'Adam Ritchie': { company: 'Adam Ritchie Brand Direction', title: 'Principal' },
  'Thomas Ryan Oakes': { company: 'Referral Program Pros', title: 'Founder & CEO' },
  'Ben Hess': { company: 'Lens + Line LLC', title: 'Owner' },
  'Jonathan Shipman': { company: 'Wela Capital Partners', title: 'Founding Partner' },
};

cyber.prospects.forEach(p => {
  // Fix remaining swaps
  if (swapFixes[p.name]) {
    p.company = swapFixes[p.name].company;
    p.title = swapFixes[p.name].title;
  }

  const companyIsCyber = isCyberCompany(p.company);
  const titleIsCyber = hasCyberTitle(p.title);
  const hasActiveSequence = ['dm_sent', 'follow_up_1', 'follow_up_2', 'replied'].includes(p.status);

  if (companyIsCyber || titleIsCyber) {
    keepInCyber.push(p);
  } else if (hasActiveSequence) {
    // Don't disrupt active sequences — keep them
    keepInCyber.push(p);
  } else if (isMarketingTitle(p.title)) {
    moveToB2B.push(p);
  } else {
    remove.push(p);
  }
});

console.log('=== RESULTS ===');
console.log('Keep in Cyber (Tool 2): ' + keepInCyber.length);
console.log('Move to B2B (Tool 1): ' + moveToB2B.length);
console.log('Remove (not relevant): ' + remove.length);

console.log('\n--- Moving to B2B Tool #1 ---');
moveToB2B.forEach(p => console.log('  ' + p.name + ' | ' + p.company + ' | ' + p.title));

console.log('\n--- Removing ---');
remove.forEach(p => console.log('  ' + p.name + ' | ' + p.company + ' | ' + p.title));

// Check for duplicates before moving to B2B
const b2bNames = new Set(b2b.prospects.map(p => normalize(p.name)));
const dupes = moveToB2B.filter(p => b2bNames.has(normalize(p.name)));
if (dupes.length > 0) {
  console.log('\n--- WARNING: These are already in Tool 1 (will skip) ---');
  dupes.forEach(p => console.log('  ' + p.name + ' | ' + p.company));
}

// Execute the changes
const newToB2B = moveToB2B.filter(p => !b2bNames.has(normalize(p.name)));

// Update Tool 2 - only keep cyber prospects
cyber.prospects = keepInCyber;
fs.writeFileSync('data/cyber-prospects.json', JSON.stringify(cyber, null, 2));

// Update Tool 1 - add B2B marketing prospects (skip dupes)
newToB2B.forEach(p => b2b.prospects.push(p));
fs.writeFileSync('data/b2b-prospects.json', JSON.stringify(b2b, null, 2));

console.log('\n=== DONE ===');
console.log('Tool 2 now has ' + keepInCyber.length + ' prospects');
console.log('Tool 1 now has ' + b2b.prospects.length + ' prospects (' + newToB2B.length + ' added)');
console.log('Removed ' + remove.length + ' irrelevant prospects');
