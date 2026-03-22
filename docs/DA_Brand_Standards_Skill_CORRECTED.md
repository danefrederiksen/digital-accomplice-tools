---
name: da-brand-standards
description: "Canonical DA brand rules + design system. Every skill, agent, and template must follow these. Loaded automatically by da-content-agent, ai-visibility-snapshot, discovery-deck-generator, linkedin-post-optimizer, post-discovery-snapshot, youtube-upload-optimizer, and any skill that produces branded output."
---

# DA Brand Standards + Design System — Skill Reference (v3.0, March 20, 2026)

This file is the single source of truth. If any other skill contradicts this, this file wins.

---

## 1. Colors (7 approved, all others banned)

| Name | Hex | Usage |
|------|-----|-------|
| DA Orange | #F8901E | Primary accent, CTAs, logo, highlights, buttons |
| Black | #000000 | Headlines, strong emphasis |
| Blue-Gray | #5A6B7A | Body text, secondary labels, wordmark |
| Gray | #CBCBCB | Captions, metadata, borders |
| White | #FFFFFF | Primary backgrounds, cards, interior slides |
| Light Gray | #F5F5F5 | Page/section backgrounds |
| Dark | #1A1A1A | Deck bookend slides (1 and last), dark UI only |

### Orange System Variants

| Variant | Value | Usage |
|---------|-------|-------|
| Accent | #F8901E | Primary buttons, stats, links |
| Accent Hover | #E07A10 | Button hover state |
| Accent Dim | rgba(248,144,30,0.12) | Subtle accent backgrounds |
| Accent Glow | rgba(248,144,30,0.25) | Button glow on hover |
| Border Accent | rgba(248,144,30,0.35) | Hover border highlights |

**BANNED COLORS:** #F38B1C, #F5A623, #AAAAAA, #F0F0F0, #0D0D0D, #E8913A — all deprecated.

---

## 2. Typography

| Role | Font | Notes |
|------|------|-------|
| Primary | **Inter** | All content. Bold=headlines, Regular=body, Light=captions |
| Tags/Code | Space Mono | Tags, code, metadata labels ONLY |
| Fallback | Arial, Helvetica | Email clients only |
| **BANNED** | **Poppins** | Legacy from old Wix site. Never use. |

### Google Fonts Import

```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap
```

### Why Inter over Poppins

Inter was designed for screen readability and UI. DA's ICP is B2B marketing leaders and cybersecurity companies — serious buyers who value credibility. Inter signals precision and professionalism. Poppins is rounder and softer — better for consumer/creative brands, not DA's positioning.

### Typography Scale (PDF / One-Pagers)

| Role | Font | Weight | Size | Color |
|------|------|--------|------|-------|
| Page title | Inter | Bold (700) | 22–26pt | #000000 |
| Section header | Inter | SemiBold (600) | 13–15pt | #000000 |
| Body text | Inter | Regular (400) | 9–10pt | #5A6B7A |
| Caption / metadata | Inter | Light (300) | 7–8pt | #5A6B7A |
| Stat / callout number | Inter | Bold (700) | 28–36pt | #F8901E |
| CTA button text | Inter | SemiBold (600) | 10–12pt | #FFFFFF on #F8901E |

### Typography Scale (Decks / Slides)

| Role | Font | Weight | Size | Color |
|------|------|--------|------|-------|
| Slide title | Inter | Bold (700) | 32–40pt | #000000 (white slides) or #FFFFFF (dark slides) |
| Slide subtitle | Inter | Regular (400) | 18–22pt | #5A6B7A |
| Slide body | Inter | Regular (400) | 16–18pt | #5A6B7A |
| Slide caption | Inter | Light (300) | 12–14pt | #CBCBCB |
| Stat number | Inter | Bold (700) | 48–64pt | #F8901E |

**Rules:**
- Minimum 3:1 size ratio between headline and body text (e.g., 26pt title vs. 9pt body).
- Never use more than 3 weights on one page/slide.
- Line height: 1.3× for body text, 1.0–1.1× for headlines.

---

## 3. Spacing System

Five-value scale. Use these consistently — never invent custom spacing.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4pt | Inline spacing, icon gaps |
| sm | 8pt | Between related elements (label + value) |
| md | 16pt | Between components on same section |
| lg | 24pt | Between sections |
| xl | 36pt | Major section breaks, top/bottom page margins |

### Page Margins (PDF / One-Pagers)

- Top: 36pt (xl)
- Bottom: 36pt (xl) — above CTA bar
- Left/Right: 40pt
- CTA bar: full bleed, 50pt tall

### Slide Margins (Decks)

- All sides: 48–56pt
- Footer zone: bottom 40pt reserved for logo + page info

---

## 4. Page Zones (One-Pager Layout)

Every one-page PDF follows this vertical zone structure:

```
┌────────────────────────────────┐
│  HEADER ZONE (title + logo)    │  ~60pt
├────────────────────────────────┤
│  HERO ZONE (bar graph / key    │  ~200pt
│  visual — ONE dominant element) │
├────────────────────────────────┤
│  CONTENT ZONE (2–3 sections    │  ~380pt
│  max, separated by lg spacing)  │
├────────────────────────────────┤
│  CTA BAR (dark, full bleed)    │  50pt
└────────────────────────────────┘
```

**Rules:**
- Header zone: company name left, DA logo right. No subtitle unless absolutely necessary.
- Hero zone: ONE visual. Bar graph, stat callout, or key insight. Never two competing visuals.
- Content zone: max 3 sections. Each section gets a header + 2–3 lines of body text max.
- CTA bar: #1A1A1A background, white text left, orange CTA button right.

