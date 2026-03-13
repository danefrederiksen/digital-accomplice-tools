# Prospecting Tools Fix Plan — Updated March 6, 2026

**Last session:** March 6, 2026
**Status:** Step 1 partially complete. Step 2 COMPLETE. Steps 3-10 pending.

---

## Step 1: Clean Tool #4 (Cyber 2nd Connections) — IN PROGRESS

### Done
- [x] Section headers deleted (5 records: "HIGH-VALUE...", "SOLID...", "QUESTIONABLE...", "Name/Title", "tool 3 batch 2")
- [x] ICP records fixed — names moved from `company` field to `name` (40 of 41; 1 was a duplicate and deleted)
- [x] REFERRAL records fixed — names moved from `company` field to `name` (all 17)
- [x] UNKNOWN records fixed — names moved from `company` field to `name` (all 3)
- [x] 29 junk/duplicate records removed total
- [x] Record count: 245 → 221

### Remaining
- [ ] **62 records have no company AND no LinkedIn URL** — names and titles only (all founders/CEOs from original ICP/REFERRAL/UNKNOWN import). Dane is researching these manually. CSV exported: `Tool4_Incomplete_Records_To_Research.csv`
  - When Dane returns with the CSV filled in → import company + LinkedIn URL back into `cyber-2nd-prospects.json`
  - Any records Dane can't find info for → delete them
- [ ] **Check for internal duplicates with swapped fields (~18 mentioned in original audit)** — need to re-verify after current cleanup. May already be resolved by the 29 deletions.
- [ ] **Clean comment-log.json** — remove activity log entries that reference deleted record IDs
- [ ] **Verify final record count and data integrity**

### Current Tool #4 Stats
- 221 total records
- 159 records with company names
- 62 records missing company + LinkedIn (the ones Dane is researching)
- 34 records with LinkedIn URLs
- 187 records without LinkedIn URLs
- 213 "not_started" / 8 "connection_sent"

---

## Step 2: Clean Tool #3 (B2B 2nd Connections) — COMPLETE

### What was found
- All 30 records were cybersecurity people — zero actual B2B (non-cyber) prospects
- Records 1-13: correct field format (name/company/title)
- Records 14-30: swapped fields (title in company field, company in title field)
- 6 exact internal duplicates (same person in both groups)

### What was done
- [x] Backed up all affected files (b2b-2nd-prospects, cyber-2nd-prospects, both activity logs)
- [x] Restored data from backup (live file had been emptied at some point)
- [x] Identified 16 people already in Tool #4 — confirmed as dupes, safe to remove
- [x] Identified 8 people NOT in Tool #4 — added with correct field mapping and LinkedIn URLs
- [x] Kevin Bocek and Peter Prieto comment data preserved on new Tool #4 records
- [x] Tool #3 emptied (0 records) — ready for actual B2B 2nd connection imports
- [x] Tool #3 activity log cleared

### Results
- Tool #4: 221 → 229 records (+8 new)
- Tool #3: 30 → 0 records (all were cyber, now properly in Tool #4)
- Tool #3 is clean and empty, ready for real B2B 2nd connection data

---

## Step 3: Reconcile Cross-Tool Duplicates — COMPLETE

### What was found
- 0 actual name overlaps between Tool #1 (7 records) and Tool #5 (58 records)
- The "27 duplicates" from the original audit no longer exist in current data
- However, 10 misfit records found in Tool #5 (not referral partners)
- 1 record with swapped company/title fields

### What was done
- [x] Compared all Tool #1 names against Tool #5 — no cross-tool duplicates
- [x] Removed 10 misfits from Tool #5:
  - John Thorpe (The Agency RE — real estate)
  - Justin Thomas (Creative Artists Agency — talent)
  - Nicklas Dunham (DEA Dunham Entertainment — entertainment)
  - Patrick Cassidy (PIVOT Agency — sports)
  - Jason Costes (United Talent Agency — talent)
  - Andy Haney (freelance gaffer — crew)
  - Benjamin C Little (freelance video specialist — crew)
  - Brandon Bichajian (Pinnacle Artists Agency — talent)
  - Ruth Stroup (Ruth Stroup Insurance — insurance)
  - Julia Nimchinski (no data — junk)
