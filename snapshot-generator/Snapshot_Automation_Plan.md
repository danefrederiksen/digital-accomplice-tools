# AI Visibility Snapshot — Automation Plan

**Date:** March 7, 2026
**Status:** Planning
**Owner:** Dane Frederiksen / Digital Accomplice

---

## 1. How It SHOULD Work (Target State)

### Input: 2 things from Dane
1. **Prospect name** (e.g., "Hinge Marketing")
2. **3 competitors** (e.g., "Rattleback, Jumpfactor, Edge Marketing")

That's it. Nothing else.

### What Claude Does (automatically)
1. **Company research** — Visits prospect's website, LinkedIn, learns their language, identifies their industry/category
2. **AI visibility queries** — Runs 20 standardized buyer-intent questions across ChatGPT, Perplexity, and Claude. Scores every answer for all 4 companies (prospect + 3 competitors)
3. **YouTube/video audit** — Searches YouTube for all 4 companies. Counts videos, checks subscribers, notes upload frequency, checks if any videos appear in AI answers
4. **LinkedIn video check** — Checks company pages for video content in recent posts
5. **Scoring** — Calculates AI visibility score (0-10) and video score (0-10) for all 4 companies
6. **Fills in all snapshot fields** — Maps research data to the 19-field form automatically
7. **Generates two deliverables:**
   - **AI Visibility Snapshot PDF** — The one-page branded report (letter-size)
   - **Research Methodology Document** — Every query run, every score, every source URL, how each number was calculated

### Output: 2 downloads
1. `{CompanyName}_AI_Snapshot.pdf` — The client-facing deliverable
2. `{CompanyName}_Snapshot_Methodology.pdf` — Internal doc showing the work

### Time: ~10-15 minutes of Claude working, zero effort from Dane

---

## 2. How It CURRENTLY Works

### Input: 19 manual fields from Dane
Dane has to fill in every field himself:

| # | Field | What Dane has to figure out manually |
|---|-------|--------------------------------------|
| 1 | Company name | Easy — he knows this |
| 2 | Industry | Has to categorize it |
| 3 | Report date | Easy |
| 4 | Competitor 1 | He picks these |
| 5 | Competitor 2 | He picks these |
| 6 | Competitor 3 | He picks these |
| 7 | AI Score — Company | Has to run queries, count mentions, do math |
| 8 | AI Score — Comp 1 | Same — for every competitor |
| 9 | AI Score — Comp 2 | Same |
| 10 | AI Score — Comp 3 | Same |
| 11 | Video Score — Company | Has to audit YouTube, count videos |
| 12 | Video Score — Comp 1 | Same — for every competitor |
| 13 | Video Score — Comp 2 | Same |
| 14 | Video Score — Comp 3 | Same |
| 15 | YouTube video count | Manual YouTube search |
| 16 | Videos in AI answers | Cross-reference AI results with YouTube |
| 17 | AI mentions (/20) | Count from query results |
| 18 | AI recommendations (/20) | Count from query results |
| 19 | Headline override (optional) | Write custom headline |

### The problem
Fields 7-18 require **hours of manual research**:
- Running 20+ AI queries across multiple platforms
- Visiting 4 YouTube channels
- Counting and scoring everything
- Doing math to normalize scores

The form is just a data entry tool. All the hard work happens before you even open it.

### What exists but isn't connected
- **Research methodology** — Fully documented (20 queries, scoring rubric, cross-model validation). Lives in `SKILL.md` and `QUICK-REFERENCE.md`. But it's a human-readable doc, not automated.
- **Snapshot generator** — Fully functional (form → live preview → PDF/JPG export). But requires all 19 fields pre-filled.
- **Export pipeline** — Works perfectly (HTML → Chrome headless → PDF or JPG). No changes needed.
- **Scoring rubric** — Defined (0-3 per query, normalized to 0-10). But calculated by hand.

### Current workflow (honest version)
1. Dane picks a prospect and competitors (~1 min)
2. Dane (or Claude in conversation) runs 20 AI queries manually (~30-45 min)
3. Dane audits YouTube for 4 companies (~20 min)
4. Dane does the math to calculate scores (~10 min)
5. Dane opens the form and types in 19 values (~5 min)
6. Dane clicks Export PDF (~5 seconds)
7. **Total: ~60-80 minutes per snapshot**

---

## 3. The Gap

| Capability | Target State | Current State | Gap |
|-----------|-------------|---------------|-----|
| Company research | Automatic (web search) | Manual | Claude does this via web search |
| AI visibility queries | 20 queries, auto-scored | Manual copy-paste | Claude runs queries, scores them |
| YouTube audit | Auto-search, count videos | Manual browsing | Claude searches YouTube via web |
| Score calculation | Automatic from raw data | Manual math | Simple code — scores from query results |
| Form fill | Automatic | Manual 19 fields | New API endpoint or direct HTML generation |
| PDF generation | Automatic | Works (click button) | Already done — just needs to be called programmatically |
| Methodology doc | Auto-generated from research log | Doesn't exist | New template + auto-fill from research data |
| End-to-end time | ~10-15 min (Claude working) | ~60-80 min (Dane working) | 75-85% time savings |

