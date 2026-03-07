---
name: ai-snapshot-agent
description: "Agent instructions for producing an AI Visibility & Video Competitive Snapshot for a B2B company. Use this skill whenever Dane asks to run a snapshot, build a competitive report, research a prospect's AI visibility, check how a company ranks in AI search, or prepare a snapshot for outreach. Also trigger when Dane names a company and says 'run it,' 'check them,' 'snapshot,' 'how do they show up in AI,' or 'build a report for [company].' This skill covers the full research workflow: prompt generation, multi-model querying, scoring, video analysis, cross-model validation, and report assembly."
---

# AI Visibility & Video Competitive Snapshot — Agent Instructions

## Purpose

Produce a verifiable, CEO-grade competitive report showing how a target company ranks against 3 competitors in AI search results and video presence. The output must pass the 60-second busy-person test and withstand executive scrutiny.

## Core Principles

1. **Never fabricate data.** Every claim must come from an actual query you ran or a public source you checked. If you can't verify it, don't include it.
2. **ALWAYS use live web search for verification.** Never rely on training data to determine whether a company has video content, a YouTube channel, website pages, or any other online presence. You MUST perform a real-time web search (e.g., `[Company Name] YouTube channel`, `site:youtube.com [Company Name]`) before making any claim about what a company does or doesn't have. Training data is stale — the web is current.
3. **Document everything.** Date, time, model, exact prompt, exact result. No exceptions.
4. **Be honest about variance.** AI answers change. Report consistency patterns, not cherry-picked results.
5. **Speed over perfection for cold outreach.** Use Lite mode. Save Full mode for warm prospects.
6. **The report sells the meeting, not the service.** Recommendations should be specific but the CTA is always a 15-minute call.

---

## Before You Start: Gather Inputs

Ask Dane for (or extract from conversation):

| Input | Required? | Example |
|-------|-----------|---------|
| Target company name | YES | "BreachRX" |
| Target company website | YES | "breachrx.com" |
| Industry vertical | YES | "Cybersecurity" or "Professional Services" |
| 3 competitors | YES — confirm with Dane, never assume | "Resilience, Cobalt, Coalition" |
| Mode | YES — ask if not stated | "Lite" (cold outreach) or "Full" (warm prospect) |
| Contact name + title | NICE TO HAVE | "Young Sae Song, CEO" |

**If Dane says "run a snapshot on [Company]" without specifying competitors**, research the company first, propose 3 competitors, and get confirmation before proceeding.

---

## Mode Definitions

### Lite Mode (Cold Outreach)
- 1 query run (not 3)
- 2 models: ChatGPT + Perplexity
- 10 prompts (Categories 1-4 only, 2-3 per category)
- No video-specific prompts
- Target time: **60 minutes total**
- Note in report: "Single-run snapshot — full validation available on request"

### Full Mode (Warm Prospect / Referral Partner)
- 3 query runs over 3 days
- 4 models: ChatGPT, Perplexity, Gemini, Claude
- 15 prompts (all 5 categories)
- 5 additional video-specific prompts
- Target time: **3.5 hours spread over 3 days**
- Includes cross-model agreement analysis and consistency scoring

---

## Step 1: Generate the Prompt Set

Build prompts from these 5 categories. Customize [bracketed terms] for the target company's industry.

### Category 1: Solution Discovery (3 prompts)
```
1. "What are the best [CATEGORY] solutions for mid-market companies?"
2. "What [CATEGORY] tools do companies with 200-500 employees use?"
3. "Recommend a [CATEGORY] vendor for a growing company"
```

### Category 2: Comparison / Evaluation (3 prompts)
```
4. "[TARGET COMPANY] vs [COMPETITOR A] — which is better?"
5. "What are the pros and cons of [TARGET COMPANY]?"
6. "Alternatives to [MOST WELL-KNOWN COMPETITOR]"
```

### Category 3: Problem-Aware (3 prompts)
```
7. "How do mid-size companies solve [CORE PROBLEM THE CATEGORY ADDRESSES]?"
8. "What should I look for in a [CATEGORY] provider?"
9. "Is it worth hiring a [CATEGORY] agency or building in-house?"
```

### Category 4: Brand-Specific (3 prompts)
```
10. "What does [TARGET COMPANY] do?"
11. "Is [TARGET COMPANY] any good?"
12. "Tell me about [TARGET COMPANY]'s services"
```

### Category 5: Thought Leadership (3 prompts) — FULL MODE ONLY
```
13. "Who are the leading experts in [INDUSTRY TOPIC]?"
14. "What companies are doing innovative work in [CATEGORY]?"
15. "What YouTube channels cover [INDUSTRY TOPIC]?"
```

