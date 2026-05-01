#!/usr/bin/env node
/**
 * Daily Hot List — scans all prospecting tool data for warm/hot leads needing action
 * Sends a branded HTML email to dane@digitalaccomplice.com
 *
 * Run:   node scripts/daily-hot-list.js            (sends email)
 *        node scripts/daily-hot-list.js --dry-run   (prints to console, no send)
 *
 * Requires: npm install nodemailer
 *
 * Gmail App Password setup:
 *   1. Go to myaccount.google.com → Security → 2-Step Verification → App passwords
 *   2. Create an app password for "Mail"
 *   3. Set GMAIL_APP_PASSWORD env var or edit the placeholder below
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run');
const TOOLS_ROOT = path.join(__dirname, '..', 'tools');
const DATA_DIR = TOOLS_ROOT; // retained var name; resolution changed to per-tool folders
const DASHBOARD_DATA = path.join(__dirname, '..', 'warming-app copy', 'data', 'prospects.json');

const EMAIL_FROM = 'dane@digitalaccomplice.com';
const EMAIL_TO = 'dane@digitalaccomplice.com';

// Gmail SMTP — fill in your app password or set GMAIL_APP_PASSWORD env var
const GMAIL_USER = 'dane@digitalaccomplice.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD_HERE';

// Brand
const ORANGE = '#F8901E';
const RED = '#D32F2F';
const GREEN = '#388E3C';
const DARK_BG = '#1a1a2e';
const CARD_BG = '#f9f9f9';

// ── Tool file → display name mapping ────────────────────────────────────────
const TOOL_MAP = [
  { file: path.join('b2b',           'data', 'prospects.json'), name: 'Tool #1: B2B 1st Conn' },
  { file: path.join('cyber',         'data', 'prospects.json'), name: 'Tool #2: Cyber 1st Conn' },
  { file: path.join('b2b-2nd',       'data', 'prospects.json'), name: 'Tool #3: B2B 2nd Conn' },
  { file: path.join('cyber-2nd',     'data', 'prospects.json'), name: 'Tool #4: Cyber 2nd Conn' },
  { file: path.join('referral-1st',  'data', 'prospects.json'), name: 'Tool #5: Referral 1st Conn' },
  { file: path.join('referral-2nd',  'data', 'prospects.json'), name: 'Tool #6: Referral 2nd Conn' },
  { file: path.join('substack',      'data', 'prospects.json'), name: 'Tool #9: Substack' },
  { file: path.join('referral-email','data', 'prospects.json'), name: 'Tool #12: Referral Emails' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadJSON(filepath) {
  try {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch { return null; }
}

function getProspects(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.prospects || []);
}

/**
 * Get current date/time in Pacific Time as a Date object.
 * We compare everything in PT per Dane's timezone.
 */
function nowInPT() {
  const now = new Date();
  // Convert to PT string, then parse back
  const ptStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  return new Date(ptStr);
}

function todayPT() {
  const pt = nowInPT();
  return formatDate(pt);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate days between two YYYY-MM-DD date strings.
 * Returns number of full days difference.
 */
function daysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1 + 'T12:00:00');
  const d2 = new Date(dateStr2 + 'T12:00:00');
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Extract the YYYY-MM-DD portion from a date value.
 * Handles ISO strings (with Z suffix), plain date strings, etc.
 */
function extractDate(val) {
  if (!val) return null;
  if (typeof val === 'string') return val.slice(0, 10);
  return null;
}

// ── Scan tool prospect files ────────────────────────────────────────────────

function scanToolProspects() {
  const today = todayPT();
  const leads = [];

  for (const tool of TOOL_MAP) {
    const filepath = path.join(DATA_DIR, tool.file);
    const data = loadJSON(filepath);
    const prospects = getProspects(data);

    for (const p of prospects) {
      const status = (p.status || '').toLowerCase();
      if (status !== 'replied' && status !== 'sql') continue;

      const lastAction = extractDate(p.lastActionDate);
      const daysAgo = daysBetween(lastAction, today);
      const nextStep = p.nextStep || p.next_step || '';

      leads.push({
        name: p.name || 'Unknown',
        company: p.company || '',
        tool: tool.name,
        status: status.toUpperCase(),
        lastActionDate: lastAction,
        daysAgo,
        nextStep,
        linkedinUrl: p.linkedinUrl || p.linkedin_url || '',
      });
    }
  }

  return leads;
}

// ── Scan main dashboard ─────────────────────────────────────────────────────

