const { spawn } = require('child_process');
const path = require('path');

const TOOLS = [
  { name: 'Prospecting Tool #1 — B2B 1st Connections', file: 'b2b-serve.js', port: 3851 },
  { name: 'Prospecting Tool #2 — Cyber 1st Connections', file: 'cyber-serve.js', port: 3852 }
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
console.log('  Tool #1 (B2B):   http://localhost:3851');
console.log('  Tool #2 (Cyber): http://localhost:3852');
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
