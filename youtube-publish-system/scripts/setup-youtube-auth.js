// One-time YouTube OAuth setup. Captures a refresh token for the channel-owning account
// and prints the lines you need to add to .env.
//
// Prerequisites in .env:
//   YOUTUBE_CLIENT_ID=...
//   YOUTUBE_CLIENT_SECRET=...
//
// Run: node --env-file=.env scripts/setup-youtube-auth.js
// It opens a browser at Google's consent screen, captures the auth code via a local
// loopback server on port 8765, exchanges it for a refresh token, and prints the result.

import { createServer } from 'node:http';
import { exec } from 'node:child_process';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const PORT = 8765;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET in .env');
  process.exit(1);
}

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', SCOPE);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log(`\nOpening browser for OAuth consent.`);
console.log(`If it doesn't open automatically, paste this URL into your browser:`);
console.log(`\n${authUrl.toString()}\n`);
console.log(`Waiting for callback on ${REDIRECT_URI} ...\n`);

exec(`open "${authUrl.toString()}"`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`OAuth error: ${error}`);
    console.error(`OAuth error: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Waiting for OAuth callback...');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Auth complete</h1><p>You can close this tab and return to the terminal.</p>');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.error(`Token exchange failed: HTTP ${tokenRes.status}`);
    console.error(await tokenRes.text());
    server.close();
    process.exit(1);
  }

  const tokens = await tokenRes.json();

  console.log('\n✅ Auth successful!\n');
  console.log('Refresh token:');
  console.log(tokens.refresh_token);
  console.log('\nAdd this line to .env:');
  console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log('\n(The access token is short-lived and rotated automatically — no need to save it.)');

  server.close();
  process.exit(0);
});

server.listen(PORT);
