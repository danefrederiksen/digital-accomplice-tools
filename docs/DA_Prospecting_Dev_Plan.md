# DA Prospecting Tool — Development Plan

**Date:** February 27, 2026
**Approach:** Small steps. Each one delivers something usable. No step depends on a future step that doesn't exist yet.

---

## Where We Are (Honest)

You have a contact list and a comment counter. Here's the gap between that and a prospecting tool:

| What a prospecting tool does | Current state |
|---|---|
| Holds all your prospects in one place | 6 in dashboard, 320 in Excel, ~600 in a doc |
| Shows you what to do today | Shows warming targets only (comments/DMs) |
| Tracks what you've done | Tracks comments (+1) and DMs (+2). Nothing else. |
| Manages follow-up sequences | Does not exist |
| Tells you when someone's gone cold | Does not exist |
| Gives you message templates | Does not exist |
| Connects to your pitch artifact (report) | Report agent exists but is disconnected |

---

## The Build Order

### Step 1: Import the 320 into the dashboard
**Why first:** You can't build anything useful on top of 6 prospects. This is the foundation.

**What to do:**
- Read the Excel file, map columns to dashboard schema
- Handle missing data: many rows won't have LinkedIn URLs — import them anyway with a "needs_url" flag
- Dedup against the 6 already in the dashboard
- Preserve existing segments, tiers, and ICP scores from Excel
- Set all imported prospects to status "new" (not "warming" — they haven't been touched)

**What you get:** One place with all 320 prospects. The "All Prospects" tab becomes useful. Pipeline view shows real numbers.

**Estimated effort:** 1 session

---

### Step 2: Add a "New" status and triage view
**Why second:** After import, you'll have ~320 prospects sitting in "new" status. You need a way to review and activate them in batches — not dump them all into the warming queue at once.

**What to do:**
- Add a "Triage" section to the Today view (or a new tab)
- Show "new" prospects grouped by segment
- One-click actions: "Start Warming" (moves to warming queue), "Skip" (parks them), "Needs LinkedIn URL" (flags for manual lookup)
- Batch actions: "Activate all Tier 1 Cyber" with one click

**What you get:** Control over which prospects enter your daily workflow and when.

**Estimated effort:** 1 session

---

### Step 3: Fix the "Connected" field
**Why third:** Your entire sequence logic splits on connected vs. not connected. Right now this field is mostly empty or defaulted to `false`. Without it, the tool can't route prospects to the right workflow.

**What to do:**
- Add a prominent "Connected?" indicator on prospect cards
- Make it easy to flip during triage: "I'm connected" / "Not connected" / "Don't know"
- For the warming queue: only show "Who Posted?" for connected prospects (you can't comment on posts from people you're not connected with unless the post is public)

**What you get:** The tool knows which prospects can receive a DM vs. which need a connection request first.

**Estimated effort:** Part of Step 2 (same session)

---

### Step 4: Build the sequence engine (core)
**Why fourth:** This is the biggest missing piece. Without it, you log a DM and then have to remember to follow up in 2 days using your own memory.

**What to do:**
- Add sequence fields to prospect schema: `sequence_type`, `sequence_step`, `sequence_started`, `follow_up_due`, `follow_up_count`
- Define the first sequence: Connected + ICP Prospect
  - Step 1: Send offer (day 0)
  - Step 2: Follow-up #1 (day 2)
  - Step 3: Follow-up #2 (day 4)
  - Step 4: Follow-up #3 (day 6)
  - Step 5: No reply → mark dead
- When you log "Sent Snapshot DM" → prospect enters the sequence at Step 1
- Dashboard shows a new "Follow-ups Due" section in the Today view
- Follow-ups due today appear with "Sent follow-up" / "Got a reply!" / "Skip" buttons
- "Got a reply" → moves to "replied" status, exits sequence
- After 3 unanswered follow-ups → auto-mark "dead" or surface a "Kill this sequence?" prompt

**What you get:** The tool tells you who needs a follow-up today. You log it. It schedules the next one. Nothing falls through cracks.

**Estimated effort:** 2 sessions

---

### Step 5: Add message templates
**Why fifth:** Sequences without templates mean you're still writing every message from scratch. Templates make the daily queue actionable in seconds, not minutes.

**What to do:**
- Create a templates store (JSON file or embedded in the app)
- Templates keyed by: sequence_type + step_number
- Example template set for "Connected + ICP Prospect":
  - Step 1 (initial offer): "Hey {name}, I put together a quick snapshot of {company}'s video presence vs. your top competitors. Want me to send it over?"
  - Step 2 (follow-up 1): "Following up on this — the snapshot takes 2 min to review. Happy to send if useful."
  - Step 3 (follow-up 2): "Last follow-up on this. The data was interesting — {company} has some gaps competitors haven't filled yet. Let me know if you want a look."
- Show the template on the prospect card in the follow-up queue
- "Copy to clipboard" button → paste into LinkedIn
- Allow Dane to edit/customize templates over time

**What you get:** Open dashboard → see who to contact → click copy → paste into LinkedIn → click "Sent" → done. Under 30 seconds per action.

**Estimated effort:** 1 session

---

### Step 6: Add cooling alerts and dead-lead detection
**Why sixth:** Once you have sequences running and data flowing, you need the tool to flag problems — prospects going cold, sequences that should be killed.

**What to do:**
- **Cooling alert:** Any prospect in "warming" status with no engagement logged in 14+ days → show warning badge
- **Stale sequence alert:** Any prospect in an active sequence where a follow-up was due 3+ days ago and wasn't sent → show warning
- **Dead-lead auto-flag:** 3 follow-ups sent, no reply, 7+ days since last → suggest marking dead
- Add a "Needs Attention" section at the top of the Today view that surfaces these alerts

**What you get:** The tool doesn't just show you what to do — it tells you what's falling apart.

**Estimated effort:** 1 session

---

### Step 7: Basic reporting
**Why seventh:** You've been running the system for a while now. You need to know if it's working.

**What to do:**
- Weekly summary: actions taken, replies received, calls booked, deals won/lost
- Pipeline velocity: how long prospects spend in each stage
- Conversion funnel: warming → warm → outreach → reply → call → won (with drop-off rates)
- Simple bar charts or just clean number tables — no need for a charting library

**What you get:** "Last week I commented on 40 posts, sent 5 snapshots, got 2 replies, booked 1 call." Data to know if the cadence is right.

**Estimated effort:** 1 session

---

### Step 8: Import the ~600 researched prospects
**Why eighth (not first):** These are raw names from Sales Navigator searches. They have no tiers, no ICP scores, no LinkedIn URLs in a usable format, and they haven't been deduped against your master list. Importing them before the system can handle triage (Step 2) would flood the dashboard with noise.

**What to do:**
- Parse the research doc (4 searches: Cyber CMOs, Demand Gen Directors, C-Suite podcast targets, AI/ML leaders)
- Extract name, company, title, segment
- Dedup against existing 320
- Auto-assign initial tiers based on role (CMO/VP = Tier 1, Director = Tier 2, Other = Tier 3)
- Import into dashboard with status "new"
- Use the triage view (Step 2) to review and activate in batches

**What you get:** Your full prospect universe (~800-900 after dedup) in one place, ready to be activated in waves.

**Estimated effort:** 1-2 sessions

---

### Step 9: Define the remaining sequences
**Why ninth:** By now you'll have real data on how the ICP sequence performs. Use that to inform the others.

**What to do (interview with Dane for each):**
- Connected + Referral Partner sequence (offers A and B)
- Connected + Podcast Guest sequence
- Not Connected flow (connection request → wait → enter sequence)
- Existing Client sequence (if applicable)

**Estimated effort:** 1 session per sequence type

---

### Step 10: Connect the report agent to the pipeline
**Why last:** The report agent works. But right now you run it manually in a separate Claude session. Once the pipeline has real activity, it makes sense to connect them.

**What to do:**
- Add a "Generate Report" action on prospect cards (for prospects in "warm" or "outreach_sent" status)
- When clicked: trigger the V2 agent workflow for that prospect's company
- Track `report_generated: true/false` per prospect
- Show "Report ready" badge on prospects who have one

**What you get:** The pitch artifact is part of the workflow, not a separate project.

**Estimated effort:** 1-2 sessions

---

## The Sequence

```
Step 1: Import 320 from Excel          ← foundation (data)
Step 2: Triage view + "new" status     ← foundation (control)
Step 3: Fix "connected" field          ← foundation (routing)
  ↓
Step 4: Sequence engine                ← core feature
Step 5: Message templates              ← makes sequences usable
Step 6: Cooling/dead alerts            ← makes sequences reliable
  ↓
Step 7: Reporting                      ← visibility into results
Step 8: Import 600 research prospects  ← scale the pipeline
Step 9: Define remaining sequences     ← expand the playbook
Step 10: Connect report agent          ← integrate the pitch tool
```

**Steps 1-3** = Get real data into a usable state. ~2 sessions.
**Steps 4-6** = Build the actual prospecting engine. ~4 sessions.
**Steps 7-10** = Scale, measure, and integrate. ~4-5 sessions.

---

## What We're NOT Building (Yet)

- Mobile access / cloud deployment — stay local until the tool proves itself
- Gmail integration — possible via MCP but not needed until email sequences exist
- Lime CRM sync — decide Lime's fate after Step 7 when you have real data
- LinkedIn automation — never. Manual execution, tool-assisted tracking.
- Multi-user support — this is Dane's tool, not a team product

---

## Ready to Start

Step 1 (importing the 320 from Excel) can happen right now. It's mechanical — read the spreadsheet, map the columns, write to the JSON file. No design decisions needed.

Say the word.
