const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const WARMING_DATA = path.join(__dirname, '..', 'warming-app copy', 'data', 'prospects.json');
const OUTPUT = path.join(__dirname, '..', 'reports', 'DA_Ops_Processes_WeeklyReport_2026-03-08_ProspectingData.xlsx');

// Helper: read JSON safely — unwraps {prospects: [...]} if needed
function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.prospects)) return raw.prospects;
    return [];
  } catch(e) { return []; }
}

// --- Comment counting from comment-log.json (source of truth) ---
const commentLogData = readJSON('comment-log.json');
const WEEK_START = '2026-03-02'; // Monday
const WEEK_END = '2026-03-09';   // Sunday end

// Count comments per segment for this week
const commentsBySegment = {};
const commentsByDay = {};
let totalWeekComments = 0;

commentLogData.forEach(c => {
  const d = (c.date || '').slice(0, 10);
  if (d >= WEEK_START && d < WEEK_END) {
    const seg = c.segment || 'unknown';
    commentsBySegment[seg] = (commentsBySegment[seg] || 0) + 1;
    commentsByDay[d] = (commentsByDay[d] || 0) + 1;
    totalWeekComments++;
  }
});

// Also count comments from per-tool activity files (logged directly, not via Tool #11)
const activityFiles = {
  'b2b_2nd': 'b2b-2nd-activity.json',
  'cyber_2nd': 'cyber-2nd-activity.json',
  'referral_1st': 'referral-1st-activity.json',
  'referral_2nd': 'referral-2nd-activity.json'
};

Object.entries(activityFiles).forEach(([seg, file]) => {
  const acts = readJSON(file);
  acts.forEach(a => {
    const action = (a.action || '').toLowerCase();
    if (action.includes('comment')) {
      const d = (a.date || a.timestamp || '').slice(0, 10);
      if (d >= WEEK_START && d < WEEK_END) {
        // Avoid double-counting: check if this comment is already in comment-log
        const alreadyCounted = commentLogData.some(c =>
          c.prospectName === (a.prospect || a.name) &&
          (c.date || '').slice(0, 10) === d &&
          c.segment === seg
        );
        if (!alreadyCounted) {
          commentsBySegment[seg] = (commentsBySegment[seg] || 0) + 1;
          commentsByDay[d] = (commentsByDay[d] || 0) + 1;
          totalWeekComments++;
        }
      }
    }
  });
});

// Map segment keys to tool labels
const segmentToTool = {
  'b2b_2nd': '#3 B2B 2nd Conn',
  'cyber_2nd': '#4 Cyber 2nd Conn',
  'referral_1st': '#5 Referral 1st Conn',
  'referral_2nd': '#6 Referral 2nd Conn'
};

console.log('Comments by segment:', commentsBySegment);
console.log('Comments by day:', commentsByDay);
console.log('Total week comments:', totalWeekComments);

const commentPct = Math.round((totalWeekComments / 40) * 100);
const commentGrade = commentPct >= 90 ? 'A' : commentPct >= 70 ? 'B' : commentPct >= 50 ? 'C' : commentPct >= 30 ? 'D' : 'F';

