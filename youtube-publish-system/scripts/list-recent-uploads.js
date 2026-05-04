// Lists the N most recent uploads on the authenticated YouTube channel.
// Used to grab video IDs for fresh uploads without forcing Dane to copy/paste from Studio.
//
// Run: node --env-file=.env scripts/list-recent-uploads.js [count]

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing YOUTUBE_* env vars in .env');
  process.exit(1);
}

const count = parseInt(process.argv[2] || '10', 10);

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: HTTP ${res.status} — ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(path, token) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`YouTube API ${path}: HTTP ${res.status} — ${await res.text()}`);
  return res.json();
}

const token = await getAccessToken();

// 1. Get the uploads playlist ID for the authenticated channel.
const channels = await api('channels?part=contentDetails&mine=true', token);
const uploadsPlaylistId = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
if (!uploadsPlaylistId) throw new Error('No uploads playlist found for this channel');

// 2. List the most recent uploads.
const uploads = await api(`playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${count}`, token);

// 3. Get full video details (status, duration, privacy) for each.
const videoIds = uploads.items.map(i => i.contentDetails.videoId).join(',');
const videos = await api(`videos?part=snippet,status,contentDetails&id=${videoIds}`, token);

// 4. Print a paste-friendly table.
console.log('');
console.log('Most recent uploads:');
console.log('═══════════════════════════════════════════════════════════════════════════════');
for (const v of videos.items) {
  const id = v.id;
  const title = v.snippet.title;
  const privacy = v.status.privacyStatus;
  const dur = v.contentDetails.duration; // ISO 8601 like PT1M5S
  const publishedAt = v.snippet.publishedAt;
  console.log(`${id}  [${privacy.padEnd(8)}]  ${dur.padEnd(10)}  ${publishedAt}`);
  console.log(`              ${title}`);
}
console.log('═══════════════════════════════════════════════════════════════════════════════');
