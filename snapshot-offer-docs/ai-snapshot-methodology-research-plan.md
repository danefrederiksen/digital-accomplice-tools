# AI Visibility Snapshot: Research Methodology & Validation Plan

## The Problem We're Solving

AI answers are non-deterministic. If we're going to send a report to a CEO saying "you're invisible in AI search," we need to prove it holds up under scrutiny. That means:

- Same prompts, multiple runs, documented variance
- Cross-model agreement (or documented disagreement)
- Transparent methodology anyone could reproduce
- Honest about what this can and can't tell you

---

## Phase 1: Build the Prompt Set (Do This Once, Reuse Forever)

### Goal
Create a standardized bank of 15 buyer-intent prompts per industry vertical, starting with Cybersecurity and Professional Services.

### Prompt Categories (3 prompts each × 5 categories = 15)

**Category 1: Solution Discovery**
- "What are the best [category] solutions for mid-market companies?"
- "What [category] tools do companies with 200-500 employees use?"
- "Recommend a [category] vendor for a company our size"

**Category 2: Comparison / Evaluation**
- "[Company] vs [Competitor] — which is better?"
- "What are the pros and cons of [Company]?"
- "Alternatives to [well-known competitor in space]"

**Category 3: Problem-Aware (pre-purchase)**
- "How do mid-size companies solve [core problem]?"
- "What should I look for in a [category] provider?"
- "Is it worth hiring a [category] agency or doing it in-house?"

**Category 4: Brand-Specific**
- "What does [Company Name] do?"
- "Is [Company Name] any good?"
- "Tell me about [Company Name]'s services"

**Category 5: Thought Leadership / Expertise**
- "Who are the leading experts in [industry topic]?"
- "What companies are doing innovative work in [category]?"
- "What YouTube channels cover [industry topic]?"

### Rules for Writing Prompts
- Use natural language, not keyword stuffing
- Write them how an actual buyer would type/speak
- No leading questions ("Isn't [Company] great at...")
- Include the prospect's actual company name in Category 4
- Customize Categories 1-3 and 5 for the industry, not the company

### Deliverable
A Google Sheet with columns: Prompt ID | Category | Prompt Text | Vertical | Last Updated

---

## Phase 2: The Test Protocol

### Models to Test
| Model | Access Method | Why Include It |
|-------|-------------|----------------|
| ChatGPT (GPT-4o) | chat.openai.com | Largest user base, most buyer usage |
| Perplexity | perplexity.ai | Cites sources explicitly, growing fast |
| Google Gemini | gemini.google.com | Tied to Google ecosystem, AI Overviews |
| Claude | claude.ai | Growing market share, different training data |

### Run Protocol

**Per snapshot (per company):**

1. Run all 15 prompts on all 4 models = 60 queries
2. Repeat the full set **3 times over 3 different days** = 180 queries total
3. Space runs at least 24 hours apart
4. Use the same account, same location (Oakland, CA), same device
5. Clear conversation history / start new session before each run
6. No follow-up prompts — first response only

**What to record for each query:**

| Field | Description |
|-------|------------|
| Run ID | Run 1, 2, or 3 |
| Date | YYYY-MM-DD |
| Time | HH:MM local |
| Model | ChatGPT / Perplexity / Gemini / Claude |
| Prompt ID | From prompt bank |
| Prompt Text | Exact text entered |
| Target Company Mentioned? | Yes / No |
| Mention Type | Recommended / Mentioned / Cited source only / Absent |
| Position | 1st, 2nd, 3rd mentioned, or N/A |
| Competitor A Mentioned? | Yes / No + type |
| Competitor B Mentioned? | Yes / No + type |
| Competitor C Mentioned? | Yes / No + type |
| Sentiment | Positive / Neutral / Negative / N/A |
| Sources Cited | URLs if any (Perplexity and Gemini mainly) |
| Video Content Cited? | Yes / No — note if YouTube/video was referenced |
| Screenshot Taken? | Yes (filename) |
| Notes | Anything unusual |

