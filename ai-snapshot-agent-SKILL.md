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
  "notes": "[brief note about what was found]",
  "verbatim_response": "[REQUIRED for top 3 buyer-intent queries: save the FULL verbatim response text from the AI model. This feeds the WHAT AI SAYS section of the snapshot.]"
}
```

### 2e. Save Verbatim Quotes for WHAT AI SAYS
For the **top 3 most impactful buyer-intent queries** (the ones where the gap between prospect and competitor is most visceral):
- Save the **full verbatim response text** from the AI model
- Note which model generated it (ChatGPT, Perplexity, etc.)
- Flag the specific sentences where competitors are named/recommended and the prospect is absent
- These quotes feed directly into Section 3 (WHAT AI SAYS) of the snapshot template

### 2f. Track Mentions and Recommendations
Count across all 20 queries:
- **mentions**: How many queries included the target company in results (score >= 1)
- **recommended**: How many queries recommended the target company by name (score = 3)

---

## STEP 2g: Compile Per-Platform Citation Status (for Comparison Grid)

After all 20 queries are scored, compile a **per-platform citation summary** for the COMPETITOR COMPARISON grid in the snapshot:

```
For each AI platform tested, determine citation status per company:
  ✓ Cited    = company scored 2-3 on at least 2 queries from that platform
  ~ Partial  = company scored 1, or scored 2-3 on only 1 query
  ✗ Not Cited = company scored 0 on all queries from that platform

