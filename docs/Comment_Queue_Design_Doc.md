# Prospecting Tool #11 — Comment Queue (Unified)

## Design Doc — Created Mar 1, 2026

---

## Problem

Tools 3, 4, and 6 are 2nd connection tools. The strategy is: comment on their posts first to warm them up, THEN send a connection request + DM.

But when Dane checks Sales Navigator alerts and sees 20 people posted, he has no idea which ones are in his system or which segment they belong to. He'd have to search three separate tools for every name. That's unworkable.

Commenting is ONE activity across three tools. It needs ONE interface.

---

## Solution

A unified Comment Queue tool that:

1. **Pulls prospect data from Tools 3, 4, and 6** (reads their JSON data files)
2. **Instant search bar** — type a name, instantly see if they're a prospect and which segment
3. **Logs comments** back to the correct source tool's data file
4. **Tracks commenting activity** — who you've commented on, when, how many times

---

## Daily Workflow (Exact Steps)

### Setup
- **Tab 1:** Sales Navigator alerts (LinkedIn)
- **Tab 2:** Comment Queue tool (http://localhost:3861)

### The Flow (10-15 min/day)

1. Open Sales Nav alerts — see 20 people posted
2. Go through each alert:
   - See name (e.g., "Sarah Chen posted about cybersecurity hiring")
   - Switch to Tab 2, type "Sarah" in search bar
   - **Match found:** "Sarah Chen — Cyber 2nd Connection (Tool #4)" → go comment on her post → come back, click "Commented" → logged
   - **No match:** skip in 3 seconds, move to next alert
3. Out of 20 alerts, typically 2-5 are actual prospects. The rest you skip instantly.
4. Done. Comments logged to the right tool automatically.

---

## Features

### 1. Unified Search Bar (the core feature)
- Single text input at top of page
- Searches across all three source tools simultaneously
- Shows: Name, Company, Segment (B2B 2nd / Cyber 2nd / Referral 2nd), Source Tool (#)
- Instant results as you type (filter on keyup)
- If no match: shows "Not in system — skip"

### 2. Quick Comment Logger
- When a prospect is found via search, show a "Log Comment" button
- One click logs the comment with today's date
- Writes back to the source tool's JSON file (e.g., Tool #4's data)
- Optional: paste the post URL for reference

### 3. Comment History
- Shows all comments logged today / this week
- Grouped by segment
- Running count: "3 comments today (target: 8)"

### 4. Activity Tracking Per Prospect
- `last_commented` — date of most recent comment
- `comment_count` — total comments logged
- `last_checked` — date you last looked at their profile
- `days_since_last_post` — if tracked, helps identify inactive prospects

### 5. Inactive Prospect Flagging
- If a prospect hasn't posted in 3+ weeks (based on last_commented or manual flag):
  - Flag as "Inactive on LinkedIn"
  - Suggest: "Consider cold connection request instead"
  - Dane can choose to keep monitoring or skip

### 6. Daily Stats Bar
- Comments logged today
- Target progress (e.g., 5/8 comments today)
- Breakdown by segment

---

## Technical Spec

### Files
- `comment-queue.html` — single-file HTML app (same pattern as Tools 1-10)
- `comment-queue-serve.js` — Node.js Express server
- Port: **3861**

### Data Strategy
- **Does NOT have its own prospect data.** Reads from Tools 3, 4, 6 JSON files.
- **Comment log:** Own file at `data/comment-log.json` — stores all comment events with timestamps
- **Reads from:**
  - `data/b2b-2nd-prospects.json` (Tool #3)
  - `data/cyber-2nd-prospects.json` (Tool #4)
  - `data/referral-2nd-prospects.json` (Tool #6)
- **Writes comment engagements back** to the source tool's JSON when logging a comment

### API Endpoints
- `GET /api/search?q=name` — searches all three data files, returns matches
- `POST /api/comment` — logs a comment (writes to comment-log.json AND source tool's JSON)
- `GET /api/stats` — today's comment count, weekly count, per-segment breakdown
- `GET /api/history` — recent comment log with filters

### Search Logic
- Case-insensitive substring match on prospect name and company
- Returns: `{ name, company, segment, sourceTool, sourceFile, lastCommented, commentCount }`
- Sorted by relevance (exact match first, then partial)

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  DA Comment Queue                    [3/8 today] │
├─────────────────────────────────────────────────┤
│                                                   │
│  🔍 [ Search prospect name...              ]     │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Sarah Chen — Cyber 2nd (Tool #4)            │ │
│  │ CyberDefend Inc. | Last commented: Feb 27   │ │
│  │ [Log Comment]  [View Profile]               │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ── Today's Comments ──────────────────────────  │
│  ✓ Mike Torres — B2B 2nd (Tool #3) — 9:14 AM   │
│  ✓ Lisa Park — Referral 2nd (Tool #6) — 9:22 AM │
│  ✓ James Wu — Cyber 2nd (Tool #4) — 9:31 AM    │
│                                                   │
│  ── This Week: 18 comments ────────────────────  │
│  B2B 2nd: 6  |  Cyber 2nd: 8  |  Referral: 4   │
└─────────────────────────────────────────────────┘
```

---

## Integration with start-all.js

- Add Tool #11 to `start-all.js` so it launches with all other tools
- Port 3861

---

## Build Estimate

- Small tool. Same single-file pattern as all others.
- Main complexity: reading from 3 separate JSON files and writing back
- Estimated build: 1 session

---

## Why This Matters

Without this tool, commenting on 2nd connection posts is a guessing game. With it:
- **10 min/day** to check 20 Sales Nav alerts against your prospect list
- **Zero mental overhead** figuring out "is this person in my system?"
- **Automatic logging** so comments show up in the right tool's pipeline
- **Inactive flagging** so you stop wasting time on people who don't post
