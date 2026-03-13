const fs = require('fs');
const files = {
  'Tool #1 (b2b-prospects)': 'data/b2b-prospects.json',
  'Tool #2 (cyber-prospects)': 'data/cyber-prospects.json',
  'Tool #3 (b2b-2nd-prospects)': 'data/b2b-2nd-prospects.json',
  'Tool #4 (cyber-2nd-prospects)': 'data/cyber-2nd-prospects.json',
  'Tool #5 (referral-1st-prospects)': 'data/referral-1st-prospects.json',
  'Tool #6 (referral-2nd-prospects)': 'data/referral-2nd-prospects.json'
};

const allData = {};
for (const [label, path] of Object.entries(files)) {
  try {
    const raw = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    allData[label] = data.prospects || [];
  } catch(e) {
    allData[label] = [];
    console.log('ERROR reading ' + path + ': ' + e.message);
  }
}

console.log('=== RECORD COUNTS ===');
for (const [label, prospects] of Object.entries(allData)) {
  console.log(label + ': ' + prospects.length + ' records');
}

console.log('\n=== 1. DUPLICATES WITHIN EACH TOOL ===');
for (const [label, prospects] of Object.entries(allData)) {
  const seen = {};
  const dupes = [];
  prospects.forEach((p, i) => {
    const name = p.name.trim().toLowerCase();
    if (seen[name] !== undefined) {
      dupes.push({ name: p.name, company: p.company, title: p.title, firstIdx: seen[name], secondIdx: i });
    } else {
      seen[name] = i;
    }
  });
  if (dupes.length > 0) {
    console.log('\n' + label + ':');
    dupes.forEach(d => {
      const first = prospects[d.firstIdx];
      console.log('  DUPE: "' + d.name + '"');
      console.log('    1st (pos ' + d.firstIdx + '): company="' + first.company + '" title="' + first.title + '"');
      console.log('    2nd (pos ' + d.secondIdx + '): company="' + d.company + '" title="' + d.title + '"');
    });
  } else {
    console.log(label + ': No internal duplicates');
  }
}

console.log('\n=== 2. DUPLICATES ACROSS TOOLS ===');
const nameToTools = {};
for (const [label, prospects] of Object.entries(allData)) {
  prospects.forEach(p => {
    const name = p.name.trim().toLowerCase();
    if (!nameToTools[name]) nameToTools[name] = [];
    nameToTools[name].push({ tool: label, company: p.company, title: p.title, name: p.name });
  });
}
let crossDupeCount = 0;
for (const [name, entries] of Object.entries(nameToTools)) {
  const toolSet = new Set(entries.map(e => e.tool));
  if (toolSet.size > 1) {
    crossDupeCount++;
    console.log('\n"' + entries[0].name + '":');
    entries.forEach(e => {
      console.log('  ' + e.tool + ': company="' + e.company + '" title="' + e.title + '"');
    });
  }
}
if (crossDupeCount === 0) console.log('No cross-tool duplicates found');

console.log('\n=== 4. JUNK/TEST/HEADER RECORDS ===');
const junkPatterns = [/^name$/i, /^test$/i, /^referral$/i, /^header/i, /^high-value/i, /^solid/i, /^tool \d/i, /^batch/i];
for (const [label, prospects] of Object.entries(allData)) {
  prospects.forEach(p => {
    const n = p.name.trim();
    const isJunk = junkPatterns.some(pat => pat.test(n));
    const isEmpty = (n === '' && p.company === '' && p.title === '');
    const hasNoData = (!p.company && !p.title && !p.linkedinUrl && n.length > 0);
    if (isJunk || isEmpty || hasNoData) {
      console.log(label + ': name="' + n + '" company="' + p.company + '" title="' + p.title + '"');
    }
  });
}

