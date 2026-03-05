# AI Visibility Snapshot Generator — Project Status & Resume Instructions
**Last updated:** March 5, 2026
**Overall status:** Phases A, B, C complete. PDF export working. Ready for Phase D (templatize for any company).

---

## HOW TO RESUME

Paste this entire file into a new Claude Code session and say: **"Pick up where we left off."**

Claude should:
1. Read the key files listed below to get full context
2. Start on the next incomplete phase (currently **Phase D — Templatize for Any Company**)
3. Start the server with `node /snapshot-generator/server.js` or use launch.json config "snapshot-generator" on port 3850

---

## WHAT THIS PROJECT IS

A **one-page AI Visibility Snapshot** — a cold outreach deliverable for Digital Accomplice (DA). It shows a prospect how visible they are in AI search (ChatGPT, Perplexity) vs competitors, and highlights the gap: their video content doesn't reach AI answers.

**The pitch:** DA is a video strategy agency. The snapshot proves the prospect leads in AI text results but their YouTube videos are invisible to AI. DA can fix that. The snapshot is the door-opener for a 15-minute call.

**Current pilot target:** Hinge Marketing (professional services marketing firm, Reston VA).

---

## WHAT'S BUILT (Phases A + B + C complete)

### The Snapshot Template
- **File:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/public/hinge-snapshot.html`
- **Preview:** `http://localhost:3850/hinge-snapshot.html`
- **Server:** `node /Users/danefrederiksen/Desktop/Claude code/snapshot-generator/server.js` (port 3850)
- **Also in:** `.claude/launch.json` as "snapshot-generator"

### What the template shows (9 sections, letter-size page):
1. Dark header bar: "AI VISIBILITY SNAPSHOT" + "Prepared for Hinge Marketing - March 2026"
2. Headline: **"Hinge Marketing leads AI search. 332 videos. Zero reach AI. That's the gap."**
3. 3 stat boxes: AI score (7.0/10), Video in AI (0/332), YouTube-in-AI trend (16%)
4. Proof line: "Hinge showed up in 16 out of 20 answers — recommended by name in 13. You have 332 YouTube videos. Not one appeared."
5. Side-by-side bar charts: AI Search Visibility vs Video in AI Answers
6. Dark callout: "That's not a content problem — it's an optimization problem. Fix it first and the gap becomes a moat."
7. "In 15 minutes you get" — 3 value props
8. Methodology fine print (transparent, verifiable)
9. Footer: CTA + DA branding + source footnotes

### Real Data (Phase A — March 5, 2026)
20 queries across ChatGPT + Perplexity, scored 0-3 per company per answer.

| Company | ChatGPT (of 30) | Perplexity (of 30) | Combined (of 60) | **Score /10** |
|---------|-----------------|-------------------|-------------------|---------------|
| **Hinge Marketing** | 22 | 20 | 42 | **7.0** |
| **Rattleback** | 8 | 3 | 11 | **1.8** |
| **Jumpfactor** | 0 | 0 | 0 | **0.0** |
| **Edge Marketing** | 0 | 2 | 2 | **0.3** |

**Video in AI answers:** 0 for ALL four companies across all 20 queries. No video from anyone.

### YouTube Channel Data (Phase B — March 5, 2026)
| Company | Channel | Subscribers | Videos | Last Upload | Status |
|---------|---------|-------------|--------|-------------|--------|
| **Hinge Marketing** | @HingeMarketing | 1,530 | 332 | 8 days ago | Very active — podcast "Spiraling Up", Shorts |
| **Rattleback** | @rattleback9574 | 15 | 19 | ~1 year ago | Dormant |
| **Jumpfactor** | @jumpfactormarketing | 158 | 18 | ~2 years ago | Dormant |
| **Edge Marketing** | @EdgeMarketingInc | 2 | 28 | 9 days ago | Active but 0-8 views/video |

**Key insight:** Hinge has 332 YouTube videos but ZERO reach AI search. That's the pitch — not "you don't have video" but "your video isn't optimized for AI discovery."

---

### PDF Export (Phase C — COMPLETE, March 5, 2026)
- **Export PDF button** on `hinge-snapshot.html` — click to download PDF directly in browser
- **3 export endpoints in `server.js`:**
  - `POST /api/export-pdf` — accepts full HTML body, writes PDF to disk, returns JSON
  - `GET /api/export-pdf?file=hinge-snapshot.html&name=HingeMarketing` — exports any public HTML file as PDF
  - `GET /api/download-pdf?file=hinge-snapshot.html&name=HingeMarketing` — generates + streams PDF download to browser
- Chrome headless `--print-to-pdf` + `--no-pdf-header-footer` — letter-size, clean output
- Export toolbar is hidden in print/PDF via `@media print` rule
- Output: `/Desktop/Claude code/HingeMarketing_AI_Snapshot.pdf` (376K)
- **Tested end-to-end:** all 3 endpoints verified, button click → download confirmed

---

## WHAT'S NEXT

