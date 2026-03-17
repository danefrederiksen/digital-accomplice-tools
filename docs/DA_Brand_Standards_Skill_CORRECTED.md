---
name: da-brand-standards
description: "Canonical DA brand rules. Every skill, agent, and template must follow these. Loaded automatically by da-content-agent, ai-visibility-snapshot, discovery-deck-generator, linkedin-post-optimizer, and any skill that produces branded output."
---

# DA Brand Standards — Skill Reference (v2.0, March 16, 2026)

Consolidated from live site CSS audit, all existing brand docs, and ICP alignment review.
If any other skill or doc conflicts with this file, **this file wins.**

---

## Colors (7 approved, all others banned)

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

## Typography

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

---

## Design Rules

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

## CTA Language

| Offer | Context |
|-------|---------|
| **AI Visibility Snapshot** | Everything external: DMs, LinkedIn, CTA buttons, PDFs, cold outreach, website |
| **Video Marketing Strategy Snapshot** | Warm only: discovery calls, referral intros, proposals, post-conversation follow-ups |

- "Video Snapshot" → retired externally. Use "AI Visibility Snapshot."
- "Video Interview" → use "Expert Spotlight" in outreach.
- "Free consultation" → never. Say "15-minute call."
- S/M/L tiers → live calls only. Never on paper.

---

## Voice (writing as Dane)

Short sentences. Fragments OK. Contractions always. Direct, no filler, no hedge words.
Back claims with specifics — real clients, real numbers. Teach before selling.
No corporate jargon. No passive voice. 1-2 emoji max. Zero hashtags. Links in comments only.
No exclamation points. No paragraphs longer than 3 sentences.

**Don't say:** "leverage," "synergies," "holistic solutions," "unlock potential," "in today's landscape," "it's worth noting," "needless to say"

---

## File Naming

`DA_{Dept}_{Subcategory}_{Description}_{YYYY-MM-DD}.{ext}`

Depts: Sales, Marketing, Clients, Ops, Finance, Assets
Never use generic names.

---

## Snapshot PDF Rules

5 sections, 1 page, Inter font. S1 bar graph (prospect=orange, comps=#5A6B7A). S2 methodology. S3 directional arrows (no recipes). S4 Who We Are. S5 dark CTA bar + orange Book a Call. Text = Black/#5A6B7A only. No pricing. Provenance Log required separately.

## Deck Rules

Slide 1 + last: #1A1A1A. Interior: #FFFFFF. Inter throughout. DA logo bottom-right every slide. 6 slides max for discovery.
