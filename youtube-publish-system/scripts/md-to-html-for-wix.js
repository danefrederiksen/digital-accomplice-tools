// Tiny markdown→HTML converter for the Todd article body.
// Skips the H1 (already in Wix title) and the <script> JSON-LD blocks.
// Output opens in Safari so Dane can copy-paste rich text into Wix.

const fs = require('fs');
const { execSync } = require('child_process');

const SRC = '/Users/danefrederiksen/Desktop/Claude Code/youtube-publish-system/output-samples/todd-fairbairn-article.md';
const OUT = '/tmp/todd-article-body.html';

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n');

// Find where the script blocks start. Everything before that is body.
const scriptStart = lines.findIndex(l => l.startsWith('<script'));
const bodyLines = lines.slice(0, scriptStart === -1 ? lines.length : scriptStart);

// Drop the H1 line (already in title field).
const filtered = bodyLines.filter(l => !l.startsWith('# ') || l.startsWith('## '));

const html = [];
let inList = false;
let inQuote = false;
let para = [];

const flushPara = () => {
  if (para.length) {
    html.push('<p>' + para.join(' ') + '</p>');
    para = [];
  }
};
const closeList = () => { if (inList) { html.push('</ul>'); inList = false; } };
const closeQuote = () => { if (inQuote) { html.push('</blockquote>'); inQuote = false; } };

for (const line of filtered) {
  const t = line.trim();

  if (t === '') {
    flushPara();
    closeList();
    closeQuote();
    continue;
  }

  if (t.startsWith('### ')) {
    flushPara(); closeList(); closeQuote();
    html.push(`<h3>${t.slice(4)}</h3>`);
    continue;
  }
  if (t.startsWith('## ')) {
    flushPara(); closeList(); closeQuote();
    html.push(`<h2>${t.slice(3)}</h2>`);
    continue;
  }
  if (t.startsWith('- ')) {
    flushPara(); closeQuote();
    if (!inList) { html.push('<ul>'); inList = true; }
    html.push(`<li>${t.slice(2)}</li>`);
    continue;
  }
  if (t.startsWith('> ')) {
    flushPara(); closeList();
    if (!inQuote) { html.push('<blockquote>'); inQuote = true; }
    html.push(`<p>${t.slice(2)}</p>`);
    continue;
  }

  // Plain paragraph text
  closeList(); closeQuote();
  para.push(t);
}
flushPara(); closeList(); closeQuote();

const doc = `<!doctype html>
<html><head><meta charset="utf-8"><title>Todd Article — copy from here</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; }
  h2 { margin-top: 2em; font-size: 1.6em; }
  h3 { margin-top: 1.4em; font-size: 1.25em; }
  blockquote { border-left: 4px solid #F8901E; padding-left: 16px; margin: 1em 0; color: #555; font-style: italic; }
  ul { padding-left: 1.5em; }
  .banner { background: #FFF7EB; border-left: 4px solid #F8901E; padding: 12px 16px; margin-bottom: 24px; font-size: 14px; }
</style></head><body>
<div class="banner"><strong>Wix paste source.</strong> Select all (Cmd+A), copy (Cmd+C), then paste into the Wix blog body. Headings, bullets, and quotes should carry over.</div>
${html.join('\n')}
</body></html>`;

fs.writeFileSync(OUT, doc);
console.log('Wrote', OUT);
execSync(`open -a Safari "${OUT}"`);
console.log('Opened in Safari.');
