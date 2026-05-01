const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3863;
const HTML_FILE = path.join(__dirname, 'index.html');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'opportunities.json');
const BACKUP_DIR = path.join(__dirname, 'backups');
const MAX_BACKUPS = 5;

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

function loadData() {
  ensureDirs();
  try {
    if (!fs.existsSync(DATA_FILE)) return { meta: getDefaultMeta(), opportunities: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load data:', err.message);
    return { meta: getDefaultMeta(), opportunities: [] };
  }
}

function getDefaultMeta() {
  return {
    version: '1.0',
    description: 'DA Opportunity Tracker',
    timezone: 'America/Los_Angeles',
    stages: ['lead', 'engaged', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'nurture']
  };
}

function saveData(data) {
  ensureDirs();
  backupData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function backupData() {
  if (!fs.existsSync(DATA_FILE)) return;
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `opportunities_${timestamp}.json`);
    fs.copyFileSync(DATA_FILE, backupFile);
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('opportunities_'))
      .sort()
      .reverse();
    backups.slice(MAX_BACKUPS).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    });
  } catch (err) {
    console.error('Backup failed:', err.message);
  }
}

// ============================================================
// SANITIZATION
// ============================================================
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

const VALID_STAGES = ['lead', 'engaged', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'nurture'];
const VALID_YES_TO = ['call', 'snapshot', 'video_interview'];
const ALLOWED_FIELDS = [
  'company', 'type', 'contact', 'email', 'stage', 'source',
  'next_action', 'next_action_date', 'notes', 'yes_to'
];

// ============================================================
// ROUTES
// ============================================================

// Serve HTML
app.get('/', (req, res) => res.sendFile(HTML_FILE));

// GET all opportunities
app.get('/api/opportunities', (req, res) => {
  const data = loadData();
  res.json(data);
});

// POST — add new opportunity
app.post('/api/opportunities', (req, res) => {
  const data = loadData();
  const raw = req.body;

  const contact = sanitize((raw.contact || '').trim());
  const company = sanitize((raw.company || '').trim());
  if (!contact) return res.status(400).json({ error: 'Contact name required' });

  const opp = {
    id: raw.id || uuidv4(),
    company: company,
    type: sanitize((raw.type || 'prospect').trim()),
    contact: contact,
    email: sanitize((raw.email || '').trim()),
    stage: VALID_STAGES.includes(raw.stage) ? raw.stage : 'lead',
    source: sanitize((raw.source || '').trim()),
    next_action: sanitize((raw.next_action || '').trim()),
    next_action_date: sanitize((raw.next_action_date || '').trim()),
    notes: sanitize((raw.notes || '').trim()),
    yes_to: Array.isArray(raw.yes_to) ? raw.yes_to.filter(v => VALID_YES_TO.includes(v)) : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0]
  };

  data.opportunities.push(opp);
  saveData(data);
  res.json(opp);
});

// PUT — update opportunity
app.put('/api/opportunities/:id', (req, res) => {
  const data = loadData();
  const idx = data.opportunities.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Opportunity not found' });

  const updates = req.body;
  const opp = data.opportunities[idx];

  for (const [key, val] of Object.entries(updates)) {
    if (!ALLOWED_FIELDS.includes(key)) continue;
    if (key === 'stage' && !VALID_STAGES.includes(val)) continue;
    if (key === 'yes_to') {
      opp.yes_to = Array.isArray(val) ? val.filter(v => VALID_YES_TO.includes(v)) : opp.yes_to;
      continue;
    }
    opp[key] = typeof val === 'string' ? sanitize(val) : val;
  }

  opp.updated = new Date().toISOString().split('T')[0];
  data.opportunities[idx] = opp;
  saveData(data);
  res.json(opp);
});

// POST — add history entry
app.post('/api/opportunities/:id/history', (req, res) => {
  const data = loadData();
  const idx = data.opportunities.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Opportunity not found' });

  const entry = {
    date: sanitize((req.body.date || new Date().toISOString().split('T')[0]).trim()),
    type: sanitize((req.body.type || 'update').trim()),
    note: sanitize((req.body.note || '').trim())
  };

  data.opportunities[idx].history.push(entry);
  data.opportunities[idx].updated = new Date().toISOString().split('T')[0];
  saveData(data);
  res.json(data.opportunities[idx]);
});

// DELETE — remove opportunity
app.delete('/api/opportunities/:id', (req, res) => {
  const data = loadData();
  const opp = data.opportunities.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

  data.opportunities = data.opportunities.filter(o => o.id !== req.params.id);
  saveData(data);
  res.json({ ok: true });
});

// ============================================================
// START
// ============================================================
ensureDirs();
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Sales Opportunities Tracker running at http://localhost:${PORT}`);
  console.log(`  Data: ${DATA_FILE}`);
  console.log(`  Backups: ${BACKUP_DIR} (last ${MAX_BACKUPS} kept)\n`);
});
