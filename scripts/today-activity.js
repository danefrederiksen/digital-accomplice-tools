#!/usr/bin/env node
/**
 * Daily Activity Report — reads ALL tool data files and activity logs
 * Data lives in: /Users/danefrederiksen/Desktop/Claude code/data/
 * Run: node scripts/today-activity.js [YYYY-MM-DD]
 *
 * Auto-fallback: If no date arg is given and today has zero activity,
 * automatically falls back to yesterday's date so you always see the
 * most recent day with data.
 */
const fs = require('fs');
const path = require('path');

const EXPLICIT_DATE = process.argv[2]; // user-provided date, if any
const DATA = path.join(__dirname, '..', 'data');

// ── Tool definitions: prospect file + activity log file ──
const tools = [
  { name: 'Tool #1: B2B 1st Conn DMs',    prospects: 'b2b-prospects.json',          activity: 'b2b-activity.json' },
  { name: 'Tool #2: Cyber 1st Conn DMs',   prospects: 'cyber-prospects.json',        activity: 'cyber-activity.json' },
  { name: 'Tool #3: B2B 2nd Conn DMs',     prospects: 'b2b-2nd-prospects.json',      activity: 'b2b-2nd-activity.json' },
  { name: 'Tool #4: Cyber 2nd Conn DMs',   prospects: 'cyber-2nd-prospects.json',    activity: 'cyber-2nd-activity.json' },
  { name: 'Tool #5: Referral 1st Conn',    prospects: 'referral-1st-prospects.json',  activity: 'referral-1st-activity.json' },
  { name: 'Tool #6: Referral 2nd Conn',    prospects: 'referral-2nd-prospects.json',  activity: 'referral-2nd-activity.json' },
  { name: 'Tool #7: B2B Emails',           prospects: 'b2b-email-prospects.json',     activity: 'b2b-email-activity.json' },
  { name: 'Tool #8: Cyber Emails',         prospects: 'cyber-email-prospects.json',   activity: 'cyber-email-activity.json' },
  { name: 'Tool #9: Substack Emails',      prospects: 'substack-prospects.json',      activity: 'substack-activity.json' },
  { name: 'Tool #10: Customer Emails',     prospects: 'customer-prospects.json',      activity: 'customer-activity.json' },
  { name: 'Tool #12: Referral Emails',     prospects: 'referral-email-prospects.json', activity: 'referral-email-activity.json' },
];

// All date fields found in prospect objects
const dateFields = [
  'lastActionDate', 'dmSentDate', 'followUp1Due', 'followUp2Due',
  'connectionSentDate', 'connectionAcceptedDate', 'connectionCheckDate',
  'last_commented', 'activatedDate', 'emailSentDate', 'subscribedDate'
];

// ── UTC → Pacific Time conversion ──
function utcToPT(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return isoString.slice(11, 16); }
}

function loadJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch { return null; }
}

function getProspects(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.prospects || []);
}

function getYesterday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone edge cases
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ── Count activity for a given date (quick check, no output) ──
function countActivityForDate(targetDate) {
  let count = 0;

  // Check activity logs
  for (const tool of tools) {
    const actData = loadJSON(path.join(DATA, tool.activity));
    if (!actData || !Array.isArray(actData)) continue;
    count += actData.filter(e => e.date && e.date.startsWith(targetDate)).length;
  }

  // Check comment log
  const commentLog = loadJSON(path.join(DATA, 'comment-log.json'));
  if (commentLog && Array.isArray(commentLog)) {
    count += commentLog.filter(c => c.date && c.date.startsWith(targetDate)).length;
  }

  // Check prospect date fields
  for (const tool of tools) {
    const prospects = getProspects(loadJSON(path.join(DATA, tool.prospects)));
    for (const p of prospects) {
      for (const field of dateFields) {
        if (p[field] && String(p[field]).startsWith(targetDate)) { count++; break; } // one match per prospect is enough
      }
    }
  }

  // Check main dashboard engagements
  const dashData = loadJSON(path.join(__dirname, '..', 'warming-app copy', 'data', 'prospects.json'));
  if (dashData) {
    for (const p of getProspects(dashData)) {
      if (p.engagements && Array.isArray(p.engagements)) {
        count += p.engagements.filter(e => e.date && e.date.startsWith(targetDate)).length;
      }
    }
  }

  return count;
}

// ═══════════════════════════════════════════
// DETERMINE WHICH DATE TO REPORT ON
// ═══════════════════════════════════════════
let TODAY;
let fellBack = false;

if (EXPLICIT_DATE) {
  // User specified a date — use it no matter what
  TODAY = EXPLICIT_DATE;
} else {
  const now = new Date().toISOString().slice(0, 10);
  const todayCount = countActivityForDate(now);
  if (todayCount > 0) {
    TODAY = now;
  } else {
    const yesterday = getYesterday(now);
    const yesterdayCount = countActivityForDate(yesterday);
    if (yesterdayCount > 0) {
      TODAY = yesterday;
      fellBack = true;
    } else {
      TODAY = now; // genuinely no activity — show today's empty report
    }
  }
}