function scanDashboard() {
  const today = todayPT();
  const leads = [];

  const data = loadJSON(DASHBOARD_DATA);
  const prospects = getProspects(data);

  for (const p of prospects) {
    // Check 1: sequence_status active with past-due follow_up_due
    const seqActive = (p.sequence_status || '').toLowerCase() === 'active';
    const followUpDue = extractDate(p.follow_up_due);
    const isPastDue = followUpDue && daysBetween(followUpDue, today) > 0;

    // Check 2: replied/sql status (same as tool prospects)
    const status = (p.status || '').toLowerCase();
    const isRepliedOrSQL = status === 'replied' || status === 'sql' ||
                           status === 'outreach_sent'; // also track active outreach

    if (seqActive && isPastDue) {
      const daysOverdue = daysBetween(followUpDue, today);
      leads.push({
        name: p.name || 'Unknown',
        company: p.company || '',
        tool: 'Main Dashboard',
        status: `FOLLOW-UP OVERDUE (${daysOverdue}d)`,
        lastActionDate: extractDate(p.last_action_date || p.last_engagement_date),
        daysAgo: daysOverdue,
        nextStep: p.last_action || `Step ${p.sequence_step || '?'} - ${p.sequence_type || ''}`,
        linkedinUrl: p.linkedin_url || '',
        followUpDue,
      });
    }

    // Also pick up replied/sql from dashboard with stale lastActionDate
    if (isRepliedOrSQL) {
      const lastAction = extractDate(p.last_action_date || p.last_engagement_date);
      const daysAgo = daysBetween(lastAction, today);

      // Avoid duplicating the follow-up overdue entry
      if (seqActive && isPastDue) continue;

      leads.push({
        name: p.name || 'Unknown',
        company: p.company || '',
        tool: 'Main Dashboard',
        status: status.toUpperCase(),
        lastActionDate: lastAction,
        daysAgo,
        nextStep: p.last_action || '',
        linkedinUrl: p.linkedin_url || '',
      });
    }
  }

  return leads;
}

// ── Categorize leads ────────────────────────────────────────────────────────

function categorize(leads) {
  const hot = [];    // 2+ days no action
  const warm = [];   // 1 day no action
  const pending = []; // acted on today

  for (const lead of leads) {
    if (lead.daysAgo >= 2) {
      hot.push(lead);
    } else if (lead.daysAgo === 1) {
      warm.push(lead);
    } else {
      pending.push(lead);
    }
  }

  // Sort each by days ago (most urgent first)
  hot.sort((a, b) => b.daysAgo - a.daysAgo);
  warm.sort((a, b) => b.daysAgo - a.daysAgo);
  pending.sort((a, b) => (a.tool > b.tool ? 1 : -1));

  return { hot, warm, pending };
}

// ── Build HTML email ────────────────────────────────────────────────────────

