# Digital Accomplice — Prospecting Tool: Comprehensive Design Doc

**Status:** Draft for Review
**Last Updated:** February 27, 2026
**Author:** Dane Frederiksen + Claude Code

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [What This Is Not](#what-this-is-not)
3. [Component Inventory](#component-inventory)
4. [What's Working](#whats-working)
5. [What's Not Working](#whats-not-working)
6. [Data Architecture](#data-architecture)
7. [Workflow Map](#workflow-map)
8. [Sequence Logic](#sequence-logic)
9. [Automation Constraints](#automation-constraints)
10. [Gaps & Decisions Needed](#gaps--decisions-needed)
11. [Recommended Next Steps](#recommended-next-steps)

---

## 1. What This Is

A prospecting system for Digital Accomplice that does three things:

1. **Warm prospects** — daily LinkedIn engagement (comments, DMs) to build familiarity before pitching
2. **Run outreach sequences** — structured follow-up cadences with message templates, auto-logging, and dead-lead detection
3. **Generate custom reports** — per-prospect "Video Opportunity Reports" that serve as the pitch artifact

The end goal: Dane opens one tool each morning, sees what to do, does it, logs it, and moves on. Everything feeds into a single pipeline view.

---

## 2. What This Is Not

- **Not a CRM replacement** (yet) — Lime CRM still exists. The tool doesn't sync with it. Role of Lime is TBD.
- **Not automated outreach** — no LinkedIn API, no scraping, no auto-messages. Everything is manual execution with tool-assisted tracking.
- **Not a lead gen tool** — prospects come from Sales Navigator exports, manual research, and referrals. The tool manages them after import.
- **Not multi-user** — built for Dane only. No auth, no roles, no team features.

---

## 3. Component Inventory

### A. Warming Dashboard (localhost:3847)
**Status: Built. Functional.**

| Attribute | Details |
|-----------|---------|
| Stack | Node.js (Express) + Python (alt server), single HTML/CSS/JS frontend |
| Port | 3847 |
| Data store | `data/prospects.json` (JSON flat file) |
| Deployed | Local only — not hosted anywhere |
| Repo | `github.com/danefrederiksen/digital-accomplice-tools` |

**What it does:**
- 4 tabs: Today (daily work queue), Pipeline (Kanban), All Prospects (filterable table), Import
- Daily targets: 8 LinkedIn comments, 1 Snapshot DM, 1 Referral outreach, 1 Podcast invite
- Warmth scoring: comments +1, DMs +2. Auto-advance to "warm" at score 5+
- Bulk import via LinkedIn URLs or CSV
- Engagement logging with timestamped history
- Pipeline stages: New → Warming → Warm → Outreach Sent → Replied → Call Booked → Won/Lost
- CSV export

**Sample data:** ~6 active prospects (warm_priority), 23 LinkedIn activity alerts in `alerts.json`

---

### B. Master Spreadsheet (`DA_Prospect_Master copy.xlsx`)
**Status: Exists. Partially populated.**

| Attribute | Details |
|-----------|---------|
| Total prospects | ~320 across 5 sheets |
| Segments | Cyber (35), AI-ML (68), Referral Partners (58), Warm Priority (7), All Prospects (320) |
| Columns (16) | Name, Company, Title, Segment, Tier, ICP Score, Status, Last Action, Last Action Date, Next Action, Follow-Up Date, LinkedIn URL, Connected, Notes, Source, Batch |
| Sources | lime_export, manual |

**Key gap:** Status, Last Action, Last Action Date, Next Action, Follow-Up Date, and Batch columns are almost entirely empty. The spreadsheet has contact data but no activity history.

---

### C. Prospect Lists (from "Claude code prospecting organization experiment")
**Status: Research complete. Not imported.**

Large research document containing ~600+ prospects across 4 LinkedIn Sales Navigator searches:

| Search | Count | Profile |
|--------|-------|---------|
| A: Cyber CMOs/VPs | ~148 | Primary ICP — CMOs & VPs of Marketing at cybersecurity companies |
| B: Cyber Demand Gen/Content Directors | ~105 | Secondary — directors who execute on video/content decisions |
| C: Cyber C-Suite (podcast targets) | ~160+ | Founders, CEOs, CTOs — better as podcast guests than direct buyers |
| D: Bay Area AI/Tech Marketing Leaders | ~200+ | Secondary vertical — AI/ML companies, Bay Area focus |

These lists are raw — no dedup against the master spreadsheet, no tier/ICP scoring, no import into the dashboard yet.

---

### D. Video Opportunity Report Agent (V2)
**Status: Built. Validated. Repeatable.**

| Attribute | Details |
|-----------|---------|
| Prompt file | `video-opportunity-report-agent-v2.md` (423 lines) |
| Workflow file | `video-opportunity-workflow.md` (294 lines) |
| First version | `competitive-video-research-agent-instructions-v1.md` (V1 — superseded) |
| Completed reports | BreachRx (v3 → v4, fully validated) |
| Deliverables per run | PDF report + DM infographic (JPG) + full-size infographic (JPG) |
| Stat validation | 9 template stats + 14 BreachRx-specific stats verified. See `report-validation.md` |

**What it does:**
1. Takes a company name as input
2. Researches company + identifies 3 competitors
3. Full video audit: YouTube, LinkedIn Video, Website Video, Blog, Podcast, Community
4. Scores each company 0-5 per channel, produces a scorecard
5. Gap analysis + AI search data case
6. 90-day recommendation plan
7. Generates branded HTML → PDF + infographic JPGs

**Production pipeline:** Markdown → HTML (branded template) → Chrome headless → PDF/JPG

---

### E. Brand Guidelines
**Status: Defined. Documented.**

| Element | Value |
|---------|-------|
| Primary accent | DA Orange #F38B1C |
| Headlines | Black #000000 |
| Body text | Blue-Gray #5A6B7A |
| Captions/labels | Gray #CBCBCB |
| Backgrounds | White #FFFFFF, Light Gray #F5F5F5 |
| Font | Inter / Arial / Helvetica (no serif ever) |
| Voice | Direct, data-first, no-BS, short sentences |

---

### F. Supporting Files

| File | Purpose |
|------|---------|
| `report-validation.md` | Stat verification log for all report claims |
| `claude-code-quickstart.md` | Git/GitHub reference for Dane |
| `DA_Brand_Guidelines_v2.docx` | Full brand guidelines (in Downloads) |
| Template HTMLs (BreachRx_*) | Branded templates for report + infographics |

---

## 4. What's Working

| Component | Status | Notes |
|-----------|--------|-------|
| Warming Dashboard UI | Working | Clean, functional, daily queue works |
| Comment tracking | Working | +1 warmth, logged with timestamp |
| DM Snapshot tracking | Working | +2 warmth, auto-status-advance |
| Warmth scoring & auto-advance | Working | Score >= 5 → status changes to "warm" |
| Pipeline Kanban view | Working | Visual pipeline with drag-free status management |
| Bulk import (URLs + CSV) | Working | Dedup by LinkedIn username or name+company |
| CSV export | Working | Full prospect export |
| LinkedIn activity alerts | Partially working | `alerts.json` captures alerts, but only 1/23 matched to a prospect |
| Video Opportunity Report Agent | Working | V2 prompt validated, BreachRx report complete, repeatable workflow documented |
| Report → PDF pipeline | Working | Chrome headless → PDF/JPG, brand-compliant |
| Stat validation process | Working | 23 stats verified with sources |
| Brand consistency | Working | Colors, fonts, voice all documented and enforced |

---

## 5. What's Not Working

### Critical Gaps

| Gap | Impact | Details |
|-----|--------|---------|
| **Excel ↔ Dashboard not synced** | Data lives in two places | Master spreadsheet has 320 prospects; dashboard has ~6. No import/export bridge between them. Activity logged in dashboard doesn't flow back to Excel. |
| **No outreach sequence engine** | Can't manage follow-ups | Dashboard tracks warming (pre-pitch), but has no concept of offer → follow-up #1 → #2 → #3 → dead. No cadence timers, no follow-up reminders, no sequence templates. |
| **No message templates** | Dane writes from scratch each time | No stored templates for connection requests, initial offers, follow-ups, referral asks, or podcast invitations. |
| **No connection request tracking** | Blind spot in funnel | Can't track who's been sent a connection request, who accepted, who's still pending. This is the first step for Not Connected prospects. |
| **No email tracking** | Blind spot in funnel | Gmail outreach is completely untracked. |
| **No non-snapshot DM tracking** | Blind spot in funnel | Only Snapshot DMs are tracked. Regular conversation DMs aren't logged. |
| **600+ researched prospects not imported** | Wasted research | The prospecting experiment doc has ~600 prospects across 4 searches. None are in the dashboard or master spreadsheet. |
| **Referral & Podcast = counter only** | No prospect-level tracking | Dashboard counts referral outreach and podcast invites per day but doesn't log which specific prospect was contacted. |

### Secondary Gaps

| Gap | Impact |
|-----|--------|
| **Lime CRM role undefined** | Unclear if it's being replaced, integrated, or abandoned |
| **No reporting/analytics** | No weekly/monthly view of pipeline velocity, conversion rates, or activity trends |
| **No "cooling lead" alerts** | Dashboard doesn't flag prospects who haven't been engaged in X days |
| **Dashboard is local-only** | Can't access from phone or when away from laptop |
| **V1 agent still exists** | `competitive-video-research-agent-instructions-v1.md` is superseded by V2 but not deleted — potential confusion |
| **Report agent not connected to prospect pipeline** | Reports are generated manually per prospect. No trigger from pipeline stage. |
| **alerts.json match rate is low** | 1 out of 23 LinkedIn alerts matched a prospect (4%). Most prospects aren't in the system yet. |

---

## 6. Data Architecture

### Current State: Three Disconnected Data Stores

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   Master Excel       │     │  Dashboard JSON      │     │  Prospect Lists      │
│   (320 prospects)    │     │  (~6 prospects)      │     │  (~600 prospects)    │
│                      │     │                      │     │                      │
│  Has: contact data,  │     │  Has: warmth scores, │     │  Has: name, company, │
│  segments, tiers,    │     │  engagement logs,    │     │  title, role         │
│  ICP scores          │     │  pipeline status     │     │                      │
│                      │     │                      │     │  Missing: everything │
│  Missing: activity   │     │  Missing: 314 of 320 │     │  else — no tiers,   │
│  history, pipeline   │     │  prospects from      │     │  no ICP scores,     │
│  status              │     │  master sheet        │     │  no dedup           │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
         ↕ No sync                    ↕ No sync                   ↕ Not imported
```

### Target State: Single Source of Truth

```
┌────────────────────────────────────────────────────┐
│              Dashboard (prospects.json)             │
│                                                    │
│  All prospects (~900 after dedup)                  │
│  Contact data + segments + tiers + ICP scores      │
│  + warmth scores + engagement logs + pipeline      │
│  + sequence state + follow-up dates + templates    │
│                                                    │
│  Import from: Excel, CSV, LinkedIn URLs            │
│  Export to: CSV, Excel                             │
└────────────────────────────────────────────────────┘
```

### Prospect Data Schema (Current in Dashboard)

```
id, name, linkedin_url, linkedin_username, company, title,
segment, tier, icp_score, tags, status, connected,
check_in_days, warmth_score, engagements[], next_check_in,
last_engagement_date, last_action, last_action_date,
notes, source, batch, created_at
```

### Fields Needed (Not Yet in Schema)

```
sequence_id          — which sequence path this prospect is on
sequence_step        — current step in the sequence (1, 2, 3...)
sequence_start_date  — when the sequence began
offer_type           — which offer was made (snapshot, interview, strategy)
follow_up_due_date   — when the next follow-up fires
follow_up_count      — how many follow-ups sent
dead_reason          — why the sequence was killed (no response, declined, etc.)
email                — for email outreach tracking
connection_status    — pending, accepted, not_sent (more granular than boolean)
report_generated     — whether a Video Opportunity Report exists for this prospect
```

---

## 7. Workflow Map

### The Full Prospecting Lifecycle

```
Phase 1: SOURCING
  Sales Navigator search → Export → Raw prospect list
  ↓
Phase 2: QUALIFICATION
  Score ICP fit → Assign tier (1/2/3) → Assign segment → Import to dashboard
  ↓
Phase 3: WARMING (current dashboard focus)
  Daily LinkedIn comments on their posts → Track warmth score
  Warmth score >= 5 → Auto-advance to "warm"
  ↓
Phase 4: OUTREACH (NOT BUILT)
  Connected? → Send offer (Snapshot DM, interview invite, strategy snapshot)
  Not connected? → Send connection request → Wait → Then send offer
  ↓
Phase 5: FOLLOW-UP SEQUENCE (NOT BUILT)
  Follow-up #1 (2 days) → #2 (2 days) → #3 (2 days)
  Reply received → Move to "Replied"
  No reply after 3 → Mark "Dead"
  ↓
Phase 6: CONVERSION
  Reply → Call booked → Won / Lost
  ↓
Phase 7: REPORT DELIVERY (BUILT, NOT INTEGRATED)
  Run Video Opportunity Report Agent for prospect's company
  Generate PDF + infographics
  Send via email or LinkedIn DM
```

### What Exists Today

- Phase 1: Manual (Sales Nav + Google Docs)
- Phase 2: Partial (Excel has tiers/scores, dashboard import works but data isn't moved)
- Phase 3: Working in dashboard
- Phase 4: Counter only (no per-prospect tracking)
- Phase 5: Not built
- Phase 6: Not built (status exists in pipeline but no workflow)
- Phase 7: Built but triggered manually, not connected to pipeline

---

## 8. Sequence Logic

### Sequence Matrix

| | Connected | Not Connected |
|---|---|---|
| **ICP Prospect** | Offer → 3 follow-ups → Dead | Connection request → (wait) → Offer flow |
| **Referral Partner** | Offer A or B → TBD follow-ups | Connection request → (wait) → Offer flow |
| **Existing Client** | TBD | N/A |
| **Podcast Guest** | Invite → TBD follow-ups | Connection request → (wait) → Invite flow |

### Defined: Connected + ICP Prospect

| Step | Action | Timing |
|------|--------|--------|
| 1 | Send offer (Snapshot DM or report teaser) | Day 0 |
| 2 | Log in dashboard | Immediate |
| 3 | Follow-up #1 | Day 2 |
| 4 | Follow-up #2 | Day 4 |
| 5 | Follow-up #3 | Day 6 |
| 6 | No response → Mark dead | Day 6+ |

**Cadence:** 2-day intervals. 3 attempts max. Total sequence: ~6 days.

### Defined: Connected + Referral Partner

Two offers being A/B tested:
- **Offer A:** Interview invitation ("Be a guest on our show")
- **Offer B:** Free strategy snapshot for one of their clients

Follow-up cadence: TBD (assume same as ICP baseline)

### Not Yet Defined

- Connected + Existing Client
- Connected + Podcast Guest
- All "Not Connected" flows (connection request → wait → enter sequence)

### Offers in Use

| Offer | Target | Channel | Artifact |
|-------|--------|---------|----------|
| Video Opportunity Snapshot | ICP Prospects | LinkedIn DM | DM infographic JPG + PDF report |
| Interview Invitation | Referral Partners | LinkedIn DM | — |
| Free Strategy Snapshot | Referral Partners (alt) | LinkedIn DM | Mini-report for their client |
| Podcast Invitation | Podcast Guests | LinkedIn DM or Email | — |

---

## 9. Automation Constraints

| Constraint | Impact |
|------------|--------|
| No LinkedIn API | Cannot auto-post, auto-DM, or auto-connect. All actions manual. |
| No scraping | Cannot pull LinkedIn data programmatically. Risk of account ban. |
| No Gmail API (currently) | Email not integrated. Could be added via Gmail MCP. |
| Local-only deployment | Dashboard runs on localhost:3847. No mobile access. |
| Manual activity logging | Every comment, DM, and action must be manually logged in the dashboard. |

### What Could Be Automated (Within Constraints)

- **Follow-up reminders** — dashboard shows "due today" based on cadence timers
- **Dead-lead detection** — auto-flag after 3 unanswered follow-ups
- **Cooling alerts** — flag prospects with no engagement in X days
- **Report generation** — trigger Video Opportunity Report from pipeline stage
- **Template insertion** — pre-fill message templates per sequence step
- **Gmail read/draft** — Gmail MCP is connected, could draft follow-up emails

---

## 10. Gaps & Decisions Needed

### Must Decide

| # | Decision | Options | Impact |
|---|----------|---------|--------|
| 1 | **Single source of truth** | A) Dashboard JSON replaces Excel. B) Excel remains master, dashboard syncs. C) Move to a real DB. | Everything depends on this. |
| 2 | **Lime CRM** | A) Abandon. B) Use as contact store only. C) Integrate via API. | Determines if there's a third data source to manage. |
| 3 | **Import the 600+ researched prospects?** | A) Yes, score/tier/dedup and import all. B) Cherry-pick top candidates. C) Hold until sequences are built. | Unlocks the pipeline or creates noise. |
| 4 | **Hosting** | A) Keep local (laptop only). B) Deploy to VPS/cloud. C) Use a hosted tool instead (HubSpot, etc.) | Affects mobile access, reliability, backup. |

### Must Define

| # | Item | Current State |
|---|------|--------------|
| 5 | Existing Client sequence | Not defined |
| 6 | Podcast Guest sequence (post-invite) | Not defined |
| 7 | Not Connected flow (all types) | Not defined |
| 8 | Message templates per sequence step | None exist |
| 9 | Reporting cadence and metrics | Not defined |
| 10 | When to trigger a Video Opportunity Report in the pipeline | Not defined — currently manual |

---

## 11. Recommended Next Steps

### Phase 1: Consolidate Data (1 session)
1. Import the 320 master spreadsheet prospects into the dashboard
2. Dedup the ~600 researched prospects against the master list
3. Score and tier the new prospects
4. Make the dashboard the single source of truth

### Phase 2: Build Sequence Engine (2-3 sessions)
1. Add sequence fields to prospect schema (sequence_id, step, follow_up_due_date, etc.)
2. Build the "due today" view for follow-ups (not just warming)
3. Add follow-up cadence timers (2-day intervals for ICP baseline)
4. Add dead-lead auto-detection (3 unanswered → dead)
5. Add cooling-lead alerts (no engagement in X days)

### Phase 3: Add Templates (1 session)
1. Write message templates for each sequence step and lead type
2. Build template selection into the dashboard UI
3. Copy-to-clipboard on click

### Phase 4: Connect the Report Agent (1 session)
1. Add "Generate Report" button to prospect cards in pipeline
2. When clicked, run the V2 agent workflow for that prospect's company
3. Track report_generated status per prospect

### Phase 5: Define Missing Sequences (interview with Dane)
1. Existing Client workflow
2. Podcast Guest post-invite workflow
3. Not Connected flows for all lead types
4. Decide on Lime CRM future

---

*This doc is the current state of the system as of February 27, 2026. It should be updated as decisions are made and features are built.*
