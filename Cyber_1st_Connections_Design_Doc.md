# Tool 2: Cyber 1st Connections DM and Follow-Up Tracker — Design Doc

**Created:** 2026-03-01
**Status:** Design
**Based on:** Tool 1 (B2B 1st Connections DM and Follow-Up Tracker)

---

## What This Tool Does

Manages outreach to **1st-degree LinkedIn connections in the cybersecurity space**. Same architecture as Tool 1 (single-file HTML app + Node server), but with cybersecurity-specific messaging and title filters.

The pitch: Dane is launching a **new video series focused on cybersecurity** — separate from the B2B marketing series. Messaging references his existing work with **AWS, BreachRx**, and other cybersecurity companies to establish credibility.

---

## What Changes from Tool 1

### 1. Message Templates (the big change)

**DM (initial outreach):**
```
Hello {name}, I'm launching a new video series on cybersecurity — how security leaders are navigating the threat landscape as AI changes the game.

I've been producing video for AWS, BreachRx, and other cyber companies, and I want to bring those conversations to LinkedIn.

Takes just 15 min, no prep and I'll post on LinkedIn same day and tag you.

https://www.digitalaccomplice.com/video-series

Interested?

Dane
```

**Follow-Up 1 (3 days after DM):**
```
Hey {name} — I'm putting together a cybersecurity video series featuring leaders like you. 15 min, no prep, I handle everything. Already working with companies like AWS and BreachRx on the video side.

Worth a conversation?
```

**Follow-Up 2 / Final Nudge (3 days after Follow-Up 1):**
```
{name} — last ping on this. Free LinkedIn content featuring you as the cybersecurity expert. Worst case you look smart for 15 minutes. 😄
Dane
```

### 2. Title Keyword Filters (for CSV import)

Tool 1 filters for marketing titles. Tool 2 filters for security/IT titles:

```
ciso, cso, vp security, vp cybersecurity, vp information security,
director security, director cybersecurity, director information security,
head of security, head of cybersecurity, head of infosec,
chief information security officer, chief security officer,
security architect, security engineer, security operations,
it director, it manager, vp it, cto, cio,
founder, ceo, co-founder, owner
```

Keep `founder/ceo/co-founder/owner` in the list — small cyber companies often have founders handling security decisions.

### 3. Branding / UI Label Changes

| Element | Tool 1 (B2B) | Tool 2 (Cyber) |
|---|---|---|
| Page title | B2B Outreach Sequencer | Cyber Outreach Sequencer |
| Header text | B2B 1st Connections | Cyber 1st Connections |
| Browser tab | B2B Outreach | Cyber Outreach |
| Server port | 3851 | **3852** |
| Data file | `data/b2b-prospects.json` | `data/cyber-prospects.json` |
| Activity file | `data/b2b-activity.json` | `data/cyber-activity.json` |
| HTML file | `b2b-outreach.html` | `cyber-outreach.html` |
| Server file | `b2b-serve.js` | `cyber-serve.js` |

Same DA brand styling (orange #F8901E, black header, Poppins font). No visual changes besides the labels.

---

## What Stays the Same (copy from Tool 1)

Everything else is identical:

- **4 tabs:** Dashboard, Import, All Prospects, Activity Log
- **CSV import:** LinkedIn format detection + headerless CSV support
- **Manual prospect entry:** Name, company, title, LinkedIn URL
- **3-step sequence:** Not Started → DM Sent → Follow-Up 1 → Follow-Up 2 → Replied/Cold
- **Dashboard sections:** DM Today, Follow Up Today, Replied, Waiting for Response
- **Copy Message button** on every card (copies personalized message to clipboard)
- **Preview toggle** to see the message before copying
- **"Mark DM Sent" / "Mark Follow-Up Sent" / "Got Reply"** buttons on each card
- **Reply capture** with textarea + next-step planning field
- **Timeline visualization** per prospect
- **Select All** on import
- **Open LinkedIn** button on cards (when URL exists)
- **Server sync** with localStorage fallback
- **Auto-backup** (last 5 backups in `data/backups/`)
- **Activity logging** for all actions
- **CORS localhost-only** restriction
- **HTML sanitization** on all inputs
- **Field whitelist validation**
- **Status validation** (only valid statuses accepted)

---

## Follow-Up Cadence

Same as Tool 1:
- **DM sent** → Follow-Up 1 due in **3 days**
- **Follow-Up 1 sent** → Follow-Up 2 (final nudge) due in **3 days**
- **Follow-Up 2 sent** → Moves to "Waiting" → Mark Cold after 5 days with no reply

---

## Files to Create

1. `cyber-outreach.html` — Clone of `b2b-outreach.html` with changes above
2. `cyber-serve.js` — Clone of `b2b-serve.js` pointing to cyber data files, port 3852

## Data Files (auto-created on first run)

1. `data/cyber-prospects.json` — `{prospects: []}`
2. `data/cyber-activity.json` — `[]`

---

## How to Run

```bash
node cyber-serve.js
# → http://localhost:3852
```

---

## Build Estimate

This is a straight clone-and-modify of Tool 1. Changes are:
1. Swap message templates (3 messages)
2. Swap title keyword filter list
3. Rename labels/titles
4. Change port, file names, data paths

No new features. No architectural changes.

---

## Future Consideration

Once Tools 1–6 are all built and running, evaluate whether to consolidate into a single app with a tool/vertical selector dropdown. For now, separate files keeps things simple and independent — one tool can't break another.
