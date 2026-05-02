# Build Status

**Started:** 2026-04-30
**Current phase:** Phase 1 COMPLETE (2026-05-01). Phase 1.6 COMPLETE (2026-05-02 — schema audit + shorts skill). Next: Phase 2 (Long-Form Thumbnail Generator).

---

## Phase 1: GEO Article Generator
- [x] 1.1 — Sample transcript in `tests/` (Todd Fairbairn, 2026-04-30)
- [x] 1.2 — Skill scaffold created (2026-04-30)
- [x] 1.3 — Prompt logic drafted + tested on Todd transcript (2026-04-30). Output: `output-samples/todd-fairbairn-article.md` (1,380 words, voice + GEO checks passed, shipped by Dane).
- [x] 1.4 — JSON-LD schema block (2026-04-30). Step 11 added to SKILL.md. Two schemas: `Article` + `FAQPage`. Validated against Todd article: both blocks parse cleanly, 5 Q&A pairs match.
- [x] 1.5 — Wix-paste formatting verified (2026-05-01). Live URL: https://www.digitalaccomplice.com/post/3-person-team-zero-slop-todd-fairbairn-on-b2b-ai. Google Rich Results Test: 3 valid items (2 Articles + 1 FAQ). H1/H2/H3, bullets, blockquote, FAQ section, JSON-LD schema all rendered correctly.

## Phase 1.6: Schema Audit + Shorts Skill (2026-05-02)
- [x] 1.6a — `scripts/audit-schema.js` built. Fetches a live Wix URL, extracts every `<script type="application/ld+json">` block, validates required fields per type (Article/BlogPosting, FAQPage, VideoObject), flags duplicate schemas, saves report to `audits/<slug>-<date>.txt`. Tested on Todd article: 5 schemas found, all PASS. Found Wix auto-adds `Person` + `HowTo` schemas on top of yours. Wix also renames `Article` → `BlogPosting` (both valid).
- [x] 1.6b — `geo-short-article-generator` skill built at `~/.claude/skills/geo-short-article-generator/skill.md`. 16 explicit steps. Outputs ~600-word page per short with H1 (the question), one-line hook, embedded YouTube Short iframe (9:16), Quick Answer bullets, single H2 section, 3-question FAQ, "Watch the full interview" backlink, and Article + FAQPage + VideoObject JSON-LD. Step 14 generates the cross-link footer for the long-form article (3 short links). Step 15 reminds Dane to run the audit script post-publish.
- [ ] 1.6c — Test the shorts skill end-to-end on a real Todd Fairbairn short (NEXT).
- [ ] 1.6d — Optional: auto-patch the long-form Wix post with the cross-link footer via Phase 1.5 API (not built — Dane pastes manually for now).

## Phase 2: Long-Form Thumbnail Generator
- [ ] 2.1 — Static HTML template (hardcoded data)
- [ ] 2.2 — Chrome headless render to JPG
- [ ] 2.3 — Dynamic CLI args
- [ ] 2.4 — Tested with second guest data

## Phase 3: Shorts Pipeline
- [ ] 3.1 — Shorts metadata format defined
- [ ] 3.2 — `youtube-shorts-optimizer` skill scaffold
- [ ] 3.3 — Prompt logic for one short
- [ ] 3.4 — Extended to 3 shorts in one run
- [ ] 3.5 — Batch upload script (dry-run)
- [ ] 3.6 — Live test on throwaway shorts
- [ ] 3.7 — End-to-end test on Todd shorts

---

## Notes / Blockers

_(Update as we go.)_

---

## Session Log

