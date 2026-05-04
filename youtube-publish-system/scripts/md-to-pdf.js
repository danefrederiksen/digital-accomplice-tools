// Convert a markdown file to a DA-styled PDF using Chrome headless.
// Run: node scripts/md-to-pdf.js <input.md> <output.pdf>

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { marked } from 'marked';

const [, , inArg, outArg] = process.argv;
if (!inArg || !outArg) {
  console.error('Usage: node scripts/md-to-pdf.js <input.md> <output.pdf>');
  process.exit(1);
}

const inPath = resolve(inArg);
const outPath = resolve(outArg);

const md = readFileSync(inPath, 'utf8');
const body = marked.parse(md);

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Document</title>
<style>
  @page { size: Letter; margin: 0.6in; }
  body { font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 10.5pt; line-height: 1.45; max-width: 7.2in; }
  h1 { color: #F8901E; font-size: 22pt; border-bottom: 2px solid #F8901E; padding-bottom: 6px; margin-top: 24px; }
  h2 { color: #1a1a1a; font-size: 14pt; margin-top: 22px; border-bottom: 1px solid #e3e3e3; padding-bottom: 3px; }
  h3 { color: #1a1a1a; font-size: 11.5pt; margin-top: 16px; }
  code { font-family: "SF Mono", Menlo, Monaco, Consolas, monospace; background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 9.5pt; }
  pre { background: #f4f4f4; padding: 10px 12px; border-radius: 4px; overflow-x: auto; font-size: 9pt; line-height: 1.4; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 9pt; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; }
  th, td { border: 1px solid #d0d0d0; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #fafafa; font-weight: 600; }
  blockquote { border-left: 3px solid #F8901E; margin: 10px 0; padding: 4px 12px; color: #444; background: #fffaf2; }
  ul, ol { padding-left: 22px; }
  li { margin: 3px 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 18px 0; }
  a { color: #C16A12; text-decoration: none; }
  strong { color: #1a1a1a; }
</style></head>
<body>${body}</body></html>`;

const tmpHtml = `/tmp/md-to-pdf-${process.pid}.html`;
writeFileSync(tmpHtml, html);

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execSync(`"${chrome}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${outPath}" "file://${tmpHtml}"`, { stdio: 'inherit' });

console.log(`Wrote ${outPath}`);
