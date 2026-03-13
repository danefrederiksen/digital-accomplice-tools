# DA Prospecting System — Complete Documentation
**Date:** March 1, 2026
**Owner:** Dane Frederiksen / Digital Accomplice

---

## System Overview

The DA Prospecting System is a suite of **10 standalone outreach tracking tools** plus a **central pipeline dashboard**, all running locally as Node.js Express apps with JSON data storage. Every tool follows the same pattern: single-file HTML frontend, Node.js server, JSON persistence, DA brand styling.

**No LinkedIn API, no scraping.** All outreach actions are done manually by Dane. The tools track what happened, when, and what's next.

---

## Architecture at a Glance

```
/Users/danefrederiksen/Desktop/Claude code/
├── start-all.js              ← Starts all 10 tools at once
├── b2b-outreach.html         ← Tool #1 frontend
├── b2b-serve.js              ← Tool #1 server (port 3851)
├── cyber-outreach.html       ← Tool #2 frontend
├── cyber-serve.js            ← Tool #2 server (port 3852)
├── b2b-2nd-outreach.html     ← Tool #3 frontend
├── b2b-2nd-serve.js          ← Tool #3 server (port 3853)
├── cyber-2nd-outreach.html   ← Tool #4 frontend
├── cyber-2nd-serve.js        ← Tool #4 server (port 3854)
├── referral-1st-outreach.html ← Tool #5 frontend
├── referral-1st-serve.js     ← Tool #5 server (port 3855)
├── referral-2nd-outreach.html ← Tool #6 frontend
├── referral-2nd-serve.js     ← Tool #6 server (port 3856)
├── b2b-email-outreach.html   ← Tool #7 frontend
├── b2b-email-serve.js        ← Tool #7 server (port 3857)
├── cyber-email-outreach.html ← Tool #8 frontend
├── cyber-email-serve.js      ← Tool #8 server (port 3858)
├── substack-outreach.html    ← Tool #9 frontend
├── substack-serve.js         ← Tool #9 server (port 3859)
├── customer-outreach.html    ← Tool #10 frontend
├── customer-serve.js         ← Tool #10 server (port 3860)
├── data/                     ← All prospect JSON + activity logs + backups
│   ├── b2b-prospects.json
│   ├── b2b-activity.json
│   ├── cyber-prospects.json
│   ├── cyber-activity.json
│   ├── referral-1st-prospects.json
│   ├── referral-1st-activity.json
│   └── backups/
├── warming-app copy/         ← Main pipeline dashboard
│   ├── server.js             ← Dashboard server (port 3847)
│   └── data/
│       ├── prospects.json    ← 988 prospects
│       ├── templates.json    ← 16 message templates
│       └── alerts.json
└── [design docs, plans, agent files]
```

---

## The 10 Prospecting Tools

### LinkedIn DM Tools (1–6)