- [x] Fixed Oleksandr Korolko: company/title were swapped → corrected to company="InstaDives", title="Founder | Video production, Social Media Marketing"

### Results
- Tool #5: 58 → 48 records
- Tool #1: 7 records (unchanged)
- All remaining Tool #5 records are legit agency/marketing/video referral partners

---

## Step 4: Clean comment-log.json — COMPLETE

### What was found
- 10 log entries, all pointing to valid prospect IDs (0 orphaned)
- All 7 unique prospects' comment_counts match their log entries
- Brian Rucker: comment_count=0, 0 log entries — already clean (no desync)
- Kevin Bocek and Peter Prieto exist in both Tool #2 and Tool #4 (different IDs). Log entries reference Tool #2 IDs. Tool #4 copies had inflated comment_counts from Step 2 migration.

### What was done
- [x] Audited all 10 log entries against all prospect data files
- [x] Verified all comment_counts match log for Tool #2 prospects
- [x] Reset Kevin Bocek comment_count 1→0 in Tool #4 (comments tracked under Tool #2 ID)
- [x] Reset Peter Prieto comment_count 3→0 in Tool #4 (comments tracked under Tool #2 ID)
- [x] Confirmed Brian Rucker is clean (0/0)

### Note
Kevin Bocek and Peter Prieto are duplicated across Tool #2 (cyber 1st) and Tool #4 (cyber 2nd) — separate dedup issue, not part of this step.

---

## Step 5: Add Search Bar to Tools #1-#10 — NOT STARTED

- Instant filter by name/company/title
- Use Tool #11's implementation as reference
- Apply to both Dashboard and All Prospects tabs

---

## Step 6: Add Activity Feed Link to Tools #1-#10 — NOT STARTED

- "Activity" button on each prospect card
- Opens `linkedin.com/in/[handle]/recent-activity/all/`
- Falls back to LinkedIn name search if no URL saved

---

## Step 7: Add Delete Button on Dashboard Cards (Tools #1-#10) — NOT STARTED

- Small X button with confirmation prompt
- Clean junk as you encounter it during daily workflow

---

## Step 8: Verify Tool #11 Integration End-to-End — NOT STARTED

- Run testing checklist from original Fix Plan
- Test comment logging from #11 to each source tool (#3, #4, #5, #6)
- Test simultaneous access (race condition check)
- Verify daily targets exclude junk records

---

## Step 9: Add Editable Offer / A-B Testing to Tools #1-#10 — NOT STARTED

- "Current Offer" editor on each Dashboard
- Tracks which offer was used per prospect
- Enables testing different messages

---

## Step 10: Build Unified Hub Dashboard — NOT STARTED

- Cross-tool progress view (daily/weekly totals vs targets)
- Quick-links to all 12 tools
- Alerts for overdue follow-ups, stale prospects, inactive tools
- Read-only — no writes, no race conditions

---

## Also Pending (Not Part of Fix Plan)

**Data imports (needs CSVs from Dane):**
- Tool #7 — B2B emails: NO SOURCE YET (need email harvesting tool)
- Tool #8 — Cyber emails: BreachRX, Binary Defense, DirectDefense, CyberMaxx, AgileBlue
- Tool #9 — Substack: 150 subscribers from Substack export
- Tool #10 — Customers: 108 past clients
- Tool #12 — Referral partners: Deb Andrews, Terrie Wheeler, Kara Jensen, etc.

**Quick fixes:**
- Tool #1 missing "Open LinkedIn" button on Replied cards

**Overdue follow-ups (manual — Dane does in browser):**
- 3 overdue in Cyber 1st Connections (Tool #2, port 3852)
- 4 overdue in Referral 1st Connections (Tool #5, port 3855)
