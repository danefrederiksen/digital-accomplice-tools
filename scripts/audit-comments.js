const fs = require("fs");
const log = JSON.parse(fs.readFileSync("data/comment-log.json", "utf8"));

const files = {
  cyber_2nd: JSON.parse(fs.readFileSync("data/cyber-2nd-prospects.json", "utf8")),
  referral_1st: JSON.parse(fs.readFileSync("data/referral-1st-prospects.json", "utf8")),
  b2b: JSON.parse(fs.readFileSync("data/b2b-prospects.json", "utf8")),
};
try { files.cyber = JSON.parse(fs.readFileSync("data/cyber-prospects.json", "utf8")); } catch(e) {}

console.log("Loaded:", Object.keys(files).join(", "));

// Build ID lookup
const allIds = {};
for (const [file, data] of Object.entries(files)) {
  const prospects = data.prospects || data;
  if (Array.isArray(prospects)) {
    prospects.forEach(p => { allIds[p.id] = { name: p.name, file, cc: p.comment_count }; });
  }
}

// Count per prospect in log
const counts = {};
log.forEach(e => { counts[e.prospectId] = (counts[e.prospectId] || 0) + 1; });

console.log("\n=== LOG ENTRY CHECK ===");
log.forEach(e => {
  const f = allIds[e.prospectId];
  console.log(e.prospectName + " (" + e.segment + ") — " + (f ? "FOUND in " + f.file : "ORPHANED"));
});

console.log("\n=== COUNT CHECK ===");
for (const [pid, cnt] of Object.entries(counts)) {
  const f = allIds[pid];
  if (f) {
    const stored = (f.cc !== undefined && f.cc !== null) ? f.cc : "n/a";
    console.log(f.name + ": log=" + cnt + " stored=" + stored + " " + (f.cc === cnt ? "OK" : "MISMATCH"));
  } else {
    console.log("orphaned ID " + pid + ": log=" + cnt);
  }
}

// Check all prospects that have comment_count > 0 but no log entries
console.log("\n=== PROSPECTS WITH COMMENTS BUT NO LOG ===");
for (const [id, info] of Object.entries(allIds)) {
  if (info.cc > 0 && !counts[id]) {
    console.log(info.name + " (" + info.file + "): comment_count=" + info.cc + " but 0 log entries");
  }
}

console.log("\n=== BRIAN RUCKER ===");
const brian = Object.values(allIds).find(p => p.name === "Brian Rucker");
if (brian) {
  const bLogs = log.filter(e => e.prospectName === "Brian Rucker");
  console.log("In " + brian.file + ", comment_count=" + brian.cc + ", log entries=" + bLogs.length);
} else {
  console.log("Not found");
}
