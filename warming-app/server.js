const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3847;
const DATA_FILE = path.join(__dirname, 'data', 'prospects.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize data file if missing
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ prospects: [], engagementLog: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
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
  const added = [];
  const skipped = [];

  urls.forEach(url => {
    url = url.trim();
    if (!url) return;
    if (!url.includes('linkedin.com/in/')) {
      skipped.push(url);
      return;
    }
    // Normalize URL
    const username = extractUsername(url);
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
      segment: segment || 'cyber',
      tier: tier || 1,
      icp_score: 0,
      tags: tags || [],
      status: 'warming',
      connected: false,
      check_in_days: check_in_days || 3,
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
  let added = 0, skipped = 0;

  rows.forEach(row => {
    const username = extractUsername(row.linkedin_url);
    if (!username) { skipped++; return; }
    if (data.prospects.find(p => p.linkedin_username === username)) { skipped++; return; }

    data.prospects.push({
      id: uuidv4(),
      name: row.name || '',
      linkedin_url: row.linkedin_url || '',
      linkedin_username: username,
      company: row.company || '',
      title: row.title || '',
      segment: row.segment || 'cyber',
      tier: parseInt(row.tier) || 2,
      icp_score: parseFloat(row.icp_score) || 0,
      tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
      status: row.status || 'warming',
      connected: row.connected === 'yes' || row.connected === 'true',
      check_in_days: parseInt(row.check_in_days) || 3,
      warmth_score: parseInt(row.warmth_score) || 0,
      engagements: [],
      next_check_in: new Date().toISOString().split('T')[0],
      notes: row.notes || '',
      source: row.source || 'csv_import',
      batch: row.batch || '',
      created_at: new Date().toISOString().split('T')[0]
    });
    added++;
  });

  saveData(data);
  res.json({ added, skipped });
});

// PUT update prospect
app.put('/api/prospects/:id', (req, res) => {
  const data = loadData();
  const idx = data.prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.prospects[idx] = { ...data.prospects[idx], ...req.body };
  saveData(data);
  res.json(data.prospects[idx]);
});

// POST log engagement
app.post('/api/prospects/:id/engage', (req, res) => {
  const data = loadData();
  const idx = data.prospects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const p = data.prospects[idx];
  const { type, note } = req.body;
  const today = new Date().toISOString().split('T')[0];

  p.engagements = p.engagements || [];
  p.engagements.push({ type, date: today, note: note || '' });

  // Update warmth score
  if (type === 'comment') {
    p.warmth_score = (p.warmth_score || 0) + 1;
  } else if (type === 'dm') {
    p.warmth_score = (p.warmth_score || 0) + 2;
    p.status = 'outreach_sent';
    p.last_action = note || 'Sent DM';
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
  data.prospects = data.prospects.filter(p => p.id !== req.params.id);
  saveData(data);
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

app.listen(PORT, () => {
  console.log(`\n  DA Warming Dashboard running at http://localhost:${PORT}\n`);
});
