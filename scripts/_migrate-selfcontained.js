// One-shot migration: flat tools/ + data/ → per-tool self-contained folders.
// Run from repo root: node scripts/_migrate-selfcontained.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'tools');
const DATA_DIR = path.join(ROOT, 'data');

// Per-tool migration specs. `b2b` is already done manually, skip it.
const TOOLS = [
  { folder: 'cyber',          html: 'cyber-outreach.html',         serve: 'cyber-serve.js',         prefix: 'cyber',          hasTemplates: true,  hasActivity: true },
  { folder: 'b2b-2nd',        html: 'b2b-2nd-outreach.html',       serve: 'b2b-2nd-serve.js',       prefix: 'b2b-2nd',        hasTemplates: true,  hasActivity: true,  hasCommentLog: true },
  { folder: 'cyber-2nd',      html: 'cyber-2nd-outreach.html',     serve: 'cyber-2nd-serve.js',     prefix: 'cyber-2nd',      hasTemplates: true,  hasActivity: true,  hasCommentLog: true },
  { folder: 'referral-1st',   html: 'referral-1st-outreach.html',  serve: 'referral-1st-serve.js',  prefix: 'referral-1st',   hasTemplates: true,  hasActivity: true,  hasCommentLog: true },
  { folder: 'referral-2nd',   html: 'referral-2nd-outreach.html',  serve: 'referral-2nd-serve.js',  prefix: 'referral-2nd',   hasTemplates: true,  hasActivity: true,  hasCommentLog: true },
  { folder: 'b2b-email',      html: 'b2b-email-outreach.html',     serve: 'b2b-email-serve.js',     prefix: 'b2b-email',      hasTemplates: false, hasActivity: true },
  { folder: 'cyber-email',    html: 'cyber-email-outreach.html',   serve: 'cyber-email-serve.js',   prefix: 'cyber-email',    hasTemplates: false, hasActivity: true },
  { folder: 'substack',       html: 'substack-outreach.html',      serve: 'substack-serve.js',      prefix: 'substack',       hasTemplates: false, hasActivity: true },
  { folder: 'customer',       html: 'customer-outreach.html',      serve: 'customer-serve.js',      prefix: 'customer',       hasTemplates: false, hasActivity: true },
  { folder: 'referral-email', html: 'referral-email-outreach.html',serve: 'referral-email-serve.js',prefix: 'referral-email', hasTemplates: false, hasActivity: true },
  { folder: 'opportunities',  html: 'opportunities.html',          serve: 'opportunities-serve.js', prefix: 'opportunities',  hasTemplates: false, hasActivity: false, dataIsSelf: true }
];

function moveIfExists(src, dst) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.renameSync(src, dst);
    return true;
  }
  return false;
}

