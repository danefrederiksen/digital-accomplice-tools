#!/usr/bin/env node
// Step 2.2 — Render thumbnail-template.html to PNG via Chrome headless.
// Renders at 2x for crisp text, then downsamples to exactly 1280x720 with sips.

import { execSync } from 'child_process';
import { existsSync, mkdirSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome';

const HTML_PATH = resolve(__dirname, 'thumbnail-template.html');
const OUT_DIR = resolve(__dirname, '..', 'output-samples');
const RAW_PNG = resolve(OUT_DIR, 'thumbnail-test-raw.png');
const FINAL_PNG = resolve(OUT_DIR, 'thumbnail-test.png');

if (!existsSync(HTML_PATH)) {
  console.error(`Template not found: ${HTML_PATH}`);
  process.exit(1);
}
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

console.log(`Rendering ${HTML_PATH}`);
console.log(`Output:    ${FINAL_PNG}`);

// Render at 2x device-scale-factor → 2560x1440, then downsample for sharp text.
const renderCmd = `${CHROME} --headless --disable-gpu --hide-scrollbars --screenshot="${RAW_PNG}" --window-size=1280,720 --force-device-scale-factor=2 "file://${HTML_PATH}"`;
execSync(renderCmd, { timeout: 30000, stdio: 'inherit' });

// Downsample 2560x1440 → 1280x720 with sips (built into macOS).
execSync(`sips -z 720 1280 "${RAW_PNG}" --out "${FINAL_PNG}"`, { stdio: 'inherit' });

const bytes = statSync(FINAL_PNG).size;
const kb = (bytes / 1024).toFixed(1);
console.log(`\nDone. ${FINAL_PNG} (${kb} KB)`);
console.log(`Open with: open "${FINAL_PNG}"`);
