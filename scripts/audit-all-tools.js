const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

const files = {
  "Tool1_B2B_1st": "b2b-prospects.json",
  "Tool2_Cyber_1st": "cyber-prospects.json",
  "Tool3_B2B_2nd": "b2b-2nd-prospects.json",
  "Tool4_Cyber_2nd": "cyber-2nd-prospects.json",
  "Tool5_Ref_1st": "referral-1st-prospects.json",
  "Tool6_Ref_2nd": "referral-2nd-prospects.json",
  "Tool9_Substack": "substack-prospects.json",
  "Tool12_Ref_Email": "referral-email-prospects.json"
};

const allProspects = [];

Object.entries(files).forEach(([tool, file]) => {
  const fp = path.join(dataDir, file);
  if (!fs.existsSync(fp)) { console.log(tool + ": FILE MISSING"); return; }
  const data = JSON.parse(fs.readFileSync(fp));
  const prospects = data.prospects;

  const statuses = {};
  let missingLinkedin = 0;
  let missingCompany = 0;
  const swapped = [];

  prospects.forEach(p => {
    statuses[p.status] = (statuses[p.status] || 0) + 1;
    if (!p.linkedinUrl) missingLinkedin++;
    if (!p.company) missingCompany++;

    const titleKW = ["CMO","VP ","VP,","Director","Head of","Chief","SVP","Senior ","Manager","Officer","Advisor","Member","Founder","CEO","President","Producer"];
    const compHasTitleKW = titleKW.some(kw => p.company && p.company.includes(kw));
    const titleHasTitleKW = titleKW.some(kw => p.title && p.title.includes(kw));
    if (compHasTitleKW && !titleHasTitleKW) {
      swapped.push(p.name + " | co=" + p.company + " | ti=" + p.title);
    }

    allProspects.push({name: p.name, company: p.company, title: p.title, linkedin: p.linkedinUrl || "", status: p.status, tool: tool});
  });

  console.log("\n=== " + tool + " (" + file + ") ===");
  console.log("Total: " + prospects.length);
  console.log("Statuses: " + JSON.stringify(statuses));
  console.log("Missing LinkedIn: " + missingLinkedin + " | Missing Company: " + missingCompany);
  if (swapped.length > 0) {
    console.log("SWAPPED FIELDS (" + swapped.length + "):");
    swapped.forEach(s => console.log("  " + s));
  }
});

// Duplicates by name
console.log("\n\n=== CROSS-TOOL NAME DUPLICATES ===");
const nameMap = {};
allProspects.forEach(p => {
  const key = p.name.toLowerCase().trim().replace(/\s+/g, " ");
  if (!nameMap[key]) nameMap[key] = [];
  nameMap[key].push(p);
});
Object.entries(nameMap).forEach(([name, entries]) => {
  if (entries.length > 1) {
    console.log("DUP: " + entries[0].name);
    entries.forEach(e => console.log("  " + e.tool + " | " + e.company + " | " + e.status));
  }
});

// Duplicates by LinkedIn URL
console.log("\n=== LINKEDIN URL DUPLICATES ===");
const urlMap = {};
allProspects.forEach(p => {
  if (p.linkedin && p.linkedin.trim()) {
    const key = p.linkedin.toLowerCase().trim().replace(/\/+$/, "");
    if (!urlMap[key]) urlMap[key] = [];
    urlMap[key].push(p);
  }
});
Object.entries(urlMap).forEach(([url, entries]) => {
  if (entries.length > 1) {
    console.log("DUP URL: " + url);
    entries.forEach(e => console.log("  " + e.name + " | " + e.tool + " | " + e.status));
  }
});

// Misplacement checks
console.log("\n\n=== MISPLACEMENT ANALYSIS ===");

console.log("\n--- Cyber companies in B2B tools ---");
const cyberKW = ["security","cyber","firewall","threat","vuln","breach","soc ","siem","endpoint","phish","malware","ransomware","pentest","infosec","compliance","risk","incident","netsec","encrypt","identity","auth","zero trust","deception","soar","xdr","edr","mdr"];
allProspects.forEach(p => {
  if (p.tool.includes("B2B")) {
    const comp = (p.company + " " + p.title).toLowerCase();
    const match = cyberKW.find(kw => comp.includes(kw));
    if (match) console.log("  CYBER in B2B: " + p.name + " (" + p.company + ") [" + p.tool + "] keyword=" + match);
  }
});

console.log("\n--- Agency/referral types in B2B or Cyber tools ---");
const agencyKW = ["agency","consulting","consultancy","studio","production company","public relations","fractional cmo"];
allProspects.forEach(p => {
  if (p.tool.startsWith("Tool1") || p.tool.startsWith("Tool2") || p.tool.startsWith("Tool3") || p.tool.startsWith("Tool4")) {
    const comp = (p.company + " " + p.title).toLowerCase();
    const match = agencyKW.find(kw => comp.includes(kw));
    if (match) console.log("  AGENCY in " + p.tool + ": " + p.name + " (" + p.company + ") keyword=" + match);
  }
});

console.log("\n--- Non-agency/non-marketing types in Referral tools ---");
allProspects.forEach(p => {
  if (p.tool.includes("Ref")) {
    const comp = (p.company + " " + p.title).toLowerCase();
    const isAgencyOrMktg = ["agency","consulting","consultancy","studio","production","pr ","public relations","fractional","marketing","brand","media","digital","creative","content","video","film","design","communications","advertising","social media","seo","growth","influencer","web"].some(kw => comp.includes(kw));
    if (!isAgencyOrMktg) {
      console.log("  NON-REFERRAL in " + p.tool + ": " + p.name + " (" + p.company + ", " + p.title + ")");
    }
  }
});

// Also list all prospects with full details for each tool
console.log("\n\n=== FULL PROSPECT LISTINGS ===");
Object.entries(files).forEach(([tool, file]) => {
  const fp = path.join(dataDir, file);
  if (!fs.existsSync(fp)) return;
  const data = JSON.parse(fs.readFileSync(fp));
  console.log("\n--- " + tool + " ---");
  data.prospects.forEach((p, i) => {
    const dates = [];
    if (p.dmSentDate) dates.push("dm=" + p.dmSentDate);
    if (p.connectionSentDate) dates.push("conn=" + p.connectionSentDate);
    if (p.lastActionDate) dates.push("last=" + p.lastActionDate);
    if (p.emailSentDate) dates.push("email=" + p.emailSentDate);
    console.log("  " + (i+1) + ". " + p.name + " | " + (p.company||"(no company)") + " | " + (p.title||"(no title)") + " | " + p.status + " | LI=" + (p.linkedinUrl ? "YES" : "NO") + (dates.length ? " | " + dates.join(", ") : ""));
  });
});