Store as:
{
  "comparison_grid": {
    "ChatGPT":   { "target": "Cited", "comp1": "Not Cited", "comp2": "Partial" },
    "Perplexity": { "target": "Cited", "comp1": "Cited", "comp2": "Not Cited" },
    "Claude":     { "target": "Not Cited", "comp1": "Not Cited", "comp2": "Not Cited" },
    "Google AI":  { "target": "Partial", "comp1": "Not Cited", "comp2": "Not Cited" }
  }
}
```

This data maps directly to Section 5 (COMPETITOR COMPARISON) of the snapshot template.

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

### Summarize Video Status for Snapshot
For EACH company, assign a one-word status. This feeds directly into Section 4 (KEY FINDINGS) of the snapshot:
- **Active** = uploaded in last 3 months, regular cadence
- **Sporadic** = has videos but dormant (3+ months since last upload, or <5 videos/year)
- **Absent** = no YouTube channel found, or <3 total videos

```
Store as:
{
  "video_status": {
    "target": "Active",
    "comp1": "Sporadic",
    "comp2": "Absent",
    "comp3": "Absent"
  }
}
```

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

Write 3 bullet-point findings based on the data. Each should be:
- **Specific** — cite actual numbers
- **Evidence-backed** — reference query results or YouTube data
- **Business-relevant** — connect to buyer behavior

**Finding 3 is ALWAYS the video status line.** This is required, not optional.

Example findings:
- "<strong>Hinge leads AI visibility at 7.0/10</strong> — mentioned in 16 of 20 queries, recommended by name in 13. Nearest competitor (Rattleback) scores just 1.8."
- "<strong>Zero video content appears in AI answers</strong> — despite Hinge having 332 YouTube videos, not a single one was cited in any AI response. This is an optimization gap, not a content gap."
- "<strong>Video status:</strong> Hinge: Active (332 videos) | Rattleback: Sporadic (19 videos, dormant) | Jumpfactor: Sporadic (18 videos, dormant) | Edge: Absent (28 videos, no traction)"

**Format for Finding 3:**
```
Video status: [Company]: [Active/Sporadic/Absent] | [Comp1]: [Active/Sporadic/Absent] | [Comp2]: [Active/Sporadic/Absent]
```

---

## STEP 6: Build the Data Object and Generate PDFs

### 6a. Assemble the Data Object

Build a JSON object with ALL research data. **New fields marked with [NEW]:**

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

  "[NEW] whatAISays": [
    {
      "query": "What are the best incident response platforms?",
      "model": "ChatGPT",
      "competitorQuote": "Resilience is widely regarded as a leading platform for...",
      "prospectResult": "Not mentioned"
    },
    {
      "query": "Recommend a cybersecurity vendor for mid-market",
      "model": "Perplexity",
      "competitorQuote": "Cobalt and Coalition are frequently recommended for...",
      "prospectResult": "Mentioned briefly in a list of 8 vendors"
    }
  ],

  "[NEW] comparisonGrid": {
    "ChatGPT":    {"target": "Cited", "comp1": "Not Cited", "comp2": "Partial"},
    "Perplexity": {"target": "Cited", "comp1": "Cited", "comp2": "Not Cited"},
    "Claude":     {"target": "Not Cited", "comp1": "Not Cited", "comp2": "Not Cited"},
    "Google AI":  {"target": "Partial", "comp1": "Not Cited", "comp2": "Not Cited"}
  },

  "[NEW] videoStatus": {
    "target": "Active",
    "comp1": "Sporadic",
    "comp2": "Absent",
    "comp3": "Absent"
  },

  "[NEW] recommendation": {
    "quickWin": "Record a 3-minute expert video answering your #1 buyer question and publish to YouTube with full transcript.",
    "nextMove": "Create a 4-video FAQ series from your top support queries and optimize descriptions for AI citation.",
    "fullPlay": "Build a monthly video program that positions [Company] as the go-to expert AI models cite in your category."
  },

  "[NEW] effortLevel": "Low — one 3-minute video + transcript, no production required.",

  "queries": [
    {"id": 1, "query": "What are the best...", "scores": [3, 1, 0, 0], "notes": "Hinge recommended first", "verbatim_response": "[full text for top 3 queries]"},
    ...all 20 queries...
  ],
  "youtube": [
    {"company": "Hinge Marketing", "channelUrl": "youtube.com/...", "subscribers": "1,530", "videos": 332, "lastUpload": "Feb 27, 2026", "freqPerMonth": 12, "status": "active", "inAI": 0},
    ...all 4 companies...
  ],
  "findings": [
    "<strong>Finding 1 text</strong> — with supporting evidence",
    "<strong>Finding 2 text</strong> — competitive gap with numbers",
    "<strong>Video status:</strong> [Company]: Active | [Comp1]: Sporadic | [Comp2]: Absent"
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

## STEP 7: Assemble the Report — Section-by-Section

Build the snapshot following this exact section order (matches snapshot-generator template):

1. **WHAT WE CHECKED** — One sentence: X queries, which platforms, which companies.
2. **AI VISIBILITY SCORE** — Score out of 10, mentions fraction, recommended fraction, 3 stat boxes.
3. **WHAT AI SAYS** — Pick the 2 most visceral gaps from verbatim quotes (Step 2e). Side-by-side: competitor quote vs. prospect absence. Note the AI model.
4. **KEY FINDINGS** — 3 bullet findings. Finding 3 = REQUIRED video status line (Active/Sporadic/Absent for all companies).
5. **COMPETITOR COMPARISON** — Grid from Step 2g data. Rows = platforms, columns = prospect + 2 competitors. Cells = ✓ Cited / ✗ Not Cited / ~ Partial.
6. **THE GAP** — Dark callout box. Specific to this company. End with punch line in DA Orange.
7. **WHY IT MATTERS** — MUST include revenue stat (5-6x or 27-32% SQLs) AND urgency window (adoption doubled, 2-3 year window closing). 3-4 sentences max.
8. **RECOMMENDATION** — 3-tier: Quick Win (this week, one sentence, doable Monday morning), Next Move (this month, one sentence), Full Play (this quarter, one sentence, naturally points toward DA without being pushy). Lite mode still uses 3 tiers — keep them short.
9. **EFFORT LEVEL** — One line: Low/Medium/High + brief context. Match to Quick Win. Never quote prices.
10. **NEXT STEP** — 15-minute call CTA. No pitch. Calendly link.

---

## STEP 8: Quality Checks

Before reporting done, verify:

- [ ] All 4 companies have AI scores calculated from actual query data
- [ ] YouTube data was verified via web search (not training data)
- [ ] Mentions and recommended counts match the query log
- [ ] Key findings reference actual numbers from the research
- [ ] No fabricated statistics or unverified claims
- [ ] WHAT AI SAYS includes 2+ verbatim quotes with source model noted
- [ ] Competitor comparison grid complete for all platforms tested
- [ ] Video status line (Active/Sporadic/Absent) for all companies
- [ ] 3-tier recommendation: Quick Win + Next Move + Full Play
- [ ] Revenue math explicit in WHY IT MATTERS
- [ ] Urgency window framing included
- [ ] Effort level present and honest
- [ ] Passes 60-second test
- [ ] One page or less
- [ ] File named per convention

---

## Verified Stats for Reports

Use these in the snapshot. All previously verified:

- AI search traffic converts **5-6x** higher than Google organic
- Companies visible in AI search report **27-32% more inbound SQLs** (SmartRent + Broworks data, 2025-2026)
- YouTube is the **#1 LLM social citation source** (16% of AI answers)
- **73%** of YouTube AI citations come from third-party content
- AI Overviews YouTube citations up **25%** since January 2026 (BrightEdge Q1 2026)
- **87%** of marketers say video increased sales (Wyzowl 2026)
- AI search adoption **doubled in 2025** — the competitive window is 2-3 years

**REQUIRED in every report:** Always use at least one revenue stat (5-6x conversion OR 27-32% SQL increase) AND the urgency window line ("AI search adoption doubled in 2025. Companies building visibility now will own their categories for 2-3 years. This window is closing.") in the WHY IT MATTERS section.

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
