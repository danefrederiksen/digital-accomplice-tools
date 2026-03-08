---
name: snapshot-generator
description: "Use this skill whenever Dane asks to create a video snapshot, AI visibility check, AI visibility audit, competitive snapshot, or prospect assessment for a target company. Also trigger when Dane mentions a company name in the context of outreach, prospecting, or 'run a snapshot on [company]'. Outputs a forwardable one-page PDF-ready assessment showing how a company appears (or doesn't) in AI search results vs competitors, with a focus on video content gaps. This is the core conversion tool in the Digital Accomplice sales pipeline. Also trigger for: 'snapshot [company]', 'visibility check', 'how does [company] show up in AI', 'build a snapshot for [name]', or any A/B snapshot test execution."
---

# AI Visibility Snapshot — One-Page Template Structure

## What This Is

The template structure and output format for the one-page AI Visibility Snapshot PDF. This is the deliverable that goes to the prospect. It must:
- Pass the **60-second test** (busy person gets the point in under a minute)
- Fit on **one page** (letter size, 8.5 x 11)
- Be **forwardable** without Dane present
- Lead with **gut punch**, close with **path forward**

---

## DA Brand Standards

- **Colors:** DA Orange #F38B1C, Black #000000, Blue-Gray #5A6B7A, Gray #CBCBCB, White #FFFFFF, Light Gray #F5F5F5
- **Fonts:** Poppins (headlines), Space Mono (labels), Inter/Arial (body)
- **Voice:** Direct, data-first, no-BS, short sentences
- **Wrong colors (never use):** #F5A623, #AAAAAA, #F0F0F0

---

## One-Page Structure (10 Sections)

### Section 1: WHAT WE CHECKED
**Purpose:** Establish credibility and scope in one line.

```
TEMPLATE:
We ran [X] buyer-intent queries across [AI platforms tested] for [Company] vs. [Comp1], [Comp2], and [Comp3].
```

**Instructions:**
- One sentence. Keep under 25 words.
- Name the specific AI platforms tested (e.g., ChatGPT, Perplexity, Claude, Google AI).
- Name all 3 competitors explicitly — never use "competitors" generically.

---

### Section 2: AI VISIBILITY SCORE
**Purpose:** The headline number. Instant gut punch.

```
TEMPLATE:
[Score]/10 — AI Search Visibility
[X]/20 queries mentioned [Company] | [Y]/20 recommended by name
```

**Instructions:**
- Score is 0-10 scale, 1 decimal place.
- Show the fraction: mentions out of total queries, recommendations out of total.
- Include 3 stat boxes:
  - Stat 1: AI visibility score (e.g., "6.0/10")
  - Stat 2: Video gap stat (e.g., "0/332 videos cited in AI")
  - Stat 3: Market stat (e.g., "16% of AI answers cite YouTube")

---

