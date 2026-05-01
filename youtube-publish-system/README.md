# YouTube Publish System

**Goal:** Take a 15-min Riverside interview and publish to YouTube as 1 long-form video + 3 shorts + 1 GEO-optimized article — with the smallest possible amount of manual work.

**Scope decisions (locked in by Dane, Apr 30 2026):**
- LinkedIn posting stays **manual**. No automation.
- Shorts go to **YouTube only**, not LinkedIn.
- Dane cuts the 3 shorts himself from the long-form (no auto-clip generator).
- Long-form interviews are ~15 minutes max.

---

## Daily Flow (Once Built)

1. Record interview on Riverside, export Otter transcript (.txt)
2. Cut 3 short clips from the long-form (Dane, in his editor)
3. Run `youtube-upload-optimizer` skill → long-form metadata package
4. Run `youtube-shorts-optimizer` skill → 3 shorts metadata packages
5. Run `geo-article-generator` skill → markdown article
6. Generate long-form thumbnail (script)
7. Upload 4 video drafts to YouTube Studio (manual)
8. Run `youtube-publish.js` (long-form) + `youtube-publish-shorts.js` (3 shorts)
9. Paste article into Wix
10. Manually post to LinkedIn (Dane decides what to share)

---

## What's Already Built ✅

- `scripts/youtube-publish.js` — long-form Data API uploader (in main repo, not this folder)
- `youtube-upload-optimizer` skill — long-form title/description/tags/SRT
- Google Cloud OAuth — set up, refresh token saved

## What This Folder Will Hold 🆕

- `scripts/generate-thumbnail.js` — long-form thumbnail generator
- `scripts/youtube-publish-shorts.js` — batch shorts uploader
- A new skill: `youtube-shorts-optimizer` (lives in Dane's skills dir)
- A new skill: `geo-article-generator` (lives in Dane's skills dir)
- This folder = test inputs, output samples, build docs

---

## Folder Structure

```
youtube-publish-system/
├── README.md            ← this file
├── BUILD_PLAN.md        ← ordered build steps with test criteria
├── STATUS.md            ← progress tracker (update as we go)
├── scripts/             ← new scripts live here during build
├── tests/               ← sample transcripts + headshots for testing
└── output-samples/      ← generated outputs to verify quality
```

---

## Inputs Dane Provides Per Video

- Riverside MP4 (long-form, ~15 min)
- Otter transcript (.txt)
- Guest headshot photo (.jpg)
- 3 timestamp ranges + 1-line description per short
- 3 cut MP4 files of the shorts

## Build Order

See [BUILD_PLAN.md](BUILD_PLAN.md). Three pieces, smallest steps, test after each.

1. **GEO article generator** (no APIs, fastest learning loop)
2. **Long-form thumbnail generator**
3. **Shorts pipeline** (skill + batch uploader)