---

## 4. Step-by-Step Build Plan

### Step 1: Define the Query Set (Day 1)
**What:** Lock in the exact 20 queries Claude will run for every snapshot.
**Why:** Standardized queries = comparable results across prospects.
**Deliverable:** A JSON/config file with 20 query templates that accept `{company}`, `{competitor1}`, `{competitor2}`, `{competitor3}`, `{industry}` variables.

**The 20 queries (4 categories × 5 each):**

**Category A — Solution Discovery (5)**
1. "What are the best {industry} agencies/companies?"
2. "Who should I hire for {industry}?"
3. "Top {industry} firms for mid-market companies"
4. "Best {industry} companies 2026"
5. "{industry} agencies that specialize in B2B"

**Category B — Company-Specific (5)**
6. "What does {company} do?"
7. "Is {company} any good?"
8. "{company} reviews"
9. "{company} vs {competitor1}"
10. "{company} alternatives"

**Category C — Problem-Aware (5)**
11. "How do companies improve their {industry_problem}?"
12. "Do I need a {industry} agency or can I do it in-house?"
13. "What should I look for in a {industry} provider?"
14. "How much does {industry} cost?"
15. "Is {industry} worth the investment?"

**Category D — Video & Content (5)**
16. "Best YouTube channels about {industry}"
17. "{company} videos"
18. "Video marketing for {industry}"
19. "Who is creating good content about {industry}?"
20. "Expert video content in {industry_topic}"

**Status:** Queries exist in SKILL.md but need to be formalized into a reusable config.

---

### Step 2: Build the Research Engine (Day 1-2)
**What:** A structured workflow that Claude follows when given a prospect name + 3 competitors. Not code — a documented process that Claude executes using its existing tools (web search, web fetch).

**The workflow:**

```
INPUT: company_name, competitor_1, competitor_2, competitor_3

STEP 2a: Company Intel
  - Web search: "{company_name}" → get website, industry, what they do
  - Web search: "{company_name} LinkedIn" → company page info
  - Determine: industry category, core problem they solve, their language

STEP 2b: AI Visibility Queries (20 queries × 1 run each)
  - For each of 20 queries:
    - Substitute variables (company, competitors, industry)
    - Run query via Claude's own knowledge + web search
    - Score each company 0-3:
      - 0 = Absent (not mentioned)
      - 1 = Cited (URL only, not named in text)
      - 2 = Mentioned (named in a list)
      - 3 = Recommended (named as top choice or highlighted)
    - Log: query text, full response summary, scores for all 4 companies

STEP 2c: YouTube Audit (4 companies)
  - For each company:
    - Web search: "{company} YouTube channel"
    - Web search: "{company} site:youtube.com"
    - Collect: subscriber count, total videos, recent upload frequency
    - Check: did any videos appear in AI query answers? (cross-ref Step 2b)

STEP 2d: Score Calculation
  - AI Score per company: (sum of 20 query scores) / 60 × 10 = 0-10
  - Video Score per company: Based on YouTube presence (0-10 scale)
    - 0 = No channel
    - 1-2 = Channel exists, dormant (<5 videos/year)
    - 3-4 = Active but low traction
    - 5-6 = Regular uploads, moderate views
    - 7-8 = Consistent, good engagement
    - 9-10 = Strong channel, high engagement, multiple formats

STEP 2e: Compile Results
  - Map to 19 form fields
  - Generate headline (auto-logic already exists)
  - Package for Step 3
```

**Status:** This workflow exists conceptually in SKILL.md. Needs to be formalized as a repeatable Claude instruction set.

---

### Step 3: Build the Methodology Document Template (Day 2)
**What:** An HTML template for the methodology/research doc that auto-fills from research data.

