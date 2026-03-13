# Snapshot v2 — Design Doc / Generator Prompt

## What This Is
A single-page branded PDF that combines the AI visibility diagnosis AND the recommendations brief into one clean, bold deliverable. Replaces the current 8-page report for most outreach. The full report still exists for deep-dive conversations — this is the door-opener version.

## Output Format
- **PNG image.** Single file. No HTML, no PDF.
- **Dimensions:** 1080 x 1350px (Instagram/LinkedIn portrait) OR 1920 x 1080px (landscape, for email/deck embed). Generator should support both.
- **Pipeline:** HTML template rendered via Chrome headless → PNG screenshot. The HTML is never delivered — it's just the rendering engine.
- **File naming:** `[Company]_AI_Snapshot_v2_[date].png`

## Design Constraints
- **One image.** Everything fits in one graphic. No pages, no scrolling.
- **5th grade reading level.** No jargon. No long sentences. If a word has more than 3 syllables, cut it.
- **Bold and scannable.** Someone should get the message in 10 seconds of skimming.
- **DA brand specs:** Orange #F8901E, Black #000, Blue-Gray #5A6B7A, White #FFF, Light Gray #F5F5F5. Font: Poppins (Arial fallback). No gradients, no shadows.
- **High-res.** 2x pixel density for crisp text on retina screens.

## Page Layout (top to bottom)

### 1. HEADER BAR
- DA logo (small, top left)
- "AI VISIBILITY SNAPSHOT" label (top right, small caps, gray)
- Company name: large, bold, black
- Date generated

### 2. HEADLINE (the hook)
One bold sentence that creates urgency. Generated from data.

Format: **"[Company] has [X]. AI doesn't know it exists."**

Examples:
- "Double Cross has a 95-point rating. AI recommends Grey Goose instead."
- "BreachRx has 14 years of expertise. AI cites 0 of it."
- "GISI has 200+ federal contracts. AI sends buyers to Deloitte."

Rules: Use their strongest asset + the gap. Short. Punchy. Make them feel it.

### 3. THE SCORE BOX (3 stats, side by side)
Three bold stat cards in a horizontal row. Orange numbers, black labels.

| Stat 1 | Stat 2 | Stat 3 |
|--------|--------|--------|
| **0/20** | **3 competitors** | **0 videos** |
| AI mentions | rank higher | found by AI |

These are the three most damning numbers from the audit. Pick the ones that hurt most. Always include the "0/20 AI mentions" or equivalent as stat 1.

### 4. COMPETITIVE BAR CHART
Simple horizontal bars. 4 companies (target + 3 competitors). Bars show AI citation score out of 20. Target company bar is orange. Competitors are gray. Labels on left, scores on right.

No axis labels. No legend. Just bars and numbers. A child could read it.

### 5. THE PRESCRIPTION — 3 TIERS
This is the new part. Three stacked boxes, full width. Light gray background. Orange tier labels.

**Box 1: "DO THIS TODAY (free, <1 hour)"**
- 2 bullet points. Specific to their gaps. Things they can literally do right now.
- Example: "Add transcripts to your 12 existing YouTube videos" / "Pin your best explainer to LinkedIn featured"

**Box 2: "DO THIS QUARTER (the real plan)"**
- 2 bullet points. Bigger moves with timelines.
- Example: "Launch a 6-video FAQ series targeting the queries where [Competitor] outranks you" / "Build a competitor comparison video for your #1 buyer-intent query"

**Box 3: "WHAT WE'D BUILD FOR YOU (the full engine)"**
- 2 bullet points. The vision. Aspirational.
- Example: "Monthly video production + AI visibility tracking vs. competitors" / "Full YouTube channel strategy: branding, metadata, optimization, distribution"

### 6. SINGLE CTA LINE
Centered. Regular weight. Not loud.

**"If any of this interests you, I'm happy to talk through which pieces fit."**

Below it: Dane's name, email, one line: "Digital Accomplice — AI visibility through video."

### 7. FOOTER
Small, gray text: "Methodology: [X] buyer-intent queries tested across ChatGPT + Perplexity. Results reflect patterns, not guarantees. Full methodology available on request."

---

## Generator Input Fields

The snapshot generator form needs these fields to produce this page:

| Field | Type | Example |
|-------|------|---------|
| company_name | text | "Double Cross Vodka" |
| headline | text | "Double Cross has a 95-point rating. AI recommends Grey Goose instead." |
| stat_1_number | text | "0/20" |
| stat_1_label | text | "AI mentions" |
| stat_2_number | text | "3" |
| stat_2_label | text | "competitors rank higher" |
| stat_3_number | text | "0" |
| stat_3_label | text | "videos found by AI" |
| target_name | text | "Double Cross" |
| target_score | number | 1 |
| comp_1_name | text | "Grey Goose" |
| comp_1_score | number | 16 |
| comp_2_name | text | "Belvedere" |
| comp_2_score | number | 14 |
| comp_3_name | text | "Tito's" |
| comp_3_score | number | 12 |
| tier1_action1 | text | "Add transcripts to your 12 existing YouTube videos" |
| tier1_action2 | text | "Pin your best product review to LinkedIn featured" |
| tier2_action1 | text | "Launch a 6-video tasting series targeting 'best premium vodka' queries" |
| tier2_action2 | text | "Build a comparison video for 'best vodka for martini'" |
| tier3_action1 | text | "Monthly video production + quarterly AI visibility re-scoring" |
| tier3_action2 | text | "Full YouTube channel relaunch: branding, metadata, optimization" |
| num_queries | number | 20 |
| ai_platforms | text | "ChatGPT + Perplexity" |
| date | text | "March 13, 2026" |

## Visual Hierarchy (what the eye hits first)

1. **Headline** — the hook. Biggest text on the page.
2. **3 stat cards** — the damage. Bold orange numbers.
3. **Bar chart** — the gap. Visual proof.
4. **Tier boxes** — the fix. What to do about it.
5. **CTA** — the door. Quiet, confident.

Everything else is supporting. Header and footer should be invisible unless you look for them.

## Export Endpoint
`POST /api/export-snapshot-v2`
- Renders the HTML template with input data
- Screenshots via Chrome headless at 2x resolution
- Returns PNG buffer
- Supports `?format=portrait` (1080x1350, default) or `?format=landscape` (1920x1080)

## What This Is NOT
- Not an HTML page. HTML is only the rendering layer — the deliverable is a PNG.
- Not an 8-page report. That still exists for deep conversations.
- Not a proposal. No pricing. No scope. No contract language.
- Not a sales pitch. It's a gift that happens to make them want to talk to you.

## Tone
Write like you're explaining something important to a smart friend who's busy. No fluff. No filler. Every word earns its spot.
