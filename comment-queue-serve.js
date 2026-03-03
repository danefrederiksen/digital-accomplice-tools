const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = 3861;
const HTML_FILE = path.join(__dirname, 'comment-queue.html');
const DATA_DIR = path.join(__dirname, 'data');
const COMMENT_LOG_FILE = path.join(DATA_DIR, 'comment-log.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const SCREENSHOTS_DIR = path.join(DATA_DIR, 'screenshots');
const SCREENSHOTS_META_FILE = path.join(DATA_DIR, 'screenshots.json');
const DAILY_OVERRIDES_FILE = path.join(DATA_DIR, 'daily-overrides.json');
const WARMING_DM_LOG_FILE = path.join(DATA_DIR, 'warming-dm-log.json');

// Warming config
const COMMENTS_TO_DM = 4; // Number of comments before prospect is "warmed up"

// DM templates per segment — shown when prospect is ready to DM
const DM_TEMPLATES = {
  b2b_2nd: {
    label: 'B2B 2nd Connection',
    template: `Hey {name} — been enjoying your content lately. I run a video strategy agency that helps B2B companies turn expertise into content that drives pipeline. Would you be open to a quick convo about how video could work for {company}?`
  },
  cyber_2nd: {
    label: 'Cyber 2nd Connection',
    template: `Hey {name} — been following your posts on cybersecurity. I work with cyber companies on video content that builds authority and generates leads. Curious if {company} has explored video as part of your GTM. Open to a quick chat?`
  },
  referral_1st: {
    label: 'Referral 1st Connection',
    template: `Hey {name} — been enjoying your content. I run Digital Accomplice, a video strategy agency. Always looking for people in complementary spaces to refer business back and forth. Would you be open to exploring a referral partnership?`
  },
  referral_2nd: {
    label: 'Referral 2nd Connection',
    template: `Hey {name} — I've been engaging with your content and appreciate your perspective. I run Digital Accomplice, a video strategy agency. I think there could be synergy between what we do. Would you be open to connecting and exploring ways to refer business?`
  }
};

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

function loadDailyOverrides() {
  try {
    if (!fs.existsSync(DAILY_OVERRIDES_FILE)) return {};
    return JSON.parse(fs.readFileSync(DAILY_OVERRIDES_FILE, 'utf8')) || {};
  } catch { return {}; }
}

function saveDailyOverrides(data) {
  fs.writeFileSync(DAILY_OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getTodayOverride() {
  const overrides = loadDailyOverrides();
  const todayStr = new Date().toISOString().split('T')[0];
  return overrides[todayStr] || null;
}

// Warming DM log — tracks DMs sent and replies received through the warming pipeline
function loadWarmingDmLog() {
  try {
    if (!fs.existsSync(WARMING_DM_LOG_FILE)) return [];
    return JSON.parse(fs.readFileSync(WARMING_DM_LOG_FILE, 'utf8')) || [];
  } catch { return []; }
}

function saveWarmingDmLog(entries) {
  fs.writeFileSync(WARMING_DM_LOG_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

// Derive warming status from prospect fields
function getWarmingStatus(prospect) {
  if (prospect.warming_reply_date) return 'replied';
  if (prospect.warming_dm_sent) return 'dm_sent';
  const count = prospect.comment_count || 0;
  if (count >= COMMENTS_TO_DM) return 'dm_ready';
  if (count > 0) return 'commenting';
  return 'not_started';
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
      // Use stored count from prospect data (more reliable than log count)
      const effectiveCount = p.comment_count || stats.count;
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
        commentCount: effectiveCount,
        lastCommented: stats.lastDate,
        warmingStatus: getWarmingStatus({ ...p, comment_count: effectiveCount }),
        commentsNeeded: Math.max(0, COMMENTS_TO_DM - effectiveCount),
        warmingDmSent: p.warming_dm_sent || null,
        warmingReplyDate: p.warming_reply_date || null
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

  // Check if prospect just became DM-ready
  const dmReady = totalComments >= COMMENTS_TO_DM;

  res.json({ ok: true, entry, totalComments, dmReady, commentsNeeded: Math.max(0, COMMENTS_TO_DM - totalComments) });
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
    const effectiveCount = p.comment_count || stats.count;
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
      commentCount: effectiveCount,
      lastCommented: stats.lastDate,
      warmingStatus: getWarmingStatus({ ...p, comment_count: effectiveCount }),
      commentsNeeded: Math.max(0, COMMENTS_TO_DM - effectiveCount),
      warmingDmSent: p.warming_dm_sent || null,
      warmingReplyDate: p.warming_reply_date || null
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

  // Check for screenshot-based override
  const override = getTodayOverride();
  if (override) {
    const overrideTargets = [];
    const allMap = {};
    all.forEach(p => { allMap[p.id] = p; });

    for (const pid of override.prospectIds) {
      const p = allMap[pid];
      if (!p) continue;
      const stats = commentStats[pid] || { count: 0, lastDate: null };
      overrideTargets.push({
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
        priority: 0,
        daysSinceComment: stats.lastDate ? Math.floor((now.getTime() - new Date(stats.lastDate).getTime()) / 86400000) : null
      });
    }

    return res.json({
      targets: overrideTargets,
      doneToday: commentedTodayIds.size,
      dailyTarget: Math.max(DAILY_TARGET, overrideTargets.length),
      remaining: Math.max(0, overrideTargets.length - commentedTodayIds.size),
      isOverride: true,
      overrideSetAt: override.setAt
    });
  }

  // Filter out excluded statuses, header rows, already-commented-today, and warmed-up prospects
  const candidates = all.filter(p => {
    if (!p.name || p.name === 'Name') return false;
    const status = (p.status || '').toLowerCase();
    if (EXCLUDE_STATUSES.includes(status)) return false;
    if (commentedTodayIds.has(p.id)) return false;
    // Exclude prospects who are warmed up (4+ comments), DM'd, or replied
    const warmStatus = getWarmingStatus(p);
    if (['dm_ready', 'dm_sent', 'replied'].includes(warmStatus)) return false;
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
// OCR — extract names from screenshot
// ============================================================
app.post('/api/screenshots/:id/ocr', async (req, res) => {
  const meta = loadScreenshotsMeta();
  const entry = meta.find(s => s.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Screenshot not found' });

  const filepath = path.join(SCREENSHOTS_DIR, `${entry.id}.${entry.ext}`);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });

  try {
    console.log(`[OCR] Starting OCR on ${entry.filename}...`);
    const { data: { text } } = await Tesseract.recognize(filepath, 'eng');
    console.log(`[OCR] Raw text extracted (${text.length} chars)`);

    // Strategy: use two approaches and merge results
    // 1. Pattern-based: find Sales Nav specific patterns in the raw text
    // 2. Fuzzy match: compare every word sequence against the prospect database
    const extractedNames = [];
    const seenNames = new Set();

    function addName(name) {
      const cleaned = name.replace(/[^\w\s'-]/g, '').trim();
      if (cleaned.length < 3) return;
      // Filter file names, extensions, UI elements
      if (/\.(png|jpg|txt|json|md|js|html|mp4|docx|xlsx|csv|pdf|webp)/i.test(cleaned)) return;
      if (/[_]/.test(cleaned)) return;  // underscores = file/variable names
      if (/^\d/.test(cleaned)) return;
      const key = cleaned.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        extractedNames.push(cleaned);
      }
    }

    // --- Approach 1: Sales Nav patterns in raw text ---
    // Join lines to handle names split across lines, normalize whitespace
    const fullText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

    // Name word pattern: capitalized word, possibly hyphenated (Still-Baxter)
    // Using [A-Z] without i flag so we only match capitalized words (proper nouns)
    const NW = '[A-Z][a-zA-Z\'-]+';
    const NAME = `${NW}(?:\\s+${NW}){1,4}`;

    const patterns = [
      // "Suggested lead: [Name] ..."
      new RegExp(`Suggested lead:?\\s*(${NAME})`, 'g'),
      // "[Name] shared a post"
      new RegExp(`(${NAME})\\s+shared a post`, 'g'),
      // "[Name] accepted your"
      new RegExp(`(${NAME})\\s+accepted your`, 'g'),
      // "[Name] commented on"
      new RegExp(`(${NAME})\\s+commented on`, 'g'),
      // "[Name] liked your/a post"
      new RegExp(`(${NAME})\\s+liked (?:your|a post)`, 'g'),
      // "[Name] viewed your"
      new RegExp(`(${NAME})\\s+viewed your`, 'g'),
      // "[Name] sent you a message"
      new RegExp(`(${NAME})\\s+sent you`, 'g'),
    ];

    let match;
    for (const pattern of patterns) {
      while ((match = pattern.exec(fullText)) !== null) {
        addName(match[1]);
      }
    }

    // --- Approach 2: Match raw text against prospect database ---
    const allProspects = loadAllProspects();
    const prospectNames = allProspects.map(p => p.name).filter(Boolean);
    const lowerText = text.toLowerCase();

    for (const pName of prospectNames) {
      // Check if prospect name appears anywhere in the OCR text
      if (pName && pName.length > 3 && lowerText.includes(pName.toLowerCase())) {
        addName(pName);
      }
    }

    console.log(`[OCR] Extracted ${extractedNames.length} names: ${extractedNames.join(', ')}`);
    res.json({ ok: true, names: extractedNames });
  } catch (err) {
    console.error('[OCR] Failed:', err.message);
    res.status(500).json({ error: 'OCR failed: ' + err.message });
  }
});

// ============================================================
// BULK NAME MATCH — search multiple names at once
// ============================================================
app.post('/api/match-names', (req, res) => {
  const { names } = req.body;
  if (!names || !Array.isArray(names)) {
    return res.status(400).json({ error: 'names array required' });
  }

  const all = loadAllProspects();
  const commentLog = loadCommentLog();
  const todayStr = new Date().toISOString().split('T')[0];

  // Build comment stats
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

  const results = [];
  const unmatched = [];

  for (const rawName of names) {
    const q = (rawName || '').toLowerCase().trim();
    if (!q) continue;

    // Find best match: exact name > starts with > contains
    let match = null;
    let matchType = 'none';

    for (const p of all) {
      const pName = (p.name || '').toLowerCase();
      if (pName === q) {
        match = p;
        matchType = 'exact';
        break;
      }
      if (!match && pName.startsWith(q)) {
        match = p;
        matchType = 'starts';
      }
      if (!match && pName.includes(q)) {
        match = p;
        matchType = 'contains';
      }
    }

    // Also try first-name + last-name matching (Sales Nav often shows "First Last")
    if (!match) {
      const parts = q.split(/\s+/);
      if (parts.length >= 2) {
        for (const p of all) {
          const pName = (p.name || '').toLowerCase();
          // Check if all parts appear in the prospect name
          if (parts.every(part => pName.includes(part))) {
            match = p;
            matchType = 'partial';
            break;
          }
        }
      }
    }

    if (match) {
      const stats = commentStats[match.id] || { count: 0, lastDate: null, commentedToday: false };
      results.push({
        id: match.id,
        name: match.name,
        company: match.company,
        title: match.title,
        linkedinUrl: match.linkedinUrl,
        status: match.status,
        segment: match.segment,
        segmentLabel: match.segmentLabel,
        sourceTool: match.sourceTool,
        sourcePort: match.sourcePort,
        commentCount: stats.count,
        lastCommented: stats.lastDate,
        commentedToday: stats.commentedToday,
        matchType,
        searchedName: rawName.trim()
      });
    } else {
      unmatched.push(rawName.trim());
    }
  }

  res.json({ matches: results, unmatched, total: names.length });
});

// ============================================================
// DAILY OVERRIDE — set/get/clear screenshot-based targets
// ============================================================

// Set today's override targets
app.post('/api/daily-targets/override', (req, res) => {
  const { prospectIds, screenshotId } = req.body;
  if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
    return res.status(400).json({ error: 'prospectIds array required' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const overrides = loadDailyOverrides();

  overrides[todayStr] = {
    prospectIds: prospectIds.map(id => sanitize(id)),
    screenshotId: screenshotId ? sanitize(screenshotId) : null,
    setAt: new Date().toISOString()
  };

  // Clean up old overrides (keep last 7 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  for (const key of Object.keys(overrides)) {
    if (key < cutoffStr) delete overrides[key];
  }

  saveDailyOverrides(overrides);
  res.json({ ok: true, date: todayStr, count: prospectIds.length });
});

// Clear today's override
app.delete('/api/daily-targets/override', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const overrides = loadDailyOverrides();
  delete overrides[todayStr];
  saveDailyOverrides(overrides);
  res.json({ ok: true });
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
// WARMING PIPELINE — DM Queue, DM Logging, Reply Tracking
// ============================================================

// GET DM TEMPLATES — returns templates per segment
app.get('/api/dm-templates', (req, res) => {
  res.json({ templates: DM_TEMPLATES, commentsRequired: COMMENTS_TO_DM });
});

// GET DM QUEUE — prospects warmed up (4+ comments) and ready to DM
app.get('/api/dm-queue', (req, res) => {
  const all = loadAllProspects();
  const commentLog = loadCommentLog();

  // Build comment stats
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

  const dmReady = all
    .filter(p => {
      if (!p.name || p.name === 'Name') return false;
      const effectiveCount = p.comment_count || (commentStats[p.id] || {}).count || 0;
      const warmStatus = getWarmingStatus({ ...p, comment_count: effectiveCount });
      return warmStatus === 'dm_ready';
    })
    .map(p => {
      const stats = commentStats[p.id] || { count: 0, lastDate: null };
      const effectiveCount = p.comment_count || stats.count;
      const template = DM_TEMPLATES[p.segment] || DM_TEMPLATES.b2b_2nd;
      const personalizedMessage = template.template
        .replace(/\{name\}/g, (p.name || '').split(' ')[0])
        .replace(/\{company\}/g, p.company || 'your company');
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
        commentCount: effectiveCount,
        lastCommented: stats.lastDate,
        dmTemplate: personalizedMessage,
        templateLabel: template.label
      };
    })
    .sort((a, b) => (b.lastCommented || '').localeCompare(a.lastCommented || ''));

  res.json({ prospects: dmReady, total: dmReady.length });
});

// POST LOG DM SENT — marks prospect as DM'd, removes from comment queue
app.post('/api/warming-dm', (req, res) => {
  const { prospectId, segment, message } = req.body;

  if (!prospectId || !segment) {
    return res.status(400).json({ error: 'prospectId and segment required' });
  }

  const now = new Date().toISOString();

  // Update source prospect
  const updated = updateSourceProspect(segment, prospectId, {
    warming_dm_sent: now
  });

  if (!updated) {
    return res.status(404).json({ error: 'Prospect not found in source data' });
  }

  // Log to warming DM log
  const log = loadWarmingDmLog();
  const entry = {
    id: uuidv4(),
    prospectId: sanitize(prospectId),
    segment: sanitize(segment),
    type: 'dm_sent',
    message: sanitize(message || ''),
    date: now
  };
  log.unshift(entry);
  if (log.length > 1000) log.length = 1000;
  saveWarmingDmLog(log);

  res.json({ ok: true, entry });
});

// POST LOG REPLY — marks prospect as replied, tracks conversion
app.post('/api/warming-reply', (req, res) => {
  const { prospectId, segment, notes } = req.body;

  if (!prospectId || !segment) {
    return res.status(400).json({ error: 'prospectId and segment required' });
  }

  const now = new Date().toISOString();

  // Update source prospect
  const updated = updateSourceProspect(segment, prospectId, {
    warming_reply_date: now
  });

  if (!updated) {
    return res.status(404).json({ error: 'Prospect not found in source data' });
  }

  // Log to warming DM log
  const log = loadWarmingDmLog();
  const entry = {
    id: uuidv4(),
    prospectId: sanitize(prospectId),
    segment: sanitize(segment),
    type: 'reply_received',
    message: sanitize(notes || ''),
    date: now
  };
  log.unshift(entry);
  saveWarmingDmLog(log);

  res.json({ ok: true, entry });
});

// GET DM SENT — prospects who have been DM'd (waiting for reply)
app.get('/api/dm-sent', (req, res) => {
  const all = loadAllProspects();
  const commentLog = loadCommentLog();
  const dmLog = loadWarmingDmLog();

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

  // Get DM details from log
  const dmDetails = {};
  dmLog.forEach(entry => {
    if (entry.type === 'dm_sent' && !dmDetails[entry.prospectId]) {
      dmDetails[entry.prospectId] = entry;
    }
  });

  const sent = all
    .filter(p => {
      if (!p.name || p.name === 'Name') return false;
      const warmStatus = getWarmingStatus(p);
      return warmStatus === 'dm_sent' || warmStatus === 'replied';
    })
    .map(p => {
      const stats = commentStats[p.id] || { count: 0, lastDate: null };
      const dmDetail = dmDetails[p.id] || {};
      return {
        id: p.id,
        name: p.name,
        company: p.company,
        title: p.title,
        linkedinUrl: p.linkedinUrl,
        segment: p.segment,
        segmentLabel: p.segmentLabel,
        commentCount: p.comment_count || stats.count,
        lastCommented: stats.lastDate,
        warmingStatus: getWarmingStatus(p),
        dmSentDate: p.warming_dm_sent,
        replyDate: p.warming_reply_date,
        dmMessage: dmDetail.message || ''
      };
    })
    .sort((a, b) => (b.dmSentDate || '').localeCompare(a.dmSentDate || ''));

  res.json({ prospects: sent, total: sent.length });
});

// GET WARMING STATS — conversion funnel
app.get('/api/warming-stats', (req, res) => {
  const all = loadAllProspects();
  const commentLog = loadCommentLog();

  const commentStats = {};
  commentLog.forEach(entry => {
    if (!commentStats[entry.prospectId]) {
      commentStats[entry.prospectId] = { count: 0 };
    }
    commentStats[entry.prospectId].count++;
  });

  let commenting = 0, dmReady = 0, dmSent = 0, replied = 0, notStarted = 0;

  all.forEach(p => {
    if (!p.name || p.name === 'Name') return;
    const effectiveCount = p.comment_count || (commentStats[p.id] || {}).count || 0;
    const status = getWarmingStatus({ ...p, comment_count: effectiveCount });
    switch (status) {
      case 'commenting': commenting++; break;
      case 'dm_ready': dmReady++; break;
      case 'dm_sent': dmSent++; break;
      case 'replied': replied++; break;
      default: notStarted++;
    }
  });

  const conversionRate = dmSent + replied > 0
    ? Math.round((replied / (dmSent + replied)) * 100)
    : 0;

  res.json({
    funnel: { notStarted, commenting, dmReady, dmSent, replied },
    conversionRate,
    commentsRequired: COMMENTS_TO_DM
  });
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
