const fs = require("fs");
const path = require("path");
const dataDir = path.join(__dirname, "..", "data");

const files = {
  "Tool1_B2B_1st": "b2b-prospects.json",
  "Tool2_Cyber_1st": "cyber-prospects.json",
  "Tool3_B2B_2nd": "b2b-2nd-prospects.json",
  "Tool4_Cyber_2nd": "cyber-2nd-prospects.json",
  "Tool5_Ref_1st": "referral-1st-prospects.json",
  "Tool6_Ref_2nd": "referral-2nd-prospects.json"
};

const all = [];
Object.entries(files).forEach(([tool, file]) => {
  const fp = path.join(dataDir, file);
  if (!fs.existsSync(fp)) return;
  const d = JSON.parse(fs.readFileSync(fp, "utf8"));
  d.prospects.forEach(p => {
    all.push({name: p.name, company: p.company||"", title: p.title||"", status: p.status, tool: tool});
  });
});

// Cyber in B2B
console.log("=== CYBER COMPANIES IN B2B TOOLS ===");
const cyberKW = ["security","cyber","firewall","threat","vuln","breach","siem","endpoint","phish","malware","pentest","infosec","netsec","encrypt","zero trust","deception","soar","xdr","edr","mdr"];
all.forEach(p => {
  if (p.tool === "Tool1_B2B_1st" || p.tool === "Tool3_B2B_2nd") {
    const text = (p.company + " " + p.title).toLowerCase();
    const match = cyberKW.find(kw => text.includes(kw));
    if (match) console.log("  " + p.name + " | " + p.company + " | " + p.title + " [" + p.tool + "] keyword=" + match);
  }
});

// Agencies in B2B/Cyber
console.log("\n=== AGENCIES IN B2B/CYBER TOOLS (should be referral) ===");
all.forEach(p => {
  if (p.tool.includes("B2B") || p.tool.includes("Cyber")) {
    const text = (p.company + "").toLowerCase();
    if (text.includes("agency") || text.includes("consultancy") || text.includes("production company")) {
      console.log("  " + p.name + " | " + p.company + " [" + p.tool + "]");
    }
  }
});

// Non-referral in referral tools
console.log("\n=== POSSIBLY MISPLACED IN REFERRAL TOOLS (non-agency/marketing) ===");
const refKW = ["agency","consult","studio","production","public relation","fractional","marketing","brand","media","digital","creative","content","video","film","design","communications","advertising","social media","seo","web","freelanc","influencer","pr "];
all.forEach(p => {
  if (p.tool.includes("Ref")) {
    const text = (p.company + " " + p.title).toLowerCase();
    const isRef = refKW.some(kw => text.includes(kw));
    if (!isRef) {
      console.log("  " + p.name + " | " + p.company + " | " + p.title + " [" + p.tool + "]");
    }
  }
});

// Non-cyber in Cyber tools (companies that are clearly not cybersecurity)
console.log("\n=== NON-CYBER COMPANIES IN CYBER TOOLS (sampling) ===");
const cyberCompanyKW = ["security","cyber","threat","vuln","breach","siem","firewall","endpoint","phish","malware","pentest","infosec","netsec","encrypt","zero trust","deception","soar","xdr","edr","mdr","defense","defence","identity","auth","access","risk","compliance","incident","forensic","detect","protect","safeguard","shield","guard","sentinel","crowdstrike","qualys","cloudflare","palo alto","fortinet","splunk","elastic","sumo logic","okta","sailpoint","cyberark","zscaler","darktrace","rapid7","tenable","snyk","wiz","lacework","aqua","prisma","checkpoint","proofpoint","mimecast","abnormal","cofense","netskope","tessian","hack","brinqa","anvilogic","obsidian","chainguard","checkmarx","greynoise","acalvio","teleport","abstract","upwind","sandboxaq","trusted","blinkops","seemplicity","coro","inspectiv","vulncheck","ndata"];
all.forEach(p => {
  if (p.tool.includes("Cyber")) {
    const text = (p.company + " " + p.title).toLowerCase();
    const isCyber = cyberCompanyKW.some(kw => text.includes(kw));
    if (!isCyber && p.company) {
      console.log("  " + p.name + " | " + p.company + " | " + p.title + " [" + p.tool + "]");
    }
  }
});

// Swapped fields summary for Tool 2
console.log("\n=== TOOL 2 SWAPPED FIELDS COUNT ===");
const t2 = JSON.parse(fs.readFileSync(path.join(dataDir, "cyber-prospects.json"), "utf8"));
let swapped = 0;
const titleKW = ["CMO","VP ","VP,","Director","Head of","Chief","SVP","Senior ","Manager","Officer","Advisor","Member","Founder","CEO","President","Producer","CRO","Editor","Co-Founder","Contributor"];
t2.prospects.forEach(p => {
  const compHasTitle = titleKW.some(kw => p.company && p.company.includes(kw));
  const titleHasTitle = titleKW.some(kw => p.title && p.title.includes(kw));
  if (compHasTitle && !titleHasTitle) swapped++;
});
console.log("  Tool 2 swapped company/title: " + swapped + " out of " + t2.prospects.length);
