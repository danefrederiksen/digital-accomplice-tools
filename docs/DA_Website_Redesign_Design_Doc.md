# Digital Accomplice Website Redesign — Design Doc
**Created:** 2026-03-16
**Status:** Planning phase — pivoting to Wix redesign-in-place
**Platform:** Wix (redesign in place) | Video hosting: Vimeo
**Quick command:** "website redesign project"

---

## What We Know

### Current State
- Live site: digitalaccomplice.com on Wix
- Site doesn't reflect new positioning (strategy + production, not just production)
- Need site that sells the 3-tier service model, showcases case studies, and leads with AI visibility angle

### Platform Decision: Wix (redesign in place)
- **Why Wix over Webflow:** Dane already knows Wix, no migration needed, steep Webflow learning curve not worth it for a non-coder. Friend's experience with Squarespace+Claude confirmed that simpler platforms work fine.
- **Why not Squarespace:** Would require full migration from Wix. Redesigning in place on Wix is lowest-friction path.
- **Video hosting: Vimeo** — clean ad-free embeds, player customization, no "related videos" sending visitors away. YouTube stays for discovery/SEO; Vimeo for on-site embeds.
- **No rollback needed:** Redesigning the existing Wix site. Can revert page-by-page if needed since Wix has version history.
- **Webflow account:** Created 2026-03-16 but ABANDONED. Workspace `danes-workspace-2a2780` can be deleted.

### Sitemap (5 pages + eyebrow nav)

**Main nav:** Home | About | Services | Work | Resources
**Eyebrow nav:** Contact | Privacy | Careers | Sitemap

**Page 1: Home**
- Hero: Positioning statement + hero video
- StoryBrand-style layout (see wireframe template in sitemap PDF)
- Problem → solution → CTA flow
- Three positioning statement options drafted (see sitemap PDF page 9, Simon's feedback)
- Multiple CTAs: free assessment, AI Visibility Snapshot, video interview, start a project

**Page 2: About**
- "Why us" section with Venn diagram (marketing agency + video production = DA)
- Origin story (Dane's background: NatGeo, Discovery, USATODAY, Xbox, PlayStation → DA in 2010)
- "How we work" — 4-step proprietary process
- Team section (Dane + assembled experts)
- Client logos: Adobe, Twitch, Google, Microsoft, Honda, VW, Taco Bell, Samsung
- Dane's face on page for trust building

**Page 3: Services**
- 3 tiers: Strategy ($5K/$10K/$15K), Pipeline (2-8 weeks), Project-Based (varies)
- Challenge/approach comparison table
- "Three Revolutions" framework (AI, Video, Business Culture)
- Sub-nav: Our Video Strategy Process, Pre-purposing Pipeline Setup, Project-Based Production
- Each service: What it is, Who it's for, How it works, What you get, Price/timing
- Budget allocation examples ("$10K can be spent 3 different ways")
- Note: Strategy comes first — "you wouldn't build a house without a blueprint"

**Page 4: Work**
- Logo wall at top (~10 B2B logos: AWS, Twitch, Google, Adobe)
- Three case study categories:
  - A) Video Strategy: Hinge, Thiel & Team, Crux
  - B) Video Pipeline: Twitch (sales enablement), Tube Mogul (outsourced team), Quatrain (field/remote)
  - C) One-off Content: AWS Cyber, Colton animated, Twitch, social clips
- Each pipeline case study needs workflow diagram graphic
- "More examples" button at bottom of one-offs

**Page 5: Resources**
- Blog (repurpose Substack newsletter as weekly posts + standalone blog posts)
- Newsletter subscribe/view (Substack link)
- Hourly consulting (hidden page)
- Webinars/events (link inactive until launched)
- Publications (3 Revolutions white paper, exec guide, quarterly cadence)
- Videos: thought leadership content archive

### CTA Strategy
- Primary: Free assessment / book a call
- Secondary on-ramps (lower friction):
  - AI Visibility Snapshot (lead capture — give email, get report)
  - Video interview offer
  - "Start a video project" inquiry
- CTAs woven throughout site, not just one page
- No "buy now" button for strategy

