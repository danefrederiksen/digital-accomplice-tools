const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3850;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const CHROME = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '..');

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
