#!/usr/bin/env python3
"""
Generate DA-branded PDF from Website Redesign Design Doc.
Output: reports/DA_Marketing_Website_Redesign_Design_Doc_2026-03-16.pdf
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable
import os

# --- DA Brand Colors ---
DA_ORANGE = HexColor("#F8901E")
DA_BLACK = HexColor("#000000")
DA_BLUE_GRAY = HexColor("#5A6B7A")
DA_GRAY = HexColor("#CBCBCB")
DA_LIGHT_GRAY = HexColor("#F5F5F5")
DA_WHITE = HexColor("#FFFFFF")

MARGIN = 0.75 * inch
PAGE_W, PAGE_H = letter

# --- Styles ---
def make_styles():
    s = {}
    s["title"] = ParagraphStyle(
        "title", fontName="Helvetica-Bold", fontSize=26, leading=32,
        textColor=DA_BLACK, alignment=TA_LEFT, spaceAfter=6
    )
    s["subtitle"] = ParagraphStyle(
        "subtitle", fontName="Helvetica", fontSize=12, leading=16,
        textColor=DA_BLUE_GRAY, alignment=TA_LEFT, spaceAfter=4
    )
    s["section"] = ParagraphStyle(
        "section", fontName="Helvetica-Bold", fontSize=16, leading=20,
        textColor=DA_ORANGE, spaceBefore=18, spaceAfter=2
    )
    s["subsection"] = ParagraphStyle(
        "subsection", fontName="Helvetica-Bold", fontSize=12, leading=16,
        textColor=DA_BLUE_GRAY, spaceBefore=12, spaceAfter=4
    )
    s["body"] = ParagraphStyle(
        "body", fontName="Helvetica", fontSize=10, leading=14,
        textColor=DA_BLACK, spaceAfter=4
    )
    s["bullet"] = ParagraphStyle(
        "bullet", fontName="Helvetica", fontSize=10, leading=14,
        textColor=DA_BLACK, leftIndent=18, spaceAfter=3,
        bulletIndent=0, bulletFontSize=10
    )
    s["bullet2"] = ParagraphStyle(
        "bullet2", fontName="Helvetica", fontSize=10, leading=14,
        textColor=DA_BLACK, leftIndent=36, spaceAfter=2,
        bulletIndent=18, bulletFontSize=10
    )
    s["checkbox"] = ParagraphStyle(
        "checkbox", fontName="Helvetica", fontSize=10, leading=14,
        textColor=DA_BLACK, leftIndent=22, spaceAfter=3,
        bulletIndent=0
    )
    s["table_header"] = ParagraphStyle(
        "table_header", fontName="Helvetica-Bold", fontSize=9, leading=12,
        textColor=DA_WHITE
    )
    s["table_cell"] = ParagraphStyle(
        "table_cell", fontName="Helvetica", fontSize=9, leading=12,
        textColor=DA_BLACK
    )
    s["footer"] = ParagraphStyle(
        "footer", fontName="Helvetica", fontSize=7, leading=9,
        textColor=DA_BLUE_GRAY
    )
    s["rule_num"] = ParagraphStyle(
        "rule_num", fontName="Helvetica-Bold", fontSize=10, leading=14,
        textColor=DA_BLACK, leftIndent=18, spaceAfter=3, bulletIndent=0
    )
    return s

STYLES = make_styles()


# --- Custom Flowables ---
class OrangeRule(Flowable):
    """Horizontal orange accent line."""
    def __init__(self, width, thickness=2):
        super().__init__()
        self.rule_width = width
        self.thickness = thickness
        self.height = thickness + 2

    def wrap(self, aW, aH):
        return (self.rule_width, self.height)

    def draw(self):
        self.canv.setStrokeColor(DA_ORANGE)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.rule_width, 0)


class AccentBar(Flowable):
    """Tall orange accent bar for title page."""
    def __init__(self, width=6, height=60):
        super().__init__()
        self.bar_width = width
        self.height = height

    def wrap(self, aW, aH):
        return (self.bar_width, self.height)

    def draw(self):
        self.canv.setFillColor(DA_ORANGE)
        self.canv.rect(0, 0, self.bar_width, self.height, stroke=0, fill=1)


# --- Helpers ---
def section_header(title, content_width):
    """Return section header + orange underline."""
    return [
        Paragraph(title, STYLES["section"]),
        OrangeRule(content_width, thickness=2),
        Spacer(1, 6),
    ]

def subsection(title):
    return [Paragraph(title, STYLES["subsection"])]

def bullet(text, level=1):
    style = STYLES["bullet"] if level == 1 else STYLES["bullet2"]
    orange_dot = '<font color="#F8901E">\u2022</font>'
    return Paragraph(f"{orange_dot}  {text}", style)

def checkbox(text):
    orange_box = '<font color="#F8901E">\u25A1</font>'
    return Paragraph(f"{orange_box}  {text}", STYLES["checkbox"])

def body(text):
    return Paragraph(text, STYLES["body"])

def bold_body(text):
    return Paragraph(f"<b>{text}</b>", STYLES["body"])


# --- Footer ---
def footer_func(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(DA_BLUE_GRAY)
    canvas.drawString(MARGIN, 0.45 * inch, "Digital Accomplice  |  Website Redesign Design Doc  |  March 2026")
    canvas.drawRightString(PAGE_W - MARGIN, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def first_page_footer(canvas, doc):
    footer_func(canvas, doc)


def later_page_footer(canvas, doc):
    footer_func(canvas, doc)


# --- Build ---
def build_pdf():
    base = "/Users/danefrederiksen/Desktop/Claude Code"
    out_path = os.path.join(base, "reports", "DA_Marketing_Website_Redesign_Design_Doc_2026-03-16.pdf")

    doc = SimpleDocTemplate(
        out_path, pagesize=letter,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=0.75 * inch
    )
    content_width = PAGE_W - 2 * MARGIN
    story = []

    # =========================================================
    # TITLE PAGE
    # =========================================================
    story.append(Spacer(1, 1.5 * inch))
    # Orange accent bar (table trick to put bar + text side by side)
    title_text = Paragraph("Digital Accomplice<br/>Website Redesign<br/>Design Doc", STYLES["title"])
    bar_table = Table(
        [[AccentBar(width=5, height=90), title_text]],
        colWidths=[20, content_width - 20],
    )
    bar_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (1, 0), (1, 0), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(bar_table)
    story.append(Spacer(1, 24))
    story.append(OrangeRule(content_width * 0.4, thickness=3))
    story.append(Spacer(1, 18))

    meta_style = ParagraphStyle("meta", fontName="Helvetica", fontSize=11, leading=16, textColor=DA_BLUE_GRAY)
    story.append(Paragraph("<b>Created:</b>  2026-03-16", meta_style))
    story.append(Paragraph("<b>Status:</b>  Planning phase — not yet building", meta_style))
    story.append(Paragraph("<b>Platform:</b>  Webflow (new build)  |  Wix (current live site, kept as rollback)", meta_style))
    story.append(Spacer(1, 8))

    story.append(PageBreak())

    # =========================================================
    # SECTION: What We Know
    # =========================================================
    story.extend(section_header("What We Know", content_width))

    # Current State
    story.extend(subsection("Current State"))
    story.append(bullet("Live site: digitalaccomplice.com on Wix"))
    story.append(bullet("Site doesn't reflect new positioning (strategy + production, not just production)"))
    story.append(bullet("Need site that sells the 3-tier service model, showcases case studies, and leads with AI visibility angle"))
    story.append(Spacer(1, 6))

    # Platform Decision
    story.extend(subsection("Platform Decision: Webflow"))
    story.append(bullet("<b>Why Webflow over Wix:</b> Cleaner code (better SEO + AI visibility), Claude connector for assisted building, better CMS for blog/resources, more design control, zero maintenance"))
    story.append(bullet("<b>Rollback plan:</b> Keep Wix site 100% intact and live. Build entire new site on Webflow staging URL. When ready, DNS swap. If problems, swap DNS back to Wix. Keep Wix active for 30 days post-launch."))
    story.append(bullet("<b>Claude connector:</b> Webflow has a Claude connector that may let us build/edit pages programmatically"))
    story.append(Spacer(1, 6))

    # Sitemap
    story.extend(subsection("Sitemap (5 Pages + Eyebrow Nav)"))
    story.append(body("<b>Main nav:</b>  Home  |  About  |  Services  |  Work  |  Resources"))
    story.append(body("<b>Eyebrow nav:</b>  Contact  |  Privacy  |  Careers  |  Sitemap"))
    story.append(Spacer(1, 6))

    # Page descriptions
    pages_data = [
        ("Page 1: Home", [
            "Hero: Positioning statement + hero video",
            "StoryBrand-style layout (see wireframe template in sitemap PDF)",
            "Problem \u2192 solution \u2192 CTA flow",
            "Three positioning statement options drafted (see sitemap PDF page 9, Simon\u2019s feedback)",
            "Multiple CTAs: free assessment, AI Visibility Snapshot, video interview, start a project",
        ]),
        ("Page 2: About", [
            "\"Why us\" section with Venn diagram (marketing agency + video production = DA)",
            "Origin story (Dane\u2019s background: NatGeo, Discovery, USATODAY, Xbox, PlayStation \u2192 DA in 2010)",
            "\"How we work\" \u2014 4-step proprietary process",
            "Team section (Dane + assembled experts)",
            "Client logos: Adobe, Twitch, Google, Microsoft, Honda, VW, Taco Bell, Samsung",
            "Dane\u2019s face on page for trust building",
        ]),
        ("Page 3: Services", [
            "3 tiers: Strategy ($5K/$10K/$15K), Pipeline (2\u20138 weeks), Project-Based (varies)",
            "Challenge/approach comparison table",
            "\"Three Revolutions\" framework (AI, Video, Business Culture)",
            "Sub-nav: Our Video Strategy Process, Pre-purposing Pipeline Setup, Project-Based Production",
            "Each service: What it is, Who it\u2019s for, How it works, What you get, Price/timing",
            "Budget allocation examples (\"$10K can be spent 3 different ways\")",
            "Strategy comes first \u2014 \"you wouldn\u2019t build a house without a blueprint\"",
        ]),
        ("Page 4: Work", [
            "Logo wall at top (~10 B2B logos: AWS, Twitch, Google, Adobe)",
            "Three case study categories:",
            "  A) Video Strategy: Hinge, Thiel &amp; Team, Crux",
            "  B) Video Pipeline: Twitch (sales enablement), Tube Mogul (outsourced team), Quatrain (field/remote)",
            "  C) One-off Content: AWS Cyber, Colton animated, Twitch, social clips",
            "Each pipeline case study needs workflow diagram graphic",
            "\"More examples\" button at bottom of one-offs",
        ]),
        ("Page 5: Resources", [
            "Blog (repurpose Substack newsletter as weekly posts + standalone blog posts)",
            "Newsletter subscribe/view (Substack link)",
            "Hourly consulting (hidden page)",
            "Webinars/events (link inactive until launched)",
            "Publications (3 Revolutions white paper, exec guide, quarterly cadence)",
            "Videos: thought leadership content archive",
        ]),
    ]

    for page_title, items in pages_data:
        story.append(Paragraph(f"<b><font color='#F8901E'>{page_title}</font></b>", STYLES["body"]))
        for item in items:
            if item.startswith("  "):
                story.append(bullet(item.strip(), level=2))
            else:
                story.append(bullet(item))
        story.append(Spacer(1, 4))

    # CTA Strategy
    story.extend(subsection("CTA Strategy"))
    story.append(bullet("<b>Primary:</b> Free assessment / book a call"))
    story.append(bullet("<b>Secondary on-ramps</b> (lower friction):"))
    story.append(bullet("AI Visibility Snapshot (lead capture \u2014 give email, get report)", level=2))
    story.append(bullet("Video interview offer", level=2))
    story.append(bullet("\"Start a video project\" inquiry", level=2))
    story.append(bullet("CTAs woven throughout site, not just one page"))
    story.append(bullet("No \"buy now\" button for strategy"))
    story.append(Spacer(1, 6))

    # Brand Guidelines
    story.extend(subsection("Brand Guidelines"))
    story.append(bullet("Colors: DA Orange #F8901E, Black #000, Blue-Gray #5A6B7A, Gray #CBCBCB, White #FFF, Light Gray #F5F5F5"))
    story.append(bullet("Fonts: Inter / Arial / Helvetica"))
    story.append(bullet("Voice: Direct, data-first, no-BS, short sentences"))
    story.append(bullet("<font color='red'><b>Do NOT use:</b></font> #F5A623, #AAAAAA, #F0F0F0"))
    story.append(Spacer(1, 6))

    # Inspiration Sites
    story.extend(subsection("Inspiration Sites"))
    inspo = [
        "storybrand.com \u2014 StoryBrand framework layout",
        "thursdaylabs.co \u2014 video prod company (\"I would buy from them\")",
        "rightfit.leadhunter.net",
        "flywheelos.com",
        "parakeeto.com",
        "chasingcreative.io \u2014 services section",
        "StoryBrand wireframe template (pribbledesign.com)",
        "promode.ai/the-use-cases/ \u2014 use cases layout idea",
    ]
    for site in inspo:
        story.append(bullet(site))
    story.append(Spacer(1, 6))

    # =========================================================
    # SECTION: Open Questions (as table)
    # =========================================================
    story.extend(section_header("Open Questions", content_width))

    q_data = [
        ["#", "Question", "Recommendation"],
        ["1", "Video hosting: YouTube vs Wistia vs Vimeo vs hybrid for on-site video player?", "Hybrid \u2014 YouTube for discovery, Wistia/Vimeo for on-site embeds"],
        ["2", "Blog approach: Native Webflow blog CMS vs. embed/link to Substack?", "Webflow native blog, cross-post to Substack"],
        ["3", "John Corcoran Showcase page idea \u2014 add as a service? Separate landing page?", "\u2014"],
        ["4", "Hero video: What video goes in the hero? Does it exist yet or need to be produced?", "\u2014"],
        ["5", "Case study content: Do we have written case studies for Hinge, Thiel, Crux, Twitch, Tube Mogul, Quatrain?", "\u2014"],
        ["6", "Workflow diagrams for pipeline case studies \u2014 who creates these?", "Could be built as simple graphics in the site"],
        ["7", "Team section: Who else besides Dane? Need names, photos, bios?", "\u2014"],
        ["8", "Contact form: What fields? Where does it submit to? (Calendly embed? Email?)", "\u2014"],
        ["9", "Analytics: Google Analytics? Webflow native? Both?", "\u2014"],
        ["10", "Favicon/logo: Current DA logo good to go, or updating?", "\u2014"],
        ["11", "Photos of Dane: Professional headshot ready? Multiple photos for different sections?", "\u2014"],
        ["12", "Testimonials/social proof: Any client quotes to include?", "\u2014"],
        ["13", "Publications: Is the 3 Revolutions white paper written? Exec guide?", "\u2014"],
        ["14", "Hourly consulting hidden page: What goes on it? Calendly link + rate?", "\u2014"],
    ]

    # Convert to Paragraphs for wrapping
    q_table_data = []
    for i, row in enumerate(q_data):
        if i == 0:
            q_table_data.append([
                Paragraph(row[0], STYLES["table_header"]),
                Paragraph(row[1], STYLES["table_header"]),
                Paragraph(row[2], STYLES["table_header"]),
            ])
        else:
            q_table_data.append([
                Paragraph(row[0], STYLES["table_cell"]),
                Paragraph(row[1], STYLES["table_cell"]),
                Paragraph(row[2], STYLES["table_cell"]),
            ])

    q_table = Table(q_table_data, colWidths=[30, content_width * 0.52, content_width * 0.40])
    q_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DA_ORANGE),
        ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(q_table)
    story.append(Spacer(1, 12))

    # =========================================================
    # SECTION: Step-by-Step Build Plan
    # =========================================================
    story.extend(section_header("Step-by-Step Build Plan", content_width))

    phases = [
        ("Phase 0: Setup", [
            "0.1 \u2014 Dane creates Webflow account (free tier)",
            "0.2 \u2014 Create new blank Webflow project (\"Digital Accomplice\")",
            "0.3 \u2014 Set up Claude connector (follow Webflow blog post instructions)",
            "0.4 \u2014 Verify connector works (test a simple edit)",
            "0.5 \u2014 Set up global styles: DA colors, fonts, spacing system",
        ]),
        ("Phase 1: Home Page \u2014 First Draft", [
            "1.1 \u2014 Build page skeleton: nav, hero section, sections, footer",
            "1.2 \u2014 Nav bar: Home | About | Services | Work | Resources + eyebrow nav",
            "1.3 \u2014 Hero section: headline + subhead + CTA button (placeholder video)",
            "1.4 \u2014 Problem/solution section (StoryBrand style)",
            "1.5 \u2014 \"Three Revolutions\" overview section",
            "1.6 \u2014 Services preview (3 cards linking to Services page)",
            "1.7 \u2014 Logo wall (client logos)",
            "1.8 \u2014 CTA section (free assessment)",
            "1.9 \u2014 Footer (links, contact info, social)",
            "1.10 \u2014 REVIEW WITH DANE \u2014 adjust before moving on",
        ]),
        ("Phase 2: About Page", [
            "2.1 \u2014 \"Why us\" section + Venn diagram",
            "2.2 \u2014 Origin story (narrative copy)",
            "2.3 \u2014 \"How we work\" \u2014 4-step process (icons or numbered steps)",
            "2.4 \u2014 Team section (Dane bio + photo, team members TBD)",
            "2.5 \u2014 Full client logo wall",
            "2.6 \u2014 REVIEW WITH DANE",
        ]),
        ("Phase 3: Services Page", [
            "3.1 \u2014 \"Three ways we can work together\" overview",
            "3.2 \u2014 Strategy service detail (what/who/how/what you get/price)",
            "3.3 \u2014 Pipeline service detail",
            "3.4 \u2014 Project-based service detail",
            "3.5 \u2014 Challenge/approach comparison table",
            "3.6 \u2014 Budget allocation examples section",
            "3.7 \u2014 CTA (free assessment / book a call)",
            "3.8 \u2014 REVIEW WITH DANE",
        ]),
        ("Phase 4: Work Page", [
            "4.1 \u2014 Logo wall header",
            "4.2 \u2014 Case study category navigation",
            "4.3 \u2014 Strategy case studies (Hinge, Thiel, Crux) \u2014 need content from Dane",
            "4.4 \u2014 Pipeline case studies (Twitch, Tube Mogul, Quatrain) \u2014 need content + workflow diagrams",
            "4.5 \u2014 One-off showcase (AWS Cyber, Colton, Twitch, social clips) \u2014 need video embeds",
            "4.6 \u2014 REVIEW WITH DANE",
        ]),
        ("Phase 5: Resources Page", [
            "5.1 \u2014 Blog setup (Webflow CMS collection)",
            "5.2 \u2014 Import/create first 3\u20135 blog posts from Substack newsletter",
            "5.3 \u2014 Newsletter subscribe section (Substack link or embedded form)",
            "5.4 \u2014 Publications section (white paper, exec guide \u2014 PDFs or landing pages)",
            "5.5 \u2014 Videos section (thought leadership archive)",
            "5.6 \u2014 Webinars/events placeholder (inactive link)",
            "5.7 \u2014 Hourly consulting hidden page",
            "5.8 \u2014 REVIEW WITH DANE",
        ]),
        ("Phase 6: Secondary Pages + Polish", [
            "6.1 \u2014 Contact page (form + Calendly embed)",
            "6.2 \u2014 Privacy policy page",
            "6.3 \u2014 Careers page (placeholder or real)",
            "6.4 \u2014 Sitemap page",
            "6.5 \u2014 404 page",
            "6.6 \u2014 Mobile responsive pass (test all pages on phone/tablet)",
            "6.7 \u2014 FULL REVIEW WITH DANE",
        ]),
        ("Phase 7: Video Hosting Decision + Implementation", [
            "7.1 \u2014 Decide on video hosting (YouTube/Wistia/Vimeo/hybrid)",
            "7.2 \u2014 Set up chosen platform account",
            "7.3 \u2014 Upload hero video",
            "7.4 \u2014 Upload case study videos",
            "7.5 \u2014 Upload thought leadership videos",
            "7.6 \u2014 Replace all placeholder video embeds with real ones",
            "7.7 \u2014 Test video playback on desktop + mobile",
        ]),
        ("Phase 8: SEO + AI Visibility", [
            "8.1 \u2014 Page titles + meta descriptions for all pages",
            "8.2 \u2014 Open Graph tags (social sharing previews)",
            "8.3 \u2014 Schema markup (Organization, Service, Video)",
            "8.4 \u2014 Alt text for all images",
            "8.5 \u2014 Sitemap.xml generation",
            "8.6 \u2014 Google Analytics / Search Console setup",
            "8.7 \u2014 Test AI visibility (ask ChatGPT/Perplexity about DA \u2014 baseline before launch)",
        ]),
        ("Phase 9: Launch Prep", [
            "9.1 \u2014 Final content review \u2014 all copy proofread",
            "9.2 \u2014 Test all forms (contact, newsletter, CTAs)",
            "9.3 \u2014 Test all links (internal + external)",
            "9.4 \u2014 Speed test (PageSpeed Insights)",
            "9.5 \u2014 Cross-browser test (Chrome, Safari, Firefox)",
            "9.6 \u2014 Document rollback procedure (DNS swap steps)",
            "9.7 \u2014 FINAL SIGN-OFF FROM DANE",
        ]),
        ("Phase 10: Go Live", [
            "10.1 \u2014 Point digitalaccomplice.com DNS to Webflow",
            "10.2 \u2014 Verify site is live and working",
            "10.3 \u2014 Test all forms again on live domain",
            "10.4 \u2014 Submit sitemap to Google Search Console",
            "10.5 \u2014 Monitor for 48 hours",
            "10.6 \u2014 If all good, keep Wix as backup for 30 more days, then cancel",
        ]),
    ]

    for phase_title, steps in phases:
        story.extend(subsection(phase_title))
        for step in steps:
            if "REVIEW WITH DANE" in step or "SIGN-OFF FROM DANE" in step:
                story.append(checkbox(f"<b>{step}</b>"))
            else:
                story.append(checkbox(step))
        story.append(Spacer(1, 4))

    # =========================================================
    # SECTION: Services Pricing (table)
    # =========================================================
    story.extend(section_header("Services Overview", content_width))

    svc_data = [
        ["Service Tier", "Description", "Price / Timeline"],
        ["Strategy", "Video strategy consulting \u2014 research, positioning, content roadmap", "$5K / $10K / $15K"],
        ["Pipeline", "Pre-purposing pipeline setup \u2014 ongoing content production system", "2\u20138 weeks engagement"],
        ["Project-Based", "One-off video production \u2014 single deliverable or campaign", "Varies by scope"],
    ]
    svc_table_data = []
    for i, row in enumerate(svc_data):
        if i == 0:
            svc_table_data.append([Paragraph(c, STYLES["table_header"]) for c in row])
        else:
            svc_table_data.append([Paragraph(c, STYLES["table_cell"]) for c in row])

    svc_table = Table(svc_table_data, colWidths=[content_width * 0.20, content_width * 0.52, content_width * 0.28])
    svc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DA_ORANGE),
        ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(svc_table)
    story.append(Spacer(1, 12))

    # =========================================================
    # SECTION: Rules for This Build
    # =========================================================
    story.extend(section_header("Rules for This Build", content_width))

    rules = [
        ("<b>Small steps.</b> Never build more than one section without reviewing with Dane.",),
        ("<b>No rushing.</b> Quality over speed. Dane said \"ASAP but don't railroad it.\"",),
        ("<b>Review at every phase.</b> Each phase ends with a Dane review checkpoint.",),
        ("<b>Rollback always available.</b> Wix stays live until Webflow is fully tested and approved.",),
        ("<b>Content first, design second.</b> Get the words right, then make it look good.",),
        ("<b>Video hosting decided in Phase 7, not Phase 1.</b> Don't let that decision block progress.",),
        ("<b>Each session = 1\u20132 steps max.</b> Avoid context drift. Save, commit, fresh start.",),
    ]

    for i, (rule_text,) in enumerate(rules, 1):
        orange_num = f'<font color="#F8901E"><b>{i}.</b></font>'
        story.append(Paragraph(f"{orange_num}  {rule_text}", STYLES["rule_num"]))

    story.append(Spacer(1, 24))

    # =========================================================
    # Build PDF
    # =========================================================
    doc.build(story, onFirstPage=first_page_footer, onLaterPages=later_page_footer)
    print(f"PDF generated: {out_path}")


if __name__ == "__main__":
    build_pdf()
