# Mini Podcast YouTube Publish Automation — Build Plan

**Status:** APPROVED by Dane (Mar 18, 2026). Ready to build.
**Session:** Start fresh — this doc has everything needed to pick up.

---

## What We're Building

Two scripts that automate the entire YouTube publish flow for mini podcast interviews:

1. **`scripts/youtube-publish.js`** — YouTube Data API script (title, description, tags, subtitles, thumbnail, visibility)
2. **`scripts/generate-thumbnail.js`** — HTML template → Chrome headless → 1280×720 JPG thumbnail

After these are built, the full guest-to-published flow is:
1. Record on Riverside → export Otter.ai transcript
2. Run `youtube-upload-optimizer` skill → generates .md, .txt, .srt files
3. `node scripts/generate-thumbnail.js --name="Guest" --tagline="Tagline" --photo=/path/to/headshot.jpg` → thumbnail JPG
4. Upload video to YouTube as draft (still manual — Dane uploads via Studio)
5. `node scripts/youtube-publish.js --video=VIDEO_ID --paste=reports/YouTubePaste_Guest.txt --srt=reports/Subtitles.srt --thumbnail=reports/Thumbnail.jpg` → sets all fields via API
6. Watch video, fine-tune chapter timestamps (manual — can't automate)
7. Set to public (via `--publish` flag or manually in Studio)

---

## Part 1: YouTube Data API Script

### One-Time Setup (Dane does this once in browser)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: "DA YouTube Tools"
3. Enable: YouTube Data API v3
4. Create OAuth 2.0 credentials → Desktop app type
5. Download `client_secret.json` → save to `data/youtube-credentials/client_secret.json`
6. First script run opens browser for OAuth consent → saves refresh token

### Script: `scripts/youtube-publish.js`
- **Input flags:**
  - `--video=VIDEO_ID` (required)
  - `--paste=path/to/YouTubePaste.txt` (required — parsed for title, description, tags)
  - `--srt=path/to/Subtitles.srt` (optional — uploads subtitles)
  - `--thumbnail=path/to/Thumbnail.jpg` (optional — uploads thumbnail)
  - `--publish` (optional — sets visibility to public, default stays draft)
- **Paste file format** (already standardized by optimizer skill):
  - Line 1-2: TITLE section
  - Lines 4-39: DESCRIPTION
  - Lines 41-42: TAGS (comma-separated)
- **API calls:** `youtube.videos.update()` for metadata, `youtube.captions.insert()` for subtitles, `youtube.thumbnails.set()` for thumbnail
- **Dependency:** `googleapis` npm package
- **Credentials:** `data/youtube-credentials/` (gitignored)

### Reference Pattern
- Same Node.js style as existing tools (express servers, single-file scripts)
- No Puppeteer needed — just googleapis SDK

---

## Part 2: Thumbnail Generator

### Script: `scripts/generate-thumbnail.js`
- **Input flags:**
  - `--name="Todd Fairbairn"` (guest name)
  - `--tagline="3-Person Team. Zero Slop."` (episode tagline from optimizer brief)
  - `--photo=/path/to/todd-headshot.jpg` (guest headshot — Dane provides)
  - `--output=reports/Todd-Fairbairn-Thumbnail.jpg` (optional, auto-generated if omitted)
- **Output:** 1280×720 JPG at 2x scale (2560×1440 render, scaled down)
- **Method:** Same Chrome headless pattern as snapshot generator:
  1. Build HTML string with embedded base64 guest photo
  2. Write to temp .html file
  3. `execSync` Chrome headless → screenshot to PNG
  4. `sips` convert PNG → JPG
  5. Clean up temp files

### Template Design
- DA-branded: Orange #F8901E, Inter font, DA play-button logo
- Split-frame layout: guest photo on one side, text overlay on other
- Text: Guest name, episode tagline, "MINI PODCAST" label, DA logo
- Dark background for contrast on YouTube

### Reference Code
- `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/server.js` — Chrome headless commands (lines 15-160)
- Chrome screenshot command: `--headless --disable-gpu --screenshot= --window-size=1280,720 --force-device-scale-factor=2`
- PNG→JPG: `sips -s format jpeg -s formatOptions 95 input.png --out output.jpg`

---

## Build Order

1. Install `googleapis`: `npm install googleapis`
2. Walk Dane through Google Cloud Console OAuth setup (in browser)
3. Build `scripts/youtube-publish.js`
4. Test on Todd Fairbairn video (ID: `0DHA9eBtiog`) — update metadata, upload subtitles
5. Build `scripts/generate-thumbnail.js` with HTML template
6. Generate Todd's thumbnail (need his headshot)
7. Upload thumbnail via API script
8. Update `memory/youtube_publish_workflow.md` with new automated steps
9. Update Todd's checklist (mark completed steps)

---

## Files to Create/Modify
- **CREATE:** `scripts/youtube-publish.js`
- **CREATE:** `scripts/generate-thumbnail.js`
- **CREATE:** `data/youtube-credentials/.gitignore` (ignore all credentials)
- **MODIFY:** `package.json` (add googleapis)
- **MODIFY:** `memory/youtube_publish_workflow.md` (document new process)
- **MODIFY:** `.gitignore` (add youtube-credentials/)

---

## Test Plan
- Run `youtube-publish.js` on Todd's video → verify in Studio that title/description/tags match
- Run `generate-thumbnail.js` → verify 1280×720 JPG looks correct
- Upload thumbnail via API → verify it appears in Studio
- Full dry run for hypothetical next guest to confirm repeatable
