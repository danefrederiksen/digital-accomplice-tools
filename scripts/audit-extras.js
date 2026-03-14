const fs = require("fs");

// Check within-tool duplicates in Tool 4
const d = JSON.parse(fs.readFileSync("data/cyber-2nd-prospects.json","utf8"));
const dupes = {};
d.prospects.forEach(p => {
  const k = p.name.toLowerCase().trim();
  if (!dupes[k]) dupes[k] = 0;
  dupes[k]++;
});
console.log("=== WITHIN-TOOL DUPLICATES (Tool 4) ===");
Object.entries(dupes).forEach(([k,v]) => { if (v > 1) console.log("  " + k + " (" + v + "x)"); });

// Fara Rosenzweig
console.log("\n=== Fara Rosenzweig across tools ===");
["b2b-prospects.json","b2b-2nd-prospects.json","cyber-prospects.json","referral-1st-prospects.json"].forEach(f => {
  if (!fs.existsSync("data/" + f)) return;
  const data = JSON.parse(fs.readFileSync("data/" + f, "utf8"));
  data.prospects.forEach(p => {
    if (p.name.toLowerCase().includes("fara")) console.log("  " + f + ": " + p.name + " | " + p.company + " | " + p.status);
  });
});

// ChaosTrack cross-check
console.log("\n=== ChaosTrack prospects ===");
["b2b-prospects.json","cyber-2nd-prospects.json","cyber-prospects.json"].forEach(f => {
  const data = JSON.parse(fs.readFileSync("data/" + f, "utf8"));
  data.prospects.forEach(p => {
    const text = (p.company + " " + p.title).toLowerCase();
    if (text.includes("chaostrack")) console.log("  " + f + ": " + p.name + " | co=" + p.company + " | ti=" + p.title);
  });
});

// Substack stats
console.log("\n=== Substack data quality ===");
const sub = JSON.parse(fs.readFileSync("data/substack-prospects.json","utf8"));
let noName = 0, noEmail = 0, noCompany = 0;
sub.prospects.forEach(p => {
  if (!p.name || p.name.length < 3) noName++;
  if (!p.email) noEmail++;
  if (!p.company) noCompany++;
});
console.log("  Total: " + sub.prospects.length);
console.log("  Missing/short name: " + noName);
console.log("  Missing email: " + noEmail);
console.log("  Missing company: " + noCompany);
