from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.lib import colors

DA_ORANGE = HexColor("#F8901E")
DARK = HexColor("#1A1A1A")
GRAY = HexColor("#666666")
LIGHT_BG = HexColor("#FFF7EF")
WHITE = HexColor("#FFFFFF")
LINE_COLOR = HexColor("#CCCCCC")

output_path = "/Users/danefrederiksen/Desktop/DA_Compensation_Agreement_Christine.pdf"

# Styles
title_style = ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=18, textColor=DARK, alignment=TA_CENTER, spaceAfter=4)
subtitle_style = ParagraphStyle("Subtitle", fontName="Helvetica", fontSize=11, textColor=GRAY, alignment=TA_CENTER, spaceAfter=16)
heading_style = ParagraphStyle("Heading", fontName="Helvetica-Bold", fontSize=13, textColor=DARK, spaceBefore=14, spaceAfter=6)
body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=10, textColor=DARK, spaceAfter=4, leading=14)
body_italic = ParagraphStyle("BodyItalic", fontName="Helvetica-Oblique", fontSize=9, textColor=GRAY, spaceAfter=4, leading=13)
bullet_style = ParagraphStyle("Bullet", fontName="Helvetica", fontSize=10, textColor=DARK, leftIndent=18, spaceAfter=3, leading=14, bulletIndent=6)
sig_style = ParagraphStyle("Sig", fontName="Helvetica", fontSize=10, textColor=DARK, spaceAfter=2)
sig_label = ParagraphStyle("SigLabel", fontName="Helvetica", fontSize=9, textColor=GRAY, spaceAfter=1)
footer_style = ParagraphStyle("Footer", fontName="Helvetica", fontSize=8, textColor=GRAY, alignment=TA_CENTER)

def orange_line():
    return HRFlowable(width="100%", thickness=2, color=DA_ORANGE, spaceAfter=8, spaceBefore=8)

def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", bullet_style)

