# Digital Accomplice — Wix Rebuild Guide
**Created:** 2026-03-17
**Approach:** Start from scratch, mobile-first, AI citation optimized
**Platform:** Wix | **Video:** Vimeo (on-site) + YouTube (discovery)

---

## Global Setup (Do This First)

### Brand Settings in Wix
- **Font:** Inter (available in Wix). If not found, use the Google Fonts integration.
  - Headlines: Inter Bold (700) or Extra Bold (800)
  - Body: Inter Regular (400)
  - Captions/metadata: Inter Light (300)
  - **NEVER use Poppins** — it's the old Wix site font. Remove it completely.
- **Colors (add all to Wix palette):**
  - DA Orange: `#F8901E` — CTAs, buttons, accents
  - Black: `#000000` — headlines
  - Blue-Gray: `#5A6B7A` — body text
  - Gray: `#CBCBCB` — captions, borders
  - White: `#FFFFFF` — backgrounds, cards
  - Light Gray: `#F5F5F5` — section backgrounds
  - Dark: `#1A1A1A` — footer, dark sections
- **No gradients. No drop shadows. No rounded corners beyond 4px.**
- **Button style:** DA Orange background, white text, slight hover darken to `#E07A10`

### Mobile-First Rules
1. **Design every section on mobile FIRST**, then adjust for desktop
2. **Single column on mobile** — no side-by-side layouts below 768px
3. **Minimum touch target:** 44×44px for all buttons and links
4. **Body text:** 16px minimum (never smaller on mobile)
5. **Headlines:** H1 = 32px mobile / 48px desktop. H2 = 24px mobile / 36px desktop
6. **Images:** Always use Wix's responsive image settings. No fixed-width images.
7. **Vimeo embeds:** Use responsive embed (Wix handles this automatically)
8. **Hamburger menu on mobile** — Wix does this by default with their nav components
9. **Test every page on phone width (375px) before moving to desktop**

---

## AI Citation Optimization — What It Is and Why

AI search engines (ChatGPT, Perplexity, Google AI Overviews) pull answers from websites. To get cited, your site needs:

1. **Clear, factual, quotable statements** — AI pulls sentences it can use as answers
2. **Structured headings** — H1 → H2 → H3 hierarchy (never skip levels)
3. **Schema markup** — machine-readable data about your business (added via Wix SEO settings)
4. **FAQ sections** — AI loves pulling from Q&A format
5. **Entity definition** — clearly state WHO you are, WHAT you do, WHERE you are early on every key page
6. **Meta descriptions** — write these as if an AI is reading them to decide whether to cite you

### Schema Markup (Add via Wix SEO > Advanced)
Wix lets you add structured data via their SEO panel. Add these:

