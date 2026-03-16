const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3853;
const HTML_FILE = path.join(__dirname, 'b2b-2nd-outreach.html');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'b2b-2nd-prospects.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'b2b-2nd-activity.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'b2b-2nd-templates.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const COMMENT_LOG_FILE = path.join(DATA_DIR, 'comment-log.json');
const MAX_BACKUPS = 5;
const MAX_ACTIVITY = 500;
const COMMENTS_TO_DM = 4;
const SEGMENT = 'b2b_2nd';

// ============================================================
// MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.setHeader('Access-Control-Allow-Origin', `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json({ limit: '5mb' }));

// ============================================================
// DATA HELPERS
// ============================================================
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function loadProspects() {
  ensureDirs();
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).prospects || [];
  } catch (err) {
    console.error('Failed to load prospects:', err.message);
    return [];
  }
}

function saveProspects(prospects) {
  ensureDirs();
  backupData();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ prospects }, null, 2), 'utf8');
}

function backupData() {
  if (!fs.existsSync(DATA_FILE)) return;
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `b2b-2nd-prospects_${timestamp}.json`);
    fs.copyFileSync(DATA_FILE, backupFile);
    // Prune old backups — keep last MAX_BACKUPS
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('b2b-2nd-prospects_'))
      .sort()
      .reverse();
    backups.slice(MAX_BACKUPS).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    });
  } catch (err) {
    console.error('Backup failed:', err.message);
  }
}

function loadActivity() {
  try {
    if (!fs.existsSync(ACTIVITY_FILE)) return [];
    return JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8')) || [];
  } catch { return []; }
}

function saveActivity(entries) {
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

function loadCommentLog() {
  try {
    if (!fs.existsSync(COMMENT_LOG_FILE)) return [];
    return JSON.parse(fs.readFileSync(COMMENT_LOG_FILE, 'utf8')) || [];
  } catch { return []; }
}

function saveCommentLog(entries) {
  fs.writeFileSync(COMMENT_LOG_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

function loadTemplates() {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) return null;
    return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load templates:', err.message);
    return null;
  }
}

function saveTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
}

function logActivity(action, prospectName, prospectId) {
  const entries = loadActivity();
  entries.unshift({
    date: new Date().toISOString(),
    action,
    prospectName: prospectName || '',
    prospectId: prospectId || ''
  });
  // Cap at MAX_ACTIVITY entries
  if (entries.length > MAX_ACTIVITY) entries.length = MAX_ACTIVITY;
  saveActivity(entries);
}

// ============================================================
// SANITIZATION & VALIDATION
// ============================================================
function sanitize(str) {
  if (typeof str !== 'string') return str;
  // Strip control characters and null bytes only.
  // HTML encoding happens client-side via esc() at render time.
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function sanitizeObj(obj) {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = typeof val === 'string' ? sanitize(val) : val;
  }
  return clean;
}

const VALID_STATUSES = ['not_started', 'connection_sent', 'connection_accepted', 'dm_sent', 'follow_up_1', 'follow_up_2', 'replied', 'cold'];
const ALLOWED_FIELDS = [
  'name', 'company', 'title', 'linkedinUrl', 'status',
  'connectionSentDate', 'connectionCheckDate', 'connectionAcceptedDate',
  'dmSentDate', 'followUp1Due', 'followUp2Due', 'lastActionDate',
  'reply', 'nextStep', 'draftReply', 'abVariants',
  'comment_count', 'last_commented', 'warming_dm_sent', 'warming_reply_date'
];

// Map status changes to activity labels
const STATUS_ACTIONS = {
  connection_sent: 'Sent Connection Request',
  connection_accepted: 'Connection Accepted',
  dm_sent: 'Marked DM Sent',
  follow_up_1: 'Marked Follow-Up Sent',
  follow_up_2: 'Marked Final Nudge Sent',
  replied: 'Got Reply',
  cold: 'Marked Cold',
  not_started: 'Reset to Not Started'
};

// ============================================================
// ROUTES
// ============================================================

// Serve HTML
app.get('/', (req, res) => res.sendFile(HTML_FILE));

