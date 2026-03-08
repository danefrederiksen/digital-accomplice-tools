# Next Session Pickup — Prospecting Tools Fix Plan

**Last session:** March 6, 2026
**Reference doc:** `Prospecting_Tools_Fix_Plan.html` (full audit with details)

---

## What Got Done (Mar 6 Session — Bonus Fixes)

- [x] Tool #8 templates verified — already cyber-specific, no changes needed
- [x] Tool #12 built — Referral Partner Emails (port 3862), fully working
- [x] Draft reply added to DM Tools #1, #3, #4, #5, #6 (purple-themed UI, auto-save)
- [x] Editable LinkedIn URL added to Tools #3 and #4 (inline edit, debounced save)
- [x] All code committed and pushed to GitHub

---

## What's Next — The 10-Step Fix Plan (In Order)

### P1 — Data Cleanup (Steps 1–4)

**Step 1: Clean junk data from Tool #4 (Cyber 2nd)**
- 245 records, ~60-80 are junk
- 41 records with name="ICP" — real people, names in wrong fields
- 17 records with name="REFERRAL" — same problem
- 3 records with name="UNKNOWN" — same problem
- 5 section headers imported as records (delete these)
- ~18 internal duplicates with swapped company/title fields
- 3 fake comments in comment-log.json against junk rows
- **Action:** Delete headers, fix field mapping for ICP/REFERRAL/UNKNOWN records, remove swapped dupes, clean comment log

**Step 2: Clean Tool #3 (B2B 2nd)**
- 30 records, ~20 need action
- 13 cybersecurity people in wrong segment (belong in Tool #4)
- 6 internal duplicates with swapped company/title
- 7 records with swapped fields (not dupes, just bad import)
- **Action:** Remove 13 cyber people (verify they exist in #4 first), delete 6 dupes, fix 7 swapped fields

**Step 3: Reconcile cross-tool duplicates — NEEDS DANE'S INPUT**
- 27 people appear in both Tool #1 (B2B 1st) and Tool #5 (Referral 1st)
- Dane needs to decide per person: are they a B2B prospect or a referral partner?
- **Action:** Present the 27 names to Dane, he picks which tool each belongs in, remove from the other

**Step 4: Clean comment-log.json**
- Remove entries for junk records deleted in Steps 1-2
- Reconcile Brian Rucker desync (comment_count=1 in source but 0 entries in log)
- **Action:** Audit all comment counts against log, fix mismatches

### P2 — Feature Parity (Steps 5–7)

**Step 5: Add search bar to Tools #1–#10**
- Instant filter by name/company/title
- Use Tool #11's implementation as reference
- Apply to both Dashboard and All Prospects tabs

**Step 6: Add activity feed link to Tools #1–#10**
- "Activity" button on each prospect card
- Opens `linkedin.com/in/[handle]/recent-activity/all/`
- Falls back to LinkedIn name search if no URL saved

**Step 7: Add delete button on dashboard cards (Tools #1–#10)**
- Small X button with confirmation prompt
- Lets you clean junk as you encounter it during daily workflow

### P3 — Verification & Offers (Steps 8–9)

**Step 8: Verify Tool #11 integration end-to-end**
- Run the testing checklist from Fix Plan section 3B
- Test comment logging from #11 to each source tool (#3, #4, #5, #6)
- Test simultaneous access (race condition check)
- Verify daily targets exclude junk records

**Step 9: Add editable offer / A-B testing to Tools #1–#10**
- "Current Offer" editor on each Dashboard
- Tracks which offer was used per prospect
- Enables testing different messages

### P4 — Hub Dashboard (Step 10)

**Step 10: Build unified Hub Dashboard**
- Cross-tool progress view (daily/weekly totals vs targets)
- Quick-links to all 12 tools
- Alerts for overdue follow-ups, stale prospects, inactive tools
- Read-only — no writes, no race conditions

---

## Also Pending (Not Part of Fix Plan)

**Data imports (needs CSVs from Dane):**
- Tool #7 — B2B emails: NO SOURCE YET (need to research email harvesting tools — see `email-harvesting-research.md`)
- Tool #8 — Cyber emails: BreachRX, Binary Defense, DirectDefense, CyberMaxx, AgileBlue
- Tool #9 — Substack: 150 subscribers from Substack export
- Tool #10 — Customers: 108 past clients
- Tool #12 — Referral partners: Deb Andrews, Terrie Wheeler, Kara Jensen, etc.

**7 overdue follow-ups (manual — Dane does this in browser):**
- 3 overdue in Cyber 1st Connections (Tool #2, port 3852)
- 4 overdue in Referral 1st Connections (Tool #5, port 3855)

**Remaining bonus fix:**
- Tool #1 missing "Open LinkedIn" button on Replied cards

---

## How to Start Next Session

1. Read this file
2. Read `Prospecting_Tools_Fix_Plan.html` for full details on any step
3. Start servers: `node start-all.js` from `/Desktop/Claude code/`
4. Begin with **Step 1** (clean Tool #4 junk data) — it's the biggest mess and blocks everything downstream