### Phase D: Templatize for Any Company (the big one — NEXT UP)
- Currently all data is hard-coded in `hinge-snapshot.html`
- **Goal:** Build a form UI at `http://localhost:3850/` where you input:
  - Company name, industry, 3 competitor names
  - AI scores (target company + 3 competitors, each 0-10)
  - Video scores (target + 3 competitors, each 0-10)
  - YouTube video count for target company
  - Sample query text + result summary for the proof line
  - Headline text (auto-generated or custom)
- Form generates a populated HTML page from the template
- "Export PDF" and "Export JPG" buttons that hit the server endpoints
- Pattern: follow the existing DM infographic generator at `/snapshot-generator/public/index.html` — it already does form → live preview → export

### Phase E: DM Infographic Version (already built)
- File: `/snapshot-generator/public/index.html` — form-based generator with live preview
- Social-sized JPG for LinkedIn DMs
- Uses same data, different layout (portrait format)
- **Status: DONE** — this was built before the one-pager

---

## 10 PROMPTS USED (reuse for any new company)
1. "Best marketing agencies for professional services firms"
2. "What marketing agency do mid-size accounting firms use?"
3. "Recommend a branding agency for an AEC firm"
4. "Hinge Marketing vs Rattleback — which is better?"
5. "What are the pros and cons of Hinge Marketing?"
6. "Alternatives to Hinge Marketing for professional services"
7. "How do professional services firms grow through marketing?"
8. "What should I look for in a professional services marketing agency?"
9. "What does Hinge Marketing do?"
10. "Is Hinge Marketing any good?"

(For a new company: replace "Hinge Marketing" with target name, adjust industry/competitor references, keep the same query categories — discovery, comparison, reputation, alternatives, how-to.)

---

## KEY FILES

| File | Path (under `/Desktop/Claude code/`) | What |
|------|--------------------------------------|------|
| One-page template | `snapshot-generator/public/hinge-snapshot.html` | The Hinge deliverable (HTML, letter-size) |
| DM infographic generator | `snapshot-generator/public/index.html` | Form → live preview → JPG export |
| Export server | `snapshot-generator/server.js` | Node + Chrome headless → JPG/PDF |
| This file | `Snapshot offer copy/RESUME-INSTRUCTIONS.md` | Project status + resume instructions |
| Full progress report | `Snapshot offer copy/PHASE-A-PROGRESS-REPORT.md` | All Phase A+B data, scores, observations |
| Agent methodology | `Snapshot offer copy/SKILL.md` | Full methodology for running snapshots |
| Quick checklist | `Snapshot offer copy/QUICK-REFERENCE.md` | Step-by-step workflow checklist |
| Research plan | `Snapshot offer copy/ai-snapshot-methodology-research-plan.md` | Scientific approach doc |
| Pilot data (Claude-only) | `Snapshot offer copy/hinge-marketing-pilot-snapshot from Claude.md` | Original pilot results (superseded by real data) |
| Tracking template | `Snapshot offer copy/ai-snapshot-tracking-template.xlsx` | Data entry spreadsheet |
| Denise Boyer report | `Snapshot offer copy/prototypes/DeniseBoyer_Video_Opportunity_Assessment.pdf` | Gold standard full report example |
| Denise Boyer DM | `Snapshot offer copy/prototypes/DeniseBoyer_Infographic_DM.jpg` | Gold standard infographic example |

---

## DA BRAND GUIDELINES (for any new templates)
- **Colors:** DA Orange #F38B1C, Black #000000, Blue-Gray #5A6B7A, Gray #CBCBCB, White #FFFFFF, Light Gray #F5F5F5
- **Fonts:** Inter / Arial / Helvetica. Bold headlines, Regular body, Extra Bold stat callouts.
- **Voice:** Direct, data-first, no-BS, short sentences. 5th grade reading level.
- **Wrong colors (never use):** #F5A623, #AAAAAA, #F0F0F0

---

## GITHUB
- **Repo:** `github.com/danefrederiksen/digital-accomplice-tools` (PRIVATE)
- **Local repo:** `/Users/danefrederiksen/Desktop/digital-accomplice-tools/`
- **Working copy:** `/Users/danefrederiksen/Desktop/Claude code/` (files here, then copy to repo for commits)
- **What's committed:** App code, snapshot template, methodology docs
- **What's NOT committed:** Prospect data, backups, images, PDFs, .xlsx files

---

## VERIFIED STATS & SOURCES
- **16% YouTube-in-AI stat:** Adweek, Jan 2026 (Bluefish, Emberos, Goodie AI). YouTube is #1 social platform cited in AI answers.
- **AI search conversion:** 1.3–5x higher than traditional search (Semrush, Visibility Labs, 2025-2026).
- **Note:** The 16% stat is specifically about Perplexity citing YouTube, not "all AI search." This nuance is acknowledged in memory but the template rounds to "AI answers" for simplicity. Acceptable for a cold outreach one-pager.