def phase_table(rows):
    t = Table(rows, colWidths=[1.6*inch, 4.9*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE_COLOR),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t

def header_footer(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(DA_ORANGE)
    canvas.drawString(0.7*inch, letter[1] - 0.5*inch, "DIGITAL ACCOMPLICE")
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(GRAY)
    canvas.drawString(2.35*inch, letter[1] - 0.5*inch, "|  Compensation Agreement")
    canvas.setStrokeColor(DA_ORANGE)
    canvas.setLineWidth(1.5)
    canvas.line(0.7*inch, letter[1] - 0.58*inch, letter[0] - 0.7*inch, letter[1] - 0.58*inch)
    # Footer
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GRAY)
    canvas.setStrokeColor(LINE_COLOR)
    canvas.setLineWidth(0.5)
    canvas.line(0.7*inch, 0.55*inch, letter[0] - 0.7*inch, 0.55*inch)
    canvas.drawCentredString(letter[0]/2, 0.38*inch, "This is a mutual reference document, not a legal contract.  |  Page %d" % doc.page)
    canvas.restoreState()

doc = BaseDocTemplate(output_path, pagesize=letter,
    leftMargin=0.7*inch, rightMargin=0.7*inch,
    topMargin=0.8*inch, bottomMargin=0.75*inch)

frame = Frame(0.7*inch, 0.75*inch, letter[0] - 1.4*inch, letter[1] - 1.55*inch, id="main")
template = PageTemplate(id="main", frames=frame, onPage=header_footer)
doc.addPageTemplates([template])

story = []

# Title
story.append(Spacer(1, 6))
story.append(Paragraph("Compensation &amp; Revenue-Share Agreement", title_style))
story.append(Paragraph("Between Dane Frederiksen and Christine [Last Name]", subtitle_style))

# Effective date row
info_data = [["Effective Date: _______________", "Entity: Digital Accomplice LLC"]]
info_t = Table(info_data, colWidths=[3.25*inch, 3.25*inch])
info_t.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("TEXTCOLOR", (0, 0), (-1, -1), DARK),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
story.append(info_t)

story.append(orange_line())

# Role
story.append(Paragraph("Role &amp; Responsibilities", heading_style))
story.append(Paragraph("Christine serves as a strategic partner responsible for:", body_style))
story.append(bullet("Sales development and client acquisition"))
story.append(bullet("Project management and delivery oversight"))
story.append(bullet("Strategy and service package design"))
story.append(bullet("Client support and relationship management"))

story.append(orange_line())

# Phase 1
story.append(Paragraph("Phase 1: Revenue Build", heading_style))
story.append(phase_table([
    ["Split", "50/50 on gross profit (revenue minus COGS)"],
    ["Base Pay", "None"],
    ["Duration", "Until Phase 2 trigger is met, or 6-month cap (see below)"],
]))

story.append(orange_line())

# Phase 2
story.append(Paragraph("Phase 2: Scaled Operations", heading_style))
story.append(phase_table([
    ["Trigger", "2 consecutive months at $10K+ total monthly revenue"],
    ["Base Pay", "$2,000/month"],
    ["Commission", "20% of gross profit on all revenue (recurring and new)"],
]))

story.append(orange_line())

# COGS
story.append(Paragraph("Approved COGS Categories", heading_style))
story.append(Paragraph("The following are deducted from revenue before calculating gross profit:", body_style))
story.append(bullet("Freelance contractors and subcontractors"))
story.append(bullet("Travel expenses (client-related)"))
story.append(bullet("Gear rental"))
story.append(bullet("Stock assets (footage, music, graphics)"))
story.append(bullet("Third-party post-production"))
story.append(Paragraph("Any expense outside this list requires mutual written agreement before the project begins.", body_italic))

story.append(orange_line())

# Protections for Dane
story.append(Paragraph("Protections for Dane", heading_style))
story.append(bullet("<b>Revert Clause:</b> If total revenue drops below $8K for 2 consecutive months during Phase 2, compensation reverts to Phase 1 (50/50, no base) until the $10K threshold is met again."))
story.append(bullet("<b>Phase 1 Time Cap:</b> If $10K/month is not reached within 6 months of the effective date, this agreement is renegotiated."))
story.append(bullet("<b>Trailing Commission:</b> If Christine departs, she earns commission on revenue from her sourced clients for 90 days after departure. After 90 days, those client relationships belong to Digital Accomplice."))

story.append(Spacer(1, 6))

# Protections for Christine
story.append(Paragraph("Protections for Christine", heading_style))
story.append(bullet("<b>P&amp;L Visibility:</b> Christine receives a revenue and COGS breakdown for every commissioned deal, delivered within 10 business days of project close."))
story.append(bullet("<b>Defined Trigger:</b> Phase 2 activates automatically after 2 consecutive months at $10K+. No subjective judgment."))
story.append(bullet("<b>Income Floor:</b> The $2K/month base in Phase 2 provides income stability not present in Phase 1."))
story.append(bullet("<b>Cost Transparency:</b> COGS categories are fixed. Neither party can inflate project costs without mutual agreement."))

story.append(orange_line())

# Signatures
story.append(Paragraph("Signatures", heading_style))
story.append(Paragraph("By signing below, both parties acknowledge and agree to the terms outlined in this document.", body_style))
story.append(Spacer(1, 20))

sig_data = [
    ["_________________________________", "      ", "_________________________________"],
    ["Dane Frederiksen", "", "Christine [Last Name]"],
    ["Founder, Digital Accomplice", "", "Strategic Partner"],
    ["Date: _______________", "", "Date: _______________"],
]
sig_t = Table(sig_data, colWidths=[2.8*inch, 0.9*inch, 2.8*inch])
sig_t.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica"),
    ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
    ("FONTNAME", (0, 2), (-1, 3), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("FONTSIZE", (0, 2), (-1, 3), 9),
    ("TEXTCOLOR", (0, 0), (-1, 0), DARK),
    ("TEXTCOLOR", (0, 1), (-1, 1), DARK),
    ("TEXTCOLOR", (0, 2), (-1, 3), GRAY),
    ("TOPPADDING", (0, 0), (-1, -1), 2),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
]))
story.append(sig_t)

doc.build(story)
print(f"Saved to: {output_path}")
