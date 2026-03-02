const { spawn } = require('child_process');
const path = require('path');

const TOOLS = [
  { name: 'Prospecting Tool #1 — B2B 1st Connections', file: 'b2b-serve.js', port: 3851 },
  { name: 'Prospecting Tool #2 — Cyber 1st Connections', file: 'cyber-serve.js', port: 3852 },
  { name: 'Prospecting Tool #3 — B2B 2nd Connections', file: 'b2b-2nd-serve.js', port: 3853 },
  { name: 'Prospecting Tool #4 — Cyber 2nd Connections', file: 'cyber-2nd-serve.js', port: 3854 },
  { name: 'Prospecting Tool #5 — Referral Partner 1st Connections', file: 'referral-1st-serve.js', port: 3855 },
  { name: 'Prospecting Tool #6 — Referral Partner 2nd Connections', file: 'referral-2nd-serve.js', port: 3856 },
  { name: 'Prospecting Tool #7 — B2B Leads w/ Emails', file: 'b2b-email-serve.js', port: 3857 },
  { name: 'Prospecting Tool #8 — Cyber Leads w/ Emails', file: 'cyber-email-serve.js', port: 3858 },
  { name: 'Prospecting Tool #9 — Substack Subscriber Emails', file: 'substack-serve.js', port: 3859 },
  { name: 'Prospecting Tool #10 — Customers w/ Emails', file: 'customer-serve.js', port: 3860 }
];

console.log('\n  ===================================');
console.log('  DA Prospecting Tools — Starting All');
console.log('  ===================================\n');

const children = [];

TOOLS.forEach(tool => {
  const filePath = path.join(__dirname, tool.file);
  const child = spawn('node', [filePath], {
    stdio: 'pipe',
    env: { ...process.env }
  });

  child.stdout.on('data', data => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`  [#${TOOLS.indexOf(tool) + 1}] ${line.trim()}`);
    });
  });

  child.stderr.on('data', data => {
    console.error(`  [#${TOOLS.indexOf(tool) + 1} ERROR] ${data.toString().trim()}`);
  });

  child.on('exit', (code) => {
    console.log(`  [#${TOOLS.indexOf(tool) + 1}] ${tool.name} exited (code ${code})`);
  });

  children.push(child);
});

console.log('  All servers starting...\n');
console.log('  Tool #1 (B2B 1st):   http://localhost:3851');
console.log('  Tool #2 (Cyber 1st): http://localhost:3852');
console.log('  Tool #3 (B2B 2nd):   http://localhost:3853');
console.log('  Tool #4 (Cyber 2nd):     http://localhost:3854');
console.log('  Tool #5 (Referral 1st):  http://localhost:3855');
console.log('  Tool #6 (Referral 2nd):  http://localhost:3856');
console.log('  Tool #7 (B2B Email):     http://localhost:3857');
console.log('  Tool #8 (Cyber Email):   http://localhost:3858');
console.log('  Tool #9 (Substack):      http://localhost:3859');
console.log('  Tool #10 (Customers):    http://localhost:3860');
console.log('\n  Press Ctrl+C to stop all servers.\n');

// Graceful shutdown — kill all child servers when this script exits
process.on('SIGINT', () => {
  console.log('\n  Shutting down all servers...');
  children.forEach(c => c.kill());
  process.exit(0);
});

process.on('SIGTERM', () => {
  children.forEach(c => c.kill());
  process.exit(0);
});
