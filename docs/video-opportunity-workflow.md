# Video Opportunity Report — Full Repeatable Workflow

**Purpose:** Given a company name, produce a complete deliverable package:
1. Validated Video Opportunity Assessment (branded PDF)
2. LinkedIn DM Infographic (JPG, optimized for DM preview)
3. Full-size Infographic (JPG, for social/email)

---

## STEP 1: Run the V2 Report Agent

**Template file:** `/Users/danefrederiksen/Desktop/Claude code/video-opportunity-report-agent-v2.md`

Follow the agent instructions exactly. Key steps:
1. Research the company (product, buyers, language, industry terms)
2. Identify 3 competitors (similar size, market, buyers)
3. Full video audit: YouTube, LinkedIn Video, Website Video, Blog, Podcast, Community
4. Score using the 0–5 rating scale
5. Run assumption checks (Step 3B)
6. Gap analysis
7. Build the full report with all required sections

**Output:** Markdown report (`[CompanyName]_Video_Opportunity_Assessment_v4.md`)

---

## STEP 2: Verify All Stats

Before publishing, verify every stat claim:
- Web search each stat to its original source
- Cross-reference against `report-validation.md` for known-good stats
- Check company-specific claims (funding, customer counts, team members) against press releases
- Flag anything unverifiable with "Commonly cited — original source not verified"

**Known verified stats (Feb 2026):**

| Stat | Source | Status |
|---|---|---|
| YouTube in 16% of LLM answers | Adweek, Jan 26, 2026 / Bluefish | Verified |
| 58.5% zero-click searches | SparkToro / Datos (Semrush), July 2024 | Verified |
| 70% through buying before sales | 6sense 2024 (2,509 buyers) | Verified |
| 73% AI-cited videos are expert/third-party | Zenith AI, Nov 2025 (199 citations) | Verified |
| AI traffic converts 1.3x-5x+ | Semrush 4.4x, MS Clarity 3x, Visibility Labs 1.3x, Ahrefs 23x | Verified (range) |
| CISO 50% get 5+ vendor contacts/day | Security Boulevard, Oct 2025 | Verified |
| 70% B2B buyers watch video in purchase | Google / Think with Google | Verified |

**Important:** If current date is 6+ months past Feb 2026, re-verify ALL stats. Search for newer figures.

---

## STEP 3: Generate Branded HTML Report

Use `BreachRX_Video_Opportunity_Assessment_v4.html` as the template. Replace all company-specific content.

### Brand Specs (DA Brand Guidelines v2, Feb 2026)

**Colors:**
```
--orange: #F38B1C   (accent, CTAs, headings)
--black: #000000    (headlines, table headers)
--body: #5A6B7A     (body text, wordmark)
--gray: #CBCBCB     (labels, captions, footnotes)
--light: #F5F5F5    (backgrounds, dividers)
--white: #FFFFFF    (page backgrounds)
```

**Typography:**
- Font family: `'Inter', Arial, Helvetica, sans-serif`
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap`
- No decorative, serif, or script fonts ever
- Bold (700) for headlines, Regular (400) for body, Extra Bold (800-900) for stat callouts

**Design Rules:**
- Flat design only — no gradients, no drop shadows, no rounded photo frames
- Orange accents on white backgrounds
- Black table headers with white text
- Logo: play-button icon (orange rounded square) + "DIGITAL ACCOMPLICE" text

### Report HTML Structure (8 pages)

1. **Cover Page** — Title, subtitle, prepared for/by/date, DA logo
2. **Exec Summary + What They're Doing Right** — Strengths before gaps
3. **Methodology & Scope** — Table: what examined / method / limitations + queries searched
4. **Audit Findings** — Finding 1-4 with stat row callout (3 big numbers)
5. **Industry Data** — Table: finding / source / potential implication (7 rows)
6. **Assumptions** — Table: assumption / what deeper engagement would answer (7 rows) + highlight box
7. **Opportunity + CTA** — Compounding math highlight box + 20-min call CTA
8. **Sources & References** — All footnotes [1]-[14]+, doc footer, DA logo

### Key CSS Values for Report
```
Page width: 816px (A4)
Page height: 1056px (cover only)
Content padding: 56px 72px 48px 72px
Page break: page-break-after: always
Print settings: -webkit-print-color-adjust: exact
Heading h2: 28px/900
Heading h3: 19px/800
Body: 15px/1.65
Table header: 11px/700 uppercase, black bg
Stat callout numbers: 42px/900 orange
Highlight box: black bg, 12px rounded, white text 16px/600
```

---

## STEP 4: Convert HTML Report to PDF

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --print-to-pdf="/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Video_Opportunity_Assessment_v4.pdf" \
  --no-pdf-header-footer \
  "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Video_Opportunity_Assessment_v4.html"
```

