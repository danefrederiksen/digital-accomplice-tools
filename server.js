const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const basicAuth = require('express-basic-auth');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3847;
const DATA_FILE = path.join(__dirname, 'data', 'prospects.json');
const TEMPLATES_FILE = path.join(__dirname, 'data', 'templates.json');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');

// ============================================================
// SECURITY: Basic auth — keeps any random process on your
// machine from reading your prospect data without the password.
// Change the password below to something only you know.
// The browser will prompt you once, then remember it.
// ============================================================
app.use(basicAuth({
  users: { 'dane': 'da-pipeline-2026' },
  challenge: true,
  realm: 'DA Warming Dashboard'
}));

// ============================================================
// SECURITY: Rate limiting — prevents any script from hammering
// the API. Max 100 requests per minute per IP.
// ============================================================
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — slow down' }
});
app.use(limiter);

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

  // Backup prospects
  const backupFile = path.join(BACKUP_DIR, `prospects_${timestamp}.json`);
  fs.copyFileSync(DATA_FILE, backupFile);

  // Backup templates too
  if (fs.existsSync(TEMPLATES_FILE)) {
    const templatesBackup = path.join(BACKUP_DIR, `templates_${timestamp}.json`);
    fs.copyFileSync(TEMPLATES_FILE, templatesBackup);
  }

  // Keep only last 10 backups of each type
  ['prospects_', 'templates_'].forEach(prefix => {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
      .sort();
    while (backups.length > 10) {
      fs.unlinkSync(path.join(BACKUP_DIR, backups.shift()));
    }
  });
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
const VALID_SEGMENTS = ['cyber', 'ai_ml', 'referral_partner', 'warm_priority', 'warm_network', 'cyber_cmo', 'demand_gen', 'podcast_target', 'ai_ml_leader'];
const VALID_STATUSES = ['new', 'warming', 'warm', 'outreach_sent', 'replied', 'call_booked', 'won', 'lost', 'skip', 'dead'];
const VALID_CONNECTED = [true, false, 'unknown'];
const VALID_TIERS = [1, 2, 3];
const VALID_ENGAGEMENT_TYPES = ['comment', 'dm', 'follow_up', 'reply_received', 'connection_request'];
const VALID_SEQUENCE_TYPES = ['connected_icp', 'not_connected', 'referral_partner', 'podcast_guest'];

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

// GET follow-ups due
app.get('/api/followups', (req, res) => {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const followups = data.prospects.filter(p =>
    p.sequence_status === 'active' &&
    p.follow_up_due &&
    p.follow_up_due <= today
  ).sort((a, b) => (a.follow_up_due || '').localeCompare(b.follow_up_due || ''));

  const exhausted = data.prospects.filter(p =>
    p.sequence_status === 'exhausted'
  );

  // Connection requests to check on (sent 7+ days ago)
  const connectionPending = data.prospects.filter(p =>
    p.sequence_status === 'connection_pending' &&
    p.follow_up_due &&
    p.follow_up_due <= today
  ).sort((a, b) => (a.follow_up_due || '').localeCompare(b.follow_up_due || ''));

  res.json({ due: followups, exhausted, connectionPending });
});

// GET message templates
app.get('/api/templates', (req, res) => {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    return res.json({});
  }
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
  res.json(templates);
});