**Sections:**
1. **Header** — "AI Visibility Snapshot — Research Methodology" + company name + date
2. **Scope** — What was measured, which companies, which AI platforms
3. **Query Log** — Table: Query # | Query Text | Company Scores (0-3 each) | Notes
4. **Score Summary** — How raw scores became the 0-10 final scores (show the math)
5. **YouTube Audit** — Table: Company | Channel URL | Subscribers | Total Videos | Upload Frequency | Videos in AI Answers
6. **Key Findings** — Auto-generated bullets from the data (who's winning, biggest gaps)
7. **Sources** — Every URL visited during research
8. **Methodology Notes** — "20 queries run through [platforms]. Scored 0-3. Normalized to 0-10."

**Deliverable:** An HTML template (like the snapshot template) that takes research data as input and generates a printable methodology PDF.

**Status:** Does not exist yet. Needs to be built from scratch.

---

### Step 4: Build the Automation Endpoint (Day 2-3)
**What:** A new server endpoint that accepts minimal input and returns completed snapshot + methodology PDFs.

**New endpoint:** `POST /api/generate-snapshot`

**Input:**
```json
{
  "companyName": "Hinge Marketing",
  "competitors": ["Rattleback", "Jumpfactor", "Edge Marketing"]
}
```

**What it does:**
1. Receives the request
2. Returns a "research in progress" status
3. Claude (via the skill/agent) does all 20 queries + YouTube audit
4. Fills in all 19 data fields from research
5. Generates snapshot HTML using existing `buildSnapshotHTML()` logic
6. Generates methodology HTML using new template
7. Exports both to PDF via Chrome headless
8. Returns download links for both PDFs

**Alternative approach (simpler):** Skip the endpoint entirely. Instead:
- Dane tells Claude "snapshot Hinge Marketing, competitors: Rattleback, Jumpfactor, Edge"
- Claude runs the research workflow (Step 2)
- Claude fills in the form fields via the browser or generates the HTML directly
- Claude calls the existing export endpoint
- Claude generates the methodology doc separately
- Both PDFs download automatically

**This simpler approach requires zero new code** — just a well-defined Claude skill/workflow.

**Status:** Endpoint doesn't exist. But the simpler approach (Claude-driven) could work today with a good prompt.

---

### Step 5: Create the Snapshot Skill (Day 3)
**What:** A Claude Code skill that Dane triggers with a simple command, and Claude executes the entire pipeline.

**Trigger:** Dane says "snapshot {company}, competitors: {comp1}, {comp2}, {comp3}"

**What the skill does:**
1. Parses company name and competitors
2. Runs Step 2 (research engine) — web searches, AI queries, YouTube audit
3. Calculates all scores
4. Builds snapshot HTML (reuses existing buildSnapshotHTML logic or calls the form)
5. Builds methodology HTML (new template from Step 3)
6. Exports both as PDFs to `/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/`
7. Names them:
   - `{CompanyName}_AI_Snapshot_{date}.pdf`
   - `{CompanyName}_Snapshot_Methodology_{date}.pdf`
8. Tells Dane they're done and where to find them

**Status:** Skill framework exists (ai-snapshot-agent). Needs to be updated with this specific automation flow.

---

### Step 6: Test with Hinge (Day 3)
**What:** Run the full automated pipeline on Hinge Marketing (existing data for comparison).

**Success criteria:**
- Scores match or are close to the manually-researched Hinge pilot (AI: 7.0, Video: 0)
- PDF looks identical to the existing Hinge snapshot
- Methodology doc is complete and accurate
- Total time: under 15 minutes
- Zero manual input beyond "snapshot Hinge, competitors: Rattleback, Jumpfactor, Edge"

---

### Step 7: Run on a Fresh Prospect (Day 4)
**What:** Test on a company that hasn't been researched before.

**Why:** Hinge has existing data — a fresh prospect proves the system works cold.

**Pick a real prospect from the pipeline** and run it end-to-end.

---

### Step 8: Refine and Lock In (Day 4)
**What:** Fix anything that broke in Steps 6-7. Adjust query templates, scoring calibration, or template formatting based on real results.

**Deliverable:** Final, tested, repeatable snapshot automation that Dane can trigger with one sentence.

---

## 5. What Doesn't Need to Change

These pieces are already done and working:

- **Snapshot HTML template** — The one-page PDF design is locked in. Brand colors, layout, bar charts, CTA — all good.
- **Export pipeline** — Chrome headless → PDF/JPG works perfectly. No changes needed.
- **DM infographic generator** — Separate tool, works independently. Can be auto-filled from the same research data later.
- **Server infrastructure** — Express on port 3850. Stable.
- **Brand guidelines** — Colors, fonts, voice — all documented and enforced.

---

## 6. Build Priority

| Step | What | Effort | Depends On |
|------|------|--------|------------|
| 1 | Define query set | Small (1 hr) | Nothing |
| 2 | Build research engine workflow | Medium (2-3 hrs) | Step 1 |
| 3 | Build methodology doc template | Medium (2-3 hrs) | Nothing |
| 4 | Build automation endpoint (or skip — use skill instead) | Small-Medium | Steps 1-3 |
| 5 | Create/update snapshot skill | Small (1 hr) | Steps 1-4 |
| 6 | Test with Hinge | Small (30 min) | Step 5 |
| 7 | Test with fresh prospect | Small (30 min) | Step 6 |
| 8 | Refine and lock in | Small (1-2 hrs) | Step 7 |

**Total estimated effort:** 1-2 sessions (half day to full day of Claude work)

**Recommended approach:** Steps 1 + 3 can run in parallel. Step 4 can be skipped entirely if the skill-based approach (Step 5) works — which it likely will, and it's simpler.

---

## 7. The One-Sentence Version

**Today:** Dane manually researches for an hour, fills in 19 fields, clicks Export.
**Tomorrow:** Dane says "snapshot Hinge, competitors: Rattleback, Jumpfactor, Edge" and gets two PDFs back in 15 minutes.
