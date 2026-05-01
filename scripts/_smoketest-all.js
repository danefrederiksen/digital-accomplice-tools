// Smoke-test every self-contained tool server.
// Spawns each, waits up to 5s for port to listen, curls the index endpoint, kills it.
// Prints a pass/fail table.
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const net = require('net');

const ROOT = path.join(__dirname, '..');

const TOOLS = [
  { name: 'Hub',             file: 'tools/hub/server.js',             port: 3849, api: '/api/hub-data' },
  { name: 'Tool #1 B2B 1st',        file: 'tools/b2b/server.js',            port: 3851, api: '/api/prospects' },
  { name: 'Tool #2 Cyber 1st',      file: 'tools/cyber/server.js',          port: 3852, api: '/api/prospects' },
  { name: 'Tool #3 B2B 2nd',        file: 'tools/b2b-2nd/server.js',        port: 3853, api: '/api/prospects' },
  { name: 'Tool #4 Cyber 2nd',      file: 'tools/cyber-2nd/server.js',      port: 3854, api: '/api/prospects' },
  { name: 'Tool #5 Referral 1st',   file: 'tools/referral-1st/server.js',   port: 3855, api: '/api/prospects' },
  { name: 'Tool #6 Referral 2nd',   file: 'tools/referral-2nd/server.js',   port: 3856, api: '/api/prospects' },
  { name: 'Tool #7 B2B Email',      file: 'tools/b2b-email/server.js',      port: 3857, api: '/api/prospects' },
  { name: 'Tool #8 Cyber Email',    file: 'tools/cyber-email/server.js',    port: 3858, api: '/api/prospects' },
  { name: 'Tool #9 Substack',       file: 'tools/substack/server.js',       port: 3859, api: '/api/prospects' },
  { name: 'Tool #10 Customers',     file: 'tools/customer/server.js',       port: 3860, api: '/api/prospects' },
  { name: 'Tool #11 Comment Queue', file: 'tools/comment-queue/server.js',  port: 3861, api: '/api/stats', startupMs: 15000 },
  { name: 'Tool #12 Referral Email',file: 'tools/referral-email/server.js', port: 3862, api: '/api/prospects' },
  { name: 'Opportunities',          file: 'tools/opportunities/server.js',  port: 3863, api: '/api/opportunities' }
];

function waitForPort(port, timeoutMs) {
  return new Promise(resolve => {
    const start = Date.now();
    const tick = () => {
      const socket = net.connect(port, '127.0.0.1');
      socket.on('connect', () => { socket.destroy(); resolve(true); });
      socket.on('error', () => {
        if (Date.now() - start > timeoutMs) resolve(false);
        else setTimeout(tick, 150);
      });
    };
    tick();
  });
}

function httpGet(port, apiPath) {
  return new Promise(resolve => {
    const req = http.request({
      host: '127.0.0.1',
      port,
      path: apiPath,
      method: 'GET',
      headers: { 'Origin': `http://localhost:${port}` }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, bodySize: body.length, body: body.slice(0, 80) }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.setTimeout(3000, () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.end();
  });
}

(async () => {
  const results = [];
  for (const tool of TOOLS) {
    process.stdout.write(`${tool.name.padEnd(26)} port ${tool.port}  ... `);
    const child = spawn('node', [path.join(ROOT, tool.file)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stderr = '';
    child.stderr.on('data', d => stderr += d.toString());

    const listening = await waitForPort(tool.port, tool.startupMs || 5000);
    if (!listening) {
      process.stdout.write(`FAIL (no port in 5s)\n`);
      if (stderr) console.log(`    stderr: ${stderr.slice(0, 300)}`);
      results.push({ tool: tool.name, ok: false, reason: 'no port', stderr });
      child.kill();
      continue;
    }
    const r = await httpGet(tool.port, tool.api);
    if (r.error || r.status !== 200) {
      process.stdout.write(`FAIL (api ${r.status || r.error})\n`);
      results.push({ tool: tool.name, ok: false, reason: `api ${r.status || r.error}`, stderr });
    } else {
      process.stdout.write(`OK (${r.bodySize} bytes)\n`);
      results.push({ tool: tool.name, ok: true });
    }
    child.kill();
    await new Promise(r => setTimeout(r, 200));
  }

  const passed = results.filter(r => r.ok).length;
  console.log(`\n${passed}/${results.length} passed`);
  if (passed !== results.length) {
    console.log('\nFailures:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  - ${r.tool}: ${r.reason}`);
      if (r.stderr) console.log(`      stderr: ${r.stderr.slice(0, 300)}`);
    });
    process.exit(1);
  }
})();