### Screenshot Protocol
- Full-page screenshot of every response
- File naming: `[RunID]_[Model]_[PromptID]_[Date].png`
- Store in a dedicated Google Drive folder per company
- These are your receipts if a CEO questions the data

---

## Phase 3: Scoring System

### Per-Query Score (0-3 scale)
| Score | Meaning |
|-------|---------|
| 3 | Recommended (named as a top choice or explicitly suggested) |
| 2 | Mentioned (included in a list or discussion) |
| 1 | Cited (source URL appeared but company not named in answer text) |
| 0 | Absent (not mentioned at all) |

### Per-Model Score (per company)
- Sum of all 15 prompt scores = 0-45 possible
- Normalize to 0-10 scale: (raw score / 45) × 10, rounded to 1 decimal

### Overall AI Visibility Score
- Average of all 4 model scores = 0-10
- Weight equally unless you have data showing buyer preference for a specific model (then adjust)

### Consistency Score (new — this is your credibility differentiator)
- For each prompt × model combo, compare across 3 runs
- **Consistent** = same mention type all 3 runs
- **Variable** = different results across runs
- Report: "X% of queries returned consistent results across 3 runs"
- If consistency is below 60%, flag it. That's a real finding — it means AI hasn't formed a strong opinion about this company yet.

---

## Phase 4: Cross-Model Agreement Analysis

This is where you prove (or disprove) that the findings are real, not model-specific noise.

### Agreement Matrix
For each prompt, check: do models agree?

| Agreement Level | Definition | What It Means |
|----------------|-----------|---------------|
| Strong agreement | 4/4 models same result | High confidence finding |
| Moderate agreement | 3/4 models same result | Solid finding, note the outlier |
| Split | 2/2 split | Inconclusive — report both sides |
| Weak agreement | Only 1/4 models shows result | Low confidence, don't lead with this |

### What to Report
- "Across 15 prompts, [Company] was absent from AI results with strong agreement (4/4 models) on X prompts"
- "Competitor B was recommended with strong agreement on Y prompts"
- "Z prompts showed split results — AI hasn't formed consensus here yet"

### Honesty Clause
If cross-model agreement is low overall, say so. "AI search is still forming opinions in this category. That's actually your window — the companies building content now will train these models to recommend them."

---

## Phase 5: Accuracy Verification

### The Hard Truth
There is no "ground truth" for AI visibility. You can't compare to a known-correct answer. But you CAN verify:

**Factual Accuracy Check (per company)**
- Does the AI correctly describe what the company does?
- Are the products/services mentioned accurate?
- Is pricing (if mentioned) current?
- Are any claims outdated or wrong?

Score: Accurate / Partially Accurate / Inaccurate / N/A

**Citation Accuracy Check (Perplexity mainly)**
- Do cited URLs actually exist?
- Do they actually support the claim?
- Are they recent (within 12 months)?

Score: Valid / Broken / Outdated / Irrelevant

**Report the accuracy findings.** If AI is saying wrong things about the prospect's company, that's a selling point — they need to fix their content so AI gets it right.

---

## Phase 6: Video-Specific Layer

Run on top of the standard protocol. Additional queries:

### Video-Specific Prompts (5 additional)
1. "What YouTube channels cover [industry topic]?"
2. "Best video content about [category]?"
3. "Where can I watch demos of [category] tools?"
4. "[Company Name] demo video"
5. "[Company Name] YouTube"

### What to Track
- Does any company's YouTube content appear in AI citations?
- Does the AI reference video content at all for this category?
- Which model is most likely to cite video? (Hypothesis: Perplexity and Gemini will cite YouTube more than ChatGPT/Claude)

