#!/usr/bin/env node
/**
 * Import Research Prospects Script
 * Parses ~500+ prospects from Sales Navigator research markdown file,
 * deduplicates against existing 408 prospects, and merges into prospects.json.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Paths ---
const MARKDOWN_FILE = path.join(__dirname, 'Claude code prospecting organization experiment.md');
const PROSPECTS_FILE = path.join(__dirname, 'warming-app copy', 'data', 'prospects.json');
const BACKUP_FILE = path.join(__dirname, 'warming-app copy', 'data', 'backups', 'prospects_pre_research_import.json');

// --- Helpers ---

function generateId() {
  return crypto.randomUUID();
}

/** Remove **bold**, emoji, and backslash escapes. Trim whitespace. */
function cleanName(raw) {
  let name = raw
    .replace(/\*\*/g, '')           // remove bold markers
    .replace(/\\-/g, '-')           // unescape dashes
    .replace(/\\&/g, '&')           // unescape ampersands
    .replace(/[^\w\s.,''\-()áéíóúàèìòùâêîôûäëïöüñçøåÉÈÊËÀÂÆÇÔÙÛÜŸŒšžÿ]/gu, '') // remove emoji and special chars but keep accented letters
    .replace(/\s+/g, ' ')
    .trim();
  return name;
}

