const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3861;
const HTML_FILE = path.join(__dirname, 'comment-queue.html');
const DATA_DIR = path.join(__dirname, 'data');
const COMMENT_LOG_FILE = path.join(DATA_DIR, 'comment-log.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshots');
const SCREENSHOTS_META_FILE = path.join(DATA_DIR, 'screenshots.json');

// Source tool data files — Tool #11 reads directly from these
const SOURCE_FILES = {
  'b2b_2nd': {
    file: path.join(DATA_DIR, 'b2b-2nd-prospects.json'),
    label: 'B2B 2nd Connection',
    tool: '#3',
    port: 3853
  },
  'cyber_2nd': {
    file: path.join(DATA_DIR, 'cyber-2nd-prospects.json'),
    label: 'Cyber 2nd Connection',
    tool: '#4',
    port: 3854
  },
  'referral_1st': {
    file: path.join(DATA_DIR, 'referral-1st-prospects.json'),
    label: 'Referral 1st Connection',
    tool: '#5',
    port: 3855
  },
  'referral_2nd': {
    file: path.join(DATA_DIR, 'referral-2nd-prospects.json'),
    label: 'Referral 2nd Connection',
    tool: '#6',
    port: 3856
  }
};

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

app.use(express.json({ limit: '20mb' }));

// ============================================================
// DATA HELPERS
// ============================================================
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function loadSourceProspects(sourceKey) {
  const source = SOURCE_FILES[sourceKey];
  if (!source) return [];
  try {
    if (!fs.existsSync(source.file)) return [];
    const data = JSON.parse(fs.readFileSync(source.file, 'utf8'));
    return (data.prospects || []).map(p => ({
      ...p,
      segment: sourceKey,
      segmentLabel: source.label,
      sourceTool: source.tool,
      sourcePort: source.port
    }));
  } catch (err) {
    console.error(`Failed to load ${sourceKey}:`, err.message);
    return [];
  }
}

