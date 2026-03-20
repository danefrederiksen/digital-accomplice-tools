const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3849;
const HTML_FILE = path.join(__dirname, 'hub-dashboard.html');
const DATA_DIR = path.join(__dirname, '..', 'data');

// ============================================================
// TOOL DEFINITIONS — all 10 prospect tools + comment queue
// ============================================================
const TOOLS = [
  { id: 1, key: 'b2b',          label: 'B2B 1st DM',        type: 'dm',    port: 3851, prospectFile: 'b2b-prospects.json',          activityFile: 'b2b-activity.json',          target: 4 },
  { id: 2, key: 'cyber',        label: 'Cyber 1st DM',      type: 'dm',    port: 3852, prospectFile: 'cyber-prospects.json',        activityFile: 'cyber-activity.json',        target: 4 },
  { id: 3, key: 'b2b_2nd',      label: 'B2B 2nd DM',        type: 'dm',    port: 3853, prospectFile: 'b2b-2nd-prospects.json',      activityFile: 'b2b-2nd-activity.json',      target: 3 },
  { id: 4, key: 'cyber_2nd',    label: 'Cyber 2nd DM',      type: 'dm',    port: 3854, prospectFile: 'cyber-2nd-prospects.json',    activityFile: 'cyber-2nd-activity.json',    target: 3 },
  { id: 5, key: 'referral_1st', label: 'Referral 1st',      type: 'dm',    port: 3855, prospectFile: 'referral-1st-prospects.json', activityFile: 'referral-1st-activity.json', target: 2 },
  { id: 6, key: 'referral_2nd', label: 'Referral 2nd',      type: 'dm',    port: 3856, prospectFile: 'referral-2nd-prospects.json', activityFile: 'referral-2nd-activity.json', target: 2 },
  { id: 7, key: 'b2b_email',    label: 'B2B Email',         type: 'email', port: 3857, prospectFile: 'b2b-email-prospects.json',    activityFile: 'b2b-email-activity.json',    target: 5 },
  { id: 8, key: 'cyber_email',  label: 'Cyber Email',       type: 'email', port: 3858, prospectFile: 'cyber-email-prospects.json',  activityFile: 'cyber-email-activity.json',  target: 5 },
  { id: 9, key: 'substack',     label: 'Substack',          type: 'email', port: 3859, prospectFile: 'substack-prospects.json',     activityFile: 'substack-activity.json',     target: 4 },
  { id: 10, key: 'customer',    label: 'Customers',         type: 'email', port: 3860, prospectFile: 'customer-prospects.json',     activityFile: 'customer-activity.json',     target: 3 },
  { id: 12, key: 'referral_email', label: 'Referral Email', type: 'email', port: 3862, prospectFile: 'referral-email-prospects.json', activityFile: 'referral-email-activity.json', target: 3 }
];

const COMMENT_LOG_FILE = path.join(DATA_DIR, 'comment-log.json');
const DAILY_COMMENT_TARGET = 8;
const WEEKLY_COMMENT_TARGET = 40;

// Daily Outreach Plan targets
const DAILY_DM_TARGET = 30;
const DAILY_EMAIL_TARGET = 20;
const DAILY_TOTAL_TARGET = 60;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  // Allow cross-origin from any localhost port (hub reads from all tools)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// ============================================================
// DATA HELPERS
// ============================================================
function loadJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    console.error(`Failed to load ${filepath}:`, err.message);
    return null;
  }
}

function getDateStr(d) {
  return d.toISOString().split('T')[0];
}

