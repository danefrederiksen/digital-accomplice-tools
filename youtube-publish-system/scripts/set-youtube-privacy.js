// Sets the privacy status (private/unlisted/public) on one or more YouTube videos
// owned by the authenticated channel.
//
// Run: node --env-file=.env scripts/set-youtube-privacy.js <privacy> <videoId>...
//
// Example:
//   node --env-file=.env scripts/set-youtube-privacy.js public WJbffU_bN9U mZqtmPMeCKc Q3J8O0IsNUc

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing YOUTUBE_* env vars in .env');
  process.exit(1);
}

const [privacy, ...videoIds] = process.argv.slice(2);
if (!privacy || !videoIds.length) {
  console.error('Usage: node scripts/set-youtube-privacy.js <privacy> <videoId>...');
  console.error('  privacy: public | unlisted | private');
  process.exit(1);
}
if (!['public', 'unlisted', 'private'].includes(privacy)) {
  console.error(`Invalid privacy "${privacy}" — must be public, unlisted, or private.`);
  process.exit(1);
}

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }),
});
if (!tokenRes.ok) {
  console.error(`Token exchange failed: HTTP ${tokenRes.status} — ${await tokenRes.text()}`);
  process.exit(1);
}
const { access_token } = await tokenRes.json();

let okCount = 0, failCount = 0;
for (const videoId of videoIds) {
  // YouTube API requires the full status object on PUT, so we GET first to preserve other fields.
  const getRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!getRes.ok) {
    console.error(`  ${videoId}: GET failed HTTP ${getRes.status}`);
    failCount++;
    continue;
  }
  const item = (await getRes.json()).items?.[0];
  if (!item) {
    console.error(`  ${videoId}: not found (or not owned by authenticated account)`);
    failCount++;
    continue;
  }

  const updatedStatus = { ...item.status, privacyStatus: privacy };
  const putRes = await fetch(
    'https://www.googleapis.com/youtube/v3/videos?part=status',
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: videoId, status: updatedStatus }),
    },
  );
  if (!putRes.ok) {
    console.error(`  ${videoId}: PUT failed HTTP ${putRes.status} — ${(await putRes.text()).slice(0, 300)}`);
    failCount++;
    continue;
  }
  console.log(`  ${videoId} → ${privacy}`);
  okCount++;
}
console.log(`\nDone: ${okCount} OK, ${failCount} failed.`);
process.exit(failCount ? 1 : 0);
