const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3850;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Export endpoint: receives snapshot HTML, saves it, converts to JPG via Chrome headless
app.post('/api/export', (req, res) => {
  const { html, companyName, format, contentHeight } = req.body;

  if (!html || !companyName) {
    return res.status(400).json({ error: 'Missing html or companyName' });
  }

  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, '');
  const outputDir = path.resolve(__dirname, '..');
  const htmlPath = path.join(outputDir, `${safeName}_Infographic_DM.html`);
  const pngPath = path.join(outputDir, `${safeName}_Infographic_DM.png`);
  const jpgPath = path.join(outputDir, `${safeName}_Infographic_DM.jpg`);

  try {
    // Write standalone HTML
    fs.writeFileSync(htmlPath, html, 'utf8');

    if (format === 'html-only') {
      return res.json({ success: true, file: htmlPath, message: `HTML saved to ${htmlPath}` });
    }

    // Chrome headless screenshot — use actual content height to avoid whitespace
    const winHeight = contentHeight ? Math.ceil(contentHeight) + 80 : 1400;
    const chromeCmd = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --headless --disable-gpu --screenshot="${pngPath}" --window-size=1080,${winHeight} --force-device-scale-factor=2 "${htmlPath}"`;
    execSync(chromeCmd, { timeout: 30000 });

    // Convert PNG to JPG
    const sipsCmd = `sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${jpgPath}"`;
    execSync(sipsCmd, { timeout: 10000 });

    // Clean up PNG
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
});
