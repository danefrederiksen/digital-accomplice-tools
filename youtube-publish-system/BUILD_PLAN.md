# Build Plan — Smallest Steps, Test After Each

**Rule:** Don't move to the next step until the current one passes its test. If a step fails, fix it before moving on. No batching.

---

## Phase 1: GEO Article Generator Skill

**Why first:** No APIs, no OAuth, no video files. Just transcript in → markdown out. Fastest feedback loop.

### Step 1.1 — Drop a sample transcript into `tests/`
- **Action:** Copy Todd Fairbairn's transcript from `/Volumes/Accomplice /Dane thought leadership videos/mini podcast/` to `youtube-publish-system/tests/todd-fairbairn-transcript.txt`
- **Test:** File exists and is readable. `wc -l` shows expected line count.
- **Who does it:** Dane (Claude can do it if path is accessible)

### Step 1.2 — Write skill scaffold (skill.md only)
- **Action:** Create `~/.claude/skills/geo-article-generator/skill.md` with description, inputs, output format spec
- **Test:** Skill appears in skill list when Dane runs `/` in a fresh session
- **Output:** Empty skeleton, no logic yet

### Step 1.3 — Add prompt logic for article generation
- **Action:** Skill takes transcript, outputs markdown article: H1, 4-6 H2 sections, FAQ block (3-5 Q&A), key takeaways summary at top
- **Test:** Run skill on Todd transcript → check output reads naturally, sections cover the interview, no hallucination
- **Verify:** Compare output to actual interview content — does every claim trace back to transcript?

### Step 1.4 — Add JSON-LD schema block
- **Action:** Skill appends Article + FAQPage JSON-LD schema at bottom of markdown
- **Test:** Validate generated JSON-LD at https://validator.schema.org/ — no errors
- **Why this matters:** GEO requires structured data for AI engines to cite the article

### Step 1.5 — Wix-paste formatting check
- **Action:** Verify markdown converts cleanly when pasted into Wix blog editor
- **Test:** Dane pastes Todd article into a draft Wix post, headings/lists/links render correctly
- **Fix if broken:** Adjust markdown style (Wix sometimes prefers HTML for FAQs)

**Phase 1 complete when:** Todd transcript → article in `output-samples/todd-fairbairn-article.md` → pasted to Wix draft → looks right.

---

## Phase 2: Long-Form Thumbnail Generator

**Why second:** Self-contained, no skill needed, just a script. Reuses Chrome-headless pattern from `snapshot-generator/`.

### Step 2.1 — Build static HTML template with hardcoded test data
- **Action:** Create `scripts/thumbnail-template.html` — DA-branded layout, hardcoded "Todd Fairbairn" + "3-Person Team. Zero Slop." + placeholder photo
- **Test:** Open in browser, looks correct at 1280×720 zoom
- **Verify:** Orange #F8901E, Inter font, DA logo, photo on one side, text on other

### Step 2.2 — Render to JPG via Chrome headless
- **Action:** Add `scripts/generate-thumbnail.js` that takes the static HTML, runs Chrome headless, saves as `output-samples/thumbnail-test.jpg`
- **Test:** Output is exactly 1280×720, JPG format, file under 2MB (YouTube limit)
- **Reference:** `snapshot-generator/server.js` lines 15-160 for Chrome-headless commands

### Step 2.3 — Make it dynamic (CLI args)
- **Action:** Accept `--name`, `--tagline`, `--photo`, `--output` flags. Inject values into HTML template.
- **Test:** Run with Todd's real headshot path → output looks like Step 2.1 but with real photo
- **Verify:** Photo not stretched, text doesn't overflow

### Step 2.4 — Test with second guest data
- **Action:** Try a different name/tagline/photo to catch edge cases (long names, short taglines, portrait vs landscape headshots)
- **Test:** Output still looks polished. Document any layout quirks.

**Phase 2 complete when:** `node scripts/generate-thumbnail.js --name="X" --tagline="Y" --photo=path.jpg` produces a publish-ready thumbnail every time.

---

## Phase 3: Shorts Pipeline

**Why last:** Has the most moving parts (skill + script + Data API). Builds on Phase 1 (skill pattern) and Phase 2 (script pattern).

### Step 3.1 — Define shorts metadata format
- **Action:** Decide what each short's metadata file looks like (extends `YouTubePaste` format from existing optimizer)
- **Test:** Format documented in this file under "Shorts Paste Format" appendix
- **Why:** Locks the contract before writing code

### Step 3.2 — Build `youtube-shorts-optimizer` skill scaffold
- **Action:** Create `~/.claude/skills/youtube-shorts-optimizer/skill.md`
- **Inputs:** Long-form transcript + 3 timestamp ranges + 1-line description per short
- **Outputs:** 3 paste-ready metadata files in `reports/`
- **Test:** Skill appears in skill list

### Step 3.3 — Add prompt logic for ONE short (not all 3 yet)
- **Action:** Skill processes a single timestamp range → title (under 60 chars), description (with `#shorts` + link to long-form), tags
- **Test:** Run on Todd transcript at `2:14-2:58` → output reads well, hooks viewer, references full episode

### Step 3.4 — Extend skill to handle 3 shorts in one run
- **Action:** Loop through 3 ranges, generate 3 metadata files
- **Test:** One skill call → 3 files in `output-samples/`

### Step 3.5 — Build batch upload script
- **Action:** Create `scripts/youtube-publish-shorts.js` — accepts 3 video IDs + 3 paste files, calls Data API for each
- **Test:** Dry-run mode (don't actually update) prints what it would do for 3 fake IDs
- **Why:** Don't risk corrupting real video metadata until script is verified

### Step 3.6 — Live test on 3 throwaway shorts
- **Action:** Dane uploads 3 unlisted test shorts to YouTube → run script with their IDs
- **Test:** Check Studio — all 3 have correct title/description/tags
- **Cleanup:** Delete test shorts after verification

### Step 3.7 — End-to-end test on real Todd shorts
- **Action:** Cut 3 real shorts from Todd interview → upload as drafts → run skill + script → publish
- **Test:** All 3 live on YouTube with proper metadata, linking back to long-form

**Phase 3 complete when:** A real day's batch of 3 shorts goes from "drafts uploaded" to "metadata set" in one command.

---

## Test Strategy Summary

After every step:
1. **Does it produce the expected output?** (file exists, format right)
2. **Is the output high-quality?** (Dane reviews, would he ship this?)
3. **Did anything break that already worked?** (especially relevant in Phase 3 where we extend existing scripts)

If any "no" → fix before continuing.

---

## Time Estimate

- Phase 1 (article skill): ~2 hours
- Phase 2 (thumbnail): ~2 hours
- Phase 3 (shorts pipeline): ~3 hours

**Total: ~7 hours of build, spread across multiple sessions.**

Recommend one phase per session to avoid context drift (per Dane's session-management rules in MEMORY.md).

---

## Status Tracking

See [STATUS.md](STATUS.md). Update after every step.