### YouTube Public Data to Collect
| Metric | Source |
|--------|--------|
| Subscriber count | YouTube channel page |
| Total video count | YouTube channel page |
| Videos posted in last 90 days | YouTube channel > Videos > sort by date |
| Average views (last 10 videos) | Manual count |
| Most viewed video | YouTube channel > Videos > sort by popular |
| Topics covered | Manual categorization of last 20 video titles |
| Video length patterns | Short (<2min), Medium (2-10min), Long (>10min) |
| Last upload date | YouTube channel page |

---

## Phase 7: Pilot Test (Do This Before Going Live)

### Pick 1 Known Company to Calibrate

Run the full protocol on a company where you already know the answer. Suggestion: **Hinge Marketing** — you know their content, their visibility, their competitors.

### Calibration Questions
1. Does the snapshot match what you already know to be true?
2. Are there surprises? If so, are they real findings or methodology problems?
3. How long did it take? (Target: 60-90 min for research, 30 min for report writing)
4. What fields in the tracking sheet were useless? Cut them.
5. What fields were missing? Add them.

### Iterate
- Run the pilot
- Fix the methodology
- Run it again on a DIFFERENT company
- If results are consistent and believable → methodology is ready

---

## Phase 8: Production Workflow

### Time Budget Per Snapshot (target after pilot)
| Step | Time |
|------|------|
| Prompt customization | 10 min |
| Run 1 (60 queries + screenshots) | 45 min |
| Run 2 (next day) | 45 min |
| Run 3 (day after) | 45 min |
| Data entry & scoring | 20 min |
| YouTube/video research | 20 min |
| Analysis & report writing | 30 min |
| **Total** | **~3.5 hours spread over 3 days** |

### Shortcut for Cold Outreach Snapshots
If 3.5 hours is too much for a free lead magnet:

**Lite version (1 hour):**
- 1 run only (not 3)
- 2 models only (ChatGPT + Perplexity)
- 10 prompts (not 15)
- No video-specific prompts
- Note in the report: "Single-run snapshot — results may vary"

**Full version (3.5 hours):**
- Reserve for warm prospects who've replied
- Or for referral partner snapshots (Hinge clients)
- The full version is what passes CEO scrutiny

---

## Tools Needed

| Tool | Cost | Purpose |
|------|------|---------|
| ChatGPT Plus | $20/mo | GPT-4o access |
| Perplexity Pro | $20/mo | Better results + more queries |
| Google Gemini | Free | Advanced model access |
| Claude Pro | $20/mo | You already have this |
| Google Sheets | Free | Data tracking |
| Screenshot tool (Cleanshot/native) | Free-$30 | Evidence capture |
| Google Drive | Free | Screenshot storage |

**Total recurring cost: ~$60/mo** (you likely have all of these already)

---

## What This Methodology Proves

When a CEO asks "how do I know this is real?" you can say:

1. **"We ran 15 buyer-intent queries across 4 AI models, 3 times each over 3 days. That's 180 data points."**
2. **"X% of results were consistent across runs."**
3. **"4 out of 4 models agreed on Y of your findings."**
4. **"Every response is screenshotted and archived."**
5. **"Here's exactly how we scored it — you can rerun any query yourself right now."**

That's more rigorous than what 95% of marketing agencies deliver. And it's fully reproducible.

---

## Open Questions to Resolve in Pilot

- [ ] Does VPN/location change results significantly? Test Oakland vs. incognito.
- [ ] Do logged-in vs. logged-out results differ? Test both.
- [ ] How much do results change week-to-week? Run a 2-week retest on pilot company.
- [ ] Should we weight models differently? (ChatGPT has more users than Claude — does that matter for scoring?)
- [ ] At what consistency threshold do we feel comfortable making claims? (Proposal: 70%+)
- [ ] Can any part of this be automated? (Perplexity API, Claude API for batch runs)

---

## Next Action

Run the pilot on Hinge Marketing this week. Full protocol. Time yourself. Fix what breaks.