| # | Name | Port | Server | HTML | Data File | Prospects | Status |
|---|------|------|--------|------|-----------|-----------|--------|
| 1 | B2B 1st Connections DM | 3851 | b2b-serve.js | b2b-outreach.html | b2b-prospects.json | 7 (6 DM'd, 1 queued) | ACTIVE |
| 2 | Cyber 1st Connections DM | 3852 | cyber-serve.js | cyber-outreach.html | cyber-prospects.json | 2 (2 DM'd) | ACTIVE |
| 3 | B2B 2nd Connections DM | 3853 | b2b-2nd-serve.js | b2b-2nd-outreach.html | b2b-2nd-prospects.json | 0 | BUILT, empty |
| 4 | Cyber 2nd Connections DM | 3854 | cyber-2nd-serve.js | cyber-2nd-outreach.html | cyber-2nd-prospects.json | 0 | BUILT, empty |
| 5 | Referral Partner 1st Connections | 3855 | referral-1st-serve.js | referral-1st-outreach.html | referral-1st-prospects.json | 7 (1 replied, 1 follow-up, 5 queued) | ACTIVE |
| 6 | Referral Partner 2nd Connections | 3856 | referral-2nd-serve.js | referral-2nd-outreach.html | referral-2nd-prospects.json | 0 | BUILT, empty |

### Email Tools (7–10)

| # | Name | Port | Server | HTML | Data File | Prospects | Status |
|---|------|------|--------|------|-----------|-----------|--------|
| 7 | B2B Leads w/ Emails | 3857 | b2b-email-serve.js | b2b-email-outreach.html | b2b-email-prospects.json | 0 | BUILT, empty |
| 8 | Cyber Leads w/ Emails | 3858 | cyber-email-serve.js | cyber-email-outreach.html | cyber-email-prospects.json | 0 | BUILT, empty |
| 9 | Substack Subscriber Emails | 3859 | substack-serve.js | substack-outreach.html | substack-prospects.json | 0 | BUILT, empty |
| 10 | Customers w/ Emails | 3860 | customer-serve.js | customer-outreach.html | customer-prospects.json | 0 | BUILT, empty |

---

## Tool Features (All 10 share this pattern)

- **Dashboard tab:** Today's Outreach summary bar, DM Today queue, Follow Up Today section, Replied section, Waiting for Response section
- **All Prospects tab:** Full list view with search/filter
- **Import tab:** CSV import (LinkedIn export format + headerless), manual add
- **Activity Log tab:** Timestamped record of every action
- **3-step DM sequence:** DM Sent → Follow-up 1 (day 3) → Follow-up 2 / Final Nudge (day 7) → Cold
- **Reply tracking:** Log replies with their text, set next step
- **Copy Message button:** One-click copy of templated outreach message
- **Preview button:** See full message before sending
- **Open LinkedIn button:** Quick link to prospect's profile
- **Auto-backup:** Last 5 backups kept, pruned on save
- **Activity log:** Max 500 entries per tool

### What's different per tool type:
- **1st Connection tools (1, 2, 5):** DM-focused. Prospect already connected on LinkedIn.
- **2nd Connection tools (3, 4, 6):** Connection request first, then DM after accepted.
- **Email tools (7, 8, 9, 10):** Email-based outreach instead of LinkedIn DMs. Different field structure (email address instead of LinkedIn URL).

---

## Main Pipeline Dashboard (Port 3847)

**Location:** `/Users/danefrederiksen/Desktop/Claude code/warming-app copy/`
**Server:** `node server.js` (NOT python — Python file is old/broken)
**Auth:** Username `dane`, password `da-pipeline-2026`

### Dashboard Stats
- **988 total prospects** in the pipeline
- 983 in "new" status (triage queue — not yet activated)
- 4 in "warming" (actively being engaged)
- 1 in "outreach_sent"

### Dashboard Features (6 tabs)
1. **Today:** DMs to send, follow-ups due, cooling alerts, reports to generate, connection requests to check
2. **Pipeline:** Kanban-style columns by status (new → warming → outreach_sent → replied → converted → dead)
3. **All Prospects:** Searchable/filterable list of all 988 prospects
4. **Import:** Batch import from Excel/CSV
5. **Templates:** 16 message templates (4 sequence types x 4 steps), editable
6. **Reports:** Weekly summary, funnel metrics, daily activity chart, sequence performance

### Sequence Engine
- **4 sequence types:** connected_icp, not_connected, referral_partner, podcast_guest
- **Cadence:** Offer DM → Follow-up 1 (2 days) → Follow-up 2 (2 days) → Follow-up 3 (2 days) → Exhausted
- **Engagement types:** comment, dm, follow_up, reply_received, connection_request
- **Connection request flow:** For not-connected prospects → pending 7 days → accepted (send DM) / snooze / give up

### Message Templates (16 total)
Stored in `data/templates.json`. Keyed by sequence_type + step:
- connected_icp: offer, followup_1, followup_2, followup_3
- not_connected: offer, followup_1, followup_2, followup_3
- referral_partner: offer, followup_1, followup_2, followup_3
- podcast_guest: offer, followup_1, followup_2, followup_3
- Variables: `{name}`, `{company}`

---

## Live Prospect Data (as of Mar 1, 2026)

### Tool #1 — B2B 1st Connections (7 prospects)
| Name | Company | Title | Status |
|------|---------|-------|--------|
| Alon Even | — | Global Fractional CMO & GTM Advisor | DM sent 3/1 |
| Brad Day | Orby AI | Founding Head of Marketing | DM sent 3/1 |
| Catherine Start Pradhan | Arize AI | Head of Marketing | DM sent 3/1 |
| Chris Heinemann | Invenir AI | Fractional CMO | DM sent 3/1 |
| Everett Butler | Lindy | Head of Marketing | DM sent 3/1 |
| Kevin White | Scrunch AI | Head of Marketing | DM sent 3/1 |
| Matt Bravo | Clinix AI | Chief Marketing Officer | Not started |

### Tool #2 — Cyber 1st Connections (2 prospects)
| Name | Company | Title | Status |
|------|---------|-------|--------|
| John Mitchell | CyberShield Inc | CISO | DM sent 3/1 |
| test name cyber 1 | test company | test title | DM sent 3/1 (test entry) |

### Tool #5 — Referral Partner 1st Connections (7 prospects)
| Name | Company | Title | Status |
|------|---------|-------|--------|
| Mike Chen | BrandForge Agency | Managing Director | **REPLIED** — "love the idea, let's chat next week" → Schedule call Tuesday |
| Lisa Park | RevOps Consulting | Partner | Follow-up 2 (final nudge sent) |
| Sarah Martinez | GrowthPath Marketing | Founder & CEO | Not started |
| Tom Bradley | Apex Growth Partners | CEO | Not started |
| Jessica Wong | ContentHive Agency | Creative Director | Not started |
| Ryan Patel | SalesForce Consulting | Founder | Not started |
| Amanda Liu | TechBridge Marketing | VP Marketing | Not started |

---

## Daily Outreach Plan

### LinkedIn DMs (Tools 1–6) — 30 DMs/day cap
- B2B + Cyber 1st conn: 3–4 new/day each → ~20 DMs/day steady state
- Referral 1st conn: 1–2 new/day → ~5 DMs/day
- 2nd conn tools: 3–4 new/day each → 25–40 connection requests/day

### Email (Tools 7–10) — No hard cap
- B2B + Cyber leads: 5–10/day each
- Substack subscribers: 3–5/day
- Customers: 2–3/day

### Daily Totals
- **~45–60 touches/day**
- **~225–300 touches/week** (3–4x previous ~65/week)

### Time Blocking
1. **Morning:** 1st conn DM tools (#1, #2, #5) — 15 min each
2. **Midday:** 2nd conn requests (#3, #4, #6) — 15 min each
3. **Afternoon:** Email tools (#7, #8, #9, #10) — 15 min each

---

## How to Start Everything

### All 10 prospect tools at once:
```bash
cd ~/Desktop/Claude\ code
node start-all.js
```
This launches ports 3851–3860. Press Ctrl+C to stop all.

### Individual tool:
```bash
node b2b-serve.js        # Tool #1 → http://localhost:3851
node cyber-serve.js      # Tool #2 → http://localhost:3852
node b2b-2nd-serve.js    # Tool #3 → http://localhost:3853
node cyber-2nd-serve.js  # Tool #4 → http://localhost:3854
node referral-1st-serve.js  # Tool #5 → http://localhost:3855
node referral-2nd-serve.js  # Tool #6 → http://localhost:3856
node b2b-email-serve.js     # Tool #7 → http://localhost:3857
node cyber-email-serve.js   # Tool #8 → http://localhost:3858
node substack-serve.js      # Tool #9 → http://localhost:3859
node customer-serve.js      # Tool #10 → http://localhost:3860
```

### Main pipeline dashboard:
```bash
cd ~/Desktop/Claude\ code/warming-app\ copy
node server.js           # Dashboard → http://localhost:3847
```
**Login:** dane / da-pipeline-2026

---

## Video Opportunity Report Agent

- **Agent prompt:** `video-opportunity-report-agent-v2.md`
- **Workflow:** `video-opportunity-workflow.md`
- **How to use:** Say "run this for [Company]" → Claude reads workflow → follows steps 1–11
- **Output:** HTML report → Chrome headless → PDF + infographic JPG
- **Templates:** BreachRX report (v4), DM infographic, full-size infographic
- **Pipeline integration:** Report tracking fields in dashboard (report_generated, report_date)

---

## Security & Backup

### Security Hardening
- Basic auth on dashboard (express-basic-auth)
- Rate limiting: 100 requests/min (express-rate-limit)
- CORS: localhost-only, external origins get 403
- XSS sanitization on all inputs
- Field validation (rejects non-LinkedIn URLs, invalid types)
- Data files: chmod 600 (owner-only)

### Backup Strategy
- **GitHub:** Private repo `github.com/danefrederiksen/digital-accomplice-tools`
  - Code, design docs, agent files backed up
  - Data files (prospects, templates, alerts) are gitignored
- **iCloud:** Data files copied to `iCloud Drive/DA-Backups/` with date stamps
- **Auto-backups:** Each tool keeps last 5 JSON backups in `data/backups/`
- **Cadence:** End of every Claude Code session

### What's NOT in GitHub (gitignored)
- prospects.json, alerts.json, templates.json
- data/backups/
- .xlsx files, PDFs, images, .docx
- Anything with real prospect data or generated deliverables

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `DA_Prospecting_Tool_Design.md` | System design doc — what exists, what's working, architecture |
| `DA_Prospecting_Dev_Plan.md` | 10-step build plan (ALL COMPLETE) |
| `Prospect_Tools_Roadmap.md` | Tool naming, ports, status overview |
| `Daily_Outreach_Plan.md` | Per-tool daily targets, time blocking, platform limits |
| `video-opportunity-report-agent-v2.md` | Report agent prompt (v2) |
| `video-opportunity-workflow.md` | Step-by-step report generation workflow |
| `import-research-prospects.js` | Bulk import script for researched prospects |
| `start-all.js` | Launches all 10 tools at once |
| `server.py.OLD_DO_NOT_USE` | Dead Python server — DO NOT RUN |

---

## Known Issues

1. **Dashboard stale-UI:** `gotReply()` grays out card but doesn't trigger full page refresh — pipeline column counts look stale until manual reload. Cosmetic only.
2. **Two junk entries in dashboard import:** "Dave Convio Austin / Fake Company" and "STS Marketing / School Tech Supply" — from source data, not parsing errors. Should be cleaned out.
3. **Test entry in Cyber tool:** "test name cyber 1" in Tool #2 — should be deleted.
4. **Report stat note:** YouTube 16.1% AI citation stat is Perplexity-specific, not "all AI search."

---

## Brand Guidelines

- **DA Orange:** #F38B1C
- **Black:** #000000
- **Blue-Gray:** #5A6B7A
- **Gray:** #CBCBCB
- **White:** #FFFFFF
- **Light Gray:** #F5F5F5
- **Fonts:** Inter / Arial / Helvetica
- **Voice:** Direct, data-first, no-BS, short sentences
- **Do NOT use:** #F5A623, #AAAAAA, #F0F0F0

---

## What's Next

All 10 tools and the dashboard are built. The system is ready for daily use. Next priorities:
- Load real prospects into Tools 3, 4, 6–10 (currently empty)
- Clean out test/junk entries
- Start daily outreach using the time-blocking plan
- First weekly review when a full week of data exists
- Evaluate Lime CRM integration after real pipeline data proves the workflow