// ── 1. Collect activity from ACTIVITY LOGS (primary source of truth) ──
let summary = {};
let totalActions = 0;

for (const tool of tools) {
  const actFile = path.join(DATA, tool.activity);
  const actData = loadJSON(actFile);
  if (!actData || !Array.isArray(actData)) continue;

  const todayEntries = actData.filter(e => e.date && e.date.startsWith(TODAY));
  if (todayEntries.length === 0) continue;

  summary[tool.name] = todayEntries.map(e => ({
    name: e.prospectName || 'Unknown',
    action: e.action,
    time: e.date
  }));
  totalActions += todayEntries.length;
}

// ── 2. Collect from COMMENT LOG ──
const commentLog = loadJSON(path.join(DATA, 'comment-log.json'));
if (commentLog && Array.isArray(commentLog)) {
  const todayComments = commentLog.filter(c => c.date && c.date.startsWith(TODAY));
  if (todayComments.length > 0) {
    summary['Tool #11: Comment Queue'] = todayComments.map(c => ({
      name: c.prospectName || 'Unknown',
      company: c.company || '',
      action: 'Comment logged',
      time: c.date
    }));
    totalActions += todayComments.length;
  }
}

// ── 3. Collect from PROSPECT DATE FIELDS (catches anything activity logs missed) ──
for (const tool of tools) {
  const pFile = path.join(DATA, tool.prospects);
  const prospects = getProspects(loadJSON(pFile));

  let extra = [];
  for (const p of prospects) {
    for (const field of dateFields) {
      const val = p[field];
      if (!val || !String(val).startsWith(TODAY)) continue;

      // Label the action based on field name
      let action;
      if (field === 'dmSentDate') action = 'DM sent';
      else if (field === 'lastActionDate') action = 'Action taken';
      else if (field === 'followUp1Due') action = 'Follow-up 1 due';
      else if (field === 'followUp2Due') action = 'Follow-up 2 due';
      else if (field === 'connectionSentDate') action = 'Connection request sent';
      else if (field === 'connectionAcceptedDate') action = 'Connection accepted';
      else if (field === 'connectionCheckDate') action = 'Connection checked';
      else if (field === 'last_commented') action = 'Comment logged';
      else if (field === 'activatedDate') action = 'Activated';
      else if (field === 'emailSentDate') action = 'Email sent';
      else if (field === 'subscribedDate') action = 'Subscribed';
      else action = field;

      extra.push({
        name: p.name || p.firstName || 'Unknown',
        company: p.company || '',
        action,
        status: p.status,
        field
      });
    }
  }

  // Only add entries not already captured by activity log (avoid double-counting)
  if (extra.length > 0) {
    const existing = summary[tool.name] || [];
    const existingNames = new Set(existing.map(e => e.name));
    const newEntries = extra.filter(e => {
      // If activity log already has this person, skip date-field duplicates
      // BUT keep unique actions (e.g., connectionCheckDate not in activity log)
      if (existingNames.has(e.name)) {
        // Keep if it's a field type the activity log wouldn't capture
        return ['connectionCheckDate', 'connectionAcceptedDate', 'last_commented'].includes(e.field);
      }
      return true;
    });

    if (newEntries.length > 0) {
      summary[tool.name] = [...existing, ...newEntries];
      totalActions += newEntries.length;
    }
  }
}

// ── 4. Main Dashboard (uses engagements[] arrays) ──
const dashFile = path.join(__dirname, '..', 'warming-app copy', 'data', 'prospects.json');
const dashData = loadJSON(dashFile);
if (dashData) {
  const prospects = getProspects(dashData);
  let dashActions = [];
  for (const p of prospects) {
    if (p.engagements && Array.isArray(p.engagements)) {
      for (const e of p.engagements) {
        if (e.date && e.date.startsWith(TODAY)) {
          dashActions.push({ name: p.name, company: p.company || '', action: e.type, note: e.note || '' });
        }
      }
    }
  }
  if (dashActions.length > 0) {
    summary['Main Dashboard'] = dashActions;
    totalActions += dashActions.length;
  }
}

// ═══════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════

const dayLabel = fellBack ? `YESTERDAY'S ACTIVITY (${TODAY})  ⬅ no activity yet today, showing yesterday` : `TODAY'S ACTIVITY (${TODAY})`;
console.log(`\n========== ${dayLabel} ==========\n`);

if (totalActions === 0) {
  console.log('No activity logged yet today across any tool.');
} else {
  console.log(`Total actions: ${totalActions}\n`);
  for (const [toolName, actions] of Object.entries(summary)) {
    console.log(`--- ${toolName} (${actions.length}) ---`);
    for (const a of actions) {
      const company = a.company ? ` (${a.company})` : '';
      const note = a.note ? ` — ${a.note}` : '';
      const time = a.time ? ` [${utcToPT(a.time)} PT]` : '';
      console.log(`  • ${a.action}: ${a.name}${company}${note}${time}`);
    }
    console.log('');
  }
}

