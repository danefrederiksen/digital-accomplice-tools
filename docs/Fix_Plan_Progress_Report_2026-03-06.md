# Prospecting Tools Fix Plan — Progress Report
**Date:** March 6, 2026

---

## Step 1: Clean Tool #4 (Cyber 2nd Connections) — IN PROGRESS

**What was done:**
- Deleted 5 junk section-header records ("HIGH-VALUE...", "SOLID...", etc.)
- Fixed 40 ICP records — names moved from `company` field to `name`
- Fixed all 17 REFERRAL records — same field swap fix
- Fixed all 3 UNKNOWN records — same fix
- Removed 29 junk/duplicate records total
- Record count: 245 → 221

**Still remaining:**
- 62 records have no company AND no LinkedIn URL — Dane researching manually (CSV exported: `Tool4_Incomplete_Records_To_Research.csv`)
- Internal duplicate check (~18 mentioned in original audit) — need to re-verify after cleanup
- Clean comment-log.json of deleted record references
- Final record count and data integrity verification

**Current Tool #4 stats:** 229 records (221 from Step 1 + 8 added from Step 2)

---

## Step 2: Clean Tool #3 (B2B 2nd Connections) — COMPLETE

**What was found:**
- All 30 records were cybersecurity people — zero actual B2B prospects
- Records 1-13: correct field format
- Records 14-30: company and title fields swapped
- 6 exact internal duplicates (same person in both groups)

**What was done:**
- Backed up all affected files before changes
- Restored data from backup (live file had been emptied)
- 16 people already in Tool #4 — confirmed as dupes, removed
- 8 people NOT in Tool #4 — added with correct fields and LinkedIn URLs
- Kevin Bocek and Peter Prieto comment data preserved
- Tool #3 emptied and activity log cleared

**Results:** Tool #4: 221 → 229 records. Tool #3: 30 → 0 (clean slate for real B2B data).

---

## Step 3: Reconcile Cross-Tool Duplicates (#1 vs #5) — COMPLETE

**What was found:**
- 0 actual name overlaps between Tool #1 (7 records) and Tool #5 (58 records)
- Original "27 duplicates" no longer exist in current data
- 10 misfit records in Tool #5 (insurance, talent, entertainment, sports, crew, junk)
- 1 record with swapped company/title fields (Oleksandr Korolko)

**What was done:**
- Removed 10 misfits: John Thorpe, Justin Thomas, Nicklas Dunham, Patrick Cassidy, Jason Costes, Andy Haney, Benjamin C Little, Brandon Bichajian, Ruth Stroup, Julia Nimchinski
- Fixed Oleksandr Korolko swapped fields → company="InstaDives"
- Tool #5: 58 → 48 records. Tool #1: 7 (unchanged).

---

## Step 4: Clean comment-log.json — COMPLETE

**What was found:**
- 10 log entries, all valid (0 orphaned)
- All comment_counts match log entries
- Brian Rucker: already clean (0/0, no desync)
- Kevin Bocek + Peter Prieto had inflated counts in Tool #4 from Step 2 migration

**What was done:**
- Reset Kevin Bocek comment_count 1→0 in Tool #4
- Reset Peter Prieto comment_count 3→0 in Tool #4
- Note: Kevin/Peter duplicated across Tool #2 and Tool #4 (separate dedup issue)

---

## Steps 5-10: NOT STARTED

| Step | Task | Status | Blocker |
|------|------|--------|---------|
| 5 | Add search bar to Tools #1-#10 | Not started | — |
| 6 | Add activity feed link to Tools #1-#10 | Not started | — |
| 7 | Add delete button on dashboard cards | Not started | — |
| 8 | Verify Tool #11 integration end-to-end | Not started | — |
| 9 | Add editable offer / A-B testing | Not started | — |
| 10 | Build unified hub dashboard | Not started | — |

---

## Also Pending (Not Part of Fix Plan)

- **Data imports (needs CSVs):** Tools #7, #8, #9, #10, #12
- **Quick fix:** Tool #1 missing "Open LinkedIn" on Replied cards
- **Overdue follow-ups:** 3 in Tool #2, 4 in Tool #5