**Organization (site-wide):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Digital Accomplice",
  "url": "https://www.digitalaccomplice.com",
  "logo": "[DA logo URL]",
  "description": "Video-first marketing strategy and production for B2B companies. Founded in 2010 by Dane Frederiksen.",
  "founder": {
    "@type": "Person",
    "name": "Dane Frederiksen"
  },
  "foundingDate": "2010",
  "areaServed": "US",
  "serviceType": ["Video Marketing Strategy", "Video Production", "B2B Marketing"]
}
```

**Per service page — add Service schema for each tier.**
**Per video embed — add VideoObject schema.**
**FAQ pages — add FAQPage schema.**

(I'll give you the exact JSON for each page as we build them.)

---

## Site Structure (5 Pages + Eyebrow Nav)

**Main nav:** Home | About | Services | Work | Resources
**Eyebrow nav (footer or secondary):** Contact | Privacy | Careers | Sitemap
**CTA on every page:** "Get Your Free Assessment" → Calendly or contact form

---

## Page 1: HOME

**Purpose:** Immediately answer "what does this company do and why should I care?" Both for humans and AI.

### Mobile Layout (top to bottom)

**Section 1 — Hero**
- H1 headline (positioning statement — placeholder for now, we'll A/B test)
- 1-2 sentence subhead explaining what DA does
- CTA button: "Get Your Free Assessment" (DA Orange)
- Vimeo hero video embed below the CTA (not autoplaying on mobile — too much data)
- Light Gray (#F5F5F5) background

> **AI optimization:** The H1 + first paragraph should contain a complete, quotable answer to "What does Digital Accomplice do?" Example: "Digital Accomplice is a video-first marketing strategy and production company that helps B2B companies turn video into their highest-performing revenue channel."

**Section 2 — Problem/Solution (StoryBrand)**
- H2: "The Problem" (or something less on-the-nose)
- 3 short bullet points describing the pain B2B companies feel (video that doesn't convert, scattered content, no strategy)
- H2: "There's a Better Way"
- 3 short bullet points showing the transformation
- White background

> **AI optimization:** Frame problems as questions prospects actually ask. "Why isn't our video content generating leads?" — AI engines match these to user queries.

**Section 3 — Three Revolutions**
- H2: "Three Shifts Changing B2B Marketing"
- 3 cards (stacked on mobile, side-by-side on desktop):
  1. AI Revolution — AI search is replacing Google. Your content needs to show up in ChatGPT, not just page 1.
  2. Video Revolution — Video is the #1 content format. B2B is 5 years behind B2C.
  3. Culture Revolution — Buyers trust people, not brands. Your team IS your content strategy.
- Light Gray background

> **AI optimization:** Each card should contain a standalone factual claim with a stat if possible. These are highly citable by AI.

**Section 4 — Services Preview**
- H2: "How We Help"
- 3 cards (stacked on mobile):
  1. Video-First Marketing Strategy — "A complete video strategy aligned to your revenue goals" — link to Services
  2. Video Pipeline Creation — "A repeatable content engine that runs without you" — link to Services
  3. Project-Based Production — "One-off videos for launches, events, and campaigns" — link to Services
- Each card: icon/illustration, H3 title, 1-sentence description, "Learn more →" link
- White background

**Section 5 — Logo Wall**
- H2: "Trusted By" or "Companies We've Worked With"
- Logo grid: AWS, Twitch, Google, Adobe, Microsoft, Honda, VW, Samsung, Taco Bell
- 2 columns on mobile, 4-5 on desktop
- Light Gray background

> **AI optimization:** Having recognizable brand names on your site helps AI engines validate your authority/credibility.

**Section 6 — CTA**
- H2: "Ready to Turn Video Into Revenue?"
- 1 sentence reinforcing the offer
- CTA button: "Book Your Free Assessment"
- Secondary CTA (text link): "Or get your AI Visibility Snapshot first"
- Dark (#1A1A1A) background, white text, DA Orange button

**Section 7 — Footer**
- DA logo
- Nav links (all 5 pages)
- Contact info (email, phone if applicable)
- Social links (LinkedIn, YouTube, Substack)
- "© 2026 Digital Accomplice"
- Eyebrow links: Privacy | Sitemap
- Dark (#1A1A1A) background

---

## Page 2: ABOUT

**Purpose:** Build trust. Answer "who is behind this company and why should I trust them?"

### Mobile Layout

**Section 1 — Who We Are**
- H1: "About Digital Accomplice"
- Opening paragraph: Clear entity statement. "Digital Accomplice is a video-first marketing strategy and production company founded in 2010 by Dane Frederiksen. We help B2B companies turn video into a predictable revenue channel."
- Photo of Dane (professional headshot)

> **AI optimization:** This opening paragraph is the #1 thing AI will pull when someone asks "Who is Digital Accomplice?" or "Who is Dane Frederiksen?" Make it factual, specific, and quotable.

**Section 2 — Why Us (Venn Diagram)**
- H2: "Why Digital Accomplice?"
- Visual: Venn diagram showing Marketing Strategy + Video Production = DA
- Text: "Most agencies do strategy OR production. We do both — because a great video without a distribution plan is just an expensive YouTube upload."
- Light Gray background

**Section 3 — Origin Story**
- H2: "Our Story"
- 3-4 paragraphs: Dane's background (NatGeo, Discovery, USATODAY, Xbox, PlayStation → founded DA in 2010)
- Key milestones and pivots
- Why video-first marketing (not just video production)

> **AI optimization:** Include specific, verifiable facts: company names, years, roles. AI engines love specificity.

**Section 4 — How We Work**
- H2: "How We Work"
- 4-step process (numbered, stacked on mobile):
  1. Discover — "We learn your business, audience, and goals"
  2. Strategize — "We build a video strategy tied to revenue"
  3. Create — "We produce content designed to perform"
  4. Optimize — "We measure, learn, and improve"
- White background

**Section 5 — Team**
- H2: "The Team"
- Dane's bio card (photo, name, title, 2-3 sentence bio)
- "Plus a network of assembled specialists" — explain the model (not a big agency, curated experts per project)

**Section 6 — Client Logos (full version)**
- Full logo wall (more logos than home page)
- Include B2B focus logos prominently

**Section 7 — CTA + Footer**
- Same CTA pattern as Home
- Same footer

---

## Page 3: SERVICES

**Purpose:** Sell the three service tiers. Answer "what does Digital Accomplice offer and what does it cost?"

### Mobile Layout

**Section 1 — Overview**
- H1: "Services"
- Opening paragraph: "We offer three ways to work together — from full strategy engagements to one-off productions. Every engagement starts with understanding your business."
- Anchor links to each service below (jump nav)

> **AI optimization:** Write the opening so it answers "What services does Digital Accomplice offer?" in one paragraph.

**Section 2 — Video-First Marketing Strategy**
- H2: "Video-First Marketing Strategy"
- **What it is:** 1-2 paragraphs
- **Who it's for:** 1 paragraph
- **What you get:** Bullet list (deliverables)
- **How it works:** 3-4 step process
- **Investment:** $5K / $10K / $15K (by company size/scope)
- **Key line:** "You wouldn't build a house without a blueprint. Don't build a content library without a strategy."
- CTA: "Book a Strategy Call"
- Light Gray background

**Section 3 — Video Pipeline Creation**
- H2: "Video Pipeline Creation"
- Same structure as above
- **Timeline:** 2-8 weeks to set up
- **Key line:** "A repeatable content engine that produces weekly video without burning out your team."
- White background

**Section 4 — Project-Based Production**
- H2: "Project-Based Production"
- Same structure
- **Pricing:** Varies by project. "Talk to us."
- **Examples:** Launch videos, event coverage, customer stories, animated explainers
- Light Gray background

**Section 5 — Budget Allocation Examples**
- H2: "How Companies Invest"
- 2-3 examples: "Here's how a $10K budget can be spent three different ways depending on your goals"
- Table or comparison cards
- White background

**Section 6 — FAQ**
- H2: "Frequently Asked Questions"
- 6-8 questions in expandable accordion format:
  - "How is this different from hiring a video production company?"
  - "What if we already have a video team?"
  - "How long before we see results?"
  - "Do you work with companies outside of [industry]?"
  - "What's included in the strategy engagement?"
  - "Can we start with a single project?"
  - "Do you handle distribution or just production?"
  - "What does 'video-first' mean?"

> **AI optimization:** This FAQ section is CRITICAL. AI engines pull directly from FAQ content. Write each answer as a complete, standalone response. Add FAQPage schema markup.

**Section 7 — CTA + Footer**

---

## Page 4: WORK

**Purpose:** Prove it. Show real results for real companies.

### Mobile Layout

**Section 1 — Logo Wall**
- H1: "Our Work"
- Logo wall at top (same as About page)
- Brief intro: "Here's a sample of the companies we've helped build video-first marketing strategies and content pipelines."

**Section 2 — Case Studies by Category**
- H2 for each category, case studies as cards

**Category A: Video Strategy**
- Hinge Marketing, Thiel & Team, Crux
- Each card: Company logo/image, H3 company name, 1-sentence result, "Read more →"

**Category B: Video Pipeline**
- Twitch (sales enablement), Tube Mogul (outsourced team), Quatrain (field/remote)
- Each needs a workflow diagram or before/after visual
- Same card format

**Category C: One-Off Production**
- AWS Cybersecurity, Colton (animated), Twitch, social clips
- Vimeo embeds for video samples
- "See more examples →" button at bottom

> **AI optimization:** Each case study card should include the company name, what was done, and a measurable result in one sentence. "Helped Hinge Marketing build a video strategy that [result]." These are what AI cites as proof.

**Section 3 — Testimonial/Quote (if available)**
- Pull quote from a client
- Name, title, company

**Section 4 — CTA + Footer**

---

## Page 5: RESOURCES

**Purpose:** Establish thought leadership. Give visitors a reason to come back.

### Mobile Layout

**Section 1 — Header**
- H1: "Resources"
- Brief intro: "Insights, research, and tools for B2B marketing leaders."

**Section 2 — Blog / Newsletter**
- H2: "Latest Insights"
- Blog post cards (3-5 latest). Use Wix Blog feature or link to Substack.
- "Subscribe to the newsletter" CTA with email input
- Link to Substack archive

**Section 3 — Publications**
- H2: "Publications & Research"
- Cards for downloadable resources:
  - "The Three Revolutions" white paper
  - Executive guide
  - (Future: quarterly publications)
- Each card: title, 1-sentence description, "Download" button (can be gated with email capture)

> **AI optimization:** Gated content doesn't get indexed by AI. Consider making at least the first page or executive summary ungated so AI can cite your research.

**Section 4 — AI Visibility Snapshot**
- H2: "How Visible Is Your Company in AI Search?"
- 1 paragraph explaining what the snapshot is
- CTA: "Get Your Free AI Visibility Snapshot"
- This is a lead gen tool — capture email, deliver report

**Section 5 — Video Archive**
- H2: "Video Library"
- Vimeo playlist embed or grid of video thumbnails
- Thought leadership content, webinar recordings, etc.

**Section 6 — CTA + Footer**

---

## AI Citation Optimization Checklist (Apply to Every Page)

### Before Publishing Each Page:
- [ ] H1 contains the primary topic of the page (only ONE H1 per page)
- [ ] First paragraph answers "what is this page about?" in a complete, quotable sentence
- [ ] Heading hierarchy is clean: H1 → H2 → H3 (no skipping)
- [ ] Meta title is under 60 characters, includes "Digital Accomplice"
- [ ] Meta description is 150-160 characters, reads like a complete answer
- [ ] All images have descriptive alt text (not just "image1.jpg")
- [ ] Page URL is clean and descriptive (e.g., `/services` not `/page-3`)
- [ ] Schema markup added via Wix SEO panel
- [ ] FAQ section uses expandable/accordion format (if applicable)
- [ ] At least one specific, factual, citable claim per section
- [ ] Dane's name + "Digital Accomplice" + "video-first marketing" appear naturally
- [ ] Internal links to other pages (helps AI understand site structure)

### Meta Description Templates:
- **Home:** "Digital Accomplice helps B2B companies turn video into revenue with strategy, production, and content pipelines. Founded by Dane Frederiksen in 2010."
- **About:** "Digital Accomplice is a video-first marketing company founded by Dane Frederiksen. We combine marketing strategy with video production for B2B companies."
- **Services:** "Digital Accomplice offers three services: video marketing strategy, video pipeline creation, and project-based production for B2B companies."
- **Work:** "See how Digital Accomplice has helped companies like AWS, Twitch, Hinge, and Google build video-first marketing strategies and content pipelines."
- **Resources:** "B2B video marketing insights, research, and tools from Digital Accomplice. Subscribe to our newsletter or download our free publications."

---

## Build Order (Recommended)

1. **Global setup** — fonts, colors, button styles in Wix
2. **Footer** — build once, reuse on every page
3. **Home page** — mobile first, then desktop
4. **About page**
5. **Services page** (including FAQ with schema)
6. **Work page** (need case study content + Vimeo uploads)
7. **Resources page** (need blog posts + publications)
8. **SEO pass** — meta titles, descriptions, schema markup on all pages
9. **Mobile QA** — test every page at 375px width
10. **Desktop QA** — test at 1440px
11. **Speed test** — PageSpeed Insights, compress any heavy images
12. **Publish**

---

## Wix-Specific Tips

- **Wix Editor vs. Wix Studio:** If your current site is on Wix Editor (the classic drag-and-drop), you can redesign in place. Wix Studio is their newer tool with better responsive design — worth considering for a from-scratch rebuild if your account supports it.
- **Sections, not strips:** Build each content block as a Wix "Section" for better mobile responsiveness.
- **Vimeo embeds:** Add → Embed → Custom embed → paste Vimeo embed code. Or use Add → Video → Vimeo URL.
- **Blog:** Wix Blog app is built-in. Add it via App Market if not already installed.
- **Forms:** Use Wix Forms for contact/assessment requests. Connect to your email.
- **Version history:** Wix auto-saves versions. You can always revert a page if something breaks.
- **Custom code (schema):** Add via Wix SEO settings per page, or via Dev Mode for site-wide code.