function getMondayOfWeek(d) {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// ============================================================
// ROUTES
// ============================================================

// Serve HTML
app.get('/', (req, res) => res.sendFile(HTML_FILE));

// Main hub data endpoint — aggregates everything
app.get('/api/hub-data', (req, res) => {
  const now = new Date();
  const todayStr = getDateStr(now);
  const weekStart = getMondayOfWeek(now).toISOString();

  // --- Per-tool stats ---
  const toolStats = TOOLS.map(tool => {
    const prospectPath = path.join(DATA_DIR, tool.prospectFile);
    const activityPath = path.join(DATA_DIR, tool.activityFile);

    // Load prospects
    const prospectData = loadJSON(prospectPath);
    const prospects = prospectData ? (prospectData.prospects || []) : [];

    // Load activity
    const activityData = loadJSON(activityPath);
    const activity = Array.isArray(activityData) ? activityData : [];

    // Today's activity
    const todayActivity = activity.filter(a => a.date && a.date.startsWith(todayStr));
    const weekActivity = activity.filter(a => a.date && a.date >= weekStart);

    // Count actions today
    const todayActions = {};
    todayActivity.forEach(a => {
      todayActions[a.action] = (todayActions[a.action] || 0) + 1;
    });

    // Count actions this week
    const weekActions = {};
    weekActivity.forEach(a => {
      weekActions[a.action] = (weekActions[a.action] || 0) + 1;
    });

    // Prospect status breakdown
    const statusCounts = {};
    prospects.forEach(p => {
      const s = p.status || 'unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // Key counts
    const dmsSentToday = (todayActions['Marked DM Sent'] || 0);
    const followUpsSentToday = (todayActions['Marked Follow-Up Sent'] || 0) + (todayActions['Marked Final Nudge Sent'] || 0);
    const repliesToday = (todayActions['Got Reply'] || 0);
    const connectionsSentToday = (todayActions['Sent Connection Request'] || 0);
    const emailsSentToday = (todayActions['Marked Email Sent'] || 0);

    const dmsSentWeek = (weekActions['Marked DM Sent'] || 0);
    const followUpsSentWeek = (weekActions['Marked Follow-Up Sent'] || 0) + (weekActions['Marked Final Nudge Sent'] || 0);
    const repliesWeek = (weekActions['Got Reply'] || 0);
    const connectionsSentWeek = (weekActions['Sent Connection Request'] || 0);
    const emailsSentWeek = (weekActions['Marked Email Sent'] || 0);

    // Touches today = outreach actions (DMs + emails + connection requests + follow-ups)
    const touchesToday = dmsSentToday + emailsSentToday + connectionsSentToday + followUpsSentToday;
    const touchesWeek = dmsSentWeek + emailsSentWeek + connectionsSentWeek + followUpsSentWeek;

    // Overdue follow-ups: prospects with followUp1Due or followUp2Due in the past and status still pending
    let overdueFollowUps = 0;
    prospects.forEach(p => {
      if (p.status === 'dm_sent' && p.followUp1Due && p.followUp1Due < todayStr) overdueFollowUps++;
      if (p.status === 'follow_up_1' && p.followUp2Due && p.followUp2Due < todayStr) overdueFollowUps++;
    });

    // Stale prospects: not_started with no activity in 14+ days
    let staleCount = 0;
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const staleDate = fourteenDaysAgo.toISOString();
    prospects.forEach(p => {
      if (p.status === 'not_started' && p.lastActionDate && p.lastActionDate < staleDate) staleCount++;
    });

    return {
      id: tool.id,
      key: tool.key,
      label: tool.label,
      type: tool.type,
      port: tool.port,
      target: tool.target,
      totalProspects: prospects.length,
      statusCounts,
      today: {
        dms: dmsSentToday,
        followUps: followUpsSentToday,
        replies: repliesToday,
        connections: connectionsSentToday,
        emails: emailsSentToday,
        touches: touchesToday,
        totalActions: todayActivity.length
      },
      week: {
        dms: dmsSentWeek,
        followUps: followUpsSentWeek,
        replies: repliesWeek,
        connections: connectionsSentWeek,
        emails: emailsSentWeek,
        touches: touchesWeek,
        totalActions: weekActivity.length
      },
      overdueFollowUps,
      staleCount,
      hasData: prospects.length > 0
    };
  });

  // --- Comment Queue stats (Tool #11) ---
  const commentLogData = loadJSON(COMMENT_LOG_FILE);
  const commentLog = Array.isArray(commentLogData) ? commentLogData : [];

  const commentsToday = commentLog.filter(e => e.date && e.date.startsWith(todayStr)).length;
  const commentsWeek = commentLog.filter(e => e.date && e.date >= weekStart).length;

  // Comments by segment today
  const commentsBySegment = {};
  commentLog.forEach(e => {
    if (e.date && e.date.startsWith(todayStr)) {
      commentsBySegment[e.segment] = (commentsBySegment[e.segment] || 0) + 1;
    }
  });

  const commentStats = {
    id: 11,
    key: 'comments',
    label: 'Comment Queue',
    type: 'comment',
    port: 3861,
    today: { total: commentsToday, target: DAILY_COMMENT_TARGET, bySegment: commentsBySegment },
    week: { total: commentsWeek, target: WEEKLY_COMMENT_TARGET }
  };

  // --- Combined totals ---
  let totalDMsToday = 0, totalEmailsToday = 0, totalConnectionsToday = 0, totalFollowUpsToday = 0, totalRepliesToday = 0;
  let totalDMsWeek = 0, totalEmailsWeek = 0, totalConnectionsWeek = 0, totalFollowUpsWeek = 0, totalRepliesWeek = 0;
  let totalProspects = 0, totalOverdue = 0;

  toolStats.forEach(t => {
    totalDMsToday += t.today.dms;
    totalEmailsToday += t.today.emails;
    totalConnectionsToday += t.today.connections;
    totalFollowUpsToday += t.today.followUps;
    totalRepliesToday += t.today.replies;
    totalDMsWeek += t.week.dms;
    totalEmailsWeek += t.week.emails;
    totalConnectionsWeek += t.week.connections;
    totalFollowUpsWeek += t.week.followUps;
    totalRepliesWeek += t.week.replies;
    totalProspects += t.totalProspects;
    totalOverdue += t.overdueFollowUps;
  });

  const totalTouchesToday = totalDMsToday + totalEmailsToday + totalConnectionsToday + totalFollowUpsToday;
  const totalTouchesWeek = totalDMsWeek + totalEmailsWeek + totalConnectionsWeek + totalFollowUpsWeek;

  // --- Alerts ---
  const alerts = [];

  // Overdue follow-ups
  if (totalOverdue > 0) {
    alerts.push({
      type: 'warning',
      message: `${totalOverdue} overdue follow-up${totalOverdue > 1 ? 's' : ''} across tools`,
      tools: toolStats.filter(t => t.overdueFollowUps > 0).map(t => ({ id: t.id, label: t.label, count: t.overdueFollowUps, port: t.port }))
    });
  }

  // Tools with data but no activity today
  const inactiveTools = toolStats.filter(t => t.hasData && t.today.totalActions === 0);
  if (inactiveTools.length > 0) {
    alerts.push({
      type: 'info',
      message: `${inactiveTools.length} tool${inactiveTools.length > 1 ? 's' : ''} with prospects but no activity today`,
      tools: inactiveTools.map(t => ({ id: t.id, label: t.label, port: t.port }))
    });
  }

  // Comment target not met
  if (commentsToday < DAILY_COMMENT_TARGET) {
    alerts.push({
      type: 'info',
      message: `Comments: ${commentsToday}/${DAILY_COMMENT_TARGET} today (${DAILY_COMMENT_TARGET - commentsToday} remaining)`
    });
  }

  // Reply celebrations
  if (totalRepliesToday > 0) {
    alerts.push({
      type: 'success',
      message: `${totalRepliesToday} repl${totalRepliesToday > 1 ? 'ies' : 'y'} received today!`
    });
  }

  res.json({
    generatedAt: now.toISOString(),
    date: todayStr,
    tools: toolStats,
    comments: commentStats,
    totals: {
      today: {
        dms: totalDMsToday,
        emails: totalEmailsToday,
        connections: totalConnectionsToday,
        followUps: totalFollowUpsToday,
        replies: totalRepliesToday,
        touches: totalTouchesToday,
        comments: commentsToday
      },
      week: {
        dms: totalDMsWeek,
        emails: totalEmailsWeek,
        connections: totalConnectionsWeek,
        followUps: totalFollowUpsWeek,
        replies: totalRepliesWeek,
        touches: totalTouchesWeek,
        comments: commentsWeek
      },
      targets: {
        dailyDMs: DAILY_DM_TARGET,
        dailyEmails: DAILY_EMAIL_TARGET,
        dailyTotal: DAILY_TOTAL_TARGET,
        dailyComments: DAILY_COMMENT_TARGET,
        weeklyComments: WEEKLY_COMMENT_TARGET
      },
      totalProspects,
      totalOverdue
    },
    alerts
  });
});

// Serve the daily report PDF as a download
const REPORTS_DIR = '/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports';
app.get('/api/download-report', (req, res) => {
  const todayStr = getDateStr(new Date());
  const filename = `Daily_Report_${todayStr}_Claude_Code.pdf`;
  const filepath = path.join(REPORTS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'No report found for today' });
  }
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(filepath);
});

// ============================================================
// QUICK LOG — Aggregate prospects + proxy updates
// ============================================================

// GET /api/all-prospects — reads all tool data files and returns combined list
app.get('/api/all-prospects', (req, res) => {
  const allProspects = [];

  TOOLS.forEach(tool => {
    const filepath = path.join(DATA_DIR, tool.prospectFile);
    const raw = loadJSON(filepath);
    if (!raw) return;

    // Handle both array and { prospects: [...] } formats
    const prospects = Array.isArray(raw) ? raw : (raw.prospects || []);

    prospects.forEach(p => {
      allProspects.push({
        id: p.id,
        name: p.name || '',
        company: p.company || '',
        status: p.status || 'unknown',
        sourceToolId: tool.id,
        sourceToolLabel: tool.label,
        sourcePort: tool.port,
        sourceType: tool.type
      });
    });
  });

  res.json({ prospects: allProspects, count: allProspects.length });
});

// POST /api/quick-log — proxy an action to the correct tool server
app.post('/api/quick-log', async (req, res) => {
  const { prospectId, sourcePort, action, replyText, nextStep } = req.body;

  if (!prospectId || !sourcePort || !action) {
    return res.status(400).json({ error: 'Missing required fields: prospectId, sourcePort, action' });
  }

  // Find the tool definition to know its type (dm vs email)
  const tool = TOOLS.find(t => t.port === sourcePort);
  if (!tool) {
    return res.status(400).json({ error: `Unknown tool port: ${sourcePort}` });
  }

  const todayStr = getDateStr(new Date());
  const isEmailTool = tool.type === 'email';

  // Build field updates based on action
  const updates = {};

  switch (action) {
    case 'DM Sent':
      updates.status = isEmailTool ? 'email_sent' : 'dm_sent';
      if (isEmailTool) {
        updates.emailSentDate = todayStr;
      } else {
        updates.dmSentDate = todayStr;
      }
      updates.lastActionDate = todayStr;
      break;

    case 'Follow-Up Sent':
      updates.lastActionDate = todayStr;
      break;

    case 'Reply Received':
      updates.status = 'replied';
      if (replyText) updates.reply = replyText;
      updates.lastActionDate = todayStr;
      break;

    case 'Sent Snapshot':
      updates.lastActionDate = todayStr;
      if (nextStep) updates.nextStep = nextStep;
      break;

    case 'Sent Calendly':
      updates.lastActionDate = todayStr;
      if (nextStep) updates.nextStep = nextStep;
      break;

    case 'Meeting Booked':
      updates.lastActionDate = todayStr;
      if (nextStep) updates.nextStep = nextStep;
      if (replyText) updates.reply = replyText;
      // Only set status to sql if it's a DM tool (email tools may not support it)
      // The tool server's VALID_STATUSES will filter out unsupported statuses
      updates.status = 'replied';
      break;

    case 'Connection Request Sent':
      updates.lastActionDate = todayStr;
      break;

    case 'Comment Left':
      updates.lastActionDate = todayStr;
      break;

    case 'Email Sent':
      updates.lastActionDate = todayStr;
      if (isEmailTool) {
        updates.status = 'email_sent';
        updates.emailSentDate = todayStr;
      } else {
        updates.status = 'dm_sent';
        updates.dmSentDate = todayStr;
      }
      break;

    default:
      return res.status(400).json({ error: `Unknown action: ${action}` });
  }

  // Proxy PUT to the target tool server
  const url = `http://127.0.0.1:${sourcePort}/api/prospects/${prospectId}`;

  try {
    const http = require('http');

    const result = await new Promise((resolve, reject) => {
      const body = JSON.stringify(updates);
      const options = {
        hostname: '127.0.0.1',
        port: sourcePort,
        path: `/api/prospects/${prospectId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 5000
      };

      const req = http.request(options, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          if (resp.statusCode >= 200 && resp.statusCode < 300) {
            resolve({ ok: true, data: JSON.parse(data) });
          } else {
            resolve({ ok: false, status: resp.statusCode, data });
          }
        });
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
      req.write(body);
      req.end();
    });

    if (result.ok) {
      res.json({ success: true, prospect: result.data, action, toolLabel: tool.label });
    } else {
      res.status(502).json({ error: `Tool server returned ${result.status}`, details: result.data });
    }
  } catch (err) {
    console.error(`Quick log proxy error (port ${sourcePort}):`, err.message);
    res.status(502).json({
      error: `Could not reach tool server on port ${sourcePort}. Is it running?`,
      details: err.message
    });
  }
});

// ============================================================
// START
// ============================================================
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Hub Dashboard running at http://localhost:${PORT}`);
  console.log(`  Reading from ${TOOLS.length} tools + comment queue`);
  console.log(`  Data: ${DATA_DIR}\n`);
});
