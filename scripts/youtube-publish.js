#!/usr/bin/env node
/**
 * youtube-publish.js — Sets YouTube video metadata via Data API v3
 *
 * Usage:
 *   node scripts/youtube-publish.js --video=VIDEO_ID --paste=path/to/YouTubePaste.txt [options]
 *
 * Required:
 *   --video=VIDEO_ID          YouTube video ID (from the URL)
 *   --paste=path/to/file.txt  Paste file from youtube-upload-optimizer skill
 *
 * Optional:
 *   --srt=path/to/file.srt    Upload subtitles
 *   --thumbnail=path/to/img   Upload thumbnail (JPG/PNG)
 *   --publish                 Set visibility to public (default: stays as-is)
 *   --dry-run                 Show what would happen without making API calls
 *
 * First run opens browser for OAuth consent and saves token for future use.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const http = require('http');
const { execSync } = require('child_process');

// Paths
const CRED_DIR = path.join(__dirname, '..', 'data', 'youtube-credentials');
const CLIENT_SECRET_PATH = path.join(CRED_DIR, 'client_secret.json');
const TOKEN_PATH = path.join(CRED_DIR, 'token.json');

// Scopes needed
const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

// ── Argument parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg === '--publish') { args.publish = true; continue; }
    if (arg === '--dry-run') { args.dryRun = true; continue; }
    const match = arg.match(/^--(\w[\w-]*)=(.+)$/);
    if (match) args[match[1]] = match[2];
  }
  if (!args.video || !args.paste) {
    console.error('Usage: node scripts/youtube-publish.js --video=VIDEO_ID --paste=path/to/file.txt [--srt=file.srt] [--thumbnail=file.jpg] [--publish] [--dry-run]');
    process.exit(1);
  }
  return args;
}

// ── Paste file parser ───────────────────────────────────────────────────

function parsePasteFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  let title = '';
  let description = '';
  let tags = [];
  let section = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === 'TITLE:') { section = 'title'; continue; }
    if (trimmed === 'DESCRIPTION:') { section = 'description'; continue; }
    if (trimmed === 'TAGS:') { section = 'tags'; continue; }

    switch (section) {
      case 'title':
        if (trimmed) { title = trimmed; section = null; }
        break;
      case 'description':
        if (lines[i + 1] !== undefined && lines[i + 1].trim() === 'TAGS:') {
          // Don't add trailing blank lines before TAGS
          description = description.replace(/\n+$/, '');
        } else {
          description += line + '\n';
        }
        break;
      case 'tags':
        if (trimmed) {
          tags = trimmed.split(',').map(t => t.trim()).filter(Boolean);
        }
        break;
    }
  }

  description = description.replace(/\n+$/, '');

  if (!title) throw new Error('Could not parse TITLE from paste file');
  if (!description) throw new Error('Could not parse DESCRIPTION from paste file');

  // YouTube's real limit is ~400 chars (documented as 500 but counts separators)
  const MAX_TAG_CHARS = 400;
  let totalChars = tags.reduce((s, t) => s + t.length, 0);
  if (totalChars > MAX_TAG_CHARS) {
    const trimmed = [];
    let charCount = 0;
    for (const tag of tags) {
      if (charCount + tag.length > MAX_TAG_CHARS) break;
      trimmed.push(tag);
      charCount += tag.length;
    }
    console.log(`  ⚠️  Tags trimmed: ${tags.length} → ${trimmed.length} (${totalChars} chars exceeded ${MAX_TAG_CHARS} limit)`);
    tags = trimmed;
  }

  return { title, description, tags };
}

// ── OAuth ───────────────────────────────────────────────────────────────

async function authorize() {
  if (!fs.existsSync(CLIENT_SECRET_PATH)) {
    console.error(`Missing credentials: ${CLIENT_SECRET_PATH}`);
    console.error('Run Google Cloud OAuth setup first. See docs/YouTube_Publish_Automation_Plan.md');
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = creds.installed;
  const oauth2 = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3333');

  // Check for saved token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2.setCredentials(token);

    // Refresh if expired
    if (token.expiry_date && Date.now() >= token.expiry_date - 60000) {
      console.log('Refreshing expired token...');
      const { credentials } = await oauth2.refreshAccessToken();
      oauth2.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
      console.log('Token refreshed.');
    }

    return oauth2;
  }

  // First-time auth: open browser, listen for callback
  console.log('\n🔐 First-time OAuth setup — opening browser for Google sign-in...\n');

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  // Open browser
  try {
    execSync(`open "${authUrl}"`);
  } catch {
    console.log(`Open this URL in your browser:\n${authUrl}\n`);
  }

  // Start local server to catch the callback
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:3333');
      const code = url.searchParams.get('code');
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>✅ Authorized! You can close this tab.</h2><script>window.close()</script>');
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end('Missing code parameter');
      }
    });
    server.listen(3333, () => {
      console.log('Waiting for Google sign-in callback on http://localhost:3333 ...');
    });
    server.on('error', reject);
    // Timeout after 2 minutes
    setTimeout(() => { server.close(); reject(new Error('OAuth timed out after 2 minutes')); }, 120000);
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Token saved. Future runs won\'t need browser sign-in.\n');

  return oauth2;
}

// ── API actions ─────────────────────────────────────────────────────────

async function updateVideoMetadata(youtube, videoId, { title, description, tags }) {
  console.log(`Updating metadata for video ${videoId}...`);
  console.log(`  Title: ${title}`);
  console.log(`  Tags: ${tags.length} tags`);
  console.log(`  Description: ${description.length} chars`);

  // Fetch existing snippet so we preserve categoryId and other required fields
  const existing = await youtube.videos.list({ part: 'snippet', id: videoId });
  if (!existing.data.items || !existing.data.items.length) {
    throw new Error(`Video ${videoId} not found. Check the ID and make sure you own it.`);
  }
  const currentSnippet = existing.data.items[0].snippet;

  const res = await youtube.videos.update({
    part: 'snippet',
    requestBody: {
      id: videoId,
      snippet: {
        title,
        description,
        tags,
        categoryId: currentSnippet.categoryId || '22',
      },
    },
  });

  console.log('✅ Metadata updated.');
  return res.data;
}

async function uploadSubtitles(youtube, videoId, srtPath) {
  console.log(`Uploading subtitles from ${path.basename(srtPath)}...`);

  // Delete existing English captions first (API doesn't allow duplicates)
  const existing = await youtube.captions.list({ part: 'snippet', videoId });
  for (const cap of (existing.data.items || [])) {
    if (cap.snippet.language === 'en') {
      console.log(`  Deleting existing English caption (${cap.id})...`);
      await youtube.captions.delete({ id: cap.id });
    }
  }

  const res = await youtube.captions.insert({
    part: 'snippet',
    requestBody: {
      snippet: {
        videoId,
        language: 'en',
        name: 'English',
      },
    },
    media: {
      mimeType: 'application/x-subrip',
      body: fs.createReadStream(srtPath),
    },
  });

  console.log('✅ Subtitles uploaded.');
  return res.data;
}

async function uploadThumbnail(youtube, videoId, thumbPath) {
  console.log(`Uploading thumbnail from ${path.basename(thumbPath)}...`);

  const ext = path.extname(thumbPath).toLowerCase();
  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  const res = await youtube.thumbnails.set({
    videoId,
    media: {
      mimeType,
      body: fs.createReadStream(thumbPath),
    },
  });

  console.log('✅ Thumbnail uploaded.');
  return res.data;
}

async function setPublic(youtube, videoId) {
  console.log('Setting video to public...');

  const res = await youtube.videos.update({
    part: 'status',
    requestBody: {
      id: videoId,
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
  });

  console.log('✅ Video is now public.');
  return res.data;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  // Parse paste file
  const { title, description, tags } = parsePasteFile(args.paste);

  console.log('\n📺 YouTube Publish Script');
  console.log('─'.repeat(50));
  console.log(`Video ID:    ${args.video}`);
  console.log(`Title:       ${title}`);
  console.log(`Tags:        ${tags.length} tags`);
  console.log(`Description: ${description.split('\n').length} lines`);
  if (args.srt) console.log(`Subtitles:   ${args.srt}`);
  if (args.thumbnail) console.log(`Thumbnail:   ${args.thumbnail}`);
  if (args.publish) console.log(`Visibility:  → public`);
  console.log('─'.repeat(50));

  // Validate files exist
  if (args.srt && !fs.existsSync(args.srt)) {
    console.error(`SRT file not found: ${args.srt}`);
    process.exit(1);
  }
  if (args.thumbnail && !fs.existsSync(args.thumbnail)) {
    console.error(`Thumbnail file not found: ${args.thumbnail}`);
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('\n🏜️  Dry run — no API calls made.');
    console.log('\nParsed title:', title);
    console.log('\nFirst 5 tags:', tags.slice(0, 5).join(', '));
    console.log('\nDescription preview:');
    console.log(description.split('\n').slice(0, 5).join('\n'));
    return;
  }

  // Authorize
  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });

  // 1. Update metadata
  await updateVideoMetadata(youtube, args.video, { title, description, tags });

  // 2. Upload subtitles if provided
  if (args.srt) {
    await uploadSubtitles(youtube, args.video, args.srt);
  }

  // 3. Upload thumbnail if provided
  if (args.thumbnail) {
    await uploadThumbnail(youtube, args.video, args.thumbnail);
  }

  // 4. Set public if requested
  if (args.publish) {
    await setPublic(youtube, args.video);
  }

  console.log('\n🎉 Done! Check YouTube Studio to verify.');
  console.log(`   https://studio.youtube.com/video/${args.video}/edit`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