### Brand Guidelines
**Canonical source:** `docs/DA_Brand_Standards_Skill_CORRECTED.md` (local) + Google Drive `DA_Assets_Brand_MasterStandards_2026-03-16.docx` (shared).
Do not duplicate brand rules here — reference the canonical source.

### Inspiration Sites
- storybrand.com — StoryBrand framework layout
- thursdaylabs.co — video prod company ("I would buy from them")
- rightfit.leadhunter.net
- flywheelos.com
- parakeeto.com
- chasingcreative.io — services section
- StoryBrand wireframe template (pribbledesign.com)
- promode.ai/the-use-cases/ — use cases layout idea

---

## Open Questions

1. **Video hosting:** DECIDED — Vimeo for on-site embeds, YouTube for discovery/SEO. Hybrid approach.
2. **Blog approach:** Wix native blog vs. embed/link to Substack? (TBD)
3. **John Corcoran Showcase page idea:** Add as a service? Separate landing page?
4. **Hero video:** What video goes in the hero? Does it exist yet or need to be produced?
5. **Case study content:** Do we have the written case studies for Hinge, Thiel, Crux, Twitch, Tube Mogul, Quatrain? Or do these need to be written?
6. **Workflow diagrams:** For pipeline case studies — who creates these? (Could be built as simple graphics in the site)
7. **Team section:** Who else besides Dane? Need names, photos, bios?
8. **Contact form:** What fields? Where does it submit to? (Calendly embed? Email?)
9. **Analytics:** Google Analytics? Webflow native? Both?
10. **Favicon/logo:** Current DA logo good to go, or updating?
11. **Photos of Dane:** Professional headshot ready? Multiple photos for different sections?
12. **Testimonials/social proof:** Any client quotes to include?
13. **Publications:** Is the 3 Revolutions white paper written? Exec guide?
14. **Hourly consulting hidden page:** What goes on it? Calendly link + rate?

---

## Step-by-Step Build Plan

### Phase 0: Setup — PIVOTED TO WIX
- ~~[x] 0.1–0.5 — Webflow setup — DONE but ABANDONED (Mar 16). Pivoting to Wix redesign-in-place (Mar 17).~~
- [ ] 0.6 — Audit current Wix site: inventory all pages, note what to keep vs. rebuild
- [ ] 0.7 — Set up Vimeo account (Pro plan recommended for player customization + CTAs)
- [ ] 0.8 — Document current Wix site structure (screenshots or page list) as baseline

### Phase 1: Home Page — Redesign on Wix
- [ ] 1.1 — Update nav: Home | About | Services | Work | Resources
- [ ] 1.2 — Hero section: headline + subhead + CTA button + Vimeo hero video embed
- [ ] 1.3 — Problem/solution section (StoryBrand style)
- [ ] 1.4 — "Three Revolutions" overview section
- [ ] 1.5 — Services preview (3 cards linking to Services page)
- [ ] 1.6 — Logo wall (client logos)
- [ ] 1.7 — CTA section (free assessment)
- [ ] 1.8 — Footer (links, contact info, social)
- [ ] 1.9 — **REVIEW WITH DANE** — adjust before moving on

### Phase 2: About Page
- [ ] 2.1 — "Why us" section + Venn diagram
- [ ] 2.2 — Origin story (narrative copy)
- [ ] 2.3 — "How we work" — 4-step process (icons or numbered steps)
- [ ] 2.4 — Team section (Dane bio + photo, team members TBD)
- [ ] 2.5 — Full client logo wall
- [ ] 2.6 — **REVIEW WITH DANE**

### Phase 3: Services Page
- [ ] 3.1 — "Three ways we can work together" overview
- [ ] 3.2 — Strategy service detail (what/who/how/what you get/price)
- [ ] 3.3 — Pipeline service detail
- [ ] 3.4 — Project-based service detail
- [ ] 3.5 — Challenge/approach comparison table
- [ ] 3.6 — Budget allocation examples section
- [ ] 3.7 — CTA (free assessment / book a call)
- [ ] 3.8 — **REVIEW WITH DANE**