/** Clean company name */
function cleanCompany(raw) {
  return raw
    .replace(/\*\*/g, '')
    .replace(/\\-/g, '-')
    .replace(/\\&/g, '&')
    .replace(/[🇦🇷🇺🇦✨💎🦢]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clean role/title */
function cleanRole(raw) {
  return raw
    .replace(/\*\*/g, '')
    .replace(/\\-/g, '-')
    .replace(/\\&/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Auto-assign tier based on title */
function assignTier(title) {
  const t = title.toLowerCase();
  // Tier 1: C-suite, VP, President, Founder
  if (/\b(cmo|cto|ceo|coo|cio|ciso|chief|vp\b|vice president|president|founder|co-founder|cofounder|board member|partner)\b/i.test(t)) {
    return 1;
  }
  // Tier 2: Director, Head, Senior Director
  if (/\b(director|head of|head,|sr\. dir|senior dir)\b/i.test(t)) {
    return 2;
  }
  // Tier 3: Everything else
  return 3;
}

/** Build a prospect record */
function makeProspect(name, company, title, segment, tag) {
  return {
    id: generateId(),
    name: cleanName(name),
    linkedin_url: '',
    linkedin_username: '',
    company: cleanCompany(company),
    title: cleanRole(title),
    segment: segment,
    tier: assignTier(title),
    icp_score: 0,
    tags: [tag],
    status: 'new',
    connected: false,
    check_in_days: 7,
    warmth_score: 0,
    engagements: [],
    next_check_in: null,
    last_engagement_date: null,
    notes: '',
    source: 'sales_navigator_research',
    batch: 'research_import_2026_02',
    created_at: '2026-02-28',
    sequence_type: null,
    sequence_step: null,
    sequence_started: null,
    follow_up_due: null,
    follow_up_count: 0,
    sequence_status: null
  };
}


// --- Parsers ---

/**
 * Parse Search A: one long line, names in **bold** followed by Company then Role.
 * Pattern: **Name**CompanyRole**NextName**CompanyRole...
 */
function parseSearchA(text) {
  const prospects = [];

  // The content for Search A is on line 3 (index-wise) of the file.
  // We need to find the block between "Search A" header and "Search B" header.
  const searchAStart = text.indexOf('**Stephanie Broyles**');
  const searchAEnd = text.indexOf('**Search B');
  if (searchAStart === -1 || searchAEnd === -1) {
    console.error('ERROR: Could not find Search A boundaries');
    return prospects;
  }

  const block = text.substring(searchAStart, searchAEnd);

  // Split on **Name** pattern. Each entry starts with **Name** followed by CompanyRole.
  // We'll use regex to find all **...** segments and what follows them.
  const entryPattern = /\*\*([^*]+)\*\*([^*]+?)(?=\*\*|$)/g;
  let match;

  while ((match = entryPattern.exec(block)) !== null) {
    const rawName = match[1].trim();
    const remainder = match[2].trim();

    if (!rawName || !remainder) continue;

    // Skip the header-like entry "NameCompanyRole" if it appears
    if (rawName === 'Stephanie Broyles' && remainder.startsWith('NameCompanyRole')) {
      // This is actually "NameCompanyRole**Stephanie Broyles**Mend.ioChief..."
      // Skip the prefix, the real entry follows
    }

    // Split remainder into company and role.
    // Role keywords that mark where the role starts:
    const roleStarters = [
      'Chief Marketing Officer', 'Chief Brand Officer', 'Chief Marketing & Operating Officer',
      'Chief of Staff', 'Chief Executive Officer', 'Chief Technology Officer',
      'CMO', 'CTO', 'CEO', 'COO',
      'VP of Marketing', 'VP, Marketing', 'VP Marketing', 'VP, Head of Marketing',
      'VP of Growth Marketing', 'VP, Global Demand Generation', 'VP Demand Generation',
      'VP of Marketing & Alliances', 'VP of Marketing & Communications',
      'VP, Corp Marketing', 'VP Demand Generation',
      'Vice President Marketing', 'Vice President of Marketing',
      'Vice President Global Marketing', 'Vice President, Marketing',
      'Vice President, Growth Marketing', 'Vice President Telecom Marketing',
      'Head of Marketing', 'Head of Field Marketing', 'Head of Revenue Marketing',
      'Head of Field and Partner Marketing', 'Head of Content Marketing',
      'Head of Growth Marketing', 'Head of Creator Marketing',
      'Head of Technical Marketing', 'Head of Marketing & Distribution',
      'Head of Marketing & Online Sales', 'Head of Competitive Intelligence',
      'Head of PPC', 'HEAD OF PPC',
      'Director of Integrated Marketing', 'Director of Marketing',
      'Marketing Director',
      'Advisor', 'Advisory Board Member',
      'Fractional CMO', 'CMO Club Member',
      'Executive Vice President', 'SVP Business Strategy',
      'Deputy CEO', 'Board Advisor',
      'Managing Director',
      'Member', 'Partner & CMO', 'Partner',
      'IAM VP of Marketing', 'Marketing VP',
    ];

    let company = remainder;
    let role = '';

    // Try to find the role by searching for known role prefixes
    // We'll try a regex approach: look for title keywords
    const rolePrefixRegex = /(?:Chief |Vice President|VP[ ,]|Head of |Director |CMO|CTO|CEO|COO|Advisor|Advisory|Fractional|Executive Vice|SVP |Deputy |Board |Managing |Marketing Director|Marketing VP|Member|Partner|IAM VP|HEAD OF)/;
    const roleMatch = rolePrefixRegex.exec(remainder);

    if (roleMatch) {
      company = remainder.substring(0, roleMatch.index).trim();
      role = remainder.substring(roleMatch.index).trim();
    } else {
      // Fallback: try to find common company/role boundary
      company = remainder;
      role = 'Unknown';
    }

    // Clean up company - remove trailing/leading punctuation
    company = company.replace(/^[,\s]+|[,\s]+$/g, '');

    if (rawName && company) {
      prospects.push(makeProspect(rawName, company, role, 'cyber_cmo', 'search_a'));
    }
  }

  return prospects;
}

/**
 * Parse a markdown table section. Returns array of {name, company, role}.
 */
function parseMarkdownTable(lines) {
  const prospects = [];

  for (const line of lines) {
    // Skip empty lines, header rows, separator rows
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.match(/^\|\s*[-:]+\s*\|/)) continue; // separator row like |:---|:---|
    if (trimmed.match(/^\|\s*Name\s*\|/i)) continue;  // header row

    // Split by | and extract columns
    const cols = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cols.length < 3) continue;

    const rawName = cols[0];
    const rawCompany = cols[1];
    const rawRole = cols[2];

    // Skip if name looks like a header
    if (rawName.toLowerCase() === 'name') continue;

    const name = cleanName(rawName);
    const company = cleanCompany(rawCompany);
    const role = cleanRole(rawRole);

    if (name && company) {
      prospects.push({ name, company, role });
    }
  }

  return prospects;
}


// --- Main ---
function main() {
  console.log('=== Research Prospects Import Script ===\n');

  // 1. Read source files
  const mdText = fs.readFileSync(MARKDOWN_FILE, 'utf-8');
  const mdLines = mdText.split('\n');
  const existingData = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf-8'));

  console.log(`Existing prospects: ${existingData.prospects.length}`);

  // 2. Backup current prospects
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(existingData, null, 2));
  console.log(`Backup created: ${BACKUP_FILE}\n`);

  // 3. Build dedup set from existing prospects (normalized lowercase names)
  const existingNames = new Set(
    existingData.prospects.map(p => p.name.toLowerCase().trim())
  );

  // 4. Parse each search segment
  console.log('--- Parsing Search Segments ---\n');

  // Search A: Non-table format, single long line
  const searchAProspects = parseSearchA(mdText);
  console.log(`Search A (Cyber CMOs/VPs): ${searchAProspects.length} parsed`);

  // Search B: Table from line ~11 to line ~104
  // Find the lines for Search B table
  const searchBStart = mdLines.findIndex(l => l.includes('Search B — Growth/Demand Gen Directors'));
  const searchBEnd = mdLines.findIndex((l, i) => i > searchBStart && l.includes('Search C'));
  const searchBLines = mdLines.slice(searchBStart, searchBEnd);
  const searchBRaw = parseMarkdownTable(searchBLines);
  const searchBProspects = searchBRaw.map(p =>
    makeProspect(p.name, p.company, p.role, 'demand_gen', 'search_b')
  );
  console.log(`Search B (Growth/Demand Gen Directors): ${searchBProspects.length} parsed`);

  // Search C: Table from line ~110 to line ~312
  const searchCStart = mdLines.findIndex(l => l.includes('Search C — Podcast Interview Targets'));
  const searchCEnd = mdLines.findIndex((l, i) => i > searchCStart && l.includes('Search D'));
  const searchCLines = mdLines.slice(searchCStart, searchCEnd);
  const searchCRaw = parseMarkdownTable(searchCLines);
  const searchCProspects = searchCRaw.map(p =>
    makeProspect(p.name, p.company, p.role, 'podcast_target', 'search_c')
  );
  console.log(`Search C (Podcast Interview Targets): ${searchCProspects.length} parsed`);

  // Search D: Table from line ~320 to end
  const searchDStart = mdLines.findIndex(l => l.includes('Search D — Bay Area AI & Tech Marketing Leaders'));
  const searchDLines = mdLines.slice(searchDStart);
  const searchDRaw = parseMarkdownTable(searchDLines);
  const searchDProspects = searchDRaw.map(p =>
    makeProspect(p.name, p.company, p.role, 'ai_ml_leader', 'search_d')
  );
  console.log(`Search D (Bay Area AI & Tech Marketing Leaders): ${searchDProspects.length} parsed`);

  // 5. Combine all new prospects
  const allNew = [
    ...searchAProspects,
    ...searchBProspects,
    ...searchCProspects,
    ...searchDProspects
  ];

  console.log(`\nTotal parsed across all segments: ${allNew.length}`);

  // 6. Dedup against existing + cross-segment dedup
  const dupes = [];
  const crossDupes = [];
  const netNew = [];
  const seenInImport = new Set();

  for (const p of allNew) {
    const normName = p.name.toLowerCase().trim();

    // Skip empty names
    if (!normName || normName.length < 2) continue;

    // Check against existing prospects
    if (existingNames.has(normName)) {
      dupes.push({ name: p.name, segment: p.tags[0], reason: 'exists_in_db' });
      continue;
    }

    // Check cross-segment duplicates (within this import)
    if (seenInImport.has(normName)) {
      crossDupes.push({ name: p.name, segment: p.tags[0], reason: 'cross_segment_dupe' });
      continue;
    }

    seenInImport.add(normName);
    netNew.push(p);
  }

  // 7. Print results
  console.log('\n--- Dedup Results ---\n');
  console.log(`Duplicates (already in DB): ${dupes.length}`);
  if (dupes.length > 0) {
    console.log('  Skipped (existing):');
    for (const d of dupes) {
      console.log(`    - ${d.name} (${d.segment})`);
    }
  }

  console.log(`\nCross-segment duplicates (within import): ${crossDupes.length}`);
  if (crossDupes.length > 0) {
    console.log('  Skipped (cross-segment):');
    for (const d of crossDupes) {
      console.log(`    - ${d.name} (${d.segment})`);
    }
  }

  console.log(`\nNet new prospects to add: ${netNew.length}`);

  // 8. Merge and write
  const mergedProspects = [...existingData.prospects, ...netNew];
  const outputData = { prospects: mergedProspects };

  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(outputData, null, 2));

  console.log(`\n--- Final Stats ---\n`);
  console.log(`Previous total: ${existingData.prospects.length}`);
  console.log(`New added: ${netNew.length}`);
  console.log(`New total: ${mergedProspects.length}`);
  console.log(`\nBreakdown by segment:`);

  const segmentCounts = {};
  for (const p of netNew) {
    const seg = p.tags[0];
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  }
  for (const [seg, count] of Object.entries(segmentCounts)) {
    console.log(`  ${seg}: ${count}`);
  }

  const tierCounts = { 1: 0, 2: 0, 3: 0 };
  for (const p of netNew) {
    tierCounts[p.tier]++;
  }
  console.log(`\nBreakdown by tier:`);
  console.log(`  Tier 1 (C-suite/VP/Founder): ${tierCounts[1]}`);
  console.log(`  Tier 2 (Director/Head): ${tierCounts[2]}`);
  console.log(`  Tier 3 (Other): ${tierCounts[3]}`);

  console.log(`\nDone! prospects.json updated.`);
}

main();