### Video-Specific Prompts (5 additional) — FULL MODE ONLY
```
V1. "What YouTube channels cover [INDUSTRY TOPIC]?"
V2. "Best video content about [CATEGORY]?"
V3. "Where can I watch demos of [CATEGORY] tools?"
V4. "[TARGET COMPANY] demo video"
V5. "[TARGET COMPANY] YouTube"
```

### Prompt Rules
- Use natural buyer language, not keyword stuffing
- No leading questions
- Write them how an actual marketing manager would type into ChatGPT
- Save the final prompt list — you'll reuse it for every run

---

## Step 2: Run the Queries

### For Each Query, Open a NEW Conversation in Each AI Model

Do NOT continue an existing conversation. Each prompt gets a fresh session.

### Models & Access

| Model | URL | Notes |
|-------|-----|-------|
| ChatGPT (GPT-4o) | chat.openai.com | Use default model, no custom instructions |
| Perplexity | perplexity.ai | Best for citation tracking — note all source URLs |
| Google Gemini | gemini.google.com | FULL MODE ONLY |
| Claude | claude.ai | FULL MODE ONLY — use a separate session, not this one |

### Recording Protocol

For EVERY query, record in the tracking sheet:

```
Run ID:          [1, 2, or 3]
Date:            [YYYY-MM-DD]
Time:            [HH:MM PT]
Model:           [ChatGPT / Perplexity / Gemini / Claude]
Prompt ID:       [1-15 or V1-V5]
Prompt Text:     [exact text entered]
---
Target Company:  [Mentioned? Y/N] [Type: Recommended / Mentioned / Cited / Absent]
Competitor A:    [Mentioned? Y/N] [Type]
Competitor B:    [Mentioned? Y/N] [Type]
Competitor C:    [Mentioned? Y/N] [Type]
---
Position:        [1st, 2nd, 3rd mentioned, or N/A]
Sentiment:       [Positive / Neutral / Negative / N/A]
Sources Cited:   [URLs if any]
Video Cited?:    [Y/N — note if YouTube or video content referenced]
Factually Accurate?: [Y/N/Partial — does AI describe the company correctly?]
---
Screenshot:      [filename.png]
Notes:           [anything unusual, hallucinations, outdated info]
```

### Screenshot Protocol
- Full-page screenshot of every response
- Filename format: `Run[X]_[Model]_P[PromptID]_[YYYY-MM-DD].png`
- Store in Google Drive folder: `DA Snapshots / [Company Name] / Screenshots`

### Run Timing (Full Mode Only)
- Run 1: Day 1
- Run 2: Day 2 (at least 24 hours later)
- Run 3: Day 3 (at least 24 hours after Run 2)
- Same device, same location, same accounts each time

---

## Step 3: Score the Results

### Per-Query Score

| Score | Meaning | Definition |
|-------|---------|------------|
| 3 | **Recommended** | Named as a top choice, explicitly suggested, or positioned as a leader |
| 2 | **Mentioned** | Included in a list or discussed as an option |
| 1 | **Cited** | Source URL appeared in citations but company not named in answer text |
| 0 | **Absent** | Not mentioned at all |

### Per-Model Score (per company)

```
Raw score = sum of all prompt scores (0-45 for 15 prompts, 0-30 for 10 prompts)
Normalized score = (raw / max possible) × 10, rounded to 1 decimal
```

Example: Company gets scores of 0,0,2,0,0,3,0,0,0,2 on 10 prompts = 7 raw → (7/30) × 10 = **2.3/10**

### Overall AI Visibility Score

```
Average of all model scores = final score (0-10)
```

Lite mode: average of 2 models. Full mode: average of 4 models.

### Consistency Score (Full Mode Only)

For each prompt × model combination, compare across 3 runs:
- **Consistent** = same mention type (Recommended/Mentioned/Cited/Absent) all 3 runs
- **Variable** = different results across runs

```
Consistency % = (consistent combos / total combos) × 100
```

Report this number. It IS the credibility metric.

- **80%+ consistent**: High confidence. Lead with these findings.
- **60-79% consistent**: Moderate confidence. Report findings but note variance.
- **Below 60%**: AI hasn't formed a strong opinion. Frame as: "This is your window — the market position is still being written."

---

## Step 4: Cross-Model Agreement (Full Mode Only)

For each prompt, check how many models agree:

| Level | Definition | How to Use |
|-------|-----------|------------|
| **Strong** (4/4) | All models same result | Lead with this. Highest confidence. |
| **Moderate** (3/4) | Three agree, one outlier | Solid finding. Note the outlier model. |
| **Split** (2/2) | Even split | Inconclusive. Report both sides honestly. |
| **Weak** (1/4) | Only one model shows it | Do NOT lead with this. Mention as secondary. |

