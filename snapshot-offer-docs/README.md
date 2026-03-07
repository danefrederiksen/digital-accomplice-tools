# AI Visibility Snapshot Tool — README

**Last updated:** March 7, 2026
**Owner:** Dane Frederiksen / Digital Accomplice

---

## What This Tool Does

Produces a one-page PDF showing how a B2B company appears (or doesn't) in AI search results compared to 3 competitors. Includes AI visibility scores, video presence analysis, and a call-to-action for a 15-minute strategy call. This is the core conversion tool in the DA sales pipeline.

Every snapshot also generates a companion Methodology PDF that documents exactly how the data was gathered, so results can be verified.

---

## Where Everything Lives

| What | Where | Notes |
|------|-------|-------|
| **SKILL.md** (brain) | `/Desktop/Claude code/Snapshot offer copy/SKILL.md` | The agent instructions. This is the source of truth for how snapshots are built. |
| **Snapshot Generator** (PDF builder) | `/Desktop/Claude code/snapshot-generator/` | Node.js app. Form UI + Chrome headless PDF/JPG export. |
| **Methodology script** | `/Desktop/Claude code/generate-methodology-pdf.py` | Python (reportlab). Template for audit trail PDFs. |
| **Scoring sheet** | `/Desktop/Claude code/Snapshot offer copy/ai-snapshot-tracking-template.xlsx` | Excel companion for manual scoring. |
| **Git backup** | `github.com/danefrederiksen/digital-accomplice-tools` (private) | SKILL.md lives in `snapshot-offer-docs/`. Generator in `snapshot-generator/`. |
| **Output folder** | `/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/` | All finished PDFs go here. |

---

## How to Run a Snapshot

### Option 1: Tell Claude Code (fastest)

1. Open Claude Code in `/Desktop/Claude code/`
2. Say: **"Run a snapshot on [Company Name]"**
3. Claude will ask for: competitors, mode (Lite or Full), and contact name
4. Claude runs the queries, scores results, fills the generator form, exports PDF + methodology doc
5. Both PDFs land in your daily reports folder

### Option 2: Manual with the Generator UI

1. Start the server:
   ```
   node /Desktop/Claude\ code/snapshot-generator/server.js
   ```
2. Open: **http://localhost:3850/snapshot-generator.html**
3. Fill in the 19 form fields (company, competitors, scores, YouTube data, headline)
4. Click **Export PDF** for the one-pager
5. Click **Export JPG** for a DM-sized infographic version
6. The DM infographic builder is at: **http://localhost:3850/**

### Option 3: Just the Research (no PDF)

Say: **"Run the research for [Company] but don't build the PDF yet"**
Claude will run queries, score results, and present findings. You decide whether to generate the PDF.

---

## Modes

| Mode | When to Use | Prompts | Models | Runs | Time |
|------|-------------|---------|--------|------|------|
| **Lite** | Cold outreach, first touch | 10 | 2 (ChatGPT + Perplexity) | 1 | ~60 min |
| **Full** | Warm prospect, referral partner | 15 + 5 video | 4 (ChatGPT, Perplexity, Gemini, Claude) | 3 over 3 days | ~3.5 hrs |

Default is Lite. Say "Full mode" if you want the deep version.

---

## What Gets Produced

Every snapshot generates **two files**:

1. **`[Company]_AI_Snapshot_[date]_Claude_Code.pdf`** — The one-pager you send to the prospect
2. **`[Company]_AI_Snapshot_[date]_Methodology.pdf`** — The audit trail you keep (not sent)

---

## How to Test Accuracy

### Quick Check (do this every time)

1. **Open the Methodology PDF.** Look at Section 3 (Queries Run). For each query marked "YES" (company found), manually Google the same query and confirm the company actually appears.
2. **Spot-check 2-3 scores.** Pick a prompt, run it in ChatGPT or Perplexity yourself, compare results to what the methodology doc claims.
3. **Verify video claims.** Go to YouTube, search the company name. Does the methodology doc match reality? This was the bug that was found and fixed on March 7, 2026.

### Deep Verification (do this monthly or when something feels off)

1. **Re-run a previous snapshot.** Pick a company you already snapshotted. Run it again. Compare scores. If they differ by more than 1.5 points, investigate why. AI results change over time, but big swings mean something shifted.
2. **Cross-check with manual AI queries.** The Lite mode uses web search as a proxy for AI models. Run the same 10 prompts directly in ChatGPT and Perplexity. Compare results to what web search found. If they diverge significantly, the proxy method may need recalibration.
3. **Check the stats.** The snapshot uses these verified stats (sources in `report-validation.md`):
   - AI search converts 5-6x higher than Google organic
   - YouTube is #1 LLM social citation source (16% of AI answers)
   - 73% of YouTube AI citations come from third-party content
   - AI Overviews YouTube citations up 25% since Jan 2026 (BrightEdge)
   - 87% of marketers say video increased sales (Wyzowl 2026)

   If any of these feel dated, web search the source to verify they're still current.

### Red Flags to Watch For

- A score of 0 for a well-known company (may mean queries were too niche)
- Video presence claims without web search verification in the methodology doc
- Scores that seem too high (check if the company is being confused with a different company of the same name)
- Competitor category mismatch (insurance company scored against a SaaS platform)

---

## How to Fix Bugs

### The SKILL.md is the brain. Fix it there.

The file that controls how Claude builds snapshots is:
```
/Desktop/Claude code/Snapshot offer copy/SKILL.md
```

### Bug Fix Process

1. **Identify the problem.** Look at the Methodology PDF to find where the wrong data came from. Was it a bad query? Wrong scoring? Missing web search?

2. **Edit the SKILL.md.** Add guardrails where the bug happened. Be specific. Examples:
   - If Claude guessed instead of searching: Add "You MUST use web search" with exact query templates
   - If scoring was wrong: Clarify the rubric or add examples
   - If a section was skipped: Add a checklist or mandatory step

3. **Test the fix.** Run a snapshot on the same company that had the bug. Check if the fix works.

4. **Copy to git repo and push:**
   ```
   cp "/Desktop/Claude code/Snapshot offer copy/SKILL.md" "/Desktop/digital-accomplice-tools/snapshot-offer-docs/SKILL.md"
   cd /Desktop/digital-accomplice-tools
   git add snapshot-offer-docs/SKILL.md
   git commit -m "Fix: [describe what you fixed]"
   git push
   ```

### Bug History

| Date | Bug | Root Cause | Fix |
|------|-----|-----------|-----|
| Mar 7, 2026 | False claims about companies having no video content | Relied on training data instead of live web search | Added Core Principle #2 (mandatory web search), Step 6 CRITICAL warning block, updated edge case for "no YouTube channel" |

### If the Generator Has a Bug (not the research)

The generator is a separate app at `/Desktop/Claude code/snapshot-generator/`. It has:
- `server.js` — Node.js server with PDF/JPG export endpoints
- `public/snapshot-generator.html` — The form UI and template
- `public/index.html` — DM infographic builder

If the PDF looks wrong (layout, colors, missing data), the issue is in the HTML template. If the export fails, check `server.js`.

### If the Methodology PDF Script Has a Bug

The script is at `/Desktop/Claude code/generate-methodology-pdf.py`. It's a Python reportlab script. Edit the data sections for each new company. If the layout breaks, the issue is in the TableStyle definitions.

---

## File Inventory

### Active (use these)
| File | Purpose |
|------|---------|
| `SKILL.md` | Agent instructions — the brain |
| `ai-snapshot-tracking-template.xlsx` | Manual scoring companion |
| `QUICK-REFERENCE.md` | Checklist version of the workflow |
| `README.md` | This file |

### Reference (don't edit)
| File | Purpose |
|------|---------|
| `hinge-marketing-pilot-snapshot from Claude.md` | First completed snapshot (calibration run) |
| `PHASE-A-PROGRESS-REPORT.md` | Phase A research results |
| `ai-snapshot-methodology-research-plan.md` | Original research plan |
| `RESUME-INSTRUCTIONS.md` | Session handoff notes (may be stale) |

### Archive (can delete if cluttered)
| File | Purpose |
|------|---------|
| `AI_Visibility_Audit_Hinge from Gemini.pdf` | Early Gemini prototype |
| `hinge prototype from perplxity.rtf` | Early Perplexity prototype |
| `scientific approach to rebuilding snapshot tool.rtf` | Early methodology notes |
| `prototypes/` | Old HTML prototypes |

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| `node server.js` won't start | Check if port 3850 is in use: `lsof -i :3850`. Kill the process: `kill [PID]` |
| PDF export fails | Make sure Chrome/Chromium is installed. The server uses `puppeteer` or Chrome headless. |
| Snapshot scores seem wrong | Check the Methodology PDF. Trace each score back to its query. Re-run suspect queries manually. |
| Claude says "I don't have the snapshot skill" | The SKILL.md must be in `Snapshot offer copy/` in your working directory. Check it's there. |
| Generator form is blank | Make sure you're at `/snapshot-generator.html`, not just `/` (that's the DM builder). |
| Methodology PDF won't generate | Run `pip3 install reportlab` to ensure the library is installed. |