function buildLeadRow(lead) {
  const nameLink = lead.linkedinUrl
    ? `<a href="${lead.linkedinUrl}" style="color: #1a1a2e; text-decoration: underline; font-weight: 600;">${lead.name}</a>`
    : `<span style="font-weight: 600;">${lead.name}</span>`;

  return `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0;">
        ${nameLink}
        ${lead.company ? `<br><span style="color: #666; font-size: 13px;">${lead.company}</span>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; color: #666;">
        ${lead.tool}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${lead.status.includes('OVERDUE') ? RED : ORANGE}; color: white;">
          ${lead.status}
        </span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; text-align: center; font-weight: 600;">
        ${lead.daysAgo}d
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 13px; color: #444;">
        ${lead.nextStep || '—'}
      </td>
    </tr>`;
}

function buildSection(title, leads, color, emoji) {
  if (leads.length === 0) return '';

  const rows = leads.map(buildLeadRow).join('');

  return `
    <div style="margin-bottom: 28px;">
      <h2 style="font-family: Inter, Arial, sans-serif; font-size: 18px; color: ${color}; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 3px solid ${color};">
        ${emoji} ${title} (${leads.length})
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-family: Inter, Arial, sans-serif; font-size: 14px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Name / Company</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Source</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Status</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #666;">Days</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666;">Next Step</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

function buildEmail(categories) {
  const today = todayPT();
  const totalNeedAction = categories.hot.length + categories.warm.length;
  const displayDate = formatDateDisplay(today);

  const hotSection = buildSection('HOT — Action Required', categories.hot, RED, '🔴');
  const warmSection = buildSection('WARM — Follow Up Soon', categories.warm, ORANGE, '🟠');
  const pendingSection = buildSection('PENDING — Acted On Today', categories.pending, GREEN, '🟢');

  const noLeads = totalNeedAction === 0 && categories.pending.length === 0;

  const body = noLeads
    ? `<p style="font-family: Inter, Arial, sans-serif; font-size: 16px; color: #666; text-align: center; padding: 40px 0;">
         No replied/SQL leads in the pipeline right now. Time to generate some.
       </p>`
    : `${hotSection}${warmSection}${pendingSection}`;

  const subject = `DA Hot List — ${displayDate} — ${totalNeedAction > 0 ? totalNeedAction + ' leads need action' : 'All clear'}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f4f4f4;">
  <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: ${DARK_BG}; padding: 24px 32px; text-align: center;">
      <h1 style="font-family: Inter, Arial, sans-serif; margin: 0; color: ${ORANGE}; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
        DA Hot List
      </h1>
      <p style="font-family: Inter, Arial, sans-serif; margin: 8px 0 0; color: #aaa; font-size: 14px;">
        ${displayDate} &bull; Daily Warm Lead Digest
      </p>
    </div>

    <!-- Summary bar -->
    <div style="background: ${totalNeedAction > 0 ? '#fff3e0' : '#e8f5e9'}; padding: 16px 32px; display: flex; font-family: Inter, Arial, sans-serif;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 4px 16px;">
            <div style="font-size: 28px; font-weight: 700; color: ${RED};">${categories.hot.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Hot</div>
          </td>
          <td style="text-align: center; padding: 4px 16px;">
            <div style="font-size: 28px; font-weight: 700; color: ${ORANGE};">${categories.warm.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Warm</div>
          </td>
          <td style="text-align: center; padding: 4px 16px;">
            <div style="font-size: 28px; font-weight: 700; color: ${GREEN};">${categories.pending.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Pending</div>
          </td>
          <td style="text-align: center; padding: 4px 16px;">
            <div style="font-size: 28px; font-weight: 700; color: #333;">${categories.hot.length + categories.warm.length + categories.pending.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px;">Total Active</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Content -->
    <div style="padding: 24px 32px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="background: #f0f0f0; padding: 16px 32px; text-align: center; font-family: Inter, Arial, sans-serif; font-size: 12px; color: #999;">
      Digital Accomplice &bull; Generated ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })} PT
    </div>

  </div>
</body>
</html>`;

  return { subject, html };
}

// ── Send email ──────────────────────────────────────────────────────────────

async function sendEmail(subject, html) {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (e) {
    console.error('\n[ERROR] nodemailer is not installed.');
    console.error('Run: npm install nodemailer\n');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Digital Accomplice" <${EMAIL_FROM}>`,
    to: EMAIL_TO,
    subject,
    html,
  });

  console.log(`[OK] Email sent: ${info.messageId}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('DA Daily Hot List');
  console.log(`Date: ${todayPT()} (Pacific Time)`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (console only)' : 'SEND EMAIL'}\n`);

  // Scan all sources
  const toolLeads = scanToolProspects();
  const dashboardLeads = scanDashboard();
  const allLeads = [...toolLeads, ...dashboardLeads];

  console.log(`Found ${allLeads.length} active leads (replied/sql/overdue)`);

  // Categorize
  const categories = categorize(allLeads);
  console.log(`  HOT:     ${categories.hot.length} (2+ days no action)`);
  console.log(`  WARM:    ${categories.warm.length} (1 day no action)`);
  console.log(`  PENDING: ${categories.pending.length} (acted on today)\n`);

  // Build email
  const { subject, html } = buildEmail(categories);

  if (DRY_RUN) {
    console.log('='.repeat(70));
    console.log(`SUBJECT: ${subject}`);
    console.log('='.repeat(70));

    // Print a plain-text summary for console readability
    const sections = [
      { label: 'HOT', leads: categories.hot, color: 'red' },
      { label: 'WARM', leads: categories.warm, color: 'orange' },
      { label: 'PENDING', leads: categories.pending, color: 'green' },
    ];

    for (const s of sections) {
      if (s.leads.length === 0) continue;
      console.log(`\n--- ${s.label} (${s.leads.length}) ---`);
      for (const l of s.leads) {
        console.log(`  ${l.name} @ ${l.company || 'N/A'}`);
        console.log(`    Source: ${l.tool} | Status: ${l.status} | ${l.daysAgo}d since action`);
        if (l.nextStep) console.log(`    Next: ${l.nextStep}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\nHTML saved to: scripts/daily-hot-list-preview.html');

    // Also save HTML for preview
    const previewPath = path.join(__dirname, 'daily-hot-list-preview.html');
    fs.writeFileSync(previewPath, html, 'utf8');
  } else {
    if (GMAIL_APP_PASSWORD === 'YOUR_APP_PASSWORD_HERE') {
      console.error('[ERROR] Gmail app password not configured.');
      console.error('Either:');
      console.error('  1. Set env var: GMAIL_APP_PASSWORD=xxxx node scripts/daily-hot-list.js');
      console.error('  2. Edit the GMAIL_APP_PASSWORD constant in this script');
      console.error('\nTo get an app password:');
      console.error('  myaccount.google.com → Security → 2-Step Verification → App passwords\n');
      process.exit(1);
    }

    await sendEmail(subject, html);
  }
}

main().catch(err => {
  console.error('[FATAL]', err.message || err);
  process.exit(1);
});