**Expected output:** ~9 pages, ~500KB PDF

---

## STEP 5: Generate LinkedIn DM Infographic

Use `BreachRx_Infographic_DM.html` as the template. This is the compact card format optimized for LinkedIn DM thumbnail preview.

### DM Infographic Structure
```
Width: 1080px, height: auto (flow-based, no fixed height)

├── .top-bar (black, 32px padding)
│   ├── "VIDEO OPPORTUNITY SNAPSHOT" (orange, 20px, uppercase, 3px tracking)
│   └── Company name (gray, 20px)
│
├── .headline (56px padding top/sides)
│   ├── h1 (72px/900, black, "You have the experts.")
│   ├── h1 line 2 ("AI search can't find them." — orange span)
│   └── .orange-line (100px x 6px bar, 32px margin-top)
│
├── .stats (flex row, 48px padding)
│   ├── .stat (108px/900 orange number + 26px/700 label)
│   ├── .stat (gray divider between)
│   └── .stat
│
├── .bottom-box (black rounded box, 20px margin sides)
│   └── p (32px/700 white text, orange spans for emphasis)
│
└── .footer (3px orange top border, 32px padding, 48px margin-top)
    ├── "Full report attached ↗" (24px/700 orange)
    └── DA logo (play icon + text)
```

### Key Customization Points
- **Headline:** Adapt to company's situation. Pattern: "[Company] has [asset]. [Channel] [can't find it]."
- **3 Stats:** Use the most striking audit numbers. Pattern: big zero or fraction → short label
- **Bottom box:** 1-2 sentences. First sentence = gap finding. Second sentence (orange) = unique advantage + CTA hook. Pattern: "No one in [category] is producing video. [Company] has [advantage]. First mover wins."
- **Footer:** Always "Full report attached ↗" — this goes in a DM with the PDF

### DM Infographic Key CSS
```
Card width: 1080px
Headline: 72px/900, line-height 1.05
Stats numbers: 108px/900 orange
Stats labels: 26px/700 black
Bottom box: 32px/700 white on black, 20px border-radius
Footer CTA: 24px/700 orange
Top border on footer: 3px solid #F38B1C
```

### Convert DM Infographic to JPG
```bash
# Step 1: Screenshot at 2x resolution
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --screenshot="/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_DM.png" \
  --window-size=1080,1200 \
  --force-device-scale-factor=2 \
  "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_DM.html"

# Step 2: Convert PNG to JPG
sips -s format jpeg -s formatOptions 95 \
  "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_DM.png" \
  --out "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_DM.jpg"
```

**Expected output:** ~2160px wide (2x), ~2000-2200px tall, ~400KB JPG

**Troubleshooting:** If content is cut off at bottom, increase `--window-size` height (1200 → 1400 → 1600). The width must stay 1080. Check with a screenshot review after generation.

---

## STEP 6: Generate Full-Size Infographic (Optional)

Use `BreachRx_Infographic_v2.html` as the template. This is the detailed vertical format for social media or email.