// --- Sheet 1: Summary ---
const summaryData = [
  ['DIGITAL ACCOMPLICE — WEEKLY PIPELINE REPORT'],
  ['Week of March 3–8, 2026', '', '', 'Generated: 2026-03-08'],
  [],
  ['SCORECARD VS. TARGETS'],
  ['Metric', 'Target', 'Actual', '% of Target', 'Grade'],
  ['DMs + Outreach', '15/wk', 25, '167%', 'A+'],
  ['Comments Logged', '40/wk', totalWeekComments, commentPct + '%', commentGrade],
  ['Follow-Ups Sent', '—', 25, '—', 'A'],
  ['Connection Requests', '—', 15, '—', 'B'],
  ['Reply Rate', '—', '8%', '—', 'B'],
  ['Daily Consistency', '5 days', '2 high days', '40%', 'D'],
  ['Email Outreach', '15-28/wk', 0, '0%', 'F'],
  [],
  ['DAILY ACTIVITY BREAKDOWN'],
  ['Day', 'DMs', 'Follow-Ups', 'Conn Requests', 'Comments', 'Replies', 'Prospect Adds', 'Total'],
  ['Mon 3/2', 0, 0, 0, 0, 0, 0, 0],
  ['Tue 3/3', 15, 8, 0, 0, 0, 156, 23],
  ['Wed 3/4', 0, 0, 5, commentsByDay['2026-03-04'] || 0, 0, 0, 5 + (commentsByDay['2026-03-04'] || 0)],
  ['Thu 3/5', 0, 0, 0, commentsByDay['2026-03-05'] || 0, 0, 0, (commentsByDay['2026-03-05'] || 0)],
  ['Fri 3/6', 10, 17, 10, commentsByDay['2026-03-06'] || 0, 2, 16, 39 + (commentsByDay['2026-03-06'] || 0)],
  ['Sat 3/7', 0, 0, 0, commentsByDay['2026-03-07'] || 0, 0, 1, 1 + (commentsByDay['2026-03-07'] || 0)],
  ['Sun 3/8', 0, 0, 0, commentsByDay['2026-03-08'] || 0, 0, 0, (commentsByDay['2026-03-08'] || 0)],
  ['TOTAL', 25, 25, 15, totalWeekComments, 2, 173, 65 + totalWeekComments],
  [],
  ['TOOL-BY-TOOL SUMMARY'],
  ['Tool', 'Total Prospects', 'DMs This Week', 'Follow-Ups', 'Conn Requests', 'Comments', 'Replies'],
  ['#1 B2B 1st Conn', 35, 19, 12, 0, 0, 1],
  ['#2 Cyber 1st Conn', 11, 0, 10, 0, 0, 0],
  ['#3 B2B 2nd Conn', 25, 0, 0, 0, commentsBySegment['b2b_2nd'] || 0, 0],
  ['#4 Cyber 2nd Conn', 229, 0, 0, 7, commentsBySegment['cyber_2nd'] || 0, 0],
  ['#5 Referral 1st Conn', 48, 6, 3, 0, commentsBySegment['referral_1st'] || 0, 1],
  ['#6 Referral 2nd Conn', 30, 0, 0, 8, commentsBySegment['referral_2nd'] || 0, 0],
  ['#7-10 Email Tools', 0, 0, 0, 0, 0, 0],
  ['#11 Comment Queue', '—', '—', '—', '—', '(aggregated above)', '—'],
  ['#12 Referral Emails', 0, 0, 0, 0, 0, 0],
  ['Main Dashboard', 1003, 0, 4, 0, 0, 0],
  ['TOTAL', 1381, 25, 25, 15, totalWeekComments, 2],
];

// --- Sheet 2: All Leads (from all tools) ---
const allLeads = [];
allLeads.push(['Name', 'Company', 'Title', 'Tool', 'Status', 'Comment Count', 'Last Commented', 'LinkedIn URL', 'Notes']);