// ── REMAINING: follow-ups due, pending connections (always use real today) ──
const REAL_TODAY = new Date().toISOString().slice(0, 10);
console.log('========== WHAT\'S DUE / REMAINING ==========\n');

let dueFollowUps = [];
let pendingConnections = [];

for (const tool of tools) {
  const pFile = path.join(DATA, tool.prospects);
  const prospects = getProspects(loadJSON(pFile));

  for (const p of prospects) {
    const name = p.name || p.firstName || 'Unknown';
    const company = p.company || '';

    // Follow-ups due today or overdue (skip if already actioned today)
    for (const duefield of ['followUp1Due', 'followUp2Due']) {
      if (p[duefield] && p[duefield] <= REAL_TODAY && !['replied', 'exhausted', 'dead', 'not_started', 'completed', 'cold'].includes(p.status)) {
        const alreadySentToday = (p.lastActionDate && p.lastActionDate.startsWith(REAL_TODAY));
        if (!alreadySentToday) {
          const overdue = p[duefield] < REAL_TODAY;
          dueFollowUps.push({ tool: tool.name, name, company, type: duefield.replace('Due', ''), due: p[duefield], overdue, status: p.status });
        }
      }
    }

    // Pending connections
    if ((p.status === 'connection_sent' || p.status === 'connection_pending') && p.connectionSentDate) {
      const alreadyChecked = p.connectionCheckDate && p.connectionCheckDate.startsWith(REAL_TODAY);
      if (!alreadyChecked) {
        pendingConnections.push({ tool: tool.name, name, company, sent: p.connectionSentDate });
      }
    }
  }
}

// Main dashboard follow-ups
if (dashData) {
  const prospects = getProspects(dashData);
  for (const p of prospects) {
    if (p.follow_up_due && p.follow_up_due <= REAL_TODAY && p.sequence_status === 'active') {
      const alreadyDone = p.engagements && p.engagements.some(e => e.date && e.date.startsWith(REAL_TODAY));
      if (!alreadyDone) {
        dueFollowUps.push({ tool: 'Main Dashboard', name: p.name, company: p.company || '', type: 'sequence follow-up', due: p.follow_up_due, overdue: p.follow_up_due < REAL_TODAY, status: p.status });
      }
    }
  }
}

if (dueFollowUps.length > 0) {
  console.log(`--- Follow-ups Due/Overdue (${dueFollowUps.length}) ---`);
  for (const f of dueFollowUps) {
    const tag = f.overdue ? ' ⚠️ OVERDUE' : '';
    console.log(`  • ${f.name} (${f.company}) — ${f.type} due ${f.due}${tag} [${f.tool}]`);
  }
  console.log('');
} else {
  console.log('No follow-ups due today.\n');
}

if (pendingConnections.length > 0) {
  console.log(`--- Pending Connections to Check (${pendingConnections.length}) ---`);
  for (const c of pendingConnections) {
    console.log(`  • ${c.name} (${c.company}) — sent ${c.sent} [${c.tool}]`);
  }
  console.log('');
} else {
  console.log('No pending connections to check.\n');
}

// ── DAILY SCORECARD ──
console.log('========== DAILY SCORECARD ==========\n');

let dmsSent = 0, connectionsSent = 0, commentsMade = 0, emailsSent = 0, followUpsSent = 0, connectionsChecked = 0, removals = 0, replies = 0;

for (const [toolName, actions] of Object.entries(summary)) {
  for (const a of actions) {
    const act = (a.action || '').toLowerCase();
    if (act === 'marked dm sent' || act === 'dm sent') dmsSent++;
    else if (act === 'sent connection request' || act === 'connection request sent') connectionsSent++;
    else if (act === 'logged comment' || act === 'comment logged') commentsMade++;
    else if (act === 'email sent') emailsSent++;
    else if (act.includes('follow-up') || act.includes('follow up') || act === 'marked follow-up sent') followUpsSent++;
    else if (act.includes('final nudge') || act === 'marked final nudge sent') followUpsSent++;
    else if (act === 'connection checked') connectionsChecked++;
    else if (act.includes('removed')) removals++;
    else if (act.includes('reply') || act === 'got reply') replies++;
  }
}

const totalTouches = dmsSent + connectionsSent + commentsMade + emailsSent + followUpsSent;
console.log(`LinkedIn DMs sent:       ${dmsSent} / 3-4 daily target`);
console.log(`Follow-ups sent:         ${followUpsSent}`);
console.log(`Connection requests:     ${connectionsSent} / 5-6 daily target`);
console.log(`Connections checked:     ${connectionsChecked}`);
console.log(`Comments:                ${commentsMade} / 8 daily target`);
console.log(`Emails sent:             ${emailsSent} / 15-28 daily target`);
console.log(`Replies received:        ${replies}`);
console.log(`Prospects removed:       ${removals}`);
console.log(`─────────────────────────────────────`);
console.log(`TOTAL OUTREACH TOUCHES:  ${totalTouches} / 45-60 daily target`);