### Full-Size Infographic Structure
```
Width: 1200px

├── .top-bar (black, "VIDEO OPPORTUNITY SNAPSHOT" + "Prepared for [Company] | [Date]")
├── .header (h1 56px/900, subtitle 22px, orange line)
├── .hero-stats (3 stats: 96px numbers, 20px labels, gray dividers)
├── .section "Why It Matters" (4 data rows with icons)
│   ├── data-row: YouTube 16% + AI citation
│   ├── data-row: 58.5% zero-click
│   ├── data-row: 70% buyer journey
│   └── data-row: 73% expert content
├── .opportunity-box (black rounded, 28px white text)
├── .cta-section (headline + subtext + orange button + contact info)
└── .footer (DA logo + source disclaimer)
```

### Convert Full-Size Infographic to JPG
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --screenshot="/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_v2.png" \
  --window-size=1200,2400 \
  --force-device-scale-factor=2 \
  "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_v2.html"

sips -s format jpeg -s formatOptions 95 \
  "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_v2.png" \
  --out "/Users/danefrederiksen/Desktop/Claude code/[CompanyName]_Infographic_v2.jpg"
```

---

## FILE NAMING CONVENTION

All files go in `/Users/danefrederiksen/Desktop/Claude code/`

```
[CompanyName]_Video_Opportunity_Assessment_v4.md    — Markdown report
[CompanyName]_Video_Opportunity_Assessment_v4.html  — Branded HTML report
[CompanyName]_Video_Opportunity_Assessment_v4.pdf   — Final PDF
[CompanyName]_Infographic_DM.html                   — DM infographic HTML
[CompanyName]_Infographic_DM.jpg                    — DM infographic JPG
[CompanyName]_Infographic_v2.html                   — Full-size infographic HTML
[CompanyName]_Infographic_v2.jpg                    — Full-size infographic JPG
```

Use PascalCase for company names (e.g., `BreachRx`, `CrowdStrike`, `Wiz`).

---

## DELIVERY CHECKLIST

Before sending to Dane:

- [ ] All stats verified against original sources
- [ ] Company-specific claims fact-checked (funding, customers, team)
- [ ] PDF renders correctly (all 8-9 pages, no cutoff, colors correct)
- [ ] DM infographic JPG is readable at small size (test by zooming browser to 25%)
- [ ] Full-size infographic JPG has no content cutoff
- [ ] All files use correct brand colors (#F38B1C orange, NOT #F5A623)
- [ ] Font is Inter/Arial/Helvetica (no serif, no decorative)
- [ ] CTA says "Book 20 Minutes With Dane" with dane@digitalaccomplice.com
- [ ] Footer has DA logo (orange play button + "DIGITAL ACCOMPLICE")
- [ ] "Full report attached ↗" on DM infographic

---

## TEMPLATE FILES (for reference)

| File | Purpose |
|---|---|
| `video-opportunity-report-agent-v2.md` | Agent prompt — how to research and write the report |
| `BreachRX_Video_Opportunity_Assessment_v4.html` | HTML report template (branded) |
| `BreachRx_Infographic_DM.html` | DM infographic template |
| `BreachRx_Infographic_v2.html` | Full-size infographic template |
| `report-validation.md` | Stat verification notes |
| `DA_Brand_Guidelines_v2.docx` | Brand guidelines (in Downloads) |
| `video-opportunity-workflow.md` | This file — the full process |

---

## QUICK START

When Dane says "run this for [Company Name]":

1. Read `video-opportunity-report-agent-v2.md` for full agent instructions
2. Run the audit (web search everything, visit every page)
3. Write the markdown report
4. Read `BreachRX_Video_Opportunity_Assessment_v4.html` as the HTML template
5. Create new HTML with company-specific content, keeping all brand CSS/structure
6. Convert to PDF via Chrome headless
7. Read `BreachRx_Infographic_DM.html` as the DM infographic template
8. Create new DM infographic with company-specific headline/stats/opportunity
9. Convert to JPG via Chrome headless + sips
10. Optionally create full-size infographic from `BreachRx_Infographic_v2.html` template
11. Run delivery checklist
