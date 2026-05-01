#!/usr/bin/env python3
"""Generate DA-branded PDF follow-up plan for Noteworthy AI / Abby Hinsley."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# --- DA Brand Colors ---
DA_ORANGE = HexColor("#F8901E")
DA_BLACK = HexColor("#000000")
DA_BLUE_GRAY = HexColor("#5A6B7A")
DA_GRAY = HexColor("#CBCBCB")
DA_WHITE = HexColor("#FFFFFF")
DA_DARK = HexColor("#1A1A1A")
DA_ACCENT_DIM = HexColor("#FEF5EB")

# --- Fonts (Helvetica = DA fallback for email/PDF) ---
FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

# --- Styles ---
style_title = ParagraphStyle(
    "Title", fontName=FONT_BOLD, fontSize=22, leading=26,
    textColor=DA_BLACK, spaceAfter=4
)
style_subtitle = ParagraphStyle(
    "Subtitle", fontName=FONT, fontSize=11, leading=14,
    textColor=DA_BLUE_GRAY, spaceAfter=20
)
style_section = ParagraphStyle(
    "Section", fontName=FONT_BOLD, fontSize=13, leading=16,
    textColor=DA_BLACK, spaceBefore=20, spaceAfter=8
)
style_body = ParagraphStyle(
    "Body", fontName=FONT, fontSize=9.5, leading=13.5,
    textColor=DA_BLUE_GRAY, spaceAfter=6
)
style_option_title = ParagraphStyle(
    "OptionTitle", fontName=FONT_BOLD, fontSize=11, leading=14,
    textColor=DA_ORANGE, spaceAfter=4
)
style_option_body = ParagraphStyle(
    "OptionBody", fontName=FONT, fontSize=9, leading=13,
    textColor=DA_BLUE_GRAY, spaceAfter=2
)
style_greeting = ParagraphStyle(
    "Greeting", fontName=FONT, fontSize=10, leading=14,
    textColor=DA_BLUE_GRAY, spaceAfter=10
)
style_signoff = ParagraphStyle(
    "Signoff", fontName=FONT, fontSize=10, leading=14,
    textColor=DA_BLUE_GRAY, spaceBefore=16
)
style_timeline = ParagraphStyle(
    "Timeline", fontName=FONT_OBLIQUE, fontSize=8, leading=11,
    textColor=DA_BLUE_GRAY
)

# --- Output ---
output_path = "/Users/danefrederiksen/Desktop/Claude Code/reports/Noteworthy_AI_Follow_Up_Plan.pdf"

def header_footer(canvas, doc):
    w, h = letter
    # Top orange accent line
    canvas.setStrokeColor(DA_ORANGE)
    canvas.setLineWidth(3)
    canvas.line(40, h - 36, w - 40, h - 36)
    # Footer
    canvas.setFont(FONT, 7)
    canvas.setFillColor(DA_GRAY)
    canvas.drawCentredString(w / 2, 28, "Digital Accomplice  |  dane@digitalaccomplice.com  |  digitalaccomplice.com")
    canvas.drawRightString(w - 40, 28, "Page %d" % doc.page)

doc = SimpleDocTemplate(
    output_path, pagesize=letter,
    topMargin=50, bottomMargin=50, leftMargin=40, rightMargin=40,
)

story = []

# --- HEADER ---
story.append(Spacer(1, 8))
story.append(Paragraph("Noteworthy AI — Video &amp; AI Visibility Plan", style_title))
story.append(Paragraph("Follow-up from discovery call  |  March 23, 2026  |  Prepared by Dane Frederiksen", style_subtitle))
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceAfter=12, spaceBefore=4))

# --- GREETING ---
story.append(Paragraph("Hey Abby,", style_greeting))
story.append(Paragraph(
    "Really good to reconnect today. I've been thinking about what we talked through and "
    "wanted to get some ideas down while they're fresh — both for you and for when you loop Joel in.",
    style_body
))
story.append(Paragraph("Here's how I see the opportunity:", style_body))

# --- WHERE YOU ARE NOW ---
story.append(Paragraph("Where You Are Now", style_section))
story.append(Paragraph(
    "You've got a team that's bought into video, a case study in production with TerraLeap, "
    "a pile of raw footage, and a product that nobody else does exactly the way you do it. "
    "That's a strong foundation. The gap is that the video effort is fragmented — a case study here, "
    "some trade show clips there, editing in Veed when there's time. No one's looking at it "
    "holistically or thinking about how this content shows up in AI search.",
    style_body
))

# --- WHAT I'D BRING ---
story.append(Paragraph("What I'd Bring", style_section))
story.append(Paragraph(
    "A strategic layer on top of everything you're already doing. Not just editing — the thinking "
    "that happens before, during, and after. What questions should these videos answer? Who are they for? "
    "How do we make sure the AI tools (ChatGPT, Perplexity, etc.) can actually find Noteworthy when "
    "someone asks about fleet-mounted grid inspection vs. drones? That's the stuff that turns video "
    "from a nice-to-have into a growth engine.",
    style_body
))

# --- THREE OPTIONS ---
story.append(Paragraph("Three Ways We Could Start", style_section))
story.append(Paragraph(
    "Each option is self-contained. Pick whichever fits your timeline and budget — or mix and match.",
    style_body
))
story.append(Spacer(1, 6))

def make_option_box(title, timeline, description):
    title_para = Paragraph(title, style_option_title)
    timeline_para = Paragraph(timeline, style_timeline)
    body_para = Paragraph(description, style_option_body)
    inner = Table(
        [[title_para], [timeline_para], [Spacer(1, 4)], [body_para]],
        colWidths=[490]
    )
    inner.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (0, 0), 10),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, -1), DA_ACCENT_DIM),
        ('LINEBEFORE', (0, 0), (0, -1), 3, DA_ORANGE),
    ]))
    return inner

story.append(make_option_box(
    "Option A — Quick Win: Repurpose What You've Got",
    "~2–4 weeks",
    "Take the TerraLeap case study footage + Joel's trade show clips + B-roll and cut them into "
    "15–20 short, targeted clips answering specific questions your buyers are asking. Things like "
    "\"how does fleet-mounted inspection compare to drones?\" or \"what does grid monitoring look like "
    "day-to-day?\" I handle the strategy and editing. Your team doesn't have to touch it."
))
story.append(Spacer(1, 10))

story.append(make_option_box(
    "Option B — AI Visibility Pilot",
    "~4–6 weeks",
    "I run a full AI Visibility Snapshot on Noteworthy — how you're showing up (or not) in ChatGPT, "
    "Perplexity, and Google AI when people search for grid inspection solutions. Then we build a "
    "90-day video plan specifically designed to close the gaps. Same process I use with every client."
))
story.append(Spacer(1, 10))

story.append(make_option_box(
    "Option C — Full Video Strategy Engagement",
    "Ongoing, monthly",
    "The whole picture — content calendar, AI optimization, repurposing pipeline, YouTube channel "
    "buildout, website video integration, and a system so your team can keep producing without hiring "
    "a full-time editor. We start with a planning session (you, me, Joel), map the year, and execute "
    "in monthly sprints. Scale up or pause as budget allows."
))
story.append(Spacer(1, 8))

# --- ON BUDGET ---
story.append(Paragraph("On Budget", style_section))
story.append(Paragraph(
    "We can do something at any level. Option A could be a few thousand dollars. Option C is more "
    "of an ongoing retainer. The point is to start with something that proves the value, then make "
    "bigger decisions with real data. No long-term lock-in. If funding timing means we wait a couple "
    "months to kick off, that's totally fine — I'll keep the seat warm.",
    style_body
))

# --- PAGE 2 ---
story.append(PageBreak())

# --- WHY NOT DIY ---
story.append(Paragraph("Why Bring Someone In vs. Keep Doing It Internally?", style_section))
story.append(Paragraph(
    "You've been doing a great job cobbling things together. But the real value isn't the editing — "
    "it's the strategic decisions: what content to make, how to optimize it for AI search, how to "
    "turn one shoot into 20 pieces of content, and making sure all of it ladders up to Noteworthy's "
    "growth goals. That's what I do. And unlike hiring someone in-house, you can flex up or down "
    "as budget shifts.",
    style_body
))

# --- AUDIO ONLY IDEA ---
story.append(Paragraph("The Audio-Only Idea", style_section))
story.append(Paragraph(
    "I want to flag this one because I think it's a sleeper hit. Your technical team doesn't want "
    "to be on camera — totally get it. But a 30-second audio clip of a lineman answering "
    "\"what's the biggest challenge with manual grid inspection?\" with some graphics and B-roll "
    "over it? That's a video. And we can make 50 of those. No one has to sit in front of a ring light.",
    style_body
))
story.append(Spacer(1, 6))

# Callout box
callout_text = Paragraph(
    "<b>The math:</b> 10 subject-matter experts × 5 questions each = 50 videos. "
    "Audio-only interviews, 30–60 seconds. No scheduling headaches, no camera anxiety. "
    "Each one answers a real question your buyers are searching for — in AI and on Google.",
    ParagraphStyle("Callout", fontName=FONT, fontSize=9, leading=13, textColor=DA_BLUE_GRAY)
)
callout_table = Table([[callout_text]], colWidths=[490])
callout_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_ACCENT_DIM),
    ('LEFTPADDING', (0, 0), (-1, -1), 14),
    ('RIGHTPADDING', (0, 0), (-1, -1), 14),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('LINEBEFORE', (0, 0), (0, -1), 3, DA_ORANGE),
]))
story.append(callout_table)
story.append(Spacer(1, 16))

# --- NEXT STEP ---
story.append(Paragraph("Next Step", style_section))
story.append(Paragraph(
    "Let's get a 30-minute call on the books with you and Joel once you've briefed him. "
    "I'll come with a more specific proposal based on whichever option feels right. "
    "No pressure, no rush — just want to keep the momentum going.",
    style_body
))

story.append(Spacer(1, 24))
story.append(Paragraph("Thanks for making the time today, Abby. I'm excited about this one.", style_signoff))
story.append(Spacer(1, 12))

# Signature
story.append(Paragraph("<b>Dane Frederiksen</b>", ParagraphStyle(
    "Sig", fontName=FONT_BOLD, fontSize=10, leading=13, textColor=DA_BLACK
)))
story.append(Paragraph("Founder, Digital Accomplice", ParagraphStyle(
    "SigTitle", fontName=FONT, fontSize=9, leading=12, textColor=DA_BLUE_GRAY
)))
story.append(Paragraph("dane@digitalaccomplice.com  |  digitalaccomplice.com", ParagraphStyle(
    "SigContact", fontName=FONT, fontSize=8, leading=11, textColor=DA_GRAY
)))

# --- CTA BAR ---
story.append(Spacer(1, 30))
cta_content = Paragraph(
    "<font color='#FFFFFF'>Ready to talk?</font>&nbsp;&nbsp;&nbsp;&nbsp;"
    "<font color='#F8901E'><b>digitalaccomplice.com/connect</b></font>",
    ParagraphStyle("CTABar", fontName=FONT_BOLD, fontSize=10, leading=13,
                   textColor=DA_WHITE, alignment=TA_CENTER)
)
cta_bar = Table([[cta_content]], colWidths=[doc.width])
cta_bar.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_DARK),
    ('LEFTPADDING', (0, 0), (-1, -1), 20),
    ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ('TOPPADDING', (0, 0), (-1, -1), 14),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
]))
story.append(cta_bar)

# --- Build ---
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print("PDF saved to: " + output_path)
