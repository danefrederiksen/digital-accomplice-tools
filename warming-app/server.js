const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3847;
const DATA_FILE = path.join(__dirname, 'data', 'prospects.json');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');

// ============================================================
// SECURITY: Only allow requests from localhost
// Without this, any website you visit could secretly read
// your prospect data by making requests to localhost:3847
// ============================================================
app.use((req, res, next) => {
  // Block requests from other websites (CORS protection)
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    console.warn(`[SECURITY] Blocked request from external origin: ${origin}`);
    return res.status(403).json({ error: 'Access denied — requests only allowed from localhost' });
  }
  // Set strict CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3847');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// SECURITY: Sanitize strings to prevent code injection (XSS)
// If a CSV contains a name like <script>steal(data)</script>,
// this strips it down to plain text before storing it
// ============================================================
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Sanitize all string fields in an object
function sanitizeProspect(obj) {
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      clean[key] = sanitize(val);
    } else if (Array.isArray(val)) {
      clean[key] = val.map(item => typeof item === 'string' ? sanitize(item) : item);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

// ============================================================
// SECURITY: Validate LinkedIn URLs
// Only allows linkedin.com URLs — blocks anything else from
// being stored as a "profile link" you might click on
// ============================================================
function isValidLinkedInUrl(url) {
  if (!url || url.trim() === '') return true; // Empty is OK (some prospects don't have URLs yet)
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.endsWith('linkedin.com');
  } catch {
    return false;
  }
}

// ============================================================
// DATA: Auto-backup before every write
// Keeps the last 10 backups in data/backups/
// If something goes wrong, your data can be recovered
// ============================================================
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function backupData() {
  if (!fs.existsSync(DATA_FILE)) return;
  ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `prospects_${timestamp}.json`);
  fs.copyFileSync(DATA_FILE, backupFile);

  // Keep only last 10 backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('prospects_') && f.endsWith('.json'))
    .sort();
  while (backups.length > 10) {
    fs.unlinkSync(path.join(BACKUP_DIR, backups.shift()));
  }
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ prospects: [], engagementLog: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  backupData(); // Always backup before writing
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function extractUsername(url) {
  if (!url) return '';
  const m = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
  return m ? m[1] : '';
}

function calcNextCheckIn(lastDate, intervalDays) {
  const d = lastDate ? new Date(lastDate) : new Date();
  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().split('T')[0];
}

// ============================================================
// SECURITY: Validate allowed field values
// Prevents someone from injecting unexpected statuses,
// segments, or other values through the API
// ============================================================
const VALID_SEGMENTS = ['cyber', 'ai_ml', 'referral_partner', 'warm_priority', 'warm_network'];
const VALID_STATUSES = ['new', 'warming', 'warm', 'outreach_sent', 'replied', 'call_booked', 'won', 'lost', 'skip'];
const VALID_CONNECTED = [true, false, 'unknown'];
const VALID_TIERS = [1, 2, 3];
const VALID_ENGAGEMENT_TYPES = ['comment', 'dm'];

function validateSegment(seg) { return VALID_SEGMENTS.includes(seg) ? seg : 'cyber'; }
function validateStatus(status) { return VALID_STATUSES.includes(status) ? status : 'warming'; }
function validateTier(tier) { const t = parseInt(tier); return VALID_TIERS.includes(t) ? t : 2; }
function validateConnected(val) {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return 'unknown';
}

// GET all prospects
app.get('/api/prospects', (req, res) => {
  const data = loadData();
  res.json(data.prospects);
});

// GET today's queue
app.get('/api/queue', (req, res) => {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const queue = data.prospects.filter(p =>
    p.status === 'warming' && p.next_check_in <= today
  ).sort((a, b) => (b.warmth_score || 0) - (a.warmth_score || 0));
  res.json(queue);
});

// GET stats
app.get('/api/stats', (req, res) => {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const weekStart = thisWeekStart.toISOString().split('T')[0];

  const prospects = data.prospects;
  const stats = {
    total: prospects.length,
    byStatus: {},
    bySegment: {},
    byTier: {},
    commentsToday: 0,
    commentsThisWeek: 0,
    dmsToday: 0,
    dueToday: 0,
    readyForSnapshot: 0,
    warmthDistribution: { cold: 0, warming: 0, warm: 0, hot: 0 }
  };

  prospects.forEach(p => {
    stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
    stats.bySegment[p.segment] = (stats.bySegment[p.segment] || 0) + 1;
    stats.byTier[p.tier] = (stats.byTier[p.tier] || 0) + 1;
    if (p.status === 'warming' && p.next_check_in <= today) stats.dueToday++;
    if ((p.warmth_score || 0) >= 5) stats.readyForSnapshot++;

    const ws = p.warmth_score || 0;
    if (ws === 0) stats.warmthDistribution.cold++;
    else if (ws < 3) stats.warmthDistribution.warming++;
    else if (ws < 5) stats.warmthDistribution.warm++;
    else stats.warmthDistribution.hot++;

    (p.engagements || []).forEach(e => {
      if (e.date === today && e.type === 'comment') stats.commentsToday++;
      if (e.date >= weekStart && e.type === 'comment') stats.commentsThisWeek++;
      if (e.date === today && e.type === 'dm') stats.dmsToday++;
    });
  });

  res.json(stats);
});

// POST bulk import (LinkedIn URLs)
app.post('/api/import/urls', (req, res) => {
  const data = loadData();
  const { urls, segment, tier, tags, check_in_days } = req.body;

  // Validate inputs
  if (!Array.isArray(urls)) return res.status(400).json({ error: 'urls must be an array' });
  if (urls.length > 500) return res.status(400).json({ error: 'Maximum 500 URLs per import' });

  const added = [];
  const skipped = [];

  urls.forEach(url => {
    url = (url || '').trim();
    if (!url) return;

    // SECURITY: Only allow LinkedIn URLs
    if (!isValidLinkedInUrl(url)) {
      skipped.push(url + ' (not a LinkedIn URL — blocked)');
      return;
    }

    if (!url.includes('linkedin.com/in/')) {
      skipped.push(url + ' (not a profile URL)');
      return;
    }

    const username = extractUsername(url);
    if (!username) { skipped.push(url + ' (could not extract username)'); return; }

    // Sanitize username — only allow alphanumeric, hyphens, underscores
    if (!/^[a-zA-Z0-9\-_]+$/.test(username)) {
      skipped.push(url + ' (invalid username characters)');
      return;
    }

    const normalizedUrl = `https://www.linkedin.com/in/${username}`;

    // Skip duplicates
    if (data.prospects.find(p => extractUsername(p.linkedin_url) === username)) {
      skipped.push(url + ' (duplicate)');
      return;
    }

    const prospect = {
      id: uuidv4(),
      name: '',
      linkedin_url: normalizedUrl,
      linkedin_username: username,
      company: '',
      title: '',
      segment: validateSegment(segment),
      tier: validateTier(tier),
      icp_score: 0,
      tags: Array.isArray(tags) ? tags.map(t => sanitize(String(t))) : [],
      status: 'warming',
      connected: false,
      check_in_days: Math.min(Math.max(parseInt(check_in_days) || 3, 1), 30),
      warmth_score: 0,
      engagements: [],
      next_check_in: new Date().toISOString().split('T')[0],
      notes: '',
      source: 'sales_nav',
      batch: '',
      created_at: new Date().toISOString().split('T')[0]
    };
    data.prospects.push(prospect);
    added.push(prospect);
  });

  saveData(data);
  res.json({ added: added.length, skipped: skipped.length, skippedUrls: skipped });
});

// POST bulk import from CSV
app.post('/api/import/csv', (req, res) => {
  const data = loadData();
  const { rows } = req.body;

  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be an array' });
  if (rows.length > 1000) return res.status(400).json({ error: 'Maximum 1000 rows per CSV import' });

  let added = 0, skipped = 0;
  const warnings = [];

  rows.forEach((row, i) => {
    // SECURITY: Validate LinkedIn URL if provided
    if (row.linkedin_url && !isValidLinkedInUrl(row.linkedin_url)) {
      warnings.push(`Row ${i + 1}: Non-LinkedIn URL blocked (${row.linkedin_url})`);
      skipped++;
      return;
    }

    const username = extractUsername(row.linkedin_url);
    if (!username) { skipped++; return; }
    if (data.prospects.find(p => p.linkedin_username === username)) { skipped++; return; }

    // Sanitize all imported text fields
    data.prospects.push({
      id: uuidv4(),
      name: sanitize(row.name || ''),
      linkedin_url: `https://www.linkedin.com/in/${username}`,
      linkedin_username: username,
      company: sanitize(row.company || ''),
      title: sanitize(row.title || ''),
      segment: validateSegment(row.segment),
      tier: validateTier(row.tier),
      icp_score: Math.min(Math.max(parseFloat(row.icp_score) || 0, 0), 10),
      tags: row.tags ? row.tags.split(',').map(t => sanitize(t.trim())) : [],
      status: validateStatus(row.status),
      connected: row.connected === 'yes' || row.connected === 'true',
      check_in_days: Math.min(Math.max(parseInt(row.check_in_days) || 3, 1), 30),
      warmth_score: Math.max(parseInt(row.warmth_score) || 0, 0),
      engagements: [],
      next_check_in: new Date().toISOString().split('T')[0],
      notes: sanitize(row.notes || ''),
      source: sanitize(row.source || 'csv_import'),
      batch: sanitize(row.batch || ''),
      created_at: new Date().toISOString().split('T')[0]
    });
    added++;
  });

  saveData(data);
  res.json({ added, skipped, warnings });
});

// PUT update prospect
app.put('/api/prospects/:id', (req, res) => {
  const data = loadData();
  const idx = data.prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  // SECURITY: Only allow updating known fields (prevent arbitrary field injection)
  const allowedFields = ['name', 'company', 'title', 'linkedin_url', 'linkedin_username',
    'segment', 'tier', 'icp_score', 'tags', 'status', 'connected', 'check_in_days',
    'warmth_score', 'notes', 'next_check_in', 'batch', 'source',
    'last_action', 'last_action_date'];

  const updates = {};
  for (const [key, val] of Object.entries(req.body)) {
    if (!allowedFields.includes(key)) continue;

    // Validate specific fields
    if (key === 'linkedin_url' && val && !isValidLinkedInUrl(val)) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL — only linkedin.com URLs are allowed' });
    }
    if (key === 'segment') { updates[key] = validateSegment(val); continue; }
    if (key === 'status') { updates[key] = validateStatus(val); continue; }
    if (key === 'tier') { updates[key] = validateTier(val); continue; }
    if (key === 'icp_score') { updates[key] = Math.min(Math.max(parseFloat(val) || 0, 0), 10); continue; }
    if (key === 'check_in_days') { updates[key] = Math.min(Math.max(parseInt(val) || 3, 1), 30); continue; }
    if (key === 'connected') { updates[key] = validateConnected(val); continue; }
    if (typeof val === 'string') { updates[key] = sanitize(val); continue; }
    updates[key] = val;
  }

  data.prospects[idx] = { ...data.prospects[idx], ...updates };
  saveData(data);
  res.json(data.prospects[idx]);
});

