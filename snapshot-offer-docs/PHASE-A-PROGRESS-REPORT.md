# AI Visibility Snapshot — Phase A+B Progress Report
**Date:** March 5, 2026
**Status:** Phase A complete (real AI query data). Phase B complete (YouTube video verification).

---

## What We Did

### Ran 20 queries across 2 AI platforms
- **10 prompts on ChatGPT** (new chat each time, free tier, logged into Dane's account)
- **10 prompts on Perplexity** (new thread each time, free tier, logged into Dane's account)
- Scored 4 companies in every response: Hinge Marketing, Rattleback, Jumpfactor, Edge Marketing
- Scoring: 0=Absent, 1=Cited as source, 2=Mentioned by name, 3=Recommended/highlighted

### The 10 Prompts Used
1. Best marketing agencies for professional services firms
2. What marketing agency do mid-size accounting firms use?
3. Recommend a branding agency for an AEC firm
4. Hinge Marketing vs Rattleback — which is better?
5. What are the pros and cons of Hinge Marketing?
6. Alternatives to Hinge Marketing for professional services
7. How do professional services firms grow through marketing?
8. What should I look for in a professional services marketing agency?
9. What does Hinge Marketing do?
10. Is Hinge Marketing any good?

---

## Results

### ChatGPT Scores (out of 30 max)
| Prompt | Hinge | Rattleback | Jumpfactor | Edge |
|--------|-------|------------|------------|------|
| 1. Best agencies for PSFs | 3 | 0 | 0 | 0 |
| 2. Agency for accounting | 3 | 0 | 0 | 0 |
| 3. Branding for AEC | 0 | 0 | 0 | 0 |
| 4. Hinge vs Rattleback | 3 | 3 | 0 | 0 |
| 5. Pros/cons of Hinge | 3 | 1 | 0 | 0 |
| 6. Alternatives to Hinge | 3 | 3 | 0 | 0 |
| 7. How PSFs grow | 0 | 0 | 0 | 0 |
| 8. What to look for | 1 | 1 | 0 | 0 |
| 9. What does Hinge do | 3 | 0 | 0 | 0 |
| 10. Is Hinge any good | 3 | 0 | 0 | 0 |
| **ChatGPT Total** | **22** | **8** | **0** | **0** |

### Perplexity Scores (out of 30 max)
| Prompt | Hinge | Rattleback | Jumpfactor | Edge |
|--------|-------|------------|------------|------|
| 1. Best agencies for PSFs | 0 | 0 | 0 | 0 |
| 2. Agency for accounting | 0 | 0 | 0 | 2 |
| 3. Branding for AEC | 3 | 0 | 0 | 0 |
| 4. Hinge vs Rattleback | 3 | 3 | 0 | 0 |
| 5. Pros/cons of Hinge | 3 | 0 | 0 | 0 |
| 6. Alternatives to Hinge | 3 | 0 | 0 | 0 |
| 7. How PSFs grow | 1 | 0 | 0 | 0 |
| 8. What to look for | 1 | 0 | 0 | 0 |
| 9. What does Hinge do | 3 | 0 | 0 | 0 |
| 10. Is Hinge any good | 3 | 0 | 0 | 0 |
| **Perplexity Total** | **20** | **3** | **0** | **2** |

### Final Cross-Model Scores (0–10 scale)
| Company | ChatGPT | Perplexity | Combined (of 60) | **Score /10** |
|---------|---------|------------|-------------------|---------------|
| **Hinge Marketing** | 22 | 20 | 42 | **7.0** |
| **Rattleback** | 8 | 3 | 11 | **1.8** |
| **Jumpfactor** | 0 | 0 | 0 | **0.0** |
| **Edge Marketing** | 0 | 2 | 2 | **0.3** |

### Pilot vs Real Comparison
| Company | Pilot (Claude-only) | Real (ChatGPT + Perplexity) | Change |
|---------|--------------------|-----------------------------|--------|
| Hinge | 8.7 | 7.0 | -1.7 |
| Rattleback | 3.8 | 1.8 | -2.0 |
| Jumpfactor | 2.5 | 0.0 | -2.5 |
| Edge | 1.5 | 0.3 | -1.2 |

---

## Key Observations

1. **Hinge dominates but not as much as Claude thought.** 7.0 vs 8.7 pilot. Still #1 by a mile — nearest competitor is 1.8.
2. **Rattleback only surfaces when Hinge is mentioned first.** It appears in head-to-head comparisons and "alternatives" queries but never independently.
3. **Jumpfactor and Edge are invisible.** Zero and near-zero across both platforms.
4. **ChatGPT has Dane's memory** — it recognized Digital Accomplice and added DA-relevant commentary. This didn't inflate Hinge's scores but is worth noting for methodology transparency.
5. **Perplexity and ChatGPT disagree on generic queries.** Perplexity didn't mention Hinge for "best agencies" (prompt 1) but did for AEC (prompt 3). ChatGPT was the opposite. Cross-model testing catches this.
6. **No video appeared in any AI answer.** The video gap claim holds across all 20 responses.

---

## What Was Updated

- **`snapshot-generator/public/hinge-snapshot.html`** — Updated with real scores:
  - Hinge: 8.7 → 7.0
  - Rattleback: 3.8 → 1.8
  - Jumpfactor: 2.5 → 0.0
  - Edge: 1.5 → 0.3
  - Proof line: "16 out of 20 answers — recommended by name in 13"

---

## Phase B: YouTube Video Verification — COMPLETE (March 5, 2026)

### YouTube Channel Data (verified manually)
| Company | Channel | Subscribers | Videos | Last Upload | Status |
|---------|---------|-------------|--------|-------------|--------|
| **Hinge Marketing** | @HingeMarketing | 1,530 | 332 | 8 days ago | Very active — podcast "Spiraling Up", Shorts, regular uploads |
| **Rattleback** | @rattleback9574 | 15 | 19 | ~1 year ago | Dormant |
| **Jumpfactor** | @jumpfactormarketing | 158 | 18 | ~2 years ago | Dormant — MSP case studies |
| **Edge Marketing** | @EdgeMarketingInc | 2 | 28 | 9 days ago | Active but zero traction (0-8 views/video) |

### Key Finding
**Hinge has 332 YouTube videos but ZERO appeared in any AI answer across all 20 queries.** This is more compelling than "zero video" — they're investing in video, it's just not reaching AI search. Same for competitors: Rattleback (19 videos), Jumpfactor (18), Edge (28) — none surfaced in AI answers.

### Data Corrections Applied
- **Jumpfactor video score:** Pilot had 1, real data = **0** (no video from any company in any AI answer)
- **All 4 companies:** 0/10 on Video in AI Answers (confirmed across ChatGPT + Perplexity)

### Template Updates (hinge-snapshot.html)
- **Headline:** "332 videos. Zero reach AI. That's the gap." (was "Zero video. That lead won't last." — could backfire since Hinge actually has 332 videos)
- **Stat box:** "0/332 YouTube videos found in AI answers" (was just "0")
- **Callout:** "That's not a content problem — it's an optimization problem." (was "Nobody in your space has video showing up")
- **Chart title:** "Video in AI Answers (/10)" (was "Video Presence" — too ambiguous)
- **Jumpfactor:** Corrected from 1 to 0

---

## What's Next

### Phase C: PDF Export
- [ ] Add `--print-to-pdf` Chrome headless flag to `snapshot-generator/server.js`
- [ ] Letter-size PDF output for email attachment

### Phase D: Templatize for Any Company
- [ ] Replace hard-coded Hinge data with template variables
- [ ] Build form UI at `http://localhost:3850/` for inputting company data
- [ ] Form generates populated HTML → exports to PDF/JPG

### Phase E: Infographic DM Version
- [ ] Social-sized image for LinkedIn DMs
- [ ] Based on Denise Boyer infographic format
- [ ] Same data, different layout (portrait social format)
