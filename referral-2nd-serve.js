const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3856;
const HTML_FILE = path.join(__dirname, 'referral-2nd-outreach.html');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'referral-2nd-prospects.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'referral-2nd-activity.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 5;
const MAX_ACTIVITY = 500;

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
    const backupFile = path.join(BACKUP_DIR, `referral-2nd-prospects_${timestamp}.json`);
    fs.copyFileSync(DATA_FILE, backupFile);
    // Prune old backups — keep last MAX_BACKUPS
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('referral-2nd-prospects_'))
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
  'reply', 'nextStep'
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
// START
// ============================================================
ensureDirs();
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Prospecting Tool #6 — Referral Partner 2nd Connections running at http://localhost:${PORT}`);
  console.log(`  Data: ${DATA_FILE}`);
  console.log(`  Backups: ${BACKUP_DIR} (last ${MAX_BACKUPS} kept)\n`);
});