### What to Write in the Report

Use this language pattern:
- Strong: "[Company] was absent from AI results with strong cross-model agreement (4/4 platforms) on X of 15 buyer queries."
- Moderate: "3 of 4 AI platforms recommend [Competitor B] when buyers ask about [topic]."
- Split: "AI platforms disagree on [topic] — ChatGPT favors [A], Perplexity favors [B]. This category is still contested."

---

## Step 5: Accuracy Verification

For each company mentioned by AI, verify:

### Factual Check
| Check | Pass/Fail |
|-------|-----------|
| Correctly describes what the company does | |
| Products/services mentioned are real and current | |
| Pricing (if mentioned) is accurate | |
| Company size/stage described correctly | |
| No hallucinated acquisitions, partnerships, or awards | |

### Citation Check (Perplexity primarily)
| Check | Pass/Fail |
|-------|-----------|
| Cited URLs actually exist (not 404) | |
| Cited pages actually support the claim | |
| Sources are recent (within 12 months) | |

**If AI gets facts wrong about the target company, flag this prominently.** It's a selling point — they need to fix their content so AI represents them accurately.

---

## Step 6: Video Presence Research

> **CRITICAL: USE WEB SEARCH FOR EVERY CLAIM IN THIS SECTION.**
> Before stating that a company has or doesn't have a YouTube channel, videos, or website video content, you MUST run a live web search to verify. Do NOT rely on your training data — it is often wrong or outdated about specific company assets.
> - Search: `[Company Name] YouTube channel` or `site:youtube.com [Company Name]`
> - Search: `[Company Name] video` or `[Company Name] demo video`
> - Visit the actual YouTube channel URL if found
> - If you cannot verify via web search, state "Unable to verify — manual check required" instead of guessing.

### YouTube Channel Data (all 4 companies)

Collect from public YouTube channel pages (verify via live web search first):

| Metric | How to Find |
|--------|-------------|
| Subscribers | Channel main page |
| Total videos | Channel > Videos tab |
| Videos last 90 days | Count videos uploaded in last 90 days |
| Avg views (last 10 videos) | Add views of 10 most recent, divide by 10 |
| Most viewed video | Channel > Videos > Sort by Popular |
| Last upload date | Most recent video date |
| Content types | Categorize last 20 titles: Demo, Thought Leadership, Customer Story, Tutorial, Event, Other |
| Avg video length | Short (<2min), Medium (2-10min), Long (>10min) — based on last 10 |

### Website Video Check (all 4 companies)

Visit each page and note:

| Page | Has Video? | Type | Quality |
|------|-----------|------|---------|
| Homepage | Y/N | Explainer / Hero / Testimonial / None | Pro / DIY / Stock |
| Product/Service pages | Y/N | Demo / Overview / None | |
| About page | Y/N | Culture / Founder / None | |
| Blog/Resources | Y/N | Embedded / Standalone / None | |
| Case Studies | Y/N | Customer story / Results / None | |

### Video in AI Citations

From your Step 2 data, extract:
- How many AI responses cited YouTube or video content from any company?
- Which company's video content appeared most?
- Which AI model cited video most frequently?

---

## Step 7: Assemble the Report

Use the DA report template (ai-visibility-report-template.docx).

### Section-by-Section Instructions

**Cover Page**
- Company name, date, 3 competitors listed
- Dane Frederiksen / Digital Accomplice branding

**Executive Summary**
- Write "The Bottom Line" — 1-2 sentences, plain language, the verdict
- Fill in the scorecard table with actual normalized scores
- Color code: 0-3 = red, 4-6 = yellow, 7-10 = green

**AI Search Visibility Analysis**
- State methodology: X prompts, X models, X runs, date range
- Fill in per-platform results tables
- Write "Key Finding" — what does AI say about this company? What does it get wrong?

**Video Presence Analysis**
- Fill YouTube comparison table with actual numbers
- Fill website video usage table
- State video citation findings

**Gap Analysis**
- Identify the 3 biggest gaps between target company and best-performing competitor
- Each gap must be: specific, evidence-backed, and tied to business impact
- Bad: "You need more videos." 
- Good: "You have 4 YouTube videos, last posted 8 months ago. Competitor B has 47 and posts weekly. Their content was cited in 6 of 15 AI queries we tested. Yours was cited in zero."

**Recommendations**
- 3 specific actions ranked by speed-to-results
- Each must include: what to do, what gap it closes, timeline (30/60/90 days), investment range
- At least 1 recommendation should naturally lead to DA's video production services
- But never make the rec feel forced — if video isn't the answer, say so

