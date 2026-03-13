#!/usr/bin/env node
/**
 * DA Auto-Filer — watches ~/Downloads for DA_* files and moves them
 * to the correct folder under ~/Desktop/Digital Accomplice/
 *
 * Naming convention: DA_{Department}_{Subcategory}_{Description}_{YYYY-MM-DD}.{ext}
 *
 * Run: node scripts/da-auto-filer.js
 * Or install as LaunchAgent for auto-start on login.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const DA_ROOT = path.join(os.homedir(), 'Desktop', 'Digital Accomplice');
const LOG_FILE = path.join(DA_ROOT, '4_Operations', '4.3_Processes', 'file-log.json');

// Department code → folder name
const DEPT_MAP = {
  Sales: '1_Sales',
  Marketing: '2_Marketing',
  Clients: '3_Clients',
  Ops: '4_Operations',
  Finance: '5_Finance',
  Assets: '6_Assets',
};

// Subcategory code → subfolder name
const SUB_MAP = {
  // Sales
  Prospects: '1.1_Prospects',
  Snapshots: '1.2_Snapshots',
  Proposals: '1.3_Proposals',
  Discovery: '1.4_Discovery_Calls',
  Partners: '1.5_Partners',
  Scripts: '1.6_Scripts_and_Templates',
  // Marketing
  Positioning: '2.1_Positioning',
  Content: '2.2_Content',
  Podcast: '2.3_Podcast',
  Speaking: '2.4_Speaking',
  Sequences: '2.5_Outreach_Sequences',
  // Clients
  ActiveClient: '3.1_Active',
  Archive: '3.2_Archive',
  // Operations
  Strategy: '4.1_Strategy',
  Tools: '4.2_Tools',
  Processes: '4.3_Processes',
  Legal: '4.4_Legal',
  // Finance
  Invoices: '5.1_Invoices',
  Expenses: '5.2_Expenses',
  QB: '5.3_QuickBooks_Exports',
  Tax: '5.4_Tax',
  // Assets
  Brand: '6.1_Brand',
  Templates: '6.2_Templates',
  Media: '6.3_Media',
  IP: '6.4_IP',
};

// Track files currently being written (partial downloads)
const pending = new Map();
const SETTLE_MS = 2000; // wait 2s after last change before moving

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function appendFileLog(entry) {
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch { /* file doesn't exist yet */ }
  logs.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

function resolveDestPath(destDir, filename) {
  let dest = path.join(destDir, filename);
  if (!fs.existsSync(dest)) return dest;

  // Handle duplicates: append -2, -3, etc.
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let i = 2;
  while (fs.existsSync(dest)) {
    dest = path.join(destDir, `${base}-${i}${ext}`);
    i++;
  }
  return dest;
}

function processFile(filename) {
  // Parse: DA_{Dept}_{Sub}_{rest}
  const match = filename.match(/^DA_([A-Za-z]+)_([A-Za-z]+)_(.+)$/);
  if (!match) {
    log(`Skipping ${filename} — doesn't match DA_{Dept}_{Sub}_ pattern`);
    return;
  }

  const [, dept, sub] = match;
  const deptFolder = DEPT_MAP[dept];
  const subFolder = SUB_MAP[sub];

  if (!deptFolder) {
    log(`Unknown department "${dept}" in ${filename} — leaving in Downloads`);
    return;
  }

  // If subcategory not recognized, file into department root
  const destDir = subFolder
    ? path.join(DA_ROOT, deptFolder, subFolder)
    : path.join(DA_ROOT, deptFolder);

  if (!fs.existsSync(destDir)) {
    log(`Destination doesn't exist: ${destDir} — creating it`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  const src = path.join(DOWNLOADS, filename);
  if (!fs.existsSync(src)) return; // file already moved or deleted

  const dest = resolveDestPath(destDir, filename);

  try {
    fs.renameSync(src, dest);
    log(`FILED: ${filename} → ${path.relative(DA_ROOT, dest)}`);
    appendFileLog({
      timestamp: new Date().toISOString(),
      file: filename,
      from: src,
      to: dest,
      department: dept,
      subcategory: sub,
    });
  } catch (err) {
    log(`ERROR moving ${filename}: ${err.message}`);
  }
}

function handleFileEvent(filename) {
  if (!filename || !filename.startsWith('DA_')) return;
  // Ignore partial downloads (.crdownload, .download, .part, .tmp)
  if (/\.(crdownload|download|part|tmp)$/i.test(filename)) return;

  // Debounce: wait for file to settle (download complete)
  if (pending.has(filename)) clearTimeout(pending.get(filename));
  pending.set(filename, setTimeout(() => {
    pending.delete(filename);
    processFile(filename);
  }, SETTLE_MS));
}

// --- Startup ---
log('DA Auto-Filer started');
log(`Watching: ${DOWNLOADS}`);
log(`Filing to: ${DA_ROOT}`);

// Process any DA_ files already sitting in Downloads
const existing = fs.readdirSync(DOWNLOADS).filter(f => f.startsWith('DA_'));
if (existing.length > 0) {
  log(`Found ${existing.length} existing DA_ file(s) — processing...`);
  existing.forEach(f => processFile(f));
}

// Watch for new files
fs.watch(DOWNLOADS, (eventType, filename) => {
  handleFileEvent(filename);
});

log('Watching for new DA_ files...');
