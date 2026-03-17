const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3850;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const CHROME = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'reports');

// Export snapshot as PDF (letter-size, one-page) — POST with full HTML body
app.post('/api/export-pdf', (req, res) => {
  const { html, companyName } = req.body;
  if (!html || !companyName) return res.status(400).json({ error: 'Missing html or companyName' });

  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const htmlPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.html`);
  const pdfPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.pdf`);

  try {
    fs.writeFileSync(htmlPath, html, 'utf8');

    const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "${htmlPath}"`;
    execSync(cmd, { timeout: 30000 });

    res.json({
      success: true,
      files: { html: htmlPath, pdf: pdfPath },
      message: `PDF exported to ${pdfPath}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export any public HTML file as PDF — GET with query params
// Usage: /api/export-pdf?file=hinge-snapshot.html&name=HingeMarketing
app.get('/api/export-pdf', (req, res) => {
  const { file, name } = req.query;
  if (!file || !name) return res.status(400).json({ error: 'Missing ?file= or ?name= query params' });

  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
  const sourcePath = path.join(__dirname, 'public', file);
  const pdfPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.pdf`);

  if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: `File not found: ${file}` });

  try {
    const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "file://${sourcePath}"`;
    execSync(cmd, { timeout: 30000 });

    res.json({
      success: true,
      file: pdfPath,
      message: `PDF exported to ${pdfPath}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download PDF directly in browser
// Usage: /api/download-pdf?file=hinge-snapshot.html&name=HingeMarketing
app.get('/api/download-pdf', (req, res) => {
  const { file, name } = req.query;
  if (!file || !name) return res.status(400).json({ error: 'Missing ?file= or ?name= query params' });

  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
  const sourcePath = path.join(__dirname, 'public', file);
  const pdfPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.pdf`);

  if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: `File not found: ${file}` });

  try {
    const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "file://${sourcePath}"`;
    execSync(cmd, { timeout: 30000 });

    res.download(pdfPath, `${safeName}_AI_Snapshot.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export DM infographic as JPG (social-sized)
app.post('/api/export-dm', (req, res) => {
  const { html, companyName, contentHeight } = req.body;
  if (!html || !companyName) return res.status(400).json({ error: 'Missing html or companyName' });

  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const htmlPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot_DM.html`);
  const pngPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot_DM.png`);
  const jpgPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot_DM.jpg`);

  try {
    fs.writeFileSync(htmlPath, html, 'utf8');

    const winHeight = contentHeight ? Math.ceil(contentHeight) + 80 : 1200;
    const cmd = `${CHROME} --headless --disable-gpu --screenshot="${pngPath}" --window-size=1080,${winHeight} --force-device-scale-factor=2 "${htmlPath}"`;
    execSync(cmd, { timeout: 30000 });

    const sipsCmd = `sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${jpgPath}"`;
    execSync(sipsCmd, { timeout: 10000 });

    if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);

    res.json({
      success: true,
      files: { html: htmlPath, jpg: jpgPath },
      message: `DM infographic exported to ${jpgPath}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download snapshot as PDF or JPG — POST with HTML body, streams file to browser
app.post('/api/download-snapshot', (req, res) => {
  const { html, companyName, format } = req.body;
  if (!html || !companyName) return res.status(400).json({ error: 'Missing html or companyName' });

  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const tmpHtml = path.join(OUTPUT_DIR, `_tmp_${safeName}_snapshot.html`);

  try {
    fs.writeFileSync(tmpHtml, html, 'utf8');

    if (format === 'jpg') {
      const pngPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.png`);
      const jpgPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.jpg`);

      // 816x1056 = 8.5x11in at 96dpi, 2x for quality
      const cmd = `${CHROME} --headless --disable-gpu --screenshot="${pngPath}" --window-size=816,1056 --force-device-scale-factor=2 "file://${tmpHtml}"`;
      execSync(cmd, { timeout: 30000 });

      const sipsCmd = `sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${jpgPath}"`;
      execSync(sipsCmd, { timeout: 10000 });

      if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);
      if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);

      res.download(jpgPath, `${safeName}_AI_Snapshot.jpg`);
    } else {
      const pdfPath = path.join(OUTPUT_DIR, `${safeName}_AI_Snapshot.pdf`);

      const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "file://${tmpHtml}"`;
      execSync(cmd, { timeout: 30000 });

      if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);

      res.download(pdfPath, `${safeName}_AI_Snapshot.pdf`);
    }
  } catch (err) {
    if (fs.existsSync(tmpHtml)) try { fs.unlinkSync(tmpHtml); } catch(e) {}
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// AUTOMATION ENDPOINTS — Called by Claude skill, not browser
// ============================================================

const REPORTS_DIR = '/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports';

// Generate snapshot PDF from JSON data (no form needed)
// POST /api/auto-snapshot
app.post('/api/auto-snapshot', (req, res) => {
  const { data, outputDir } = req.body;
  if (!data || !data.companyName) return res.status(400).json({ error: 'Missing data or data.companyName' });

  const safeName = data.companyName.replace(/[^a-zA-Z0-9]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const dest = outputDir || REPORTS_DIR;
  const pdfPath = path.join(dest, `${data.companyName.replace(/\s+/g, '_')}_AI_Snapshot_${dateStr}.pdf`);
  const tmpHtml = path.join(OUTPUT_DIR, `_tmp_auto_${safeName}.html`);

  try {
    // Build the snapshot HTML using same logic as the form
    const html = buildSnapshotHTML(data);
    fs.writeFileSync(tmpHtml, html, 'utf8');

    const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "file://${tmpHtml}"`;
    execSync(cmd, { timeout: 30000 });

    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);

    res.json({ success: true, file: pdfPath, message: `Snapshot PDF saved to ${pdfPath}` });
  } catch (err) {
    if (fs.existsSync(tmpHtml)) try { fs.unlinkSync(tmpHtml); } catch(e) {}
    res.status(500).json({ error: err.message });
  }
});

