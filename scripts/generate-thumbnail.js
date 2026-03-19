#!/usr/bin/env node

/**
 * YouTube Thumbnail Generator — Digital Accomplice Mini Podcast
 *
 * Usage:
 *   node scripts/generate-thumbnail.js --name="Todd Fairbairn" --topic="B2B Marketing Super-Heroes" --photo=reports/todd-headshot.jpg
 *   node scripts/generate-thumbnail.js --name="Todd Fairbairn" --topic="B2B Marketing Super-Heroes" --photo=reports/todd-headshot.jpg --output=reports/Todd-Thumbnail.jpg
 *
 * If --topic is omitted, the script will prompt for it interactively.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CHROME = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'reports');

// Parse args
const args = {};
process.argv.slice(2).forEach(arg => {
  const match = arg.match(/^--(\w+)=(.+)$/);
  if (match) args[match[1]] = match[2];
});

async function askQuestion(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function buildHTML(topicWords, photoBase64) {
  // Split topic into individual words for stacked display
  const words = topicWords.toUpperCase().split(/\s+/);
  const wordHTML = words.map(w => `<div class="topic-word">${w}</div>`).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 2560px;
    height: 1440px;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
    background: #111111;
  }

  .container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  /* Left side — topic text */
  .text-side {
    width: 50%;
    height: 100%;
    background: #111111;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 80px;
    position: relative;
  }

  .topic-word {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    color: #F8901E;
    text-transform: uppercase;
    line-height: 0.95;
    letter-spacing: -3px;
    text-align: center;
    width: 100%;
  }

  /* DA logo mark — bottom left */
  .da-mark {
    position: absolute;
    bottom: 50px;
    left: 80px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .da-mark .play-icon {
    width: 48px;
    height: 48px;
    background: #F8901E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .da-mark .play-icon::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 18px solid #111111;
    border-top: 11px solid transparent;
    border-bottom: 11px solid transparent;
    margin-left: 4px;
  }

  .da-mark span {
    color: #666666;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* Right side — guest photo */
  .photo-side {
    width: 50%;
    height: 100%;
    background-image: url('data:image/jpeg;base64,${photoBase64}');
    background-size: cover;
    background-position: center top;
    position: relative;
  }

  /* Gradient overlay on photo edge for blend */
  .photo-side::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 120px;
    height: 100%;
    background: linear-gradient(to right, #111111, transparent);
  }
</style>
</head>
<body>
  <div class="container">
    <div class="text-side">
      <div class="topic-text">
        ${wordHTML}
      </div>
      <div class="da-mark">
        <div class="play-icon"></div>
        <span>Mini Podcast</span>
      </div>
    </div>
    <div class="photo-side"></div>
  </div>

  <script>
    // Dynamic font sizing: fit words to container width
    (function() {
      const words = document.querySelectorAll('.topic-word');
      const container = document.querySelector('.text-side');
      const maxWidth = container.clientWidth - 160; // padding
      const wordCount = words.length;

      // Base size depends on word count
      let fontSize;
      if (wordCount <= 1) fontSize = 340;
      else if (wordCount === 2) fontSize = 280;
      else if (wordCount === 3) fontSize = 220;
      else fontSize = 180;

      words.forEach(w => {
        w.style.fontSize = fontSize + 'px';
        // Shrink individual words if they overflow
        let size = fontSize;
        while (w.scrollWidth > maxWidth && size > 80) {
          size -= 10;
          w.style.fontSize = size + 'px';
        }
      });
    })();
  </script>
</body>
</html>`;
}

async function main() {
  // Validate required args
  if (!args.name) {
    console.error('Error: --name is required\nUsage: node scripts/generate-thumbnail.js --name="Guest Name" --photo=path/to/photo.jpg');
    process.exit(1);
  }
  if (!args.photo) {
    console.error('Error: --photo is required\nUsage: node scripts/generate-thumbnail.js --name="Guest Name" --photo=path/to/photo.jpg');
    process.exit(1);
  }

  const photoPath = path.resolve(args.photo);
  if (!fs.existsSync(photoPath)) {
    console.error(`Error: Photo not found: ${photoPath}`);
    process.exit(1);
  }

  // Get topic — from flag or interactive prompt
  let topic = args.topic;
  if (!topic) {
    topic = await askQuestion('What\'s the 1-4 word topic for this episode? ');
    if (!topic) {
      console.error('Error: Topic is required');
      process.exit(1);
    }
  }

  console.log(`\nGenerating thumbnail...`);
  console.log(`  Guest: ${args.name}`);
  console.log(`  Topic: ${topic}`);
  console.log(`  Photo: ${photoPath}`);

  // Read photo and convert to base64
  const photoBuffer = fs.readFileSync(photoPath);
  const photoBase64 = photoBuffer.toString('base64');

  // Build HTML
  const html = buildHTML(topic, photoBase64);

  // Write temp HTML file
  const safeName = args.name.replace(/[^a-zA-Z0-9]/g, '-');
  const htmlPath = path.join(OUTPUT_DIR, `${safeName}-thumbnail-temp.html`);
  const pngPath = path.join(OUTPUT_DIR, `${safeName}-Thumbnail.png`);
  const outputPath = args.output
    ? path.resolve(args.output)
    : path.join(OUTPUT_DIR, `${safeName}-Thumbnail.jpg`);

  fs.writeFileSync(htmlPath, html, 'utf8');

  // Chrome headless screenshot at 2x for crisp rendering
  // Render at 2560x1440, which produces a 2560x1440 screenshot
  // Then scale down to 1280x720 for YouTube
  try {
    const screenshotCmd = `${CHROME} --headless --disable-gpu --screenshot="${pngPath}" --window-size=2560,1440 --force-device-scale-factor=1 --hide-scrollbars "file://${htmlPath}"`;
    execSync(screenshotCmd, { timeout: 30000, stdio: 'pipe' });

    // Convert to JPG and scale to 1280x720
    execSync(`sips -z 720 1280 "${pngPath}" --out "${pngPath}"`, { stdio: 'pipe' });
    execSync(`sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${outputPath}"`, { stdio: 'pipe' });

    // Clean up temp files
    fs.unlinkSync(htmlPath);
    fs.unlinkSync(pngPath);

    console.log(`\n  Thumbnail saved: ${outputPath}`);
    console.log(`  Size: 1280×720 (YouTube standard)`);
    console.log(`\nDone!`);
  } catch (err) {
    console.error('Error generating thumbnail:', err.message);
    console.log(`Debug: HTML saved at ${htmlPath}`);
    process.exit(1);
  }
}

main();