**Next Step**
- 15-minute strategy call
- Calendly link: [INSERT DANE'S CALENDLY]
- "No pitch. No pressure. If the data doesn't warrant a conversation, we'll tell you."

**Appendix**
- List all data sources
- State: "AI answers are non-deterministic — results may vary by session, location, and date. We document consistency patterns, not guarantees."
- Offer screenshots on request

---

## Quality Checks Before Sending

Run these before every report goes out:

### The 60-Second Test
Hand the report to someone unfamiliar with it. Can they tell you in 60 seconds:
1. Who wins and who loses?
2. What's the single biggest finding?
3. What the next step is?

If no → rewrite the executive summary.

### The CEO Scrutiny Checklist
- [ ] Every score is backed by documented data
- [ ] Screenshots exist for all claims
- [ ] Competitors were confirmed (not assumed)
- [ ] Methodology section is clear and reproducible
- [ ] Non-determinism is acknowledged
- [ ] Recommendations are specific, not generic
- [ ] Investment ranges are included (don't dodge cost)
- [ ] The report is forwardable — would a marketing manager send this to their boss?
- [ ] No made-up statistics or unverified claims
- [ ] Calendly link works

### The Honesty Check
- [ ] If the target company is actually doing well, does the report say so?
- [ ] If a competitor is weak, is the language fair (not trash-talking)?
- [ ] If results are inconsistent, is that transparently stated?
- [ ] Does anything in this report require information we don't actually have?

---

## Tracking Sheet Template

Create a Google Sheet with these tabs:

### Tab 1: Prompts
| Prompt ID | Category | Prompt Text | Vertical |

### Tab 2: Raw Data
| Run ID | Date | Time | Model | Prompt ID | Target Mentioned | Target Type | Comp A Mentioned | Comp A Type | Comp B Mentioned | Comp B Type | Comp C Mentioned | Comp C Type | Position | Sentiment | Sources | Video Cited | Accurate | Screenshot | Notes |

### Tab 3: Scores
| Company | ChatGPT Raw | ChatGPT /10 | Perplexity Raw | Perplexity /10 | Gemini Raw | Gemini /10 | Claude Raw | Claude /10 | Overall /10 |

### Tab 4: Consistency (Full Mode)
| Prompt ID | Model | Run 1 Result | Run 2 Result | Run 3 Result | Consistent? |

### Tab 5: Cross-Model Agreement (Full Mode)
| Prompt ID | ChatGPT | Perplexity | Gemini | Claude | Agreement Level |

### Tab 6: Video Data
| Company | Subscribers | Total Videos | Last 90 Days | Avg Views | Last Upload | Homepage Video | Product Video | About Video | Blog Video | Case Study Video |

---

## Verified Stats for Reports

Use these in the "Why This Matters Now" section. All previously verified:

- AI search traffic converts **5-6x** higher than Google organic
- YouTube is the **#1 LLM social citation source** (16% of AI answers)
- **73%** of YouTube AI citations come from third-party content
- AI Overviews YouTube citations up **25%** since January 2026 (BrightEdge Q1 2026)
- Wyzowl 2026: **87%** of marketers say video increased sales (NOT 83% — that's the old number)

**Do NOT use:**
- "60% of AI citations come from YouTube" — this is debunked
- Any stat you can't trace to a named source

---

## Automation Opportunities (Future)

These are manual today but could be automated:

1. **Perplexity API** — batch-run prompts and capture citations programmatically
2. **Claude API** — same, with structured output for scoring
3. **YouTube Data API** — pull channel stats automatically
4. **Google Sheets API** — auto-populate tracking sheet from API results
5. **Report generation script** — fill template from tracking sheet data

Priority: Automate the query runs first. That's where 60% of the time goes.

---

## Common Edge Cases

**"The company has no YouTube channel"**
You MUST verify this via live web search before claiming it. Search `[Company Name] YouTube` and `site:youtube.com [Company Name]`. Only if the search returns no results should you score video presence as 0. Note it explicitly: "No YouTube channel found (verified via web search [date])." This is a finding, not an error.

**"AI hallucinates a product that doesn't exist"**
Document it. Include it in the accuracy section. It's a selling point — the prospect needs to fix their content.

**"All 4 companies are invisible in AI search"**
This happens in niche categories. Frame it as opportunity: "The first company to build AI-visible content in this category will own the space."

**"The prospect is actually winning"**
Say so. Recommend they protect their position. Suggest competitive monitoring as an ongoing service. Honesty builds more trust than forced bad news.

**"Dane says 'just run a quick one'"**
That's Lite mode. Don't over-engineer it. 60 minutes, 2 models, 10 prompts, ship it.