// GET all prospects
app.get('/api/prospects', (req, res) => {
  res.json({ prospects: loadProspects() });
});

// POST — add one or many prospects
app.post('/api/prospects', (req, res) => {
  const incoming = req.body.prospects;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: 'prospects array required' });
  }

  const prospects = loadProspects();
  const existingKeys = prospects.map(p => (p.name + p.company).toLowerCase());
  let added = 0;
  let skipped = 0;

  incoming.forEach(raw => {
    const name = (raw.name || '').trim();
    if (!name) { skipped++; return; }
    const company = (raw.company || '').trim();
    const key = (name + company).toLowerCase();
    if (existingKeys.includes(key)) { skipped++; return; }

    const prospect = sanitizeObj({
      id: uuidv4(),
      name,
      company,
      title: (raw.title || '').trim(),
      linkedinUrl: (raw.linkedinUrl || '').trim(),
      status: 'not_started',
      connectionSentDate: null,
      connectionCheckDate: null,
      connectionAcceptedDate: null,
      dmSentDate: null,
      followUp1Due: null,
      followUp2Due: null,
      lastActionDate: null,
      reply: '',
      nextStep: ''
    });

    prospects.push(prospect);
    existingKeys.push(key);
    added++;
    logActivity('Added prospect', prospect.name, prospect.id);
  });

  saveProspects(prospects);
  res.json({ added, skipped });
});

// POST — migrate from localStorage (preserves existing IDs and state)
app.post('/api/prospects/migrate', (req, res) => {
  const current = loadProspects();
  if (current.length > 0) {
    return res.status(400).json({ error: 'Migration only works when server data is empty' });
  }

  const incoming = req.body.prospects;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'prospects array required' });
  }

  const prospects = incoming.map(raw => sanitizeObj({
    id: raw.id || uuidv4(),
    name: (raw.name || '').trim(),
    company: (raw.company || '').trim(),
    title: (raw.title || '').trim(),
    linkedinUrl: (raw.linkedinUrl || '').trim(),
    status: VALID_STATUSES.includes(raw.status) ? raw.status : 'not_started',
    connectionSentDate: raw.connectionSentDate || null,
    connectionCheckDate: raw.connectionCheckDate || null,
    connectionAcceptedDate: raw.connectionAcceptedDate || null,
    dmSentDate: raw.dmSentDate || null,
    followUp1Due: raw.followUp1Due || null,
    followUp2Due: raw.followUp2Due || null,
    lastActionDate: raw.lastActionDate || null,
    reply: (raw.reply || ''),
    nextStep: (raw.nextStep || '')
  }));

  saveProspects(prospects);
  logActivity('Migrated ' + prospects.length + ' prospects from browser', '', '');
  res.json({ migrated: prospects.length });
});

// PUT — update single prospect
app.put('/api/prospects/:id', (req, res) => {
  const prospects = loadProspects();
  const idx = prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Prospect not found' });

  const updates = req.body;
  const prospect = prospects[idx];

  // Only allow whitelisted fields
  for (const [key, val] of Object.entries(updates)) {
    if (!ALLOWED_FIELDS.includes(key)) continue;
    if (key === 'status' && !VALID_STATUSES.includes(val)) continue;
    prospect[key] = typeof val === 'string' ? sanitize(val) : val;
  }

  prospects[idx] = prospect;
  saveProspects(prospects);

  // Log activity based on what changed
  if (updates.status && STATUS_ACTIONS[updates.status]) {
    logActivity(STATUS_ACTIONS[updates.status], prospect.name, prospect.id);
  } else if ('reply' in updates) {
    logActivity('Updated reply', prospect.name, prospect.id);
  } else if ('draftReply' in updates) {
    logActivity('Updated draft reply', prospect.name, prospect.id);
  } else if ('nextStep' in updates) {
    logActivity('Updated next step', prospect.name, prospect.id);
  }

  res.json(prospect);
});