---

## 5. Density & Composition Rules

### Word Limits

| Format | Max words |
|--------|-----------|
| One-pager PDF | 200 words total |
| Individual section | 60 words max |
| Slide (interior) | 40 words max |
| Dark bookend slide | 15 words max |

### Composition Rules

1. **40% minimum negative space.** If more than 60% of the page has ink/elements, it's too dense. Remove something.
2. **Three-level hierarchy only.** Every page/slide should have exactly 3 visual levels: (1) dominant element the eye hits first, (2) supporting content, (3) tertiary details. If you can't identify all three, redesign.
3. **One idea per section.** If a section makes two points, split it or cut one.
4. **Size contrast > color contrast.** Use big/small differences to create hierarchy before reaching for color.
5. **Align everything to a grid.** Left edges align. Spacing between elements is consistent. No "close enough."

### Anti-Patterns (Never Do These)

- Wall of text with no visual break
- More than one chart/graph per page on a one-pager
- Text smaller than 7pt anywhere
- Colored text on colored backgrounds (except white on dark CTA bar)
- Centered body text (left-align all body copy)
- Orphan lines (single word on last line of a paragraph)
- Multiple accent colors (DA Orange is the ONLY accent)

---

## 6. Component Patterns

### Bar Graph (Snapshot §1)

- Prospect bar: #F8901E (DA Orange)
- Competitor bars: #5A6B7A (Blue-Gray)
- Bar height: proportional to score, max ~120pt
- Labels: Inter Regular 8pt, #5A6B7A, below bars
- Score labels: Inter Bold 10pt, centered above bars
- Y-axis: implied only (no drawn axis line)
- Max 5 bars total

### CTA Button

- Background: #F8901E
- Text: #FFFFFF, Inter SemiBold 10–12pt
- Corner radius: 4pt (subtle, not pill-shaped)
- Padding: 8pt vertical, 20pt horizontal
- Placement: right side of CTA bar, vertically centered

### Section Dividers

- Thin line: #CBCBCB, 0.5pt weight
- OR: lg (24pt) whitespace — no line needed if spacing is sufficient
- Never use both a line AND large spacing

### Directional Arrows (Snapshot §3)

- Arrow icon: DA Orange, simple right-pointing triangle or chevron
- Text: Inter Regular 9pt, #5A6B7A
- Max 3 arrows per section
- Each arrow = one directional insight (NOT a step-by-step recipe)

---

## 7. Design Rules (General)

- Bold, minimal. Fewer elements, bigger text.
- DA Orange = only accent color. No secondary accents.
- No gradients. No drop shadows. No off-palette colors.
- Generous white space. High contrast.
- Interior slides/pages: white or light gray.
- Dark bookends (#1A1A1A): decks only, slide 1 and last.
- Flat design only. No glassmorphism, no 3D, no gloss.
- No stock photos. No clip art. No AI-generated images.
- Simple geometric icons only — DA Orange or Black.

---

## 8. CTA Language

| Offer | Context |
|-------|---------|
| **AI Visibility Snapshot** | Everything external: DMs, LinkedIn, CTA buttons, PDFs, cold outreach, website |
| **Video Marketing Strategy Snapshot** | Warm only: discovery calls, referral intros, proposals, post-conversation follow-ups |

- "Video Snapshot" → retired externally. Use "AI Visibility Snapshot."
- "Video Interview" → use "Expert Spotlight" in outreach.
- "Free consultation" → never. Say "15-minute call."
- S/M/L tiers → live calls only. Never on paper.

---

## 9. Voice (writing as Dane)

Short sentences. Fragments OK. Contractions always. Direct, no filler, no hedge words.
Back claims with specifics — real clients, real numbers. Teach before selling.
No corporate jargon. No passive voice. 1–2 emoji max. Zero hashtags. Links in comments only.
No exclamation points. No paragraphs longer than 3 sentences.

**Don't say:** "leverage," "synergies," "holistic solutions," "unlock potential," "in today's landscape," "it's worth noting," "needless to say"

---

## 10. File Naming

`DA_{Dept}_{Subcategory}_{Description}_{YYYY-MM-DD}.{ext}`

Depts: Sales, Marketing, Clients, Ops, Finance, Assets
Never use generic names.

---

## 11. Snapshot PDF Rules

5 sections, 1 page, ReportLab + Inter. §1 bar graph (prospect=orange, comps=#5A6B7A). §2 methodology. §3 directional arrows (no recipes). §4 Who We Are. §5 dark CTA bar + orange Book a Call. Text = Black/#5A6B7A only. No pricing. Provenance Log required separately.

## 12. Deck Rules

Slide 1 + last: #1A1A1A. Interior: #FFFFFF. Inter throughout. DA logo bottom-right every slide. 6 slides max for discovery.

---

## 13. Pre-Flight Checklist

Run this before delivering ANY branded PDF, deck, or visual asset:

1. ☐ All fonts are Inter (or Space Mono for tags/code). No Poppins anywhere.
2. ☐ Every color on page is in the 7-color palette. No exceptions.
3. ☐ Negative space ≥ 40% of total page area.
4. ☐ Three-level visual hierarchy is clear (dominant → supporting → tertiary).
5. ☐ Word count is within limits (200 for one-pager, 40 per slide).
6. ☐ All body text is left-aligned.
7. ☐ No text smaller than 7pt.
8. ☐ Headline-to-body size ratio ≥ 3:1.
9. ☐ Only ONE dominant visual per page/slide.
10. ☐ CTA is obvious and uses correct language per §8.
