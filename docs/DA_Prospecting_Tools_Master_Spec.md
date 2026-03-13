# DA Prospecting Tools — Master Specification
**Version:** 1.0 | **Date:** 2026-03-09 | **Status:** Baseline for QA testing

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tool-by-Tool Specifications](#tool-by-tool-specifications)
4. [Cross-Tool Integration](#cross-tool-integration)
5. [Feature Matrix](#feature-matrix)
6. [Status Flows](#status-flows)
7. [Template System](#template-system)
8. [Daily Targets](#daily-targets)
9. [Known Issues & Gaps](#known-issues--gaps)
10. [QA Test Plan](#qa-test-plan)

---

## 1. System Overview

12 prospecting tools + 1 hub dashboard. Each tool is a single-file HTML app backed by a Node.js Express server. All share a `data/` folder for JSON storage. Tools are grouped by **channel** (LinkedIn DM vs Email) and **segment** (B2B, Cyber, Referral, Substack, Customer).

### Tool Categories

| Category | Tools | Channel | Core Action |
|----------|-------|---------|-------------|
| **LinkedIn 1st Connection DMs** | #1 B2B, #2 Cyber, #5 Referral | LinkedIn DM | Send DM to existing connections |
| **LinkedIn 2nd Connection Warming** | #3 B2B, #4 Cyber, #6 Referral | LinkedIn Comment → DM | Comment on posts to warm, then DM |
| **Email Outreach** | #7 B2B, #8 Cyber, #9 Substack, #10 Customer, #12 Referral | Email | Send email sequences |
| **Cross-Tool Aggregator** | #11 Comment Queue | LinkedIn Comment | Unified comment tracking across #3, #4, #5, #6 |

### What Makes Each Category Different

**1st Connection DMs (#1, #2, #5):** You're already connected on LinkedIn. Tool shows prospect → you copy a DM template → paste into LinkedIn → mark sent → tool tracks follow-ups on a timed cadence.

**2nd Connection Warming (#3, #4, #6):** You're NOT connected. Can't DM directly. Instead: comment on their posts to get on their radar → after enough comments, send a connection request → once connected, send DM. Tool #11 (Comment Queue) aggregates the commenting workflow.

**Email Outreach (#7, #8, #9, #10, #12):** You have their email. Tool shows prospect → you copy email template → paste into Gmail → mark sent → tool tracks follow-ups.

**Comment Queue (#11):** Reads prospect data from Tools #3, #4, #5, #6. Tracks comments per prospect. When comment count hits 4, prospect becomes "DM-ready." Provides daily target selection algorithm.

---

## 2. Architecture

### Startup
```
node start-all.js    ← launches all 13 servers as child processes
```

### Port Map

| Port | Tool | Name |
|------|------|------|
| 3849 | Hub | Hub Dashboard (cross-tool aggregator) |
| 3851 | #1 | B2B 1st Connections DM Tracker |
| 3852 | #2 | Cyber 1st Connections DM Tracker |
| 3853 | #3 | B2B 2nd Connections DM Tracker |
| 3854 | #4 | Cyber 2nd Connections DM Tracker |
| 3855 | #5 | Referral Partner 1st Connections |
| 3856 | #6 | Referral Partner 2nd Connections |
| 3857 | #7 | B2B Leads w/ Emails |
| 3858 | #8 | Cyber Leads w/ Emails |
| 3859 | #9 | Substack Subscriber Emails |
| 3860 | #10 | Customers w/ Emails |
| 3861 | #11 | Comment Queue (unified) |
| 3862 | #12 | Referral Partner Emails |

### Shared Infrastructure
- **Localhost only:** All servers bind to `127.0.0.1`
- **CORS:** Restricted to same-origin localhost
- **Data directory:** `/Users/danefrederiksen/Desktop/Claude code/data/`
- **Backups:** `data/backups/` — auto-backup on every save, max 5 per tool
- **Sanitization:** Server strips control chars; client HTML-escapes via `esc()`
- **IDs:** UUID v4 for all prospects
- **Dedup:** By email (lowercase) on import
- **Activity logs:** Capped at 500 entries per tool

### Data Files Per Tool

| Tool | Prospects File | Activity File |
|------|---------------|---------------|
| #1 | `data/b2b-1st-prospects.json` | `data/b2b-1st-activity.json` |
| #2 | `data/cyber-1st-prospects.json` | `data/cyber-1st-activity.json` |
| #3 | `data/b2b-2nd-prospects.json` | `data/b2b-2nd-activity.json` |
| #4 | `data/cyber-2nd-prospects.json` | `data/cyber-2nd-activity.json` |
| #5 | `data/referral-1st-prospects.json` | `data/referral-1st-activity.json` |
| #6 | `data/referral-2nd-prospects.json` | `data/referral-2nd-activity.json` |
| #7 | `data/b2b-email-prospects.json` | `data/b2b-email-activity.json` |
| #8 | `data/cyber-email-prospects.json` | `data/cyber-email-activity.json` |
| #9 | `data/substack-prospects.json` | `data/substack-activity.json` |
| #10 | `data/customer-prospects.json` | `data/customer-activity.json` |
| #11 | `data/comment-log.json` + `data/warming-dm-log.json` + `data/screenshots.json` + `data/daily-overrides.json` | (no separate activity file) |
| #12 | `data/referral-email-prospects.json` | `data/referral-email-activity.json` |

---

## 3. Tool-by-Tool Specifications

---

### Tool #1 — B2B 1st Connections DM Tracker
**Port:** 3851 | **Files:** `tools/b2b-outreach.html` + `tools/b2b-serve.js`

**Purpose:** Track LinkedIn DM outreach to B2B prospects you're already connected with on LinkedIn.

**Prospect Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated |
| `name` | string | Full name (required) |
| `company` | string | Company name |
| `title` | string | Job title |
| `linkedinUrl` | string | LinkedIn profile URL |
| `status` | string | Current workflow status |
| `dmSentDate` | date/null | When DM was sent |
| `followUp1Due` | date/null | Auto-set: dmSentDate + 3 days |
| `followUp2Due` | date/null | Auto-set: dmSentDate + 7 days |
| `followUp3Due` | date/null | Auto-set: dmSentDate + 14 days |
| `lastActionDate` | date/null | Most recent action |
| `reply` | string | Their reply text |
| `nextStep` | string | Next action planned |
| `offer` | string | Which offer/message variant used |
| `abVariant` | string | A/B test variant label |

**Status Flow:**
```
not_started → dm_sent → follow_up_1 → follow_up_2 → follow_up_3 → replied OR exhausted
                                                                      ↑ (Got Reply at any stage)
```

**Follow-Up Cadence:** DM → +3 days → Follow-Up 1 → +4 days → Follow-Up 2 → +7 days → Follow-Up 3

**Daily Target:** 4 DMs/day

**UI Tabs:** Dashboard, Import, All Prospects, A/B Report, Activity Log

**Template System:** localStorage key `da_templates_tool1`. 4 steps: `offer`, `followup_1`, `followup_2`, `followup_3`. Variables: `{name}`, `{company}`.

**Unique Features:**
- A/B Report tab: tracks which offer variant gets better reply rates
- `offer` and `abVariant` fields for split testing
- Open LinkedIn button on cards (opens profile URL)
- Activity Feed link (constructs `/recent-activity/all/` URL from LinkedIn slug)

---

### Tool #2 — Cyber 1st Connections DM Tracker
**Port:** 3852 | **Files:** `tools/cyber-outreach.html` + `tools/cyber-serve.js`

**Purpose:** Same as Tool #1 but for cybersecurity vertical prospects.

**Identical to Tool #1 in:** Schema, status flow, follow-up cadence, UI tabs, action buttons, A/B testing.

**Differences from Tool #1:**
- Different default template text (cybersecurity-focused messaging)
- Template localStorage key: `da_templates_tool2`
- Data files: `cyber-1st-prospects.json` / `cyber-1st-activity.json`
- Has `draftReply` field (auto-generates a reply when prospect responds)
- Daily target: 4 DMs/day

---

### Tool #3 — B2B 2nd Connections DM Tracker
**Port:** 3853 | **Files:** `tools/b2b-2nd-outreach.html` + `tools/b2b-2nd-serve.js`

**Purpose:** Track warming + DM outreach to B2B prospects you're NOT connected with. Requires commenting on their posts first, then connecting, then DM'ing.

**Prospect Schema — extends Tool #1 with:**

| Field | Type | Description |
|-------|------|-------------|
| `connected` | boolean | Whether you're now connected (starts `false`) |
| `comment_count` | integer | Comments logged (updated by Tool #11) |
| `last_commented` | date/null | Last comment date (updated by Tool #11) |
| `warming_dm_sent` | date/null | When warming DM sent (updated by Tool #11) |
| `warming_reply_date` | date/null | When reply received (updated by Tool #11) |
| `connectionRequestDate` | date/null | When connection request was sent |
| `draftReply` | string | Auto-generated reply draft |

**Status Flow:**
```
not_started → commenting (via Tool #11) → connection_sent → connected → dm_sent → follow_up_1 → follow_up_2 → follow_up_3 → replied OR exhausted
```

**Key Behavior:**
1. Prospect starts as `not_started`, `connected: false`
2. Use Tool #11 (Comment Queue) to log comments on their posts
3. After 4+ comments, prospect becomes "DM-ready" in Tool #11
4. Send connection request → mark `connection_sent`
5. When accepted → mark `connected: true`
6. Now follows same DM sequence as Tool #1 (offer → follow-ups)

**Daily Target:** 4 DMs/day (for connected prospects ready for DM)

**UI Tabs:** Dashboard, Import, All Prospects, Activity Log

**Unique Features:**
- `connected` toggle on cards (switches between warming and DM workflows)
- Editable LinkedIn URL field
- Comment count badge visible on cards
- Warming status indicator (from Tool #11 data)

---

### Tool #4 — Cyber 2nd Connections DM Tracker
**Port:** 3854 | **Files:** `tools/cyber-2nd-outreach.html` + `tools/cyber-2nd-serve.js`

**Purpose:** Same as Tool #3 but for cybersecurity vertical.

**Identical to Tool #3 in:** Schema (with warming fields), status flow, UI tabs.

**Differences from Tool #3:**
- Cybersecurity-focused templates
- Template localStorage key: `da_templates_tool4`
- Data files: `cyber-2nd-prospects.json` / `cyber-2nd-activity.json`
- Has `abVariants` in ALLOWED_FIELDS (but NOT `draftReply` — inconsistency)
- Daily target: 4 DMs/day

---

### Tool #5 — Referral Partner 1st Connections
**Port:** 3855 | **Files:** `tools/referral-1st-outreach.html` + `tools/referral-1st-serve.js`

**Purpose:** Track DM outreach to referral partners (agencies, consultants) you're already connected with.

**Schema:** Same as Tool #1 (1st connection DM fields).

**Status Flow:** Same as Tool #1 (dm_sent → follow-ups → replied/exhausted).

**Differences from Tool #1:**
- Referral-focused templates (partnership language, not sales)
- Template localStorage key: `da_templates_tool5`
- Rate-limited DM queue: shows only 2 prospects at a time (not all)
- Daily target: 2 DMs/day
- A/B Report tab present
- Additional warming fields: `comment_count`, `last_commented` (read by Tool #11)

**Note:** Even though this is a "1st connection" tool, Tool #11 still reads from it for commenting because referral partners benefit from warming even when connected.

---

### Tool #6 — Referral Partner 2nd Connections
**Port:** 3856 | **Files:** `tools/referral-2nd-outreach.html` + `tools/referral-2nd-serve.js`

**Purpose:** Track warming + DM outreach to referral partners you're NOT connected with.

**Schema:** Same as Tool #3 (2nd connection fields with warming data).

**Status Flow:** Same as Tool #3 (commenting → connection → DM sequence).

**Differences from Tool #3:**
- Referral-focused templates
- Template localStorage key: `da_templates_tool6`
- Editable LinkedIn URL field
- Has A/B templates but NO A/B Report tab (inconsistency)
- Does NOT have comment warming step in its own UI (relies entirely on Tool #11)
- Daily target: 2 DMs/day

---

### Tool #7 — B2B Leads w/ Emails
**Port:** 3857 | **Files:** `tools/b2b-email-outreach.html` + `tools/b2b-email-serve.js`

**Purpose:** Track email outreach to B2B prospects where you have their email address.

**Prospect Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Auto-generated |
| `name` | string | Full name (required) |
| `company` | string | Company name |
| `title` | string | Job title |
| `email` | string | Email address (required, dedup key) |
| `linkedinUrl` | string | LinkedIn profile URL |
| `source` | string | Lead source |
| `status` | string | Current workflow status |
| `emailSentDate` | date/null | When first email sent |
| `followUp1Due` | date/null | Auto-set: emailSentDate + 4 days |
| `followUp2Due` | date/null | Auto-set: emailSentDate + 9 days |
| `lastActionDate` | date/null | Most recent action |
| `reply` | string | Their reply text |
| `nextStep` | string | Next action planned |

**Status Flow:**
```
not_started → email_sent → follow_up_1 → follow_up_2 → replied OR cold
                                                          ↑ (Got Reply at any stage)
```

**Follow-Up Cadence:** Email → +4 days → Follow-Up 1 → +5 days → Follow-Up 2 (final nudge)

**Daily Target:** 10 emails/day

**UI Tabs:** Dashboard, Import, All Prospects, Activity Log

**Template System:** localStorage key `da_templates_tool7`. 3 steps: `email`, `follow_up_1`, `follow_up_2`. Each has `subject` + `body`. Variables: `{name}`, `{company}`.

**Action Buttons:**
- Not Started: Copy Subject, Copy Email, Preview, Mark Email Sent
- Email Sent (follow-up due): Copy Subject, Copy Email, Preview, Mark Follow-Up Sent, Got Reply
- Follow-Up 1 (final nudge due): Copy Subject, Copy Email, Preview, Mark Final Nudge Sent, Got Reply
- Follow-Up 2 (5+ days, no reply): Mark Cold, Got Reply
- Replied: Reply textarea, Next Step input, Activity Feed link

**Unique Features:**
- CSV import with title keyword filter (executive titles only)
- Timeline visualization (3-step: Email → Follow-Up → Final Nudge)
- Activity Feed URL auto-constructed from LinkedIn URL
- Preview toggle shows full rendered message inline

---

### Tool #8 — Cyber Leads w/ Emails
**Port:** 3858 | **Files:** `tools/cyber-email-outreach.html` + `tools/cyber-email-serve.js`

**Purpose:** Same as Tool #7 but for cybersecurity vertical.

**Identical to Tool #7 in:** Schema, status flow, follow-up cadence, UI tabs, daily target (10/day).

**Differences:**
- Cybersecurity-focused templates and import title filter (CISO, CTO, VP Security, etc.)
- Template localStorage key: `da_templates_tool8`
- Data files: `cyber-email-prospects.json` / `cyber-email-activity.json`

---

### Tool #9 — Substack Subscriber Emails
**Port:** 3859 | **Files:** `tools/substack-outreach.html` + `tools/substack-serve.js`

**Purpose:** Track email outreach to your Substack newsletter subscribers.

**Schema — extends Tool #7 with:**

| Field | Type | Description |
|-------|------|-------------|
| `subscribedDate` | date/null | When they subscribed to the Substack |

**Status Flow:** Same as Tool #7.

**Differences from Tool #7:**
- **Longer follow-up cadence:** +5 days (follow-up 1), +12 days (follow-up 2)
- **Daily target:** 5 emails/day (not 10)
- **No title filter on import** — all subscribers are valid
- **Substack CSV auto-detection:** Looks for `email` + `created_at` columns
- **Name extraction from email prefix** when no name provided
- **UI labels:** "All Subscribers" tab (not "All Prospects")
- **Subscriber badge** shows `subscribedDate` on cards
- Template localStorage key: `da_templates_tool9`

---

### Tool #10 — Customers w/ Emails
**Port:** 3860 | **Files:** `tools/customer-outreach.html` + `tools/customer-serve.js`

**Purpose:** Re-engage existing customers for upsells and referrals. Uses a softer, relationship-first cadence.

**Schema — extends Tool #7 with:**

| Field | Type | Description |
|-------|------|-------------|
| `lastProject` | string | Name of last project/engagement |
| `lastProjectDate` | date/null | When last project happened |
| `customerSince` | date/null | When relationship began |

**Status Flow — DIFFERENT from all other email tools:**
```
not_started → check_in_sent → follow_up_sent → ask_sent → replied OR nurture
                                                             ↑ (Got Reply at any stage)
```

**Follow-Up Cadence — longest of all tools:**
- Check-In → +7 days → Value Add → +10 days → Ask

**Daily Target:** 3 touches/day (lowest of all tools)

**Template Steps (different names):** `check_in`, `value_add`, `ask`

**Unique Features:**
- **Nurture status:** Instead of "cold," customers go to "nurture" (preserves relationship)
- **Re-Engage button:** Resets nurture prospects to `not_started` while preserving customer history fields
- **Customer fields preserved on reset:** `lastProject`, `lastProjectDate`, `customerSince`, `reply`, `nextStep`
- **Timeline labels:** "Check-In → Value Add → Ask" (not "Email → Follow-Up → Final Nudge")
- Template localStorage key: `da_templates_tool10`

---

### Tool #11 — Comment Queue (Unified Cross-Tool Aggregator)
**Port:** 3861 | **Files:** `tools/comment-queue.html` + `tools/comment-queue-serve.js`

**Purpose:** Unified commenting workflow that reads prospects from Tools #3, #4, #5, #6 and tracks comment warming progress toward DM readiness.

**THIS TOOL IS FUNDAMENTALLY DIFFERENT.** It doesn't have its own prospects — it aggregates from 4 source tools and writes warming data back to them.

**Source Tools:**

| Segment Key | Source Tool | Data File |
|-------------|------------|-----------|
| `b2b_2nd` | #3 B2B 2nd | `data/b2b-2nd-prospects.json` |
| `cyber_2nd` | #4 Cyber 2nd | `data/cyber-2nd-prospects.json` |
| `referral_1st` | #5 Referral 1st | `data/referral-1st-prospects.json` |
| `referral_2nd` | #6 Referral 2nd | `data/referral-2nd-prospects.json` |

**Fields Written Back to Source Files:**
- `comment_count` — incremented each time a comment is logged
- `last_commented` — timestamp of most recent comment
- `warming_dm_sent` — timestamp when DM sent from DM Queue
- `warming_reply_date` — timestamp when reply received

**Warming Pipeline (derived statuses, not stored):**
```
not_started (0 comments) → commenting (1-3 comments) → dm_ready (4+ comments) → dm_sent → replied
```

**Key constant:** `COMMENTS_TO_DM = 4` (4 comments before DM-ready)

**Daily Target Algorithm:**
- **Target:** 8 comments/day, 40/week
- **Priority tiers:** (1) Engaged but 0 comments, (2) Stale 3+ weeks, (3) Refresh 1-3 weeks, (4) New/never commented, (5) Recently commented
- **Deterministic daily shuffle:** Same targets every load on the same day
- **Segment round-robin:** Distributes evenly across all 4 source tools
- **Screenshot override:** Upload Sales Nav screenshot → OCR → match names → set as today's targets

**UI Tabs (6):**
1. **Search** — Instant search across all 4 source tools. Log Comment button. Daily target grid (8 cards). Today's comment count.
2. **DM Queue** — Prospects with 4+ comments ready for DM. Personalized DM template per segment. Copy + Mark DM Sent buttons.
3. **Sent / Replies** — Conversion funnel stats. All DM'd prospects with reply tracking.
4. **History** — Comment history filterable by segment. Grouped by date.
5. **All Prospects** — All prospects from all 4 sources. Sort by: name, comment count, recently commented, needs attention, warming progress.
6. **Uploads** — Screenshot upload with OCR. Name extraction and prospect matching. "Set as Today's Targets."

**DM Templates:** Stored server-side (not localStorage). One template per segment with `{name}`, `{company}` variables.

---

### Tool #12 — Referral Partner Emails
**Port:** 3862 | **Files:** `tools/referral-email-outreach.html` + `tools/referral-email-serve.js`

**Purpose:** Track email outreach to referral partners where you have their email.

**Schema — extends Tool #7 with:**

| Field | Type | Description |
|-------|------|-------------|
| `draftReply` | string | Auto-generated reply draft for when they respond |

**Status Flow:** Same as Tool #7.

**Follow-Up Cadence:** Same as Tool #7 (+4/+9 days).

**Daily Target:** 3 emails/day

**Unique Features:**
- **Draft Reply system:** When prospect replies, auto-generates a response draft. Editable textarea. Copy Draft button.
- **Import title filter:** Includes `partner` and `agency` keywords
- Template localStorage key: `da_templates_tool12`

---

## 4. Cross-Tool Integration

### Data Flow Diagram
```
                    LINKEDIN DM TOOLS                          EMAIL TOOLS
                    ─────────────────                          ───────────

   1st Connections:                                    Independent (no cross-tool):
   #1 B2B 1st ─── standalone                          #7 B2B Email
   #2 Cyber 1st ── standalone                         #8 Cyber Email
   #5 Referral 1st ──┐                                #9 Substack Email
                      │                                #10 Customer Email
   2nd Connections:   │    reads from                  #12 Referral Email
   #3 B2B 2nd ───────┼──→ #11 Comment Queue
   #4 Cyber 2nd ─────┤    (writes back warming data)
   #6 Referral 2nd ──┘
```

### How Tool #11 Connects to Source Tools

1. **Tool #11 reads** prospect name, company, LinkedIn URL, and warming fields from source JSON files
2. **When you log a comment** in Tool #11, it increments `comment_count` and updates `last_commented` in the source tool's JSON file
3. **When you send a DM** from Tool #11's DM Queue, it sets `warming_dm_sent` in the source file
4. **When you mark a reply** in Tool #11, it sets `warming_reply_date` in the source file
5. **No file locking** — all servers read/write the same JSON files. Low risk for single user.

### Tools That Are Completely Independent
Tools #1, #2, #7, #8, #9, #10, #12 have zero cross-tool data sharing. Each has its own prospects file and activity log.

---

## 5. Feature Matrix

| Feature | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 | #11 | #12 |
|---------|----|----|----|----|----|----|----|----|----|----|-----|-----|
| Search bar | - | - | - | - | - | - | - | - | - | - | YES | - |
| Activity Feed link | - | - | - | - | - | - | YES | YES | YES | YES | YES | YES |
| Delete on dashboard | - | - | - | - | - | - | - | - | - | - | n/a | - |
| Open LinkedIn button | YES | YES | YES | YES | YES | YES | YES | YES | - | YES | YES | YES |
| Message templates | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| A/B testing / offer field | YES | YES | - | - | YES | - | - | - | - | - | - | - |
| A/B Report tab | YES | YES | - | - | YES | - | - | - | - | - | - | - |
| Draft Reply on replies | - | YES | YES | - | - | - | - | - | - | - | - | YES |
| Editable LinkedIn URL | - | - | YES | - | - | YES | - | - | - | - | - | - |
| Connected toggle | - | - | YES | YES | - | YES | - | - | - | - | - | - |
| Comment warming fields | - | - | YES | YES | YES | YES | - | - | - | - | YES | - |
| CSV import | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | - | YES |
| Screenshot upload/OCR | - | - | - | - | - | - | - | - | - | - | YES | - |
| Daily target display | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| Email copy (subject+body) | - | - | - | - | - | - | YES | YES | YES | YES | - | YES |
| DM template copy | YES | YES | YES | YES | YES | YES | - | - | - | - | YES | - |

**Legend:** YES = feature exists, `-` = feature missing, n/a = not applicable

---

## 6. Status Flows

### LinkedIn DM Tools (#1, #2, #3, #4, #5, #6)
```
not_started → dm_sent → follow_up_1 → follow_up_2 → follow_up_3 → replied OR exhausted
```
- **Cadence:** DM → +3d → FU1 → +4d → FU2 → +7d → FU3
- **4 follow-up steps** (3 follow-ups after initial DM)

### 2nd Connection Pre-Sequence (#3, #4, #6 only)
```
not_started → [commenting via #11] → connection_sent → connected → (enters DM sequence above)
```

### Email Tools (#7, #8, #12)
```
not_started → email_sent → follow_up_1 → follow_up_2 → replied OR cold
```
- **Cadence:** Email → +4d → FU1 → +5d → FU2 (final nudge)
- **3 steps total** (2 follow-ups after initial email)

### Substack Email (#9)
```
not_started → email_sent → follow_up_1 → follow_up_2 → replied OR cold
```
- **Cadence:** Email → +5d → FU1 → +7d → FU2 (longer/softer cadence)

### Customer Email (#10)
```
not_started → check_in_sent → follow_up_sent → ask_sent → replied OR nurture
```
- **Cadence:** Check-In → +7d → Value Add → +10d → Ask (longest cadence)
- **Different labels:** Check-In, Value Add, Ask (not Email, Follow-Up, Final Nudge)
- **Nurture instead of Cold:** Customers can be re-engaged later

### Comment Queue Warming (#11)
```
not_started (0 comments) → commenting (1-3) → dm_ready (4+) → dm_sent → replied
```
- **Derived status** — computed from `comment_count` and DM fields, not stored

---

## 7. Template System

### Storage
- **LinkedIn DM tools (#1-#6):** localStorage per browser, key pattern `da_templates_toolN`
- **Email tools (#7-#10, #12):** localStorage per browser, key pattern `da_templates_toolN`
- **Comment Queue DM templates (#11):** Server-side in memory (not localStorage, not file)

**Risk:** Templates in localStorage are lost if browser cache is cleared. Not backed up with data.

### Template Variables
All tools support: `{name}`, `{company}` — replaced at render time.

### Template Steps by Tool Category

| Category | Steps |
|----------|-------|
| LinkedIn DM (#1-#6) | `offer`, `followup_1`, `followup_2`, `followup_3` |
| Email (#7, #8, #12) | `email` (subj+body), `follow_up_1` (subj+body), `follow_up_2` (subj+body) |
| Substack (#9) | Same as email tools |
| Customer (#10) | `check_in` (subj+body), `value_add` (subj+body), `ask` (subj+body) |
| Comment Queue (#11) | One DM template per segment (b2b_2nd, cyber_2nd, referral_1st, referral_2nd) |

### Template Editor
- Pencil icon in header opens modal
- Edit template text with `{name}` and `{company}` placeholders
- Save to localStorage on close

---

## 8. Daily Targets

| Tool | Target | Unit |
|------|--------|------|
| #1 B2B 1st DM | 4/day | DMs sent |
| #2 Cyber 1st DM | 4/day | DMs sent |
| #3 B2B 2nd DM | 4/day | DMs sent (to connected prospects) |
| #4 Cyber 2nd DM | 4/day | DMs sent (to connected prospects) |
| #5 Referral 1st DM | 2/day | DMs sent |
| #6 Referral 2nd DM | 2/day | DMs sent (to connected prospects) |
| #7 B2B Email | 10/day | Emails sent |
| #8 Cyber Email | 10/day | Emails sent |
| #9 Substack Email | 5/day | Emails sent |
| #10 Customer Email | 3/day | Touches |
| #11 Comment Queue | 8/day (40/week) | Comments logged |
| #12 Referral Email | 3/day | Emails sent |

**Total daily capacity:** ~20 DMs + ~31 emails + 8 comments = ~59 touches/day

---

## 9. Known Issues & Gaps

### Data Issues (from Fix Plan)
1. **Tool #4 junk data:** ~60-80 junk records of 245 total need cleanup
2. **Tool #3 misclassified data:** 13 wrong-segment, 6 dupes, 7 swapped fields
3. **Cross-tool duplicates:** 27 people appear in both #1 and #5 (need classification)
4. **Comment log junk:** Entries from junk prospects need removal

### Feature Inconsistencies
5. **Search bar missing:** Only Tool #11 has instant search. Tools #1-#10 and #12 lack it.
6. **Activity Feed link missing:** Tools #1-#6 don't have it (email tools do)
7. **Delete button missing on dashboard cards:** No tool has delete on the dashboard view
8. **Draft Reply inconsistency:** Only Tools #2, #3, #12 have it. Missing from #1, #4, #5, #6.
9. **A/B Report tab inconsistency:** Only #1, #2, #5 have it. Tool #6 has A/B templates but no report tab.
10. **Editable LinkedIn URL:** Only Tools #3 and #6. Missing from all others.
11. **ALLOWED_FIELDS mismatch:** Tool #4 has `abVariants` but not `draftReply`. Tool #3 has `draftReply` but not `abVariants`.
12. **Tool #1 missing:** "Open LinkedIn" button on Replied cards
13. **Template storage risk:** All templates in localStorage — not backed up, lost on cache clear

### Missing Features (from Fix Plan)
14. **Hub Dashboard (port 3849):** Planned but not fully built. Should show cross-tool daily/weekly totals.
15. **Editable offer / A/B testing:** Should exist on all tools, currently only on #1, #2, #5.
16. **Data import for email tools:** Tools #7, #9, #10, #12 need CSV files from Dane.

---

## 10. QA Test Plan

### Per-Tool Smoke Test (run for each of the 12 tools)

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Server starts on correct port | `http://localhost:{port}` loads UI |
| 2 | Import a prospect (manual add) | Prospect appears in dashboard |
| 3 | Import CSV (if applicable) | Prospects added, duplicates skipped |
| 4 | View templates | Template editor opens, shows correct steps |
| 5 | Edit a template | Saved to localStorage, persists on reload |
| 6 | Copy template to clipboard | Correct text with variables replaced |
| 7 | Take first action (Send DM / Send Email) | Status changes, follow-up dates set |
| 8 | Verify follow-up timing | Follow-up card appears on correct date |
| 9 | Take follow-up action | Status advances correctly |
| 10 | Mark as Replied | Reply textarea appears, can save text |
| 11 | Mark as Exhausted/Cold | Card moves to correct section |
| 12 | Reset prospect | All sequence fields cleared, status back to `not_started` |
| 13 | Delete prospect | Removed from all views |
| 14 | Activity log records actions | Each action creates a log entry |
| 15 | Daily target counter | Shows correct count for today |
| 16 | Page reload preserves data | All data intact after refresh |

### Tool #11 Integration Tests

| # | Test | Expected Result |
|---|------|-----------------|
| 17 | Search finds prospects from all 4 sources | Results from #3, #4, #5, #6 |
| 18 | Log a comment | `comment_count` incremented in source file |
| 19 | 4th comment triggers dm_ready | Prospect appears in DM Queue |
| 20 | Copy DM template | Correct segment-specific template |
| 21 | Mark DM Sent | `warming_dm_sent` set in source file |
| 22 | Mark Reply Received | `warming_reply_date` set in source file |
| 23 | Daily targets load (8 prospects) | Algorithm selects from all segments |
| 24 | Conversion funnel stats | Counts match actual data |

### Cross-Tool Data Integrity Tests

| # | Test | Expected Result |
|---|------|-----------------|
| 25 | Edit prospect in Tool #3, verify in #11 | Changes visible in Comment Queue |
| 26 | Log comment in #11, verify in #3 | `comment_count` updated in Tool #3 data |
| 27 | Start all servers simultaneously | No port conflicts, all 13 start |
| 28 | Concurrent writes (unlikely but possible) | No data corruption |

---

## Appendix: Quick Reference

### Starting Everything
```bash
cd /Users/danefrederiksen/Desktop/Claude\ code
node start-all.js
```

### URLs
```
Hub Dashboard:        http://localhost:3849
Tool #1  B2B 1st DM:  http://localhost:3851
Tool #2  Cyber 1st:   http://localhost:3852
Tool #3  B2B 2nd:     http://localhost:3853
Tool #4  Cyber 2nd:   http://localhost:3854
Tool #5  Referral 1st: http://localhost:3855
Tool #6  Referral 2nd: http://localhost:3856
Tool #7  B2B Email:   http://localhost:3857
Tool #8  Cyber Email:  http://localhost:3858
Tool #9  Substack:    http://localhost:3859
Tool #10 Customer:    http://localhost:3860
Tool #11 Comment Q:   http://localhost:3861
Tool #12 Referral Email: http://localhost:3862
```