function loadAllProspects() {
  const all = [];
  for (const key of Object.keys(SOURCE_FILES)) {
    all.push(...loadSourceProspects(key));
  }
  return all;
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

function updateSourceProspect(sourceKey, prospectId, updates) {
  const source = SOURCE_FILES[sourceKey];
  if (!source || !fs.existsSync(source.file)) return false;

  try {
    const data = JSON.parse(fs.readFileSync(source.file, 'utf8'));
    const prospects = data.prospects || [];
    const idx = prospects.findIndex(p => p.id === prospectId);
    if (idx === -1) return false;

    for (const [key, val] of Object.entries(updates)) {
      prospects[idx][key] = val;
    }

    fs.writeFileSync(source.file, JSON.stringify({ prospects }, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Failed to update source prospect:`, err.message);
    return false;
  }
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// ROUTES
// ============================================================

// Serve HTML
app.get('/', (req, res) => res.sendFile(HTML_FILE));

// SEARCH — searches all three source tools
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ results: [], query: '' });

  const all = loadAllProspects();
  const commentLog = loadCommentLog();

  // Build comment stats per prospect
  const commentStats = {};
  commentLog.forEach(entry => {
    if (!commentStats[entry.prospectId]) {
      commentStats[entry.prospectId] = { count: 0, lastDate: null };
    }
    commentStats[entry.prospectId].count++;
    if (!commentStats[entry.prospectId].lastDate || entry.date > commentStats[entry.prospectId].lastDate) {
      commentStats[entry.prospectId].lastDate = entry.date;
    }
  });

  // Search by name or company
  const results = all
    .filter(p => {
      const name = (p.name || '').toLowerCase();
      const company = (p.company || '').toLowerCase();
      return name.includes(q) || company.includes(q);
    })
    .map(p => {
      const stats = commentStats[p.id] || { count: 0, lastDate: null };
      return {
        id: p.id,
        name: p.name,
        company: p.company,
        title: p.title,
        linkedinUrl: p.linkedinUrl,
        status: p.status,
        segment: p.segment,
        segmentLabel: p.segmentLabel,
        sourceTool: p.sourceTool,
        sourcePort: p.sourcePort,
        commentCount: stats.count,
        lastCommented: stats.lastDate
      };
    })
    // Sort: exact name match first, then starts-with, then contains
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
      const bExact = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;
      if (aExact !== bExact) return aExact - bExact;
      return aName.localeCompare(bName);
    });

  res.json({ results, query: q });
});

// LOG COMMENT — writes to comment-log.json AND updates source prospect
app.post('/api/comment', (req, res) => {
  const { prospectId, prospectName, company, segment, postUrl } = req.body;

  if (!prospectId || !segment) {
    return res.status(400).json({ error: 'prospectId and segment required' });
  }

  const entry = {
    id: uuidv4(),
    prospectId: sanitize(prospectId),
    prospectName: sanitize(prospectName || ''),
    company: sanitize(company || ''),
    segment: sanitize(segment),
    postUrl: sanitize(postUrl || ''),
    date: new Date().toISOString()
  };

  // Save to comment log
  const log = loadCommentLog();
  log.unshift(entry);
  // Cap at 2000 entries
  if (log.length > 2000) log.length = 2000;
  saveCommentLog(log);

  // Count total comments for this prospect
  const totalComments = log.filter(e => e.prospectId === prospectId).length;

  // Update source prospect with comment tracking fields
  updateSourceProspect(segment, prospectId, {
    last_commented: entry.date,
    comment_count: totalComments
  });

  res.json({ ok: true, entry, totalComments });
});

// STATS — today's and this week's comment counts
app.get('/api/stats', (req, res) => {
  const log = loadCommentLog();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of week (Monday)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString();

  const todayComments = log.filter(e => e.date.startsWith(todayStr));
  const weekComments = log.filter(e => e.date >= weekStart);

  // Per-segment breakdown
  const segments = { b2b_2nd: 0, cyber_2nd: 0, referral_1st: 0, referral_2nd: 0 };
  const segmentsWeek = { b2b_2nd: 0, cyber_2nd: 0, referral_1st: 0, referral_2nd: 0 };

  todayComments.forEach(e => { if (segments[e.segment] !== undefined) segments[e.segment]++; });
  weekComments.forEach(e => { if (segmentsWeek[e.segment] !== undefined) segmentsWeek[e.segment]++; });

  res.json({
    today: {
      total: todayComments.length,
      target: 8,
      bySegment: segments
    },
    week: {
      total: weekComments.length,
      target: 40,
      bySegment: segmentsWeek
    }
  });
});

// HISTORY — recent comment log
app.get('/api/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const segment = req.query.segment || '';
  let log = loadCommentLog();

  if (segment && SOURCE_FILES[segment]) {
    log = log.filter(e => e.segment === segment);
  }

  res.json({ comments: log.slice(0, limit), total: log.length });
});

// ALL PROSPECTS — returns all prospects from all 3 tools with comment stats
app.get('/api/prospects', (req, res) => {
  const all = loadAllProspects();
  const commentLog = loadCommentLog();

  const commentStats = {};
  commentLog.forEach(entry => {
    if (!commentStats[entry.prospectId]) {
      commentStats[entry.prospectId] = { count: 0, lastDate: null };
    }
    commentStats[entry.prospectId].count++;
    if (!commentStats[entry.prospectId].lastDate || entry.date > commentStats[entry.prospectId].lastDate) {
      commentStats[entry.prospectId].lastDate = entry.date;
    }
  });

  const enriched = all.map(p => {
    const stats = commentStats[p.id] || { count: 0, lastDate: null };
    return {
      id: p.id,
      name: p.name,
      company: p.company,
      title: p.title,
      linkedinUrl: p.linkedinUrl,
      status: p.status,
      segment: p.segment,
      segmentLabel: p.segmentLabel,
      sourceTool: p.sourceTool,
      commentCount: stats.count,
      lastCommented: stats.lastDate
    };
  });

  res.json({ prospects: enriched, total: enriched.length });
});

// ============================================================
// DAILY TARGETS — auto-generated list of 8 prospects to comment on today
// ============================================================
const DAILY_TARGET = 8;
const EXCLUDE_STATUSES = ['cold', 'replied'];
const ENGAGED_STATUSES = ['connection_accepted', 'dm_sent', 'follow_up_1', 'follow_up_2'];

// Deterministic shuffle using date as seed (stable within same day)
function seededShuffle(arr, seed) {
  const shuffled = [...arr];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

app.get('/api/daily-targets', (req, res) => {
  const all = loadAllProspects();
  const commentLog = loadCommentLog();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Build comment stats per prospect
  const commentStats = {};
  commentLog.forEach(entry => {
    if (!commentStats[entry.prospectId]) {
      commentStats[entry.prospectId] = { count: 0, lastDate: null, commentedToday: false };
    }
    commentStats[entry.prospectId].count++;
    if (!commentStats[entry.prospectId].lastDate || entry.date > commentStats[entry.prospectId].lastDate) {
      commentStats[entry.prospectId].lastDate = entry.date;
    }
    if (entry.date.startsWith(todayStr)) {
      commentStats[entry.prospectId].commentedToday = true;
    }
  });

  // IDs already commented on today
  const commentedTodayIds = new Set();
  commentLog.forEach(entry => {
    if (entry.date.startsWith(todayStr)) commentedTodayIds.add(entry.prospectId);
  });

  // Filter out excluded statuses, header rows, and already-commented-today
  const candidates = all.filter(p => {
    if (!p.name || p.name === 'Name') return false;
    const status = (p.status || '').toLowerCase();
    if (EXCLUDE_STATUSES.includes(status)) return false;
    if (commentedTodayIds.has(p.id)) return false;
    return true;
  });

  // Score each candidate (lower = higher priority)
  const nowMs = now.getTime();
  const DAY_MS = 86400000;

  const scored = candidates.map(p => {
    const stats = commentStats[p.id] || { count: 0, lastDate: null };
    const status = (p.status || '').toLowerCase();
    const daysSinceComment = stats.lastDate
      ? Math.floor((nowMs - new Date(stats.lastDate).getTime()) / DAY_MS)
      : Infinity;

    let priority;

    if (ENGAGED_STATUSES.includes(status) && stats.count === 0) {
      // Tier 1: Engaged but never commented — hottest leads
      priority = 1;
    } else if (stats.count > 0 && daysSinceComment >= 21) {
      // Tier 2: Stale — commented before but 3+ weeks ago
      priority = 2;
    } else if (stats.count > 0 && daysSinceComment >= 7) {
      // Tier 3: Aging — commented 1-3 weeks ago, good refresh
      priority = 3;
    } else if (stats.count === 0) {
      // Tier 4: Never commented — cold prospects to warm up
      priority = 4;
    } else {
      // Tier 5: Recently commented (< 7 days) — lowest priority
      priority = 5;
    }

    return {
      id: p.id,
      name: p.name,
      company: p.company,
      title: p.title,
      linkedinUrl: p.linkedinUrl,
      status: p.status,
      segment: p.segment,
      segmentLabel: p.segmentLabel,
      sourceTool: p.sourceTool,
      sourcePort: p.sourcePort,
      commentCount: stats.count,
      lastCommented: stats.lastDate,
      priority,
      daysSinceComment: daysSinceComment === Infinity ? null : daysSinceComment
    };
  });

  // Sort by priority tier, then shuffle within each tier using today's date as seed
  scored.sort((a, b) => a.priority - b.priority);

  // Group by tier, shuffle each, then flatten
  const tiers = {};
  scored.forEach(p => {
    if (!tiers[p.priority]) tiers[p.priority] = [];
    tiers[p.priority].push(p);
  });

  let pool = [];
  for (const tier of Object.keys(tiers).sort((a, b) => a - b)) {
    pool.push(...seededShuffle(tiers[tier], todayStr + tier));
  }

  // Spread segments: pick round-robin from segments to avoid all-cyber or all-b2b
  const segmentBuckets = {};
  pool.forEach(p => {
    if (!segmentBuckets[p.segment]) segmentBuckets[p.segment] = [];
    segmentBuckets[p.segment].push(p);
  });

  const segKeys = Object.keys(segmentBuckets);
  const balanced = [];
  const usedIds = new Set();
  let round = 0;

  while (balanced.length < DAILY_TARGET && round < 200) {
    const seg = segKeys[round % segKeys.length];
    const bucket = segmentBuckets[seg];
    const next = bucket.find(p => !usedIds.has(p.id));
    if (next) {
      balanced.push(next);
      usedIds.add(next.id);
    }
    round++;
  }

  // If we didn't fill 8 from round-robin, fill from remaining pool
  if (balanced.length < DAILY_TARGET) {
    for (const p of pool) {
      if (balanced.length >= DAILY_TARGET) break;
      if (!usedIds.has(p.id)) {
        balanced.push(p);
        usedIds.add(p.id);
      }
    }
  }

  const targets = balanced.slice(0, DAILY_TARGET);
  const doneToday = commentedTodayIds.size;

  res.json({
    targets,
    doneToday,
    dailyTarget: DAILY_TARGET,
    remaining: Math.max(0, DAILY_TARGET - doneToday)
  });
});

// ============================================================
// SCREENSHOTS
// ============================================================
const ALLOWED_MIME = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

function loadScreenshotsMeta() {
  try {
    if (!fs.existsSync(SCREENSHOTS_META_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCREENSHOTS_META_FILE, 'utf8')) || [];
  } catch { return []; }
}

function saveScreenshotsMeta(entries) {
  fs.writeFileSync(SCREENSHOTS_META_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

// Upload screenshot
app.post('/api/screenshots', (req, res) => {
  const { filename, mimeType, data, notes } = req.body;

  if (!data || !mimeType) {
    return res.status(400).json({ error: 'data and mimeType required' });
  }

  const ext = ALLOWED_MIME[mimeType];
  if (!ext) {
    return res.status(400).json({ error: 'Only PNG, JPG, and WebP allowed' });
  }

  try {
    const id = uuidv4();
    const buffer = Buffer.from(data, 'base64');
    const filepath = path.join(SCREENSHOTS_DIR, `${id}.${ext}`);
    fs.writeFileSync(filepath, buffer);

    const entry = {
      id,
      filename: sanitize(filename || `screenshot.${ext}`),
      mimeType,
      ext,
      sizeBytes: buffer.length,
      uploadedAt: new Date().toISOString(),
      notes: sanitize(notes || ''),
      status: 'new'
    };

    const meta = loadScreenshotsMeta();
    meta.unshift(entry);
    saveScreenshotsMeta(meta);

    res.json({ ok: true, screenshot: entry });
  } catch (err) {
    console.error('Screenshot upload failed:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List screenshots (metadata only)
app.get('/api/screenshots', (req, res) => {
  res.json({ screenshots: loadScreenshotsMeta() });
});

// Serve screenshot image
app.get('/api/screenshots/:id/image', (req, res) => {
  const meta = loadScreenshotsMeta();
  const entry = meta.find(s => s.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const filepath = path.join(SCREENSHOTS_DIR, `${entry.id}.${entry.ext}`);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });

  res.setHeader('Content-Type', entry.mimeType);
  res.sendFile(filepath);
});

// Update screenshot metadata (status, notes)
app.put('/api/screenshots/:id', (req, res) => {
  const meta = loadScreenshotsMeta();
  const idx = meta.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  if (req.body.status) meta[idx].status = sanitize(req.body.status);
  if (req.body.notes !== undefined) meta[idx].notes = sanitize(req.body.notes);

  saveScreenshotsMeta(meta);
  res.json({ ok: true, screenshot: meta[idx] });
});

// Delete screenshot
app.delete('/api/screenshots/:id', (req, res) => {
  const meta = loadScreenshotsMeta();
  const idx = meta.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const entry = meta[idx];
  const filepath = path.join(SCREENSHOTS_DIR, `${entry.id}.${entry.ext}`);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  meta.splice(idx, 1);
  saveScreenshotsMeta(meta);
  res.json({ ok: true });
});

// ============================================================
// ERROR HANDLER (catches body-parser errors like payload too large)
// ============================================================
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large. Max upload size is ~15MB.' });
  }
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ============================================================
// START
// ============================================================
ensureDirs();
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DA Prospecting Tool #11 — Comment Queue running at http://localhost:${PORT}`);
  console.log(`  Comment log: ${COMMENT_LOG_FILE}`);
  console.log(`  Reading from:`);
  for (const [key, source] of Object.entries(SOURCE_FILES)) {
    console.log(`    Tool ${source.tool} (${source.label}): ${source.file}`);
  }
  console.log('');
});