// Tool #1 - B2B 1st
const b2b1 = readJSON('b2b-prospects.json');
if (Array.isArray(b2b1)) {
  b2b1.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#1 B2B 1st',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// Tool #2 - Cyber 1st
const cyber1 = readJSON('cyber-prospects.json');
if (Array.isArray(cyber1)) {
  cyber1.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#2 Cyber 1st',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// Tool #3 - B2B 2nd
const b2b2 = readJSON('b2b-2nd-prospects.json');
if (Array.isArray(b2b2)) {
  b2b2.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#3 B2B 2nd',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// Tool #4 - Cyber 2nd
const cyber2 = readJSON('cyber-2nd-prospects.json');
if (Array.isArray(cyber2)) {
  cyber2.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#4 Cyber 2nd',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// Tool #5 - Referral 1st
const ref1 = readJSON('referral-1st-prospects.json');
if (Array.isArray(ref1)) {
  ref1.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#5 Referral 1st',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// Tool #6 - Referral 2nd
const ref2 = readJSON('referral-2nd-prospects.json');
if (Array.isArray(ref2)) {
  ref2.forEach(p => allLeads.push([
    p.name || '', p.company || '', p.title || '', '#6 Referral 2nd',
    p.status || '', p.comment_count || 0, p.last_commented || '', p.linkedinUrl || p.linkedin || '', p.notes || ''
  ]));
}

// --- Sheet 3: Main Dashboard ---
const mainDash = [];
mainDash.push(['Name', 'Company', 'Title', 'Status', 'Tier', 'Sequence Type', 'Sequence Step', 'Follow-Up Due', 'LinkedIn URL']);
const warmingRaw = JSON.parse(fs.readFileSync(WARMING_DATA, 'utf8'));
const warming = Array.isArray(warmingRaw) ? warmingRaw : (warmingRaw.prospects || []);
if (Array.isArray(warming)) {
  warming.forEach(p => mainDash.push([
    p.name || '', p.company || '', p.title || '', p.status || '',
    p.tier || '', p.sequence_type || '', p.sequence_step || '',
    p.follow_up_due || '', p.linkedin_url || ''
  ]));
}

// --- Sheet 4: Activity Log ---
const activityLog = [];
activityLog.push(['Date', 'Tool', 'Prospect', 'Action', 'Details']);

// Pull activity from comment log
const commentLog = readJSON('comment-log.json');
if (Array.isArray(commentLog)) {
  commentLog.forEach(c => activityLog.push([
    c.date || c.timestamp || '', '#11 Comments',
    c.prospectName || c.name || '', 'comment', c.comment || c.text || ''
  ]));
}

// Pull engagements from tool data
function extractActivity(data, toolName) {
  if (!Array.isArray(data)) return;
  data.forEach(p => {
    if (p.engagements && Array.isArray(p.engagements)) {
      p.engagements.forEach(e => {
        activityLog.push([
          e.date || '', toolName, p.name || '',
          e.type || e.action || '', e.notes || e.message || ''
        ]);
      });
    }
    if (p.activity && Array.isArray(p.activity)) {
      p.activity.forEach(a => {
        activityLog.push([
          a.date || a.timestamp || '', toolName, p.name || '',
          a.type || a.action || '', a.notes || a.details || ''
        ]);
      });
    }
  });
}

extractActivity(b2b1, '#1 B2B 1st');
extractActivity(cyber1, '#2 Cyber 1st');
extractActivity(b2b2, '#3 B2B 2nd');
extractActivity(cyber2, '#4 Cyber 2nd');
extractActivity(ref1, '#5 Referral 1st');
extractActivity(ref2, '#6 Referral 2nd');

// Sort activity log by date (skip header)
activityLog.sort((a, b) => {
  if (a[0] === 'Date') return -1;
  if (b[0] === 'Date') return 1;
  return (b[0] || '').localeCompare(a[0] || '');
});

// --- Build Workbook ---
const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
ws1['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

const ws2 = XLSX.utils.aoa_to_sheet(allLeads);
ws2['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 14 }, { wch: 30 }];
XLSX.utils.book_append_sheet(wb, ws2, 'All Leads');

const ws3 = XLSX.utils.aoa_to_sheet(mainDash);
ws3['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, ws3, 'Main Dashboard');

const ws4 = XLSX.utils.aoa_to_sheet(activityLog);
ws4['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, ws4, 'Activity Log');

XLSX.writeFile(wb, OUTPUT);
console.log(`XLSX written to: ${OUTPUT}`);
console.log(`Sheets: Summary, All Leads (${allLeads.length - 1} rows), Main Dashboard (${mainDash.length - 1} rows), Activity Log (${activityLog.length - 1} rows)`);