function migrate(tool) {
  console.log(`\n=== ${tool.folder} ===`);
  const toolDir = path.join(TOOLS_DIR, tool.folder);
  const dataDir = path.join(toolDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  // 1. Move HTML + serve
  const htmlSrc = path.join(TOOLS_DIR, tool.html);
  const serveSrc = path.join(TOOLS_DIR, tool.serve);
  const htmlDst = path.join(toolDir, 'index.html');
  const serveDst = path.join(toolDir, 'server.js');
  if (!moveIfExists(htmlSrc, htmlDst)) console.log(`  skip HTML (not found): ${tool.html}`);
  else console.log(`  moved ${tool.html} → ${tool.folder}/index.html`);
  if (!moveIfExists(serveSrc, serveDst)) console.log(`  skip serve (not found): ${tool.serve}`);
  else console.log(`  moved ${tool.serve} → ${tool.folder}/server.js`);

  // 2. Move data files (some may not exist yet for no-data tools)
  if (tool.dataIsSelf) {
    // opportunities.json — no prefix rename; keep as `opportunities.json`
    moveIfExists(path.join(DATA_DIR, `${tool.prefix}.json`), path.join(dataDir, `${tool.prefix}.json`));
    console.log(`  moved ${tool.prefix}.json → ${tool.folder}/data/${tool.prefix}.json`);
  } else {
    const prospectsSrc = path.join(DATA_DIR, `${tool.prefix}-prospects.json`);
    const prospectsDst = path.join(dataDir, 'prospects.json');
    if (moveIfExists(prospectsSrc, prospectsDst)) console.log(`  moved prospects`);
    else console.log(`  skip prospects (no file yet)`);

    if (tool.hasActivity) {
      moveIfExists(path.join(DATA_DIR, `${tool.prefix}-activity.json`), path.join(dataDir, 'activity.json'))
        ? console.log(`  moved activity`) : console.log(`  skip activity`);
    }
    if (tool.hasTemplates) {
      moveIfExists(path.join(DATA_DIR, `${tool.prefix}-templates.json`), path.join(dataDir, 'templates.json'))
        ? console.log(`  moved templates`) : console.log(`  skip templates`);
    }
  }

  // 3. Edit server.js
  if (!fs.existsSync(serveDst)) {
    console.log(`  ERROR: server.js missing, cannot patch`);
    return;
  }
  let code = fs.readFileSync(serveDst, 'utf8');
  const before = code;

  // HTML_FILE → index.html
  code = code.replace(
    /const HTML_FILE = path\.join\(__dirname, '[^']+'\);/,
    `const HTML_FILE = path.join(__dirname, 'index.html');`
  );
  // DATA_DIR → sibling data/
  code = code.replace(
    /const DATA_DIR = path\.join\(__dirname, '\.\.', 'data'\);/,
    `const DATA_DIR = path.join(__dirname, 'data');`
  );
  // DATA_FILE
  if (tool.dataIsSelf) {
    // keep filename as-is (e.g. opportunities.json)
  } else {
    code = code.replace(
      new RegExp(`const DATA_FILE = path\\.join\\(DATA_DIR, '${tool.prefix}-prospects\\.json'\\);`),
      `const DATA_FILE = path.join(DATA_DIR, 'prospects.json');`
    );
  }
  // ACTIVITY_FILE
  if (tool.hasActivity) {
    code = code.replace(
      new RegExp(`const ACTIVITY_FILE = path\\.join\\(DATA_DIR, '${tool.prefix}-activity\\.json'\\);`),
      `const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');`
    );
  }
  // TEMPLATES_FILE
  if (tool.hasTemplates) {
    code = code.replace(
      new RegExp(`const TEMPLATES_FILE = path\\.join\\(DATA_DIR, '${tool.prefix}-templates\\.json'\\);`),
      `const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');`
    );
  }
  // BACKUP_DIR — move under tool folder root (not under data/)
  code = code.replace(
    /const BACKUP_DIR = path\.join\(DATA_DIR, 'backups'\);/,
    `const BACKUP_DIR = path.join(__dirname, 'backups');`
  );
  // COMMENT_LOG_FILE → cross-tool reference to comment-queue
  if (tool.hasCommentLog) {
    code = code.replace(
      /const COMMENT_LOG_FILE = path\.join\(DATA_DIR, 'comment-log\.json'\);/,
      `const COMMENT_LOG_FILE = path.join(__dirname, '..', 'comment-queue', 'data', 'comment-log.json');`
    );
  }
  // Backup filename prefix — `<prefix>-prospects_${timestamp}.json` → `prospects_${timestamp}.json`
  if (!tool.dataIsSelf) {
    code = code.replace(
      new RegExp(`\`${tool.prefix}-prospects_\\\$\\{timestamp\\}\\.json\``, 'g'),
      '`prospects_${timestamp}.json`'
    );
    // Backup-filter glob: .startsWith('<prefix>-prospects_')
    code = code.replace(
      new RegExp(`\\.startsWith\\('${tool.prefix}-prospects_'\\)`, 'g'),
      `.startsWith('prospects_')`
    );
  }

  if (code === before) {
    console.log(`  WARN: no edits applied to server.js (check manually)`);
  } else {
    fs.writeFileSync(serveDst, code, 'utf8');
    console.log(`  patched server.js`);
  }
}

TOOLS.forEach(migrate);
console.log('\nDone.');