// PUT update message templates
app.put('/api/templates', (req, res) => {
  const templates = req.body;
  if (!templates || typeof templates !== 'object') {
    return res.status(400).json({ error: 'Templates must be an object' });
  }
  // Sanitize all template strings
  const clean = {};
  for (const [seqType, steps] of Object.entries(templates)) {
    if (typeof steps !== 'object') continue;
    clean[seqType] = {};
    for (const [step, text] of Object.entries(steps)) {
      if (typeof text !== 'string') continue;
      // Don't HTML-escape templates — they contain raw message text for LinkedIn,
      // not HTML. Sanitize only strips dangerous chars if needed.
      clean[seqType][step] = text.substring(0, 1000); // Max 1000 chars per template
    }
  }
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(clean, null, 2));
  res.json(clean);
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
    followUpsDue: 0,
    sequencesExhausted: 0,
    warmthDistribution: { cold: 0, warming: 0, warm: 0, hot: 0 },
    reportsGenerated: 0,
    reportsNeeded: 0
  };

  prospects.forEach(p => {
    stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
    stats.bySegment[p.segment] = (stats.bySegment[p.segment] || 0) + 1;
    stats.byTier[p.tier] = (stats.byTier[p.tier] || 0) + 1;
    if (p.status === 'warming' && p.next_check_in <= today) stats.dueToday++;
    if ((p.warmth_score || 0) >= 5) stats.readyForSnapshot++;
    if (p.sequence_status === 'active' && p.follow_up_due && p.follow_up_due <= today) stats.followUpsDue++;
    if (p.sequence_status === 'exhausted') stats.sequencesExhausted++;

    const ws = p.warmth_score || 0;
    if (ws === 0) stats.warmthDistribution.cold++;
    else if (ws < 3) stats.warmthDistribution.warming++;
    else if (ws < 5) stats.warmthDistribution.warm++;
    else stats.warmthDistribution.hot++;

    // Report tracking
    if (p.report_generated) stats.reportsGenerated++;
    if (['warm', 'outreach_sent', 'replied', 'call_booked'].includes(p.status) && !p.report_generated) stats.reportsNeeded++;

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
    'last_action', 'last_action_date', 'last_engagement_date',
    'sequence_type', 'sequence_step', 'sequence_started', 'follow_up_due',
    'follow_up_count', 'sequence_status',
    'report_generated', 'report_date'];

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
    if (key === 'report_generated') { updates[key] = val === true || val === 'true'; continue; }
    if (key === 'report_date') { updates[key] = typeof val === 'string' ? val.substring(0, 10) : ''; continue; }
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
  const { type, note, sequence_type: reqSeqType } = req.body;

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
  } else if (type === 'connection_request') {
    // Track connection request — follow up in 7 days to check if accepted
    p.last_action = sanitize(note || 'Sent connection request');
    p.last_action_date = today;
    p.follow_up_due = calcNextCheckIn(today, 7);
    p.sequence_status = 'connection_pending';
  } else if (type === 'dm') {
    p.warmth_score = (p.warmth_score || 0) + 2;
    p.status = 'outreach_sent';
    p.last_action = sanitize(note || 'Sent DM');
    p.last_action_date = today;

    // Auto-start sequence if not already in one
    if (!p.sequence_status || p.sequence_status === 'none' || p.sequence_status === 'connection_pending') {
      // Use requested sequence type if valid, otherwise auto-detect from connected status
      if (reqSeqType && VALID_SEQUENCE_TYPES.includes(reqSeqType)) {
        p.sequence_type = reqSeqType;
      } else {
        p.sequence_type = p.connected ? 'connected_icp' : 'not_connected';
      }
      p.sequence_step = 1;
      p.sequence_started = today;
      p.follow_up_count = 0;
      p.follow_up_due = calcNextCheckIn(today, 2); // First follow-up in 2 days
      p.sequence_status = 'active';
    }
  } else if (type === 'follow_up') {
    p.follow_up_count = (p.follow_up_count || 0) + 1;
    p.sequence_step = (p.sequence_step || 1) + 1;
    p.last_action = sanitize(note || `Follow-up #${p.follow_up_count}`);
    p.last_action_date = today;

    if (p.follow_up_count >= 3) {
      // 3 follow-ups sent, no reply — mark sequence complete, suggest dead
      p.follow_up_due = null;
      p.sequence_status = 'exhausted';
    } else {
      // Schedule next follow-up in 2 days
      p.follow_up_due = calcNextCheckIn(today, 2);
    }
  } else if (type === 'reply_received') {
    p.status = 'replied';
    p.sequence_status = 'replied';
    p.follow_up_due = null;
    p.last_action = sanitize(note || 'Got a reply!');
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

// GET alerts (cooling leads, stale sequences, dead-lead suggestions)
app.get('/api/alerts', (req, res) => {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const todayMs = new Date(today).getTime();

  const cooling = [];    // Warming prospects with no engagement in 14+ days
  const stale = [];      // Active sequence, follow-up 3+ days overdue
  const deadSuggestions = []; // Exhausted 7+ days ago, still not marked dead

  data.prospects.forEach(p => {
    // --- COOLING LEADS ---
    // Prospect is in "warming" status but hasn't been engaged in 14+ days
    if (p.status === 'warming') {
      const lastEngDate = p.last_engagement_date || p.created_at || '';
      if (lastEngDate) {
        const daysSince = Math.floor((todayMs - new Date(lastEngDate).getTime()) / 86400000);
        if (daysSince >= 14) {
          cooling.push({ ...p, alert_days_cold: daysSince });
        }
      }
    }

    // --- STALE SEQUENCES ---
    // Active sequence where follow-up is 3+ days overdue
    if (p.sequence_status === 'active' && p.follow_up_due) {
      const daysOverdue = Math.floor((todayMs - new Date(p.follow_up_due).getTime()) / 86400000);
      if (daysOverdue >= 3) {
        stale.push({ ...p, alert_days_overdue: daysOverdue });
      }
    }

    // --- DEAD LEAD SUGGESTIONS ---
    // Exhausted sequence (3 follow-ups, no reply) sitting 7+ days
    if (p.sequence_status === 'exhausted') {
      const lastActionDate = p.last_action_date || p.sequence_started || '';
      if (lastActionDate) {
        const daysSinceLast = Math.floor((todayMs - new Date(lastActionDate).getTime()) / 86400000);
        if (daysSinceLast >= 7) {
          deadSuggestions.push({ ...p, alert_days_stale: daysSinceLast });
        }
      }
    }
  });

  res.json({
    cooling: cooling.sort((a, b) => b.alert_days_cold - a.alert_days_cold),
    stale: stale.sort((a, b) => b.alert_days_overdue - a.alert_days_overdue),
    deadSuggestions: deadSuggestions.sort((a, b) => b.alert_days_stale - a.alert_days_stale),
    totalAlerts: cooling.length + stale.length + deadSuggestions.length
  });
});

// GET reports data
app.get('/api/reports', (req, res) => {
  const data = loadData();
  const prospects = data.prospects;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // --- Date helpers ---
  function daysAgo(n) {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }
  const weekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);
  const monthAgo = daysAgo(30);

  // --- WEEKLY SUMMARY ---
  // Count engagements from last 7 days and previous 7 days (for trend)
  const thisWeek = { comments: 0, dms: 0, follow_ups: 0, replies: 0 };
  const lastWeek = { comments: 0, dms: 0, follow_ups: 0, replies: 0 };

  prospects.forEach(p => {
    (p.engagements || []).forEach(e => {
      if (e.date >= weekAgo) {
        if (e.type === 'comment') thisWeek.comments++;
        else if (e.type === 'dm') thisWeek.dms++;
        else if (e.type === 'follow_up') thisWeek.follow_ups++;
        else if (e.type === 'reply_received') thisWeek.replies++;
      } else if (e.date >= twoWeeksAgo) {
        if (e.type === 'comment') lastWeek.comments++;
        else if (e.type === 'dm') lastWeek.dms++;
        else if (e.type === 'follow_up') lastWeek.follow_ups++;
        else if (e.type === 'reply_received') lastWeek.replies++;
      }
    });
  });

  // Status-based counts (current snapshot)
  const statusCounts = {};
  prospects.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  // --- CONVERSION FUNNEL ---
  // A prospect "reached" a stage if they are currently at that stage or any later stage
  const stageOrder = ['new', 'warming', 'warm', 'outreach_sent', 'replied', 'call_booked', 'won'];
  const stageIndex = {};
  stageOrder.forEach((s, i) => { stageIndex[s] = i; });

  const funnel = {};
  stageOrder.forEach(s => { funnel[s] = 0; });

  prospects.forEach(p => {
    // Skip dead/lost/skip — they dropped out
    const idx = stageIndex[p.status];
    if (idx !== undefined) {
      // This prospect reached every stage up to and including their current one
      for (let i = 0; i <= idx; i++) {
        funnel[stageOrder[i]]++;
      }
    }
  });

  // --- PIPELINE VELOCITY ---
  // Average days prospects have spent in their current stage
  // Uses created_at as proxy start date (best we have without status change history)
  const velocity = {};
  const velocityCounts = {};
  const activeStatuses = ['warming', 'warm', 'outreach_sent', 'replied', 'call_booked'];
  activeStatuses.forEach(s => { velocity[s] = 0; velocityCounts[s] = 0; });

  prospects.forEach(p => {
    if (!activeStatuses.includes(p.status)) return;
    // Use sequence_started for outreach stages, created_at for warming stages
    let entryDate = p.created_at;
    if (['outreach_sent', 'replied'].includes(p.status) && p.sequence_started) {
      entryDate = p.sequence_started;
    }
    if (entryDate) {
      const days = Math.floor((today.getTime() - new Date(entryDate).getTime()) / 86400000);
      velocity[p.status] += days;
      velocityCounts[p.status]++;
    }
  });

  const avgVelocity = {};
  activeStatuses.forEach(s => {
    avgVelocity[s] = velocityCounts[s] > 0 ? Math.round(velocity[s] / velocityCounts[s]) : 0;
  });

  // --- SEQUENCE PERFORMANCE ---
  const sequences = {
    active: prospects.filter(p => p.sequence_status === 'active').length,
    exhausted: prospects.filter(p => p.sequence_status === 'exhausted').length,
    replied: prospects.filter(p => p.sequence_status === 'replied').length,
    connection_pending: prospects.filter(p => p.sequence_status === 'connection_pending').length,
    total_started: prospects.filter(p => p.sequence_started).length
  };
  // Reply rate: replies / total sequences started
  sequences.reply_rate = sequences.total_started > 0
    ? Math.round((sequences.replied / sequences.total_started) * 100)
    : 0;

  // --- ACTIVITY BY DAY (last 14 days) ---
  const dailyActivity = [];
  for (let i = 13; i >= 0; i--) {
    const dateStr = daysAgo(i);
    const day = { date: dateStr, comments: 0, dms: 0, follow_ups: 0, replies: 0 };
    prospects.forEach(p => {
      (p.engagements || []).forEach(e => {
        if (e.date === dateStr) {
          if (e.type === 'comment') day.comments++;
          else if (e.type === 'dm') day.dms++;
          else if (e.type === 'follow_up') day.follow_ups++;
          else if (e.type === 'reply_received') day.replies++;
        }
      });
    });
    day.total = day.comments + day.dms + day.follow_ups + day.replies;
    dailyActivity.push(day);
  }

  res.json({
    generated: todayStr,
    total_prospects: prospects.length,
    weekly: { thisWeek, lastWeek },
    statusCounts,
    funnel,
    avgVelocity,
    sequences,
    dailyActivity
  });
});

// GET export as CSV
app.get('/api/export/csv', (req, res) => {
  const data = loadData();
  const headers = ['name','linkedin_url','company','title','segment','tier','icp_score','status','connected','warmth_score','check_in_days','next_check_in','last_engagement_date','engagements_count','notes','source','tags','batch','created_at','sequence_type','sequence_step','sequence_status','follow_up_due','follow_up_count','report_generated','report_date'];
  const csvRows = [headers.join(',')];
  data.prospects.forEach(p => {
    csvRows.push(headers.map(h => {
      let val = '';
      if (h === 'connected') val = p.connected ? 'yes' : 'no';
      else if (h === 'report_generated') val = p.report_generated ? 'yes' : 'no';
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
  console.log(`  Security: Basic auth ON, CORS locked to localhost, rate-limited (100/min)`);
  console.log(`  Auth: username "dane" — change password in server.js line 25 if needed`);
  console.log(`  Backups: Auto-saving prospects + templates to ${BACKUP_DIR} (last 10 kept)\n`);
});
