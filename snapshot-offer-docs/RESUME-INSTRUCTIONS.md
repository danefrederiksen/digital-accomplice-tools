# Snapshot Build — Resume Instructions
**Last session:** March 4, 2026
**Status:** One-page template built, previewed, claims verified. Ready for real data.

---

## What Was Built
- **One-page AI Visibility Snapshot** (HTML → PDF) for Hinge Marketing
- File: `/snapshot-generator/public/hinge-snapshot.html`
- Server: `node /snapshot-generator/server.js` → `http://localhost:3850/hinge-snapshot.html`
- Also in launch.json as "snapshot-generator" on port 3850
- DA-branded, 5th grade reading level, all claims verified against pilot data

## What the Template Contains
1. Dark header bar with "AI VISIBILITY SNAPSHOT"
2. Bold headline: "[Company] leads AI search. Zero video. That lead won't last."
3. 3 stat boxes: AI score, video count, YouTube-in-AI stat
4. Proof quote showing an actual query tested + result
5. Side-by-side bar charts: AI Search Visibility vs Video Presence
6. Dark callout box with key insight + CTA punch line
7. "In 15 minutes you get" — 3 value props for the call
8. Methodology fine print (transparent, verifiable)
9. Footer with CTA + DA branding + source footnotes

## Current Data = PILOT ONLY
- Scores are from Claude-only single run (from `hinge-marketing-pilot-snapshot from Claude.md`)
- Hinge: 8.7/10 AI, 0/10 Video
- Rattleback: 3.8, Jumpfactor: 2.5, Edge: 1.5 — all 0 video except Jumpfactor (1)
- **Before going live:** Dane must run 10 prompts on ChatGPT + Perplexity to get real cross-model data
- Template methodology line says "ChatGPT and Perplexity" — data must match

## What's Next (Pick Up Here)

### Phase A: Run Real Queries (Dane does this manually)
1. Open ChatGPT (new session each time), run all 10 prompts from the pilot
2. Open Perplexity (new session each time), run all 10 prompts
3. Screenshot every response
4. Score each: 0=Absent, 1=Cited, 2=Mentioned, 3=Recommended
5. Calculate normalized scores per model, then average → final score

### Phase B: Update Template with Real Data
1. Replace the 8.7 with actual cross-model score
2. Update competitor scores
3. Update proof line with actual result
4. Verify video presence data is still current (YouTube search for each company)

### Phase C: Add PDF Export
- Current server.js only exports to JPG (for infographic DMs)
- Need to add `--print-to-pdf` Chrome headless flag for letter-size PDF export
- Also consider building a generator UI where you input company name + scores and it populates the template

### Phase D: Templatize for Any Company
- Replace hard-coded Hinge data with template variables
- Build a simple form UI at `http://localhost:3850/` where you input:
  - Company name, industry, 3 competitors
  - AI scores (target + 3 competitors)
  - Video scores
  - Sample query + result text
- Form generates the populated HTML, exports to PDF/JPG

### Phase E: Build the Infographic DM Version
- Companion to the one-pager — a social-sized image for LinkedIn DMs
- Based on the Denise Boyer infographic format (bold headline, 3 stats, positioning statement)
- Uses same data, different layout (portrait social format, not letter-size)

## Key Files
| File | Location | What |
|------|----------|------|
| One-page template | `/snapshot-generator/public/hinge-snapshot.html` | The deliverable |
| Export server | `/snapshot-generator/server.js` | Chrome headless → JPG (needs PDF added) |
| Agent instructions | `/Snapshot offer copy/SKILL.md` | Full methodology |
| Quick checklist | `/Snapshot offer copy/QUICK-REFERENCE.md` | Workflow checklist |
| Research methodology | `/Snapshot offer copy/ai-snapshot-methodology-research-plan.md` | Scientific approach |
| Hinge pilot data | `/Snapshot offer copy/hinge-marketing-pilot-snapshot from Claude.md` | Claude-only pilot results |
| Denise Boyer report | `/Snapshot offer copy/prototypes/DeniseBoyer_Video_Opportunity_Assessment.pdf` | Gold standard full report |
| Denise Boyer DM | `/Snapshot offer copy/prototypes/DeniseBoyer_Infographic_DM.jpg` | Gold standard infographic |
| Gemini framework | `/Snapshot offer copy/AI_Visibility_Audit_Hinge from Gemini.pdf` | Gemini's audit structure |
| Tracking template | `/Snapshot offer copy/ai-snapshot-tracking-template.xlsx` | Data entry spreadsheet |

## Prompts Used in Pilot (Reuse These)
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

## GitHub
- Repo: `github.com/danefrederiksen/digital-accomplice-tools` (private)
- Committed: hinge-snapshot.html + 4 methodology docs in `snapshot-offer-docs/`
- All files also in working copy at `/Desktop/Claude code/`