- **2026-04-30** — Planning complete. Folder + BUILD_PLAN + STATUS + README scaffolded. Todd transcript dropped into `tests/`. Phase 1 Step 1.1 done.
- **2026-04-30 (later)** — Reorganized 13 tools into `tools/<name>/` self-contained folders. Committed as `f1d4aa0` and pushed. No work on Phase 1 Step 1.2 yet.
- **2026-04-30 (Step 1.2)** — Skill scaffold written to `~/.claude/skills/geo-article-generator/skill.md`. Description, inputs, output format spec, constraints. No prompt logic yet (that's 1.3).
- **2026-04-30 (Step 1.2 verified)** — Tested in fresh session: `/geo-article-generator` autocompletes and loads SKILL.md correctly. Scaffold registered, slash command works.
- **2026-04-30 (Step 1.3 drafted)** — Logic section written into SKILL.md as 12 explicit substeps (load voice → read transcript → pick angle → H1 → takeaways → H2 outline → write sections → FAQ → optional intro → final pass → write file → report back). Schema generation explicitly excluded (that's 1.4). No-hallucination check baked into final pass. Ready for test in fresh session.
- **2026-04-30 (Step 1.3 verified)** — Ran skill on Todd Fairbairn transcript. Angle picked: "3-Person Team. Zero Slop." Output landed at 1,380 words with 5 quote attributions, no em dashes in prose, no buzzwords, FAQ phrased as natural ChatGPT queries. Dane reviewed and shipped. Step 1.3 complete.
- **2026-04-30 (Step 1.4 done)** — Added Step 11 to SKILL.md for JSON-LD schema generation. Two `<script type="application/ld+json">` blocks: `Article` (headline, author, publisher, datePublished, about) and `FAQPage` (mainEntity Q&A array). Also fixed em-dash rule to allow quote attributions. Generated and appended schema to Todd article. Both blocks validated via `JSON.parse`, 5 Q&A pairs match markdown FAQ. Step 1.4 complete.
- **2026-05-01 (Step 1.5 done)** — Wix-paste verification passed end-to-end. Mid-session discovery: the Wix Blog app had been uninstalled between sessions (sidebar Blog gone, /blog/posts 404, no Blog page in site nav). Reinstalled Wix Blog from Editor → Pages → + Add Page → Blog → "Add Wix Blog". Wix preserved the orphaned Todd post; reinstalling the app brought it back. Published the site. Live URL: `https://www.digitalaccomplice.com/post/3-person-team-zero-slop-todd-fairbairn-on-b2b-ai`. Verified rendering: H1/H2/H3, Key Takeaways bullets, blockquote with attribution, 5-question FAQ section all clean. Google Rich Results Test: 3 valid items detected (2 Articles + 1 FAQ; the duplicate Article schema is Wix auto-generating its own on top of our explicit one — non-blocking). 1 non-critical Article warning, likely missing optional field. Phase 1 COMPLETE.
- **2026-05-01 (Phase 1 patch — video embed)** — Dane caught that the GEO skill never embedded the YouTube video on the article page. Added: (1) new Input #3 (YouTube video URL), (2) new Step 10 in SKILL.md generating an `<iframe>` embed below the intro, (3) Schema C (`VideoObject`) added to JSON-LD step. Renumbered subsequent steps. Backfilled Todd's article: `gb_zGCPPVvU` iframe inserted, VideoObject schema appended. All three schemas (`Article`, `FAQPage`, `VideoObject`) parse as valid JSON.
- **2026-05-01 (uploadDate format fix)** — First Wix re-test flagged 2 non-critical Video warnings: bare date `2026-04-30` was missing time + timezone. Fixed in skill: `uploadDate` template now requires full ISO 8601 with Pacific offset (`YYYY-MM-DDTHH:MM:SS-07:00`). Todd's article + Wix Structured Data entry both updated to `2026-04-30T00:00:00-07:00`. Re-test: 3 valid items, **zero warnings**. Wix flow confirmed: Wix Blog post Settings → SEO → Advanced SEO → Structured Data → "Edit markup" expects the full `<script type="application/ld+json">...</script>` wrapper, not bare JSON.
- **2026-05-02 (Phase 1.6)** — Shipped two automation pieces in one session: (1) `scripts/audit-schema.js` for post-publish JSON-LD validation, tested live on Todd article — 5 schemas all PASS, surfaced that Wix auto-adds Person + HowTo schemas and renames Article → BlogPosting; (2) `geo-short-article-generator` skill — sibling to long-form, ~600 words per short, single H2, 3-question FAQ, 9:16 iframe, all 3 schemas, plus Step 14 cross-link footer for the long-form article. Skill registered (verified in live skills list). Pending: end-to-end test on real Todd shorts.

## Next Session Pickup

Phase 1 done. Next: **Phase 2 — Long-Form Thumbnail Generator.**
1. 2.1 — Static HTML template (hardcoded data) for a 1280×720 YouTube thumbnail.
2. 2.2 — Chrome headless render to JPG.
3. 2.3 — Dynamic CLI args (`--title`, `--guest`, `--photo`).
4. 2.4 — Tested with second guest data.

Optional cleanup for later:
- Investigate the Article "non-critical issue" warning in Rich Results Test (probably missing author image / publisher logo URL).
- Decide whether to suppress our Article schema since Wix auto-generates one (would simplify the skill output).
