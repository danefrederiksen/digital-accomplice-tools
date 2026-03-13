# DA Prospect Tools Roadmap

## Naming Convention
All tools follow: **Prospecting Tool #N — [Name]**

## Tools

1. **Prospecting Tool #1** — B2B 1st Connections DM Tracker — **BUILT**
   - File: `b2b-outreach.html` / Server: `b2b-serve.js` (port 3851)
   - CSV import (LinkedIn + headerless), manual add, 3-step sequence, reply tracking, copy-to-clipboard messages

2. **Prospecting Tool #2** — Cyber 1st Connections DM Tracker — **BUILT**
   - File: `cyber-outreach.html` / Server: `cyber-serve.js` (port 3852)
   - Same as #1 but cyber messaging (AWS/BreachRx credibility), security title filters (CISO, CTO, etc.)
   - Design doc: `Cyber_1st_Connections_Design_Doc.md`

3. **Prospecting Tool #3** — B2B 2nd Connections DM Tracker

4. **Prospecting Tool #4** — Cyber 2nd Connections DM Tracker

5. **Prospecting Tool #5** — Referral Partner 1st Connections DM Tracker — **BUILT**
   - File: `referral-1st-outreach.html` / Server: `referral-1st-serve.js` (port 3855)
   - Same pattern as #1/#2 but referral partner messaging, partner/agency title filters

6. **Prospecting Tool #6** — Referral Partner 2nd Connections DM Tracker

7. **Prospecting Tool #7** — B2B Leads w/ Emails

8. **Prospecting Tool #8** — Cyber Leads w/ Emails

9. **Prospecting Tool #9** — Substack Subscriber Emails

10. **Prospecting Tool #10** — Customers w/ Emails

11. **Prospecting Tool #11** — Comment Queue (Unified) — **PLANNED**
    - File: `comment-queue.html` / Server: `comment-queue-serve.js` (port 3861)
    - Unified comment tracking across Tools 3, 4, 6 (all 2nd connection tools)
    - Instant search bar: type a name from Sales Nav alerts → instantly see if they're a prospect and which segment
    - Logs comments back to the correct source tool's JSON data
    - Tracks: last checked, last commented, comment count, days since last post
    - Flags inactive prospects (no posts in 3+ weeks) for deprioritization or cold connection
    - Design doc: `Comment_Queue_Design_Doc.md`

## Pattern
- All tools are single-file HTML apps with local Node.js servers
- Data persists in JSON files under `data/` with auto-backups
- DA brand styling: #F8901E orange, Poppins font, black header
- Port range: 3851–3861
- Created: 2026-03-01
