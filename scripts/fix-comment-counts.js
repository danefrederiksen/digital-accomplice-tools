const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const commentLog = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'comment-log.json'), 'utf8'));

// Count comments per prospect name per segment
const counts = {};
commentLog.forEach(c => {
  const key = `${c.segment}::${c.prospectName}`;
  counts[key] = (counts[key] || 0) + 1;
});

console.log('=== Comment counts from comment-log.json ===');
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// Fix each source tool data file
const segmentFiles = {
  'b2b_2nd': 'b2b-2nd-prospects.json',
  'cyber_2nd': 'cyber-2nd-prospects.json',
  'referral_1st': 'referral-1st-prospects.json',
  'referral_2nd': 'referral-2nd-prospects.json'
};

Object.entries(segmentFiles).forEach(([segment, file]) => {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return;

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const prospects = Array.isArray(raw) ? raw : (raw.prospects || []);
  let fixed = 0;

  prospects.forEach(p => {
    const key = `${segment}::${p.name}`;
    const correctCount = counts[key] || 0;

    if (correctCount > 0 && p.comment_count !== correctCount) {
      console.log(`FIXING [${file}] ${p.name}: comment_count ${p.comment_count || 0} → ${correctCount}`);
      p.comment_count = correctCount;
      fixed++;
    }
  });

  if (fixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(raw, null, 2));
    console.log(`  → Saved ${file} (${fixed} records fixed)`);
  } else {
    console.log(`  ${file}: all counts correct`);
  }
});

console.log('\n=== Done ===');