### Phase 4: Work Page
- [ ] 4.1 — Logo wall header
- [ ] 4.2 — Case study category navigation
- [ ] 4.3 — Strategy case studies (Hinge, Thiel, Crux) — need content from Dane
- [ ] 4.4 — Pipeline case studies (Twitch, Tube Mogul, Quatrain) — need content + workflow diagrams
- [ ] 4.5 — One-off showcase (AWS Cyber, Colton, Twitch, social clips) — need video embeds
- [ ] 4.6 — **REVIEW WITH DANE**

### Phase 5: Resources Page
- [ ] 5.1 — Blog setup (Wix native blog or Substack embed — TBD)
- [ ] 5.2 — Import/create first 3-5 blog posts from Substack newsletter
- [ ] 5.3 — Newsletter subscribe section (Substack link or embedded form)
- [ ] 5.4 — Publications section (white paper, exec guide — PDFs or landing pages)
- [ ] 5.5 — Videos section (thought leadership archive)
- [ ] 5.6 — Webinars/events placeholder (inactive link)
- [ ] 5.7 — Hourly consulting hidden page
- [ ] 5.8 — **REVIEW WITH DANE**

### Phase 6: Secondary Pages + Polish
- [ ] 6.1 — Contact page (form + Calendly embed)
- [ ] 6.2 — Privacy policy page
- [ ] 6.3 — Careers page (placeholder or real)
- [ ] 6.4 — Sitemap page
- [ ] 6.5 — 404 page
- [ ] 6.6 — Mobile responsive pass (test all pages on phone/tablet)
- [ ] 6.7 — **FULL REVIEW WITH DANE**

### Phase 7: Video Hosting Implementation (Vimeo)
- [x] 7.1 — Decide on video hosting — DECIDED: Vimeo for on-site, YouTube for discovery
- [ ] 7.2 — Set up Vimeo Pro account (if not done in Phase 0)
- [ ] 7.3 — Upload hero video
- [ ] 7.4 — Upload case study videos
- [ ] 7.5 — Upload thought leadership videos
- [ ] 7.6 — Replace all placeholder video embeds with real ones
- [ ] 7.7 — Test video playback on desktop + mobile

### Phase 8: SEO + AI Visibility
- [ ] 8.1 — Page titles + meta descriptions for all pages
- [ ] 8.2 — Open Graph tags (social sharing previews)
- [ ] 8.3 — Schema markup (Organization, Service, Video)
- [ ] 8.4 — Alt text for all images
- [ ] 8.5 — Sitemap.xml generation
- [ ] 8.6 — Google Analytics / Search Console setup
- [ ] 8.7 — Test AI visibility (ask ChatGPT/Perplexity about DA — baseline before launch)

### Phase 9: Launch Prep
- [ ] 9.1 — Final content review — all copy proofread
- [ ] 9.2 — Test all forms (contact, newsletter, CTAs)
- [ ] 9.3 — Test all links (internal + external)
- [ ] 9.4 — Speed test (PageSpeed Insights)
- [ ] 9.5 — Cross-browser test (Chrome, Safari, Firefox)
- [ ] 9.6 — Document rollback procedure (DNS swap steps)
- [ ] 9.7 — **FINAL SIGN-OFF FROM DANE**

### Phase 10: Go Live
- [ ] 10.1 — Final publish on Wix (already on digitalaccomplice.com — no DNS change needed)
- [ ] 10.2 — Verify all pages live and working
- [ ] 10.3 — Test all forms on live domain
- [ ] 10.4 — Submit updated sitemap to Google Search Console
- [ ] 10.5 — Monitor for 48 hours
- [ ] 10.6 — Delete Webflow workspace (danes-workspace-2a2780)

---

## Rules for This Build
1. **Small steps.** Never build more than one section without reviewing with Dane.
2. **No rushing.** Quality over speed. Dane said "ASAP but don't railroad it."
3. **Review at every phase.** Each phase ends with a Dane review checkpoint.
4. **Rollback always available.** Wix stays live until Webflow is fully tested and approved.
5. **Content first, design second.** Get the words right, then make it look good.
6. **Video hosting decided in Phase 7, not Phase 1.** Don't let that decision block progress.
7. **Each session = 1-2 steps max.** Avoid context drift. Save, commit, fresh start.