// DELETE — remove prospect
app.delete('/api/prospects/:id', (req, res) => {
  const prospects = loadProspects();
  const prospect = prospects.find(p => p.id === req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const filtered = prospects.filter(p => p.id !== req.params.id);
  saveProspects(filtered);
  logActivity('Removed prospect', prospect.name, prospect.id);
  res.json({ ok: true });
});

// GET — activity log
app.get('/api/activity', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, MAX_ACTIVITY);
  const all = loadActivity();
  res.json({ activity: all.slice(0, limit), total: all.length });
});

// ============================================================
// COMMENT TRACKING — shared comment-log.json with Tool #11
// ============================================================

// GET comment stats for all prospects in this tool
app.get('/api/comment-stats', (req, res) => {
  const commentLog = loadCommentLog();
  const prospects = loadProspects();

  const stats = {};
  commentLog.forEach(entry => {
    if (!stats[entry.prospectId]) {
      stats[entry.prospectId] = { count: 0, lastDate: null };
    }
    stats[entry.prospectId].count++;
    if (!stats[entry.prospectId].lastDate || entry.date > stats[entry.prospectId].lastDate) {
      stats[entry.prospectId].lastDate = entry.date;
    }
  });

  // Only return stats for prospects in this tool
  const ourStats = {};
  prospects.forEach(p => {
    const s = stats[p.id] || { count: 0, lastDate: null };
    ourStats[p.id] = { count: p.comment_count || s.count, lastDate: s.lastDate };
  });

  res.json({ stats: ourStats, commentsRequired: COMMENTS_TO_DM });
});

// POST log a comment — writes to shared comment-log.json AND updates prospect
app.post('/api/comment', (req, res) => {
  const { prospectId, postUrl } = req.body;
  if (!prospectId) return res.status(400).json({ error: 'prospectId required' });

  const prospects = loadProspects();
  const prospect = prospects.find(p => p.id === prospectId);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const entry = {
    id: uuidv4(),
    prospectId: sanitize(prospectId),
    prospectName: prospect.name,
    company: prospect.company,
    segment: SEGMENT,
    postUrl: sanitize(postUrl || ''),
    date: new Date().toISOString()
  };

  // Save to shared comment log
  const log = loadCommentLog();
  log.unshift(entry);
  if (log.length > 2000) log.length = 2000;
  saveCommentLog(log);

  // Count total comments for this prospect
  const totalComments = log.filter(e => e.prospectId === prospectId).length;

  // Update prospect record (direct write to avoid backup on every comment)
  const idx = prospects.findIndex(p => p.id === prospectId);
  if (idx !== -1) {
    prospects[idx].comment_count = totalComments;
    prospects[idx].last_commented = entry.date;
    fs.writeFileSync(DATA_FILE, JSON.stringify({ prospects }, null, 2), 'utf8');
  }

  logActivity('Logged comment', prospect.name, prospectId);

  const dmReady = totalComments >= COMMENTS_TO_DM;
  res.json({ ok: true, entry, totalComments, dmReady, commentsNeeded: Math.max(0, COMMENTS_TO_DM - totalComments) });
});

// GET — templates
app.get('/api/templates', (req, res) => {
  const templates = loadTemplates();
  if (templates) {
    res.json({ templates, source: 'server' });
  } else {
    res.json({ templates: null, source: 'none' });
  }
});

// PUT — save templates
app.put('/api/templates', (req, res) => {
  const templates = req.body.templates;
  if (!templates || typeof templates !== 'object') {
    return res.status(400).json({ error: 'templates object required' });
  }
  const clean = {};
  for (const [key, val] of Object.entries(templates)) {
    clean[key] = typeof val === 'string' ? sanitize(val) : val;
  }
  saveTemplates(clean);
  res.json({ ok: true });
});

// ============================================================
// START
// ============================================================
ensureDirs();
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Prospecting Tool #3 — B2B 2nd Connections running at http://localhost:${PORT}`);
  console.log(`  Data: ${DATA_FILE}`);
  console.log(`  Templates: ${TEMPLATES_FILE}`);
  console.log(`  Backups: ${BACKUP_DIR} (last ${MAX_BACKUPS} kept)\n`);
});
