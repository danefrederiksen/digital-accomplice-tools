# Next Session Pickup — March 18, 2026

**Last session:** March 18, 2026
**Focus:** YouTube Publish Automation Tool

---

## What Got Done This Session

1. **Built `scripts/youtube-publish.js`** — fully working YouTube Data API script
   - Parses paste files from youtube-upload-optimizer skill
   - Updates title, description, tags via API
   - Uploads SRT subtitles (deletes old captions first)
   - Supports thumbnail upload and publish-to-public flags
   - OAuth flow with saved token (no re-auth needed)

2. **Tested on Todd Fairbairn video** (ID: `0DHA9eBtiog`)
   - Metadata updated (title, description, 15 tags — trimmed from 30 for YouTube's 400-char limit)
   - Subtitles uploaded (replaced existing English captions)
   - Video stays as draft (no --publish flag used)
   - Verify in Studio: https://studio.youtube.com/video/0DHA9eBtiog/edit

3. **OAuth token saved** at `data/youtube-credentials/token.json`
   - Future runs skip browser sign-in
   - Scopes: youtube, youtube.upload, youtube.force-ssl

---

## What's Next (in order)

### 1. Build `scripts/generate-thumbnail.js` (Step 5 in automation plan)
- HTML template + Chrome headless → 1280×720 JPG
- DA-branded: orange #F8901E, Inter font, dark background
- Inputs: --name, --tagline, --photo, --output
- Reference: snapshot-generator/server.js for Chrome headless pattern
- **BLOCKER:** Need Todd's headshot photo from Dane

### 2. Generate Todd's thumbnail
- Run generate-thumbnail.js with Todd's headshot
- Upload via youtube-publish.js --thumbnail flag

### 3. Finalize Todd's video
- Watch video, fine-tune chapter timestamps (manual)
- Set to public (--publish flag or manual in Studio)

### 4. Update workflow docs
- Update youtube_publish_workflow.md with new automated steps
- Mark Todd's checklist items complete

---

## How to Run the Script

```bash
# Metadata + subtitles (no publish)
node scripts/youtube-publish.js \
  --video=VIDEO_ID \
  --paste=reports/YouTubePaste_Guest.txt \
  --srt=reports/Subtitles.srt

# Full publish with thumbnail
node scripts/youtube-publish.js \
  --video=VIDEO_ID \
  --paste=reports/YouTubePaste_Guest.txt \
  --srt=reports/Subtitles.srt \
  --thumbnail=reports/Thumbnail.jpg \
  --publish

# Dry run (no API calls)
node scripts/youtube-publish.js \
  --video=VIDEO_ID \
  --paste=reports/YouTubePaste_Guest.txt \
  --dry-run
```

---

## Still Pending (from previous sessions)

| Item | Status |
|------|--------|
| Tool #1 missing "Open LinkedIn" on Replied cards | Not started |
| 62 Tool #4 records need company + LinkedIn URL | Blocked — Dane researching |
| Data imports (Tools #7, #8, #9, #10, #12) | Blocked — needs CSVs from Dane |

---

## How to Start Next Session

1. **Read this file first**
2. **Read MEMORY.md** for full project context
3. **Always use `node server.js` for the main dashboard — NOT python**
4. Start servers: `node start-all.js` from `/Desktop/Claude code/`
5. Ask Dane what he wants to work on — thumbnail generator is the natural next step
