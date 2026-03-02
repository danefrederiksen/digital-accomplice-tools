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

app.use(express.json({ limit: '5mb' }));

// ============================================================
// DATA HELPERS
// ============================================================
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
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