### Section 3: WHAT AI SAYS — NEW
**Purpose:** Visceral proof. Show the prospect exactly what AI models say (or don't say) about them vs. a competitor.

```
TEMPLATE:
When we asked "[buyer-intent query]":
  [AI Model] said: "[verbatim quote about competitor — 1-2 sentences]"
  [Company] was not mentioned.

When we asked "[second buyer-intent query]":
  [AI Model] said: "[verbatim quote — 1-2 sentences]"
  [Company] result: "[what AI said, or 'Not mentioned']"
```

**Instructions:**
- Pull quotes directly from Step 2 query results (ai-snapshot-agent). Pick the **2 most visceral gaps**.
- Side-by-side format: what AI says about a competitor vs. what it says (or doesn't say) about the prospect.
- Always note which AI model the quote came from (e.g., "ChatGPT said:").
- Keep each quote to 1-2 sentences max. Trim for impact.
- If the prospect IS mentioned, show the contrast in positioning (e.g., competitor recommended first, prospect buried in a list).

---

### Section 4: KEY FINDINGS
**Purpose:** 3 bullet-point insights from the research. Evidence-backed, specific, business-relevant.

```
TEMPLATE:
• [Finding 1 — strongest AI visibility insight, with numbers]
• [Finding 2 — competitive gap or opportunity, with evidence]
• [Finding 3 — REQUIRED: video status for all companies]
  Video status: [Company]: [Active/Sporadic/Absent] | [Comp1]: [Active/Sporadic/Absent] | [Comp2]: [Active/Sporadic/Absent]
```

**Instructions:**
- Each finding must cite actual numbers from the research.
- Finding 3 is ALWAYS the video status line. Format: `[Company]: Active | [Comp1]: Sporadic | [Comp2]: Absent`
- Video status definitions:
  - **Active** = uploaded in last 3 months, regular cadence
  - **Sporadic** = has videos but dormant (3+ months since last upload)
  - **Absent** = no YouTube channel or <3 total videos
- Bold the lead phrase of each finding.

---

### Section 5: COMPETITOR COMPARISON — NEW
**Purpose:** At-a-glance grid showing who shows up where. Competitive pressure — the emotional accelerant.

```
TEMPLATE:
                    | [Company] | [Comp1]   | [Comp2]   |
ChatGPT             |  Cited    |  Cited    |  Not Cited|
Perplexity          |  Not Cited|  Cited    |  Partial  |
Claude              |  Not Cited|  Not Cited|  Not Cited|
Google AI           |  Cited    |  Not Cited|  Not Cited|
```

**Instructions:**
- Rows = AI platforms tested (ChatGPT, Perplexity, Claude, Google AI).
- Columns = Prospect + 2 strongest competitors (drop weakest if space is tight).
- Cells: Use icons/symbols:
  - ✓ Cited (score 2-3)
  - ✗ Not Cited (score 0)
  - ~ Partial (score 1)
- Fill from Step 3 scoring data in the ai-snapshot-agent.
- Keep compact — this should be 5-6 lines max including header.

---

### Section 6: THE GAP
**Purpose:** The dark callout box. Connect the data to the opportunity. Make it feel urgent.

```
TEMPLATE:
[Bold opening statement about the gap — specific to this company's situation].
[1-2 sentences connecting the data to the opportunity].
[Punch line in DA Orange: "First one to [specific action] owns [specific outcome]."]
```

**Instructions:**
- This is the emotional center of the page. Write it like a headline, not a paragraph.
- Reference specific numbers from the research.
- The punch line should naturally point toward video/content without being salesy.
- Keep to 3-4 sentences total inside the dark box.

---

### Section 7: WHY IT MATTERS
**Purpose:** Revenue connection + urgency. Answer "so what?" and "why now?"

```
TEMPLATE:
AI search converts 5-6x higher than Google organic. Companies visible in AI search report 27-32% more inbound SQLs.* If [Company] isn't showing up when buyers ask AI for recommendations, that's pipeline walking to competitors who are.

AI search adoption doubled in 2025. Companies building visibility now will own their categories for 2-3 years. This window is closing.
```

**Instructions:**
- Always include at least ONE revenue stat: the 5-6x conversion or the 27-32% SQL increase.
- Always include the urgency window framing: adoption doubled, 2-3 year window, closing.
- Keep to 3-4 sentences max. Every word must earn its place.
- The * footnote for SQL stat: "SmartRent + Broworks data, 2025-2026"

---

### Section 8: RECOMMENDATION (3-Tier)
**Purpose:** Specific, actionable next steps at three time horizons. Replace the old single "Quick Win."

```
TEMPLATE:
Quick Win (this week):
[One sentence — immediately actionable. Must be doable Monday morning.]

Next Move (this month):
[One sentence — builds on the quick win. Slightly more involved.]

Full Play (this quarter):
[One sentence — strategic shift. Naturally points toward DA services without being pushy.]
```

**Instructions:**
- Each tier = ONE sentence. No exceptions.
- Quick Win: Lowest effort, highest signal. Examples: "Record a 3-minute expert video answering your #1 buyer question and publish to YouTube with a full transcript."
- Next Move: Builds on quick win. Example: "Create a 4-video FAQ series from your top support queries and optimize descriptions for AI citation."
- Full Play: Strategic. Example: "Build a monthly video program that positions [Company] as the go-to expert AI models cite in your category."
- Full Play should naturally point toward DA services — but never explicitly pitch. If video isn't the answer, say so.
- Lite mode still uses 3 tiers — keep them short.

---

### Section 9: EFFORT LEVEL — NEW
**Purpose:** Signal the lift. Help prospects self-qualify. Reduce friction to the call.

```
TEMPLATE:
Effort level: [Low / Medium / High] — [brief context, under 15 words]
```

**Instructions:**
- Match effort level to the Quick Win tier specifically.
- Examples:
  - "Effort level: Low — one 3-minute video + transcript, no production required."
  - "Effort level: Medium — 4 videos over 2 weeks, basic editing, YouTube optimization."
  - "Effort level: High — full content overhaul, 90-day program, professional production."
- Keep it honest. If it's Medium, say Medium. Prospects can smell sugarcoating.
- **Never quote prices.** Just signal the lift.
- One line. No more.

---

### Section 10: NEXT STEP
**Purpose:** The CTA. Always a 15-minute call. No pitch. No pressure.

```
TEMPLATE:
15 minutes. No pitch. We walk through the data. →
dane@digitalaccomplice.com · calendly.com/accomplice-dane/15min
```

**Instructions:**
- Always a 15-minute call. Not 30, not an hour.
- Include both email and Calendly link.
- "No pitch. No pressure. If the data doesn't warrant a conversation, we'll tell you."
- This goes in the footer area of the PDF.

---

## Methodology Line

```
TEMPLATE:
How we did this: [X] buyer-intent queries across [platforms]. Each answer evaluated for company mention, recommendation strength, content format cited, and video presence. AI answers change; we document the pattern, not a guarantee.
```

- Place at bottom of content area, above footer.
- Tiny font (7-8px). Gray text. Not the focus.

---

## Delivery Checklist

Before any snapshot ships, verify ALL of these:

- [ ] Every video claim backed by live search (not training data)
- [ ] Real competitor names (not generic)
- [ ] Score justified by actual findings
- [ ] WHAT AI SAYS includes 2+ verbatim quotes with source model noted
- [ ] Competitor comparison grid complete for all platforms tested
- [ ] Video status line (Active/Sporadic/Absent) for all companies
- [ ] 3-tier recommendation: Quick Win + Next Move + Full Play
- [ ] Revenue math explicit in WHY IT MATTERS
- [ ] Urgency window framing included
- [ ] Effort level present and honest
- [ ] Passes 60-second test
- [ ] One page or less
- [ ] No debunked stats
- [ ] File named per convention: `{Company}_AI_Snapshot_{date}.pdf`
- [ ] Tagged A-Offer or B-Unsolicited

---

## File Locations

- **Snapshot HTML template:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/public/hinge-snapshot-v2.html` (reference implementation)
- **Generator form:** `http://localhost:3850/snapshot-generator.html`
- **Server:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/server.js` (port 3850)
- **PDF output:** `/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/`
- **Query config:** `/Users/danefrederiksen/Desktop/Claude code/snapshot-generator/queries.json`

---

## 60-Second Test Criteria

Hand the snapshot to someone who's never seen it. In 60 seconds they should be able to tell you:
1. Who's winning and who's losing in AI search?
2. What does AI actually say about the prospect? (verbatim quotes)
3. How do competitors compare? (grid)
4. What's the single biggest finding?
5. What should they do about it? (3-tier rec)
6. How hard is it to fix? (effort level)
7. What's the next step?

If they can't answer all 7 → revise.
