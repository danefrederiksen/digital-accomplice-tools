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
6. **Every claim must be defensible.** If Dane is asked "how do you know that?" on a call, the methodology must provide a clear answer. See "Video Citation Verification" in Step 3.
7. **Every recommendation must have a rationale.** If Dane is asked "why did you recommend that?" the internal reasoning must be documented. See "Recommendation Reasoning Framework" in Step 7.

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
- **Most-cited content** — identify the prospect's strongest published research, reports, or thought leadership (this feeds the Quick Win recommendation)

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
  "video_cited": "[REQUIRED: for each company, note whether any video URL (YouTube, Vimeo, etc.) appeared in the AI response. Format: {company: false, comp1: false, comp2: false, comp3: false}]",
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

### Video Citation Verification (REQUIRED — this is how we defend the "0 videos cited" claim)

**Process:**
1. During Step 2, for every query result, check whether ANY video URL (YouTube, Vimeo, Wistia, etc.) appears in the AI response — in citations, links, embeds, or source lists.
2. Cross-reference: For each company, compare the video URLs found in Step 2 against their known YouTube channel URL from this step.
3. Count: `videosInAI` = the number of unique video URLs from the target company that appeared in any AI response across all 20 queries and all 4 platforms.

**What "0/[N] videos cited" means:**
- Across all 80 data points (20 queries × 4 platforms), zero AI answers linked to, embedded, or cited any video from that company.
- The [N] is the company's public YouTube video count, included to show the gap between production and AI visibility.

**What it does NOT mean:**
- It does NOT mean AI has never cited their videos in any query ever.
- It does NOT mean their videos are permanently invisible to AI models.
- Brand-name searches (e.g., "[Company] explainer video") might surface video results — but we test buyer-intent queries because those drive pipeline.

**Why this methodology is defensible:**
- 20 queries × 4 platforms = 80 data points — a meaningful sample of buyer-intent query space.
- We check ALL content formats in responses, not just main text.
- The methodology footnote on every snapshot discloses the scope: "AI answers change; we document the pattern, not a guarantee."

**Strengthening the claim:** When possible, add "across 20 buyer-intent queries" directly next to the 0/[N] stat in the snapshot body, not just in the footnote.

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
videosInAI = how many of those videos appeared in AI query results (from Step 3 verification)
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
    "quickWinRationale": "Maps to Actions 1+2. [Company]'s [specific research/content] already gets cited as text. A video answering the same query gives AI a video URL to attach to existing authority.",
    "quickWinTheory": "If AI already cites text on this topic, adding video+transcript should produce video citation within 30-90 days.",
    "nextMove": "Create a 4-video series from your top support queries and optimize descriptions for AI citation.",
    "nextMoveRationale": "Maps to Actions 3+4+5. Citations driven by cornerstone content. Videos presenting same findings inherit trust. Covers major pillars.",
    "nextMoveTheory": "Should expand video citation from 0 queries to 3-6 queries within 90 days.",
    "fullPlay": "Build a monthly video program that positions [Company] as the go-to expert AI models cite in your category.",
    "fullPlayRationale": "Maps to all 6 Actions. No competitor has video cited. First mover locks category. Monthly cadence compounds in model weights.",
    "fullPlayTheory": "Should produce video citations in 25-50% of buyer queries within 6-12 months."
  },

  "[NEW] effortLevel": "Low — one 3-minute video + transcript, no production required.",

  "queries": [
    {"id": 1, "query": "What are the best...", "scores": [3, 1, 0, 0], "notes": "Hinge recommended first", "video_cited": {"target": false, "comp1": false, "comp2": false, "comp3": false}, "verbatim_response": "[full text for top 3 queries]"},
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
8. **RECOMMENDATION** — 3-tier: Quick Win (this week), Next Move (this month), Full Play (this quarter). Each MUST map to at least one of the 6 Actions from the snapshot-generator framework. Internal rationale and testable theory MUST be documented in the data object even though they don't appear on the one-pager.
9. **EFFORT LEVEL** — One line: Low/Medium/High + brief context. Match to Quick Win. Never quote prices.
10. **NEXT STEP** — 15-minute call CTA. No pitch. Calendly link.

### Recommendation Reasoning Framework

When building the 3-tier recommendation, follow this process:

**For the Quick Win:**
1. Identify the prospect's most-cited content from the query data (which topics scored highest?)
2. Check if they have existing videos on those topics (from Step 3)
3. If yes → recommend optimizing those videos (Actions 2, 4)
4. If no → recommend recording a new video on their #1 cited topic (Actions 1, 2)
5. Title the Quick Win as the exact buyer question from the query data
6. **Rationale:** The authority already exists in text form. Adding video gives AI models a video URL to attach to existing authority. This is the lowest-effort path to a first video citation.
7. **Testable theory:** Re-run the same 20 queries after 60 days. If video+transcript is published, the video should appear in at least 1-3 AI answers.

**For the Next Move:**
1. Identify the prospect's top 3-5 content pillars from the query data
2. Map each pillar to a video topic, titled as a buyer question
3. Recommend a series covering these pillars
4. **Rationale:** Citations are driven by cornerstone content. Videos presenting the same findings inherit trust. "Optimized for AI citation" = question-as-title, answer in first 30 seconds, full transcript, structured YouTube description.
5. **Testable theory:** A structured series should expand video citation from 0 to 3-6 queries within 90 days.

**For the Full Play:**
1. Check competitor video status from Step 3
2. If no competitor has video cited → frame as first-mover opportunity
3. If a competitor does → frame as catch-up urgency
4. **Rationale:** Monthly cadence builds a compound library. AI training data reinforces early movers over time. First to build structured video content in a category locks it for 2-3 years.
5. **Testable theory:** Video citations in 25-50% of buyer queries within 6-12 months. Track with quarterly re-runs.

**Honest limitation (document internally, don't print):**
No guaranteed playbook for AI citation exists. These recommendations are based on how AI models index content: structured text, direct query matching, authority signals. It's the best available strategy, not a certainty.

---

## STEP 8: Quality Checks

Before reporting done, verify:

- [ ] All 4 companies have AI scores calculated from actual query data
- [ ] YouTube data was verified via web search (not training data)
- [ ] Video citation verification completed per Step 3 methodology
- [ ] "0 videos cited" claim is defensible per the documented methodology
- [ ] Mentions and recommended counts match the query log
- [ ] Key findings reference actual numbers from the research
- [ ] No fabricated statistics or unverified claims
- [ ] WHAT AI SAYS includes 2+ verbatim quotes with source model noted
- [ ] Competitor comparison grid complete for all platforms tested
- [ ] Video status line (Active/Sporadic/Absent) for all companies
- [ ] 3-tier recommendation: Quick Win + Next Move + Full Play
- [ ] Each recommendation maps to at least one of the 6 Actions
- [ ] Internal rationale and testable theory documented for each tier
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

**"A competitor DOES have video cited"**
Document which videos, on which queries, from which platform. This changes the Full Play framing from "first mover" to "catch up" — and makes urgency even higher.

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
