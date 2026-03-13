const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/cyber-2nd-prospects.json', 'utf8'));
const prospects = data.prospects;

// 1. Swapped company/title -- expanded check
// Look for entries where company field contains a role/title keyword
console.log("=== DETAILED SWAPPED FIELD CHECK ===");
const titleKeywords = /\b(VP|CEO|CTO|CMO|CISO|CSO|COO|CFO|Director|Head|Manager|Senior|Chief|President|Founder|Officer|Advisor|Board|Partner|CRO|Contributor|Member)\b/i;
const swapped = [];
prospects.forEach((p, i) => {
  if (p.company && titleKeywords.test(p.company) && p.title && !titleKeywords.test(p.title)) {
    swapped.push({index: i, name: p.name, company: p.company, title: p.title});
  }
});
console.log("Entries where company contains title keywords AND title contains no title keywords:", swapped.length);
swapped.forEach(e => console.log("  #" + e.index + ": " + e.name + " | company='" + e.company + "' | title='" + e.title + "'"));
console.log("");

// 2. All entries where company field contains role-ish text (broader check)
console.log("=== ALL ENTRIES WITH ROLE TEXT IN COMPANY FIELD ===");
const roleInCompany = [];
prospects.forEach((p, i) => {
  if (p.company && titleKeywords.test(p.company)) {
    roleInCompany.push({index: i, name: p.name, company: p.company, title: p.title});
  }
});
console.log("Count:", roleInCompany.length);
roleInCompany.forEach(e => console.log("  #" + e.index + ": " + e.name + " | company='" + e.company + "' | title='" + e.title + "'"));
console.log("");

// 3. Entries with empty company
const emptyCompany = prospects.filter(p => !p.company || p.company.trim() === "");
console.log("=== ENTRIES WITH EMPTY COMPANY ===");
console.log("Count:", emptyCompany.length);
emptyCompany.forEach(p => console.log("  " + p.name + " | title='" + p.title + "'"));
console.log("");

// 4. Duplicate: Ana Gabriela Rodriguez appears twice?
console.log("=== CHECKING FOR 'ANA GABRIELA' DUPLICATE ===");
prospects.forEach((p, i) => {
  if (p.name.toLowerCase().includes("ana gabriela")) {
    console.log("  #" + i + ": " + p.name + " | " + p.company + " | " + p.title + " | id=" + p.id);
  }
});
console.log("");

// 5. Non-cyber entries that look like they belong in B2B (no cyber/security keywords in company or title)
console.log("=== POTENTIALLY NON-CYBER ENTRIES (no cyber/security keywords anywhere) ===");
const cyberKeywords = /\b(cyber|security|infosec|CISO|SOC|threat|defense|defend|firewall|malware|phishing|endpoint|SIEM|detection|response|vulnerability|pentest|penetration|forensic|incident|compliance|risk|identity|access|authentication|encryption|privacy|surveillance|hacking|hack|exploit|intrusion|secure|guard|protect|shield|sentinel)\b/i;
const nonCyber = [];
prospects.forEach((p, i) => {
  const combined = (p.name + " " + p.company + " " + p.title).toLowerCase();
  if (!cyberKeywords.test(combined)) {
    nonCyber.push({index: i, name: p.name, company: p.company, title: p.title});
  }
});
console.log("Count:", nonCyber.length);
nonCyber.forEach(e => console.log("  #" + e.index + ": " + e.name + " | " + e.company + " | " + e.title));