// Generate methodology PDF from research data
// POST /api/auto-methodology
app.post('/api/auto-methodology', (req, res) => {
  const { data, outputDir } = req.body;
  if (!data || !data.companyName) return res.status(400).json({ error: 'Missing data or data.companyName' });

  const safeName = data.companyName.replace(/[^a-zA-Z0-9]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const dest = outputDir || REPORTS_DIR;
  const pdfPath = path.join(dest, `${data.companyName.replace(/\s+/g, '_')}_Snapshot_Methodology_${dateStr}.pdf`);
  const tmpHtml = path.join(OUTPUT_DIR, `_tmp_meth_${safeName}.html`);

  try {
    const html = buildMethodologyHTML(data);
    fs.writeFileSync(tmpHtml, html, 'utf8');

    const cmd = `${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --run-all-compositor-stages-before-draw "file://${tmpHtml}"`;
    execSync(cmd, { timeout: 30000 });

    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);

    res.json({ success: true, file: pdfPath, message: `Methodology PDF saved to ${pdfPath}` });
  } catch (err) {
    if (fs.existsSync(tmpHtml)) try { fs.unlinkSync(tmpHtml); } catch(e) {}
    res.status(500).json({ error: err.message });
  }
});

// Generate BOTH snapshot + methodology PDFs in one call
// POST /api/auto-full
app.post('/api/auto-full', (req, res) => {
  const { data, outputDir } = req.body;
  if (!data || !data.companyName) return res.status(400).json({ error: 'Missing data or data.companyName' });

  const safeName = data.companyName.replace(/[^a-zA-Z0-9]/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const dest = outputDir || REPORTS_DIR;
  const snapshotPdf = path.join(dest, `${data.companyName.replace(/\s+/g, '_')}_AI_Snapshot_${dateStr}.pdf`);
  const methPdf = path.join(dest, `${data.companyName.replace(/\s+/g, '_')}_Snapshot_Methodology_${dateStr}.pdf`);
  const tmpSnap = path.join(OUTPUT_DIR, `_tmp_snap_${safeName}.html`);
  const tmpMeth = path.join(OUTPUT_DIR, `_tmp_meth_${safeName}.html`);

  try {
    // Snapshot PDF
    fs.writeFileSync(tmpSnap, buildSnapshotHTML(data), 'utf8');
    execSync(`${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${snapshotPdf}" --run-all-compositor-stages-before-draw "file://${tmpSnap}"`, { timeout: 30000 });
    if (fs.existsSync(tmpSnap)) fs.unlinkSync(tmpSnap);

    // Methodology PDF
    fs.writeFileSync(tmpMeth, buildMethodologyHTML(data), 'utf8');
    execSync(`${CHROME} --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${methPdf}" --run-all-compositor-stages-before-draw "file://${tmpMeth}"`, { timeout: 30000 });
    if (fs.existsSync(tmpMeth)) fs.unlinkSync(tmpMeth);

    res.json({
      success: true,
      files: { snapshot: snapshotPdf, methodology: methPdf },
      message: `Both PDFs saved to ${dest}`
    });
  } catch (err) {
    [tmpSnap, tmpMeth].forEach(f => { if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch(e) {} });
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// HTML BUILDERS — Server-side versions of the client-side logic
// ============================================================

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtScore(n) {
  return n === 0 ? '0' : Number(n).toFixed(1);
}

function buildSnapshotHTML(d) {
  // Auto headlines
  const isTop = d.ai0 >= d.ai1 && d.ai0 >= d.ai2 && d.ai0 >= d.ai3 && d.ai0 > 0;
  const h1 = d.h1Override || (isTop ? `${d.companyName} leads AI search.` : `${d.companyName} is visible in AI search.`);
  const h2Raw = d.videoCount === 0 ? "Zero video. Zero AI reach. That's the gap."
    : d.videosInAI === 0 ? `${d.videoCount} videos. Zero reach AI. That's the gap.`
    : `${d.videoCount} videos. Only ${d.videosInAI} in AI. That's the gap.`;
  const h2 = d.h2Override || h2Raw;

  // Rank
  const scores = [d.ai0, d.ai1, d.ai2, d.ai3].sort((a, b) => b - a);
  const rank = scores.indexOf(d.ai0) + 1;
  const rankText = rank === 1 ? '#1 in your space' : `#${rank} of 4 companies`;

  // Stat 2
  const stat2Num = d.videoCount > 0 ? `${d.videosInAI}<span class="sm">/${d.videoCount}</span>` : '0';

  // Proof
  const proofHighlight = `${esc(d.companyName)} showed up in ${d.mentions} out of 20 answers &mdash; recommended by name in ${d.recommended}.`;
  let proofClose;
  if (d.videoCount > 0) {
    proofClose = d.videosInAI === 0
      ? `You have ${d.videoCount} YouTube videos. Not one appeared.`
      : `You have ${d.videoCount} YouTube videos. Only ${d.videosInAI} appeared.`;
  } else {
    proofClose = 'No video content from any company appeared in AI answers.';
  }
  const allVidZero = d.vid0 === 0 && d.vid1 === 0 && d.vid2 === 0 && d.vid3 === 0;
  if (allVidZero && d.videoCount > 0) proofClose += ' Zero video from any competitor either.';

  // Callout
  const calloutBold = d.videoCount > 0
    ? `${esc(d.companyName)} has ${d.videoCount} YouTube videos. ${d.videosInAI === 0 ? 'Zero reach' : 'Almost zero reach'} AI search.`
    : `${esc(d.companyName)} has zero video presence in AI search.`;

  // Bar chart helper
  function barRow(name, score, type, isTarget) {
    const nameClass = isTarget ? 'bar-name you' : 'bar-name';
    const valStr = fmtScore(score);
    const valClass = isTarget ? 'bar-val you' : (score === 0 ? 'bar-val zero' : 'bar-val');
    const width = score > 0 ? (score * 10) + '%' : '0%';
    let fillClass;
    if (score === 0) fillClass = 'bar-fill empty';
    else if (type === 'ai') fillClass = isTarget ? 'bar-fill ai' : 'bar-fill ai dim';
    else fillClass = isTarget ? 'bar-fill vid' : 'bar-fill vid dim';
    return `<div class="bar-row"><div class="${nameClass}">${esc(name)}</div><div class="bar-track"><div class="${fillClass}" style="width:${width}"></div></div><div class="${valClass}">${valStr}</div></div>`;
  }

  const aiChart = barRow(d.companyName, d.ai0, 'ai', true)
    + barRow(d.comp1, d.ai1, 'ai', false)
    + barRow(d.comp2, d.ai2, 'ai', false)
    + barRow(d.comp3, d.ai3, 'ai', false);
  const vidChart = barRow(d.companyName, d.vid0, 'vid', true)
    + barRow(d.comp1, d.vid1, 'vid', false)
    + barRow(d.comp2, d.vid2, 'vid', false)
    + barRow(d.comp3, d.vid3, 'vid', false);

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Visibility Snapshot — ${esc(d.companyName)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}@page{size:letter;margin:0}
html,body{font-family:'Inter',Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:8.5in;height:11in;margin:0 auto;display:flex;flex-direction:column;overflow:hidden}
.header{background:#1a1a1a;padding:12px 44px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.header-label{font-size:9px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:#F8901E}
.header-meta{font-size:9px;color:#888}
.content{flex:1;padding:28px 44px 0;display:flex;flex-direction:column}
.category{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#F8901E;margin-bottom:8px;padding-left:12px;border-left:3px solid #F8901E}
.headline{font-size:32px;font-weight:900;line-height:1.12;margin-bottom:6px}
.headline .accent{color:#F8901E}
.subtitle{font-size:13px;color:#5A6B7A;line-height:1.5;margin-bottom:14px}
.rule{width:48px;height:3px;background:#F8901E;margin-bottom:16px}
.stats{display:flex;gap:12px;margin-bottom:16px}
.stat{flex:1;background:#F5F5F5;border-radius:6px;padding:14px 12px 12px;text-align:center}
.stat-num{font-size:38px;font-weight:900;color:#F8901E;line-height:1;margin-bottom:4px}
.stat-num .sm{font-size:20px;font-weight:800}
.stat-label{font-size:10.5px;font-weight:500;color:#5A6B7A;line-height:1.35}
sup{font-size:65%;color:#F8901E;vertical-align:super}
.proof{font-size:11.5px;color:#5A6B7A;line-height:1.55;margin-bottom:16px;padding:9px 13px;background:#FAFAFA;border-left:3px solid #E0E0E0;border-radius:0 4px 4px 0}
.proof strong{color:#1a1a1a;font-weight:700}
.charts{display:flex;gap:20px;margin-bottom:18px}
.chart-col{flex:1}
.chart-title{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#5A6B7A;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #EBEBEB}
.bar-row{display:flex;align-items:center;margin-bottom:5px}
.bar-name{width:110px;font-size:11px;font-weight:600;color:#1a1a1a;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-name.you{color:#F8901E}
.bar-track{flex:1;height:18px;background:#F0F0F0;border-radius:3px;overflow:hidden;margin-right:8px}
.bar-fill{height:100%;border-radius:3px;min-width:2px}
.bar-fill.ai{background:#F8901E}.bar-fill.ai.dim{background:#F8901E;opacity:0.45}
.bar-fill.vid{background:#5A6B7A}.bar-fill.vid.dim{background:#5A6B7A;opacity:0.45}
.bar-fill.empty{background:transparent;min-width:0}
.bar-val{width:28px;font-size:12px;font-weight:800;text-align:right;color:#1a1a1a}
.bar-val.you{color:#F8901E}.bar-val.zero{color:#CBCBCB}
.callout{background:#1a1a1a;border-radius:8px;padding:20px 24px;margin-bottom:18px}
.callout p{font-size:13.5px;font-weight:500;color:#fff;line-height:1.6}
.callout strong{font-weight:700}.callout .punch{color:#F8901E;font-weight:700}
.next-step{display:flex;gap:16px;margin-bottom:18px;padding:16px 18px;background:#FAFAFA;border-radius:6px}
.next-step-header{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#F8901E;margin-bottom:6px}
.next-step-item{flex:1;font-size:11px;color:#5A6B7A;line-height:1.45}
.next-step-item strong{color:#1a1a1a;font-weight:600;display:block;margin-bottom:2px;font-size:11.5px}
.method{font-size:8px;color:#999;line-height:1.5;border-top:1px solid #E8E8E8;padding-top:8px;margin-top:auto}
.method b{color:#888}
.footer{padding:11px 44px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #E5E5E5;flex-shrink:0}
.cta-text{font-size:13px;font-weight:700;color:#F8901E;margin-bottom:2px}
.cta-contact{font-size:9px;color:#5A6B7A}
.brand{display:flex;align-items:center;gap:9px}
.brand-name{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a}
.footnotes{font-size:7px;color:#aaa;padding:3px 44px 7px;line-height:1.5;flex-shrink:0}
</style></head><body>
<div class="page">
<div class="header"><span class="header-label">AI Visibility Snapshot</span><span class="header-meta">Prepared for ${esc(d.companyName)} &middot; ${esc(d.reportDate)}</span></div>
<div class="content">
<div class="category">${esc(d.industry)}</div>
<h1 class="headline">${esc(h1)}<br><span class="accent">${esc(h2)}</span></h1>
<p class="subtitle">We asked AI the same questions your buyers ask. Here's what came back &mdash; and what didn't.</p>
<div class="rule"></div>
<div class="stats">
<div class="stat"><div class="stat-num">${fmtScore(d.ai0)}<span class="sm">/10</span></div><div class="stat-label">AI search score<br>${esc(rankText)}</div></div>
<div class="stat"><div class="stat-num">${stat2Num}</div><div class="stat-label">YouTube videos<br>found in AI answers</div></div>
<div class="stat"><div class="stat-num">16%</div><div class="stat-label">of AI answers now<br>include YouTube<sup>[1]</sup></div></div>
</div>
<div class="proof">We asked ChatGPT and Perplexity 10 questions your buyers type every day. <strong>${proofHighlight}</strong> ${proofClose}</div>
<div class="charts"><div class="chart-col"><div class="chart-title">AI Search Visibility (/10)</div>${aiChart}</div><div class="chart-col"><div class="chart-title">Video in AI Answers (/10)</div>${vidChart}</div></div>
<div class="callout"><p><strong>${calloutBold}</strong> That's not a content problem &mdash; it's an optimization problem. Your competitors haven't figured this out either. <span class="punch">Fix it first and the gap becomes a moat.</span></p></div>
<div class="next-step"><div class="next-step-item"><div class="next-step-header">In 15 minutes you get</div></div><div class="next-step-item"><strong>The full data</strong>Every query, every AI answer, every screenshot. See exactly what buyers see.</div><div class="next-step-item"><strong>The 3 biggest gaps</strong>Where competitors are gaining ground and where you're leaving opportunity on the table.</div><div class="next-step-item"><strong>A clear next step</strong>One action you can take this month &mdash; whether or not we work together.</div></div>
<div class="method"><b>How we did this:</b> 20 questions real buyers type into AI search. Each answer scored 0&ndash;3 (Absent / Cited / Mentioned / Recommended). You can re-run any query yourself &mdash; that's the point. AI answers change; we document the pattern, not a guarantee.</div>
</div>
<div class="footer"><div><div class="cta-text">15 minutes. No pitch. We walk through the data. &#8599;</div><div class="cta-contact">dane@digitalaccomplice.com &middot; calendly.com/accomplice-dane/15min</div></div><div class="brand"><svg width="20" height="22" viewBox="0 0 20 22" fill="none"><path d="M0 0L20 11L0 22V0Z" fill="#F8901E"/></svg><span class="brand-name">Digital Accomplice</span></div></div>
<div class="footnotes">[1] Adweek, Jan 2026 (Bluefish, Emberos, Goodie AI). YouTube is the #1 social platform cited in AI answers &mdash; 16% of responses. AI search converts 1.3&ndash;5x higher than traditional search (Semrush, Visibility Labs, 2025&ndash;2026).</div>
</div></body></html>`;
}

function buildMethodologyHTML(d) {
  // d.queries = array of { id, query, scores: [s0, s1, s2, s3], notes }
  // d.youtube = array of { company, channelUrl, subscribers, videos, lastUpload, freqPerMonth, status, inAI }
  // d.findings = array of strings
  // d.sources = array of URLs

  const queries = d.queries || [];
  const youtube = d.youtube || [];
  const findings = d.findings || [];
  const sources = d.sources || [];

  // Short names (first word or first 12 chars)
  const shortName = name => (name || '').split(/\s+/)[0].substring(0, 12);
  const cs = shortName(d.companyName);
  const c1 = shortName(d.comp1);
  const c2 = shortName(d.comp2);
  const c3 = shortName(d.comp3);

  // Raw scores
  const rawScores = [0, 0, 0, 0];
  queries.forEach(q => {
    if (q.scores) {
      rawScores[0] += (q.scores[0] || 0);
      rawScores[1] += (q.scores[1] || 0);
      rawScores[2] += (q.scores[2] || 0);
      rawScores[3] += (q.scores[3] || 0);
    }
  });

  function scoreClass(s) { return `score-${s}`; }

  function queryRow(q) {
    const s = q.scores || [0,0,0,0];
    return `<tr><td>${q.id}</td><td>${esc(q.query)}</td><td class="score-cell ${scoreClass(s[0])}">${s[0]}</td><td class="score-cell ${scoreClass(s[1])}">${s[1]}</td><td class="score-cell ${scoreClass(s[2])}">${s[2]}</td><td class="score-cell ${scoreClass(s[3])}">${s[3]}</td><td>${esc(q.notes || '')}</td></tr>`;
  }

  const catA = queries.filter(q => q.id >= 1 && q.id <= 5).map(queryRow).join('');
  const catB = queries.filter(q => q.id >= 6 && q.id <= 10).map(queryRow).join('');
  const catC = queries.filter(q => q.id >= 11 && q.id <= 15).map(queryRow).join('');
  const catD = queries.filter(q => q.id >= 16 && q.id <= 20).map(queryRow).join('');

  function ytStatusBadge(status) {
    if (status === 'active') return '<span class="yt-status yt-active">Active</span>';
    if (status === 'dormant') return '<span class="yt-status yt-dormant">Dormant</span>';
    return '<span class="yt-status yt-none">None</span>';
  }

  const ytRows = youtube.map(y =>
    `<tr><td><strong>${esc(y.company)}</strong></td><td style="font-size:8px">${esc(y.channelUrl || 'N/A')}</td><td style="text-align:center">${y.subscribers || 'N/A'}</td><td style="text-align:center">${y.videos || 0}</td><td>${esc(y.lastUpload || 'N/A')}</td><td style="text-align:center">${y.freqPerMonth || 0}</td><td>${ytStatusBadge(y.status)}</td><td style="text-align:center">${y.inAI || 0}</td></tr>`
  ).join('');

  const findingsHtml = findings.map(f => `<div class="finding">${f}</div>`).join('');
  const sourcesHtml = sources.map(s => `${esc(s)}<br>`).join('');

  // Read the template and replace placeholders
  let html;
  try {
    html = fs.readFileSync(path.join(__dirname, 'public', 'methodology-template.html'), 'utf8');
  } catch (e) {
    return `<html><body><h1>Error: methodology-template.html not found</h1></body></html>`;
  }

  const replacements = {
    '{{COMPANY_NAME}}': esc(d.companyName),
    '{{INDUSTRY}}': esc(d.industry),
    '{{REPORT_DATE}}': esc(d.reportDate),
    '{{COMP1}}': esc(d.comp1),
    '{{COMP2}}': esc(d.comp2),
    '{{COMP3}}': esc(d.comp3),
    '{{COMPANY_SHORT}}': esc(cs),
    '{{COMP1_SHORT}}': esc(c1),
    '{{COMP2_SHORT}}': esc(c2),
    '{{COMP3_SHORT}}': esc(c3),
    '{{AI_SCORE_0}}': fmtScore(d.ai0),
    '{{AI_SCORE_1}}': fmtScore(d.ai1),
    '{{AI_SCORE_2}}': fmtScore(d.ai2),
    '{{AI_SCORE_3}}': fmtScore(d.ai3),
    '{{RAW_SCORE_0}}': String(rawScores[0]),
    '{{RAW_SCORE_1}}': String(rawScores[1]),
    '{{RAW_SCORE_2}}': String(rawScores[2]),
    '{{RAW_SCORE_3}}': String(rawScores[3]),
    '{{VID_SCORE_0}}': fmtScore(d.vid0),
    '{{VID_SCORE_1}}': fmtScore(d.vid1),
    '{{VID_SCORE_2}}': fmtScore(d.vid2),
    '{{VID_SCORE_3}}': fmtScore(d.vid3),
    '{{VID_DETAIL_0}}': esc(d.vidDetail0 || ''),
    '{{VID_DETAIL_1}}': esc(d.vidDetail1 || ''),
    '{{VID_DETAIL_2}}': esc(d.vidDetail2 || ''),
    '{{VID_DETAIL_3}}': esc(d.vidDetail3 || ''),
    '{{QUERY_ROWS_A}}': catA,
    '{{QUERY_ROWS_B}}': catB,
    '{{QUERY_ROWS_C}}': catC,
    '{{QUERY_ROWS_D}}': catD,
    '{{YOUTUBE_ROWS}}': ytRows,
    '{{KEY_FINDINGS}}': findingsHtml,
    '{{SOURCES_LIST}}': sourcesHtml,
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  return html;
}

// ============================================================
// LEGACY ENDPOINTS (keep for backward compat)
// ============================================================

// Legacy export endpoint (keep for backward compat)
app.post('/api/export', (req, res) => {
  const { html, companyName, format, contentHeight } = req.body;

  if (!html || !companyName) {
    return res.status(400).json({ error: 'Missing html or companyName' });
  }

  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const htmlPath = path.join(OUTPUT_DIR, `${safeName}_Infographic_DM.html`);
  const pngPath = path.join(OUTPUT_DIR, `${safeName}_Infographic_DM.png`);
  const jpgPath = path.join(OUTPUT_DIR, `${safeName}_Infographic_DM.jpg`);

  try {
    fs.writeFileSync(htmlPath, html, 'utf8');

    if (format === 'html-only') {
      return res.json({ success: true, file: htmlPath, message: `HTML saved to ${htmlPath}` });
    }

    const winHeight = contentHeight ? Math.ceil(contentHeight) + 80 : 1400;
    const chromeCmd = `${CHROME} --headless --disable-gpu --screenshot="${pngPath}" --window-size=1080,${winHeight} --force-device-scale-factor=2 "${htmlPath}"`;
    execSync(chromeCmd, { timeout: 30000 });

    const sipsCmd = `sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${jpgPath}"`;
    execSync(sipsCmd, { timeout: 10000 });

    if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);

    res.json({
      success: true,
      files: { html: htmlPath, jpg: jpgPath },
      message: `Exported to ${jpgPath}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Snapshot Generator running at http://localhost:${PORT}`);
  console.log(`  Snapshot Generator: http://localhost:${PORT}/snapshot-generator.html`);
  console.log(`  DM Generator:       http://localhost:${PORT}/`);
  console.log(`  Hinge example:      http://localhost:${PORT}/hinge-snapshot.html`);
});
