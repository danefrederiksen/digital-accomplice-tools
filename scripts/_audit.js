const fs = require('fs');

// ===== TOOL #4: cyber-2nd-prospects.json =====
const cyber2nd = JSON.parse(fs.readFileSync('./data/cyber-2nd-prospects.json', 'utf8'));
const prospects = cyber2nd.prospects;
console.log("=== TOOL #4: cyber-2nd-prospects.json ===");
console.log("Total records:", prospects.length);
console.log("");

// Status breakdown
const statusCounts = {};
prospects.forEach(p => {
  const s = p.status || "MISSING";
  statusCounts[s] = (statusCounts[s] || 0) + 1;
});
console.log("STATUS BREAKDOWN:");
Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => console.log("  " + s + ":", c));
console.log("");

// Junk patterns
const junkPatterns = ["ICP", "REFERRAL", "UNKNOWN", "SECTION", "HEADER", "---", "==="];
const emptyNames = [];
const junkEntries = [];
const suspiciousSwap = [];

prospects.forEach((p, i) => {
  if (p.name === null || p.name === undefined || p.name.trim() === "") {
    emptyNames.push({index: i, id: p.id, name: p.name, company: p.company, title: p.title});
    return;
  }
  const upperName = p.name.toUpperCase();
  for (const pat of junkPatterns) {
    if (upperName === pat || upperName.includes(pat)) {
      junkEntries.push({index: i, id: p.id, name: p.name, company: p.company, title: p.title});
      return;
    }
  }
  // Company looks like a title
  if (p.company && /^(VP|CEO|CTO|CMO|CISO|CSO|COO|CFO|Director|Head of|Manager|Senior|Chief|President|Founder)/i.test(p.company)) {
    suspiciousSwap.push({index: i, name: p.name, company: p.company, title: p.title, issue: "company looks like a title"});
  }
  // Title looks like a company name
  if (p.title && /^(Inc|LLC|Ltd|Corp|Solutions|Technologies|Security|Systems|Software|Group|Labs|Networks)/i.test(p.title)) {
    suspiciousSwap.push({index: i, name: p.name, company: p.company, title: p.title, issue: "title looks like a company"});
  }
});

console.log("EMPTY NAMES:", emptyNames.length);
emptyNames.forEach(e => console.log("  ", JSON.stringify(e)));
console.log("");
console.log("JUNK PATTERN NAMES:", junkEntries.length);
junkEntries.forEach(e => console.log("  ", JSON.stringify(e)));
console.log("");
console.log("SWAPPED COMPANY/TITLE:", suspiciousSwap.length);
suspiciousSwap.forEach(e => console.log("  ", JSON.stringify(e)));
console.log("");

// Duplicates by name
const nameMap = {};
prospects.forEach((p, i) => {
  const key = p.name.toLowerCase().trim();
  if (nameMap[key] === undefined) nameMap[key] = [];
  nameMap[key].push({index: i, id: p.id, name: p.name, company: p.company, title: p.title, status: p.status});
});
const dupes = Object.entries(nameMap).filter(([k, v]) => v.length > 1);
console.log("DUPLICATES BY NAME:", dupes.length, "groups");
dupes.forEach(([name, entries]) => {
  console.log("  Name:", name, "(" + entries.length + " entries)");
  entries.forEach(e => console.log("    ", JSON.stringify(e)));
});
console.log("");

// Duplicates by LinkedIn URL
const urlMap = {};
prospects.forEach((p, i) => {
  if (p.linkedinUrl && p.linkedinUrl.trim()) {
    const key = p.linkedinUrl.toLowerCase().trim().replace(/\/+$/, '');
    if (urlMap[key] === undefined) urlMap[key] = [];
    urlMap[key].push({index: i, id: p.id, name: p.name, company: p.company});
  }
});
const urlDupes = Object.entries(urlMap).filter(([k, v]) => v.length > 1);
console.log("DUPLICATES BY LINKEDIN URL:", urlDupes.length, "groups");
urlDupes.forEach(([url, entries]) => {
  console.log("  URL:", url, "(" + entries.length + " entries)");
  entries.forEach(e => console.log("    ", JSON.stringify(e)));
});
console.log("");

// Missing LinkedIn URLs
const noUrl = prospects.filter(p => p.linkedinUrl === null || p.linkedinUrl === undefined || p.linkedinUrl.trim() === "");
console.log("MISSING LINKEDIN URLs:", noUrl.length);
noUrl.forEach(p => console.log("  ", p.name, "|", p.company, "|", p.title));
console.log("");

// Full listing
console.log("=== ALL ENTRIES (index: name | company | title) ===");
prospects.forEach((p, i) => {
  console.log(i + ": " + p.name + " | " + p.company + " | " + p.title);
});

console.log("");
console.log("=============================================");
console.log("");

// ===== TOOL #3: b2b-2nd-prospects.json =====
const b2b2nd = JSON.parse(fs.readFileSync('./data/b2b-2nd-prospects.json', 'utf8'));
console.log("=== TOOL #3: b2b-2nd-prospects.json ===");
console.log("Total records:", b2b2nd.prospects.length);
if (b2b2nd.prospects.length === 0) {
  console.log("FILE IS EMPTY (no prospects)");
}
console.log("");

console.log("=============================================");
console.log("");

// ===== COMMENT LOG =====
const commentLog = JSON.parse(fs.readFileSync('./data/comment-log.json', 'utf8'));
console.log("=== COMMENT LOG ===");
console.log("Total entries:", commentLog.length);
console.log("");

// Check segments
const segCounts = {};
commentLog.forEach(c => {
  const s = c.segment || "MISSING";
  segCounts[s] = (segCounts[s] || 0) + 1;
});
console.log("SEGMENTS:");
Object.entries(segCounts).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => console.log("  " + s + ":", c));
console.log("");

// Check company field issues (some have title in company)
console.log("COMMENT LOG ENTRIES:");
commentLog.forEach((c, i) => {
  console.log(i + ": " + c.prospectName + " | " + c.company + " | " + c.segment + " | prospectId=" + c.prospectId);
});
console.log("");

// Validate prospect IDs against source files
// Load all source files
const allProspectIds = new Set();

// Tool #4
prospects.forEach(p => allProspectIds.add(p.id));

// Tool #3
b2b2nd.prospects.forEach(p => allProspectIds.add(p.id));

// Also load other data files if they exist
const otherFiles = [
  'b2b-prospects.json',
  'cyber-prospects.json',
  'referral-1st-prospects.json',
  'referral-2nd-prospects.json'
];

otherFiles.forEach(f => {
  try {
    const d = JSON.parse(fs.readFileSync('./data/' + f, 'utf8'));
    const arr = d.prospects || d;
    if (Array.isArray(arr)) {
      arr.forEach(p => { if (p.id) allProspectIds.add(p.id); });
    }
    console.log("Loaded " + f + ": " + arr.length + " records");
  } catch(e) {
    console.log("Could not load " + f + ": " + e.message);
  }
});

console.log("Total unique prospect IDs across all files:", allProspectIds.size);
console.log("");

// Check comment log for orphan IDs
const orphans = commentLog.filter(c => c.prospectId && !allProspectIds.has(c.prospectId));
console.log("ORPHAN COMMENT LOG ENTRIES (prospectId not found in any data file):", orphans.length);
orphans.forEach(c => console.log("  ", c.prospectName, "|", c.company, "| prospectId=" + c.prospectId, "| segment=" + c.segment));
