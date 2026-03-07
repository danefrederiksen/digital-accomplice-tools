---
name: ai-snapshot-agent
description: "Agent instructions for producing an AI Visibility & Video Competitive Snapshot for a B2B company. Use this skill whenever Dane asks to run a snapshot, build a competitive report, research a prospect's AI visibility, check how a company ranks in AI search, or prepare a snapshot for outreach. Also trigger when Dane names a company and says 'run it,' 'check them,' 'snapshot,' 'how do they show up in AI,' or 'build a report for [company].' This skill covers the full research workflow: prompt generation, multi-model querying, scoring, video analysis, cross-model validation, and report assembly."
---

# AI Visibility Snapshot — Automated Agent (Claude-Only Mode)

## What This Does

Produces two deliverables from minimal input:
1. **AI Visibility Snapshot PDF** — One-page branded report for the prospect
2. **Research Methodology PDF** — Internal doc showing every query, score, and source

**Input:** Company name + 3 competitors (that's it)
**Output:** Two PDFs saved to the daily reports folder
**Time:** ~10-15 minutes of Claude working, zero effort from Dane

---

## Core Principles

1. **Never fabricate data.** Every claim must come from an actual web search or verified source.
2. **ALWAYS use live web search.** Never rely on training data for company-specific claims (YouTube channels, website content, products, etc.).
3. **Document everything.** Every query, every score, every source URL.
4. **Be honest about variance.** AI answers change. Report patterns, not guarantees.
5. **The report sells the meeting, not the service.** CTA is always a 15-minute call.

---

## TRIGGER & INPUT PARSING

When Dane says something like:
- "snapshot [Company], competitors: [A], [B], [C]"
- "run a snapshot on [Company]"
- "check how [Company] shows up in AI"
- "build a report for [Company]"

**Parse these inputs:**

| Input | Required | How to Get |
|-------|----------|------------|
| Company name | YES | From Dane's message |
| 3 competitors | YES | From Dane's message, or research + propose 3 for confirmation |
| Industry | AUTO | Determine from company research (Step 1) |

**If competitors are not specified:** Research the company first via web search, identify their competitive space, propose 3 competitors, and get Dane's confirmation before proceeding.

---

## STEP 1: Company Research (2-3 minutes)

Run these web searches to understand the prospect:

```
Search 1: "{company name}"
Search 2: "{company name} company"
```

From the results, determine:
- **Industry category** (e.g., "Professional Services Marketing", "Cybersecurity Incident Management")
- **What they do** in plain language
- **Industry problem** they solve (for query templates)
- **Industry topic** for thought leadership queries

Store these for variable substitution in queries.

---

## STEP 2: Run 20 AI Visibility Queries (5-8 minutes)

Load query templates from `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/queries.json`.

For each of the 20 queries:

### 2a. Substitute Variables
Replace template variables with actual values:
- `{company}` → target company name
- `{industry}` → industry category from Step 1
- `{competitor1}` → first competitor name
- `{industry_problem}` → core problem they solve
- `{industry_topic}` → specific topic for thought leadership

### 2b. Run the Query
Use **WebSearch** to search for each query. Read the results carefully.

### 2c. Score Each Company (0-3)

For EACH of the 4 companies (target + 3 competitors), assign a score:

| Score | Meaning | Definition |
|-------|---------|------------|
| **3** | Recommended | Named as a top choice, explicitly suggested, or highlighted as a leader |
| **2** | Mentioned | Named in a list or discussed as one option among several |
| **1** | Cited | URL appears in results but company not named prominently in text |
| **0** | Absent | Not mentioned anywhere in the results |

### 2d. Record the Result
For each query, store:
```
{
  "id": [1-20],
  "query": "[the actual query text after substitution]",
  "scores": [company_score, comp1_score, comp2_score, comp3_score],
  "notes": "[brief note about what was found]"
}
```

### 2e. Track Mentions and Recommendations
Count across all 20 queries:
- **mentions**: How many queries included the target company in results (score >= 1)
- **recommended**: How many queries recommended the target company by name (score = 3)

---

## STEP 3: YouTube / Video Audit (3-5 minutes)

For EACH of the 4 companies, run these web searches:

```
Search: "{company name} YouTube channel"
Search: "{company name} site:youtube.com"
Search: "{company name} video"
```

### Collect This Data Per Company:

| Field | How to Find |
|-------|-------------|
| Channel URL | From YouTube search results |
| Subscribers | Channel page (or search snippet) |
| Total videos | Channel page or search snippet |
| Last upload date | Most recent video date |
| Upload frequency | Approximate videos per month in last 90 days |
| Status | "active" (uploaded in last 3 months), "dormant" (3+ months ago), "none" (no channel) |
| Videos in AI | Cross-reference with Step 2 — did any videos appear in query results? |

### Assign Video Score (0-10)

| Score | Criteria |
|-------|----------|
| 0 | No YouTube channel found |
| 1-2 | Channel exists but dormant (<5 videos/year, no recent uploads) |
| 3-4 | Active but low traction (regular uploads, minimal views) |
| 5-6 | Regular uploads, moderate views, some content variety |
| 7-8 | Consistent publishing, good engagement, multiple formats |
| 9-10 | Strong channel — high engagement, frequent uploads, diverse formats |

**IMPORTANT:** If you cannot find a YouTube channel via web search, score as 0 and note "No channel found (verified via web search)". Do NOT guess based on training data.

---

## STEP 4: Calculate Final Scores

### AI Visibility Score (per company)
```
raw_score = sum of all 20 query scores (max 60)
ai_score = (raw_score / 60) × 10, rounded to 1 decimal
```

### Mentions Count
```
mentions = count of queries where target scored >= 1 (max 20)
recommended = count of queries where target scored = 3 (max 20)
```

### Video Count
```
videoCount = target company's total YouTube videos
videosInAI = how many of those videos appeared in AI query results
```

---

## STEP 5: Generate Key Findings

Write 3-5 bullet-point findings based on the data. Each should be:
- **Specific** — cite actual numbers
- **Evidence-backed** — reference query results or YouTube data
- **Business-relevant** — connect to buyer behavior

Example findings:
- "<strong>Hinge leads AI visibility at 7.0/10</strong> — mentioned in 16 of 20 queries, recommended by name in 13. Nearest competitor (Rattleback) scores just 1.8."
- "<strong>Zero video content appears in AI answers</strong> — despite Hinge having 332 YouTube videos, not a single one was cited in any AI response. This is an optimization gap, not a content gap."
- "<strong>Competitors are invisible</strong> — Jumpfactor (0.0) and Edge Marketing (0.3) have virtually no AI presence. First mover advantage is available now."

---

## STEP 6: Build the Data Object and Generate PDFs

### 6a. Assemble the Data Object

Build a JSON object with ALL research data:

```json
{
  "companyName": "Hinge Marketing",
  "industry": "Professional Services Marketing",
  "reportDate": "March 2026",
  "comp1": "Rattleback",
  "comp2": "Jumpfactor",
  "comp3": "Edge Marketing",
  "ai0": 7.0, "ai1": 1.8, "ai2": 0.0, "ai3": 0.3,
  "vid0": 0, "vid1": 0, "vid2": 0, "vid3": 0,
  "videoCount": 332,
  "videosInAI": 0,
  "mentions": 16,
  "recommended": 13,
  "h1Override": "",
  "h2Override": "",
  "vidDetail0": "332 videos, 1.5K subs, very active",
  "vidDetail1": "19 videos, 15 subs, dormant",
  "vidDetail2": "18 videos, 158 subs, dormant",
  "vidDetail3": "28 videos, 2 subs, active but no traction",
  "queries": [
    {"id": 1, "query": "What are the best...", "scores": [3, 1, 0, 0], "notes": "Hinge recommended first"},
    ...all 20 queries...
  ],
  "youtube": [
    {"company": "Hinge Marketing", "channelUrl": "youtube.com/...", "subscribers": "1,530", "videos": 332, "lastUpload": "Feb 27, 2026", "freqPerMonth": 12, "status": "active", "inAI": 0},
    ...all 4 companies...
  ],
  "findings": [
    "<strong>Finding 1 text</strong> — with supporting evidence",
    ...3-5 findings...
  ],
  "sources": [
    "https://example.com/source1",
    ...all URLs visited during research...
  ]
}
```

### 6b. Start the Server (if not running)

```bash
cd "/Users/danefrederiksen/Desktop/Claude code/snapshot-generator" && node server.js &
```

Wait for "Snapshot Generator running at http://localhost:3850"

### 6c. Generate Both PDFs

Call the auto-full endpoint:

```bash
curl -X POST http://localhost:3850/api/auto-full \
  -H "Content-Type: application/json" \
  -d '{...the full data object...}'
```

This generates:
1. `{Company}_AI_Snapshot_{date}.pdf` → saved to daily reports folder
2. `{Company}_Snapshot_Methodology_{date}.pdf` → saved to daily reports folder

### 6d. Report Success

Tell Dane:
- Both PDFs are saved
- Show the file paths
- Summarize the key scores (AI score, video score, top finding)
- Note how long it took

---

## STEP 7: Quality Checks

Before reporting done, verify:

- [ ] All 4 companies have AI scores calculated from actual query data
- [ ] YouTube data was verified via web search (not training data)
- [ ] Mentions and recommended counts match the query log
- [ ] Key findings reference actual numbers from the research
- [ ] No fabricated statistics or unverified claims

---

## Verified Stats for Reports

Use these in the snapshot. All previously verified:

- AI search traffic converts **5-6x** higher than Google organic
- YouTube is the **#1 LLM social citation source** (16% of AI answers)
- **73%** of YouTube AI citations come from third-party content
- AI Overviews YouTube citations up **25%** since January 2026 (BrightEdge Q1 2026)
- **87%** of marketers say video increased sales (Wyzowl 2026)

---

## Edge Cases

**"The company has no YouTube channel"**
Verify via web search first. Score as 0. Note: "No YouTube channel found (verified via web search)."

**"All 4 companies are invisible in AI"**
Frame as opportunity: "The first company to build AI-visible content in this category will own the space."

**"The prospect is actually winning"**
Say so honestly. Recommend they protect their position.

**"AI gets facts wrong about the target"**
Document it. It's a selling point — they need to fix their content.

**"Competitors are in different sub-categories"**
Note this in methodology. Score what you find, but flag category mismatch.

---

## File Locations

- **Query config:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/queries.json`
- **Methodology template:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/public/methodology-template.html`
- **Server:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/server.js` (port 3850)
- **PDF output:** `/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/`
- **Snapshot form (manual):** `http://localhost:3850/snapshot-generator.html`

---

## API Endpoints (Automation)

| Endpoint | Method | What It Does |
|----------|--------|-------------|
| `/api/auto-snapshot` | POST | Generate snapshot PDF from JSON data |
| `/api/auto-methodology` | POST | Generate methodology PDF from JSON data |
| `/api/auto-full` | POST | Generate BOTH PDFs in one call |

All accept `{ data: {...}, outputDir: "optional/path" }` and return `{ success: true, files: {...} }`.