// POST batch update prospects
app.post('/api/prospects/batch', (req, res) => {
  const data = loadData();
  const { ids, updates } = req.body;

  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  if (ids.length > 500) return res.status(400).json({ error: 'Maximum 500 prospects per batch' });
  if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'updates must be an object' });

  const cleanUpdates = {};
  if (updates.status) cleanUpdates.status = validateStatus(updates.status);
  if (updates.connected !== undefined) cleanUpdates.connected = validateConnected(updates.connected);
  if (updates.tags) cleanUpdates.tags = Array.isArray(updates.tags) ? updates.tags.map(t => sanitize(String(t))) : [];

  let updated = 0;
  data.prospects.forEach(p => {
    if (ids.includes(p.id)) {
      Object.assign(p, cleanUpdates);
      // When activating to warming, set next_check_in to today
      if (cleanUpdates.status === 'warming') {
        p.next_check_in = new Date().toISOString().split('T')[0];
      }
      updated++;
    }
  });

  saveData(data);
  res.json({ updated });
});

// POST log engagement
app.post('/api/prospects/:id/engage', (req, res) => {
  const data = loadData();
  const idx = data.prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const p = data.prospects[idx];
  const { type, note } = req.body;

  // SECURITY: Validate engagement type
  if (!VALID_ENGAGEMENT_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid engagement type. Allowed: ${VALID_ENGAGEMENT_TYPES.join(', ')}` });
  }

  const today = new Date().toISOString().split('T')[0];

  p.engagements = p.engagements || [];
  p.engagements.push({ type, date: today, note: sanitize(note || '') });

  // Update warmth score
  if (type === 'comment') {
    p.warmth_score = (p.warmth_score || 0) + 1;
  } else if (type === 'dm') {
    p.warmth_score = (p.warmth_score || 0) + 2;
    p.status = 'outreach_sent';
    p.last_action = sanitize(note || 'Sent DM');
    p.last_action_date = today;
  }

  // Set next check-in
  p.next_check_in = calcNextCheckIn(today, p.check_in_days || 3);
  p.last_engagement_date = today;

  // Auto-flag as warm
  if (p.warmth_score >= 5 && p.status === 'warming') {
    p.status = 'warm';
  }

  saveData(data);
  res.json(p);
});

// POST skip / snooze
app.post('/api/prospects/:id/skip', (req, res) => {
  const data = loadData();
  const idx = data.prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const p = data.prospects[idx];
  const today = new Date().toISOString().split('T')[0];
  p.next_check_in = calcNextCheckIn(today, p.check_in_days || 3);
  saveData(data);
  res.json(p);
});

// DELETE prospect
app.delete('/api/prospects/:id', (req, res) => {
  const data = loadData();
  const before = data.prospects.length;
  data.prospects = data.prospects.filter(p => p.id !== req.params.id);
  if (data.prospects.length === before) return res.status(404).json({ error: 'Not found' });
  saveData(data); // backupData() runs inside saveData, so deleted data is recoverable
  res.json({ ok: true });
});

// GET export as CSV
app.get('/api/export/csv', (req, res) => {
  const data = loadData();
  const headers = ['name','linkedin_url','company','title','segment','tier','icp_score','status','connected','warmth_score','check_in_days','next_check_in','last_engagement_date','engagements_count','notes','source','tags','batch','created_at'];
  const csvRows = [headers.join(',')];
  data.prospects.forEach(p => {
    csvRows.push(headers.map(h => {
      let val = '';
      if (h === 'connected') val = p.connected ? 'yes' : 'no';
      else if (h === 'engagements_count') val = (p.engagements || []).length;
      else if (h === 'tags') val = (p.tags || []).join(';');
      else val = p[h] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','));
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=da_prospects_export.csv');
  res.send(csvRows.join('\n'));
});

// ============================================================
// SECURITY: Log startup info
// ============================================================
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Warming Dashboard running at http://localhost:${PORT}`);
  console.log(`  Security: CORS locked to localhost, input sanitization active`);
  console.log(`  Backups: Auto-saving to ${BACKUP_DIR} (last 10 kept)\n`);
});