console.log('\n=== 5. SWAPPED FIELDS (company in title field or vice versa) ===');
const titleKeywords = ['cmo', 'vp ', 'vice president', 'director', 'head of', 'chief marketing', 'chief executive', 'senior director', 'founder', 'president', 'senior vice'];
for (const [label, prospects] of Object.entries(allData)) {
  prospects.forEach(p => {
    const comp = (p.company || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    // Check if company field contains what looks like a job title
    const compLooksLikeTitle = titleKeywords.some(k => comp.startsWith(k) || (comp.includes(k) && comp.length < 60));
    // Filter out false positives where company name legitimately contains these words
    const companyExceptions = ['security', 'technologies', 'networks', 'agency', 'studios', 'group', 'consulting', 'solutions', 'digital', 'marketing'];
    const isCompanyException = companyExceptions.some(ex => comp.includes(ex));

    if (compLooksLikeTitle && !isCompanyException) {
      console.log(label + ': SWAPPED - name="' + p.name + '" company="' + p.company + '" title="' + p.title + '"');
    }
  });
}

console.log('\n=== 3. WRONG TOOL CHECK ===');
// B2B tools (1,3) should have agencies/marketing companies, not cybersecurity companies
// Cyber tools (2,4) should have cybersecurity companies, not agencies
// Referral tools (5,6) should have referral partners
const cyberKeywords = ['security', 'cyber', 'cloudflare', 'crowdstrike', 'qualys', 'sumo logic', 'armis', 'f5', 'cyberark', 'netenrich'];
const agencyKeywords = ['agency', 'studios', 'production', 'marketing agency', 'pr ', 'public relations', 'creative agency', 'digital agency'];

console.log('\nChecking B2B tools for cyber companies that might be misplaced...');
for (const label of ['Tool #1 (b2b-prospects)', 'Tool #3 (b2b-2nd-prospects)']) {
  const prospects = allData[label];
  prospects.forEach(p => {
    const comp = (p.company || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    if (cyberKeywords.some(k => comp.includes(k)) && !agencyKeywords.some(k => comp.includes(k))) {
      // Looks like a cyber company in a B2B tool
      // But only flag it if it really seems wrong
    }
  });
}

console.log('\nChecking Cyber tools for agency companies that might be misplaced...');
for (const label of ['Tool #2 (cyber-prospects)', 'Tool #4 (cyber-2nd-prospects)']) {
  const prospects = allData[label];
  prospects.forEach(p => {
    const comp = (p.company || '').toLowerCase();
    if (agencyKeywords.some(k => comp.includes(k))) {
      console.log(label + ': POSSIBLE WRONG TOOL - name="' + p.name + '" company="' + p.company + '" (looks like an agency, not a cyber company)');
    }
  });
}

console.log('\nChecking Referral tools for non-referral-partner types...');
// Referral partners are typically: agencies, consultants, fractional CMOs, marketing firms
// NOT cybersecurity product companies or large enterprises
for (const label of ['Tool #5 (referral-1st-prospects)', 'Tool #6 (referral-2nd-prospects)']) {
  const prospects = allData[label];
  prospects.forEach(p => {
    const comp = (p.company || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    // Check for cyber product companies in referral tools
    if (cyberKeywords.some(k => comp.includes(k)) && !agencyKeywords.some(k => comp.includes(k))) {
      console.log(label + ': POSSIBLE WRONG TOOL - name="' + p.name + '" company="' + p.company + '" (looks like a cyber company, not a referral partner)');
    }
  });
}

// Check for 1st connection prospects in 2nd connection tools and vice versa
// This is harder to detect without connection data, but we can check if someone in a 2nd-conn tool is also in a 1st-conn tool
console.log('\nChecking for prospects in BOTH 1st and 2nd connection tools of same segment...');
const b2b1stNames = new Set(allData['Tool #1 (b2b-prospects)'].map(p => p.name.trim().toLowerCase()));
const cyber1stNames = new Set(allData['Tool #2 (cyber-prospects)'].map(p => p.name.trim().toLowerCase()));
const ref1stNames = new Set(allData['Tool #5 (referral-1st-prospects)'].map(p => p.name.trim().toLowerCase()));

allData['Tool #3 (b2b-2nd-prospects)'].forEach(p => {
  const name = p.name.trim().toLowerCase();
  if (b2b1stNames.has(name)) {
    console.log('B2B: "' + p.name + '" is in BOTH Tool #1 (1st conn) AND Tool #3 (2nd conn)');
  }
});
allData['Tool #4 (cyber-2nd-prospects)'].forEach(p => {
  const name = p.name.trim().toLowerCase();
  if (cyber1stNames.has(name)) {
    console.log('Cyber: "' + p.name + '" is in BOTH Tool #2 (1st conn) AND Tool #4 (2nd conn)');
  }
});
allData['Tool #6 (referral-2nd-prospects)'].forEach(p => {
  const name = p.name.trim().toLowerCase();
  if (ref1stNames.has(name)) {
    console.log('Referral: "' + p.name + '" is in BOTH Tool #5 (1st conn) AND Tool #6 (2nd conn)');
  }
});
