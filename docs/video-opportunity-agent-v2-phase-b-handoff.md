# Video Opportunity Agent V2 — Phase B (Claude Design) Handoff

Paste-ready prompts for the visual half of the V2 snapshot workflow. The analyst (Phase A) is a Claude Code subagent at `.claude/agents/video-opportunity-agent-v2.md`. This file covers Phase B — Claude Design.

---

## Quick Reference

- **Phase A (Claude Code):** `/agents video-opportunity-agent-v2` → outputs 12-section copy
- **Phase B (Claude Design):** Go to `claude.ai/design` → duplicate "Snapshot Starter — 12 Section" → paste handoff prompt → export PDF
- **Final filename:** `DA_Sales_Snapshots_[CompanyName]_Snapshot_YYYY-MM-DD.pdf`

---

## One-Time Setup (do this once, ~45 min)

### Step 1 — Verify access
Go to `claude.ai/design`. If the canvas loads, you're in. If not, wait 24–48 hours — Anthropic is rolling out gradually to Pro, Max, Team, and Enterprise.

Claude Design has its own usage limits, separate from chat and Claude Code. Don't burn it on iteration loops.

### Step 2 — Onboard the DA design system (30 min)

During onboarding, upload:
- `DA_Brand_Standards_Skill_CORRECTED.md` (canonical brand doc)
- `DA_logo_full.svg`
- The **Design System Seed** block (bottom of this file)
- One existing snapshot as layout reference (Adyen or AIP)
- Inter font folder if local

Point Claude Design at `digitalaccomplice.com` via web capture.

Name the system: **"DA Snapshot — v1"**.

### Step 3 — Create starter template (15 min)

In Claude Design, paste:

```
Build me a 1-page US Letter snapshot template using the DA Snapshot — v1
design system. It must have: a black header band at the top with company
name + "Video Opportunity Snapshot" on the left, prepared-for/date on the
right. 12 body sections with orange uppercase labels, each followed by 1–2
lines of body text.

Section order: THE PROBLEM / HOW WE KNOW / HOW WE GOT THE DATA / WHAT THIS
MEANS / WHY IT MATTERS / WHAT WE RECOMMEND / THE STEPS (numbered) / THE
COST / WHAT YOU NEED TO DO / HOW LONG IT TAKES / EXPECTED RESULTS / HOW
WE'LL KNOW IT WORKED.

A footer band with the Calendly link, dane@digitalaccomplice.com, and the
DA logo bottom-right.

Everything must fit on one page. If sections are tight, tighten spacing —
never spill to a second page.
```

Save as **"Snapshot Starter — 12 Section"**.

---

## Per-Prospect Workflow

**Phase A — Claude Code chat:**
1. `/agents video-opportunity-agent-v2`
2. Give it the company name
3. Agent outputs 12-section copy

**Phase B — Claude Design:**
1. Open `claude.ai/design`
2. Duplicate "Snapshot Starter — 12 Section" → rename to prospect
3. Paste the handoff prompt below with copy filled in
4. Refine with inline comments + adjustment knobs
5. Export PDF → save as `DA_Sales_Snapshots_[CompanyName]_Snapshot_YYYY-MM-DD.pdf`

Time: ~45 min research, ~10 min design.

---

## Claude Design Handoff Prompt (paste into Phase B)

```
Use the DA Snapshot — v1 design system.

Drop the following 12-section copy into the matching sections of this
template. Do not change wording. Do not add or remove sections. Keep
everything on one page — if anything overflows, tighten line spacing or
reduce body font size by 0.5pt at most before asking me what to cut.

Header:
Company: [paste]
Contact: [paste]
Date: [paste]

Body sections (in order):
[paste the 12 sections including labels]

Footer (constant — already in template):
Book a call → calendly.com/accomplice-dane/15min
dane@digitalaccomplice.com
DA logo bottom-right

Show me the canvas when set. I'll comment inline. Once approved I'll export
to PDF.
```

---

## Design System Seed (paste during Step 2 onboarding)

```
DIGITAL ACCOMPLICE BRAND SYSTEM

Colors (6 only — no exceptions):
  DA Orange: #F8901E   (primary accent, CTAs, section labels, stat callouts)
  Black:     #000000   (headlines, header band, footer band background)
  Blue-Gray: #5A6B7A   (all body text, secondary labels)
  Gray:      #CBCBCB   (captions, dividers, borders)
  White:     #FFFFFF   (backgrounds)
  Light Gray:#F5F5F5   (utility background tint)

Banned colors (never use):
  #F38B1C (deprecated orange — superseded April 18, 2026)
  #F5A623 (old orange — wrong)
  #AAAAAA (old gray)
  #F0F0F0 (not a brand color)

Typography:
  Primary font: Inter (Bold 700, SemiBold 600, Regular 400)
  Fallback:     Arial, Helvetica, sans-serif
  Banned:       Poppins, Times, Georgia, any serif, any decorative

  Headlines:        Inter Bold 700, 18–28px, Black
  Body:             Inter Regular 400, 11px, Blue-Gray, line-height 1.5
  Section labels:   Inter Bold 700, 9px, UPPERCASE, letter-spacing 1px, DA Orange
  Stat callouts:    Inter Black 900, 42–108px, DA Orange
  Footer text:      Inter Regular 400, 10px, White on Black

Design rules:
  - Flat design only. No gradients. No drop shadows. No 3D.
  - DA Orange is the only accent color.
  - White or light gray backgrounds. High contrast.
  - Generous whitespace. Bold and minimal.
  - Section dividers: 1px thin orange line.
  - Highlight boxes: black background, 12px border-radius, white text.

Logo:
  - File: DA_logo_full.svg (orange play mark + DIGITAL ACCOMPLICE wordmark)
  - Placement: bottom-right of footer
  - Never stretch, rotate, recolor, or add effects.

Voice (when adding any copy beyond template):
  - Direct. Data-first. No BS. Short sentences.
  - "Your videos aren't working. Here's why." — not "We'd love to explore
    some areas of improvement."
  - No corporate jargon.
  - Confident, not arrogant.
```

---

## Limits / Known Issues

- **Research preview** — Claude Design will change. Re-check `anthropic.com/news/claude-design-anthropic-labs` monthly.
- **No API yet.** Phase A → Phase B handoff is manual copy-paste until Anthropic ships integrations.
- **Enterprise plans** — Design is off by default. Admin enables in Organization settings.
- **Iterate the system, not the file.** Every fix made twice should go into the saved design system so future exports get it right the first time.
