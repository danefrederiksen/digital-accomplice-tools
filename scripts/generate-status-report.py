from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from datetime import datetime

# DA Brand Colors
DA_ORANGE = HexColor("#F38B1C")
DA_BLACK = HexColor("#000000")
DA_BLUE_GRAY = HexColor("#5A6B7A")
DA_GRAY = HexColor("#CBCBCB")
DA_LIGHT_GRAY = HexColor("#F5F5F5")
DA_WHITE = HexColor("#FFFFFF")
DA_GREEN = HexColor("#2E7D32")
DA_RED = HexColor("#C62828")

output_path = "/Users/danefrederiksen/Desktop/Claude code/DA_Status_Report_2026-03-06.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
    leftMargin=0.75 * inch,
    rightMargin=0.75 * inch,
)

# Styles
styles = {
    "title": ParagraphStyle(
        "title", fontName="Helvetica-Bold", fontSize=22, textColor=DA_BLACK,
        spaceAfter=4, leading=26
    ),
    "subtitle": ParagraphStyle(
        "subtitle", fontName="Helvetica", fontSize=11, textColor=DA_BLUE_GRAY,
        spaceAfter=16
    ),
    "section": ParagraphStyle(
        "section", fontName="Helvetica-Bold", fontSize=14, textColor=DA_ORANGE,
        spaceBefore=20, spaceAfter=8, leading=18
    ),
    "subsection": ParagraphStyle(
        "subsection", fontName="Helvetica-Bold", fontSize=11, textColor=DA_BLACK,
        spaceBefore=12, spaceAfter=6, leading=14
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=10, textColor=DA_BLACK,
        spaceAfter=4, leading=14
    ),
    "bullet": ParagraphStyle(
        "bullet", fontName="Helvetica", fontSize=10, textColor=DA_BLACK,
        leftIndent=20, spaceAfter=3, leading=14, bulletIndent=8
    ),
    "bullet_bold": ParagraphStyle(
        "bullet_bold", fontName="Helvetica-Bold", fontSize=10, textColor=DA_BLACK,
        leftIndent=20, spaceAfter=3, leading=14, bulletIndent=8
    ),
    "alert": ParagraphStyle(
        "alert", fontName="Helvetica-Bold", fontSize=11, textColor=DA_RED,
        spaceAfter=4, leading=14
    ),
    "good": ParagraphStyle(
        "good", fontName="Helvetica-Bold", fontSize=11, textColor=DA_GREEN,
        spaceAfter=4, leading=14
    ),
    "footer": ParagraphStyle(
        "footer", fontName="Helvetica", fontSize=8, textColor=DA_BLUE_GRAY,
        alignment=TA_CENTER
    ),
    "priority_label": ParagraphStyle(
        "priority_label", fontName="Helvetica-Bold", fontSize=10,
        textColor=DA_WHITE, spaceAfter=2
    ),
    "table_header": ParagraphStyle(
        "table_header", fontName="Helvetica-Bold", fontSize=9,
        textColor=DA_WHITE, leading=12
    ),
    "table_cell": ParagraphStyle(
        "table_cell", fontName="Helvetica", fontSize=9,
        textColor=DA_BLACK, leading=12
    ),
    "table_cell_bold": ParagraphStyle(
        "table_cell_bold", fontName="Helvetica-Bold", fontSize=9,
        textColor=DA_BLACK, leading=12
    ),
}

story = []

# Title
story.append(Paragraph("Digital Accomplice", styles["title"]))
story.append(Paragraph("Status Report &amp; Priority To-Do List", styles["subtitle"]))
story.append(Paragraph("March 6, 2026", styles["subtitle"]))
story.append(HRFlowable(width="100%", thickness=2, color=DA_ORANGE, spaceAfter=12))

# ── INFRASTRUCTURE STATUS ──
story.append(Paragraph("Infrastructure Status", styles["section"]))
story.append(Paragraph("All systems built and operational.", styles["good"]))

infra_data = [
    [Paragraph("Project", styles["table_header"]),
     Paragraph("Status", styles["table_header"]),
     Paragraph("Details", styles["table_header"])],
    [Paragraph("Main Dashboard", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("10/10 build steps. Port 3847. 988 prospects loaded.", styles["table_cell"])],
    [Paragraph("11 Outreach Tools", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("Ports 3851-3861. DM, email, comment trackers.", styles["table_cell"])],
    [Paragraph("Snapshot Generator", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("Phases A-E done. Port 3850. PDF + JPG export.", styles["table_cell"])],
    [Paragraph("Report Agent V2", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("BreachRx validated. Ready for new prospects.", styles["table_cell"])],
    [Paragraph("Security", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("Auth, rate limiting, private repo, FileVault.", styles["table_cell"])],
    [Paragraph("Daily Outreach Plan", styles["table_cell_bold"]),
     Paragraph("COMPLETE", styles["table_cell"]),
     Paragraph("45-60 touches/day target documented.", styles["table_cell"])],
]

infra_table = Table(infra_data, colWidths=[1.6 * inch, 1.0 * inch, 4.0 * inch])
infra_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_BLACK),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
    ("BACKGROUND", (0, 1), (-1, -1), DA_LIGHT_GRAY),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
]))
story.append(infra_table)

# ── PIPELINE REALITY CHECK ──
story.append(Paragraph("Pipeline Reality Check", styles["section"]))
story.append(Paragraph("Tools are built. Pipeline is empty.", styles["alert"]))
story.append(Spacer(1, 4))

pipeline_data = [
    [Paragraph("Metric", styles["table_header"]),
     Paragraph("Value", styles["table_header"]),
     Paragraph("What It Means", styles["table_header"])],
    [Paragraph("Prospects in triage", styles["table_cell_bold"]),
     Paragraph("983 of 988", styles["table_cell"]),
     Paragraph("Almost nothing has been activated yet.", styles["table_cell"])],
    [Paragraph("Prospects warming", styles["table_cell_bold"]),
     Paragraph("4", styles["table_cell"]),
     Paragraph("Minimal pipeline activity.", styles["table_cell"])],
    [Paragraph("Outreach sent", styles["table_cell_bold"]),
     Paragraph("1", styles["table_cell"]),
     Paragraph("One prospect has received outreach.", styles["table_cell"])],
    [Paragraph("Weeks of outreach data", styles["table_cell_bold"]),
     Paragraph("0", styles["table_cell"]),
     Paragraph("No baseline yet for weekly review.", styles["table_cell"])],
    [Paragraph("Outreach tools with data", styles["table_cell_bold"]),
     Paragraph("~0", styles["table_cell"]),
     Paragraph("Tools are empty. No DMs/emails logged.", styles["table_cell"])],
]

pipeline_table = Table(pipeline_data, colWidths=[1.8 * inch, 1.0 * inch, 3.8 * inch])
pipeline_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_RED),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
]))
story.append(pipeline_table)

# ── KNOWN LOOSE ENDS ──
story.append(Paragraph("Known Loose Ends", styles["section"]))

loose_ends = [
    "2 junk entries in prospects.json (Fake Company, School Tech Supply)",
    "gotReply() stale-UI bug (cosmetic \u2014 counts don\u2019t refresh without reload)",
    "YouTube 16.1% stat in report agent is Perplexity-specific, not all AI search",
    "Two-folder problem: working files in Claude code/, git repo in digital-accomplice-tools/",
    "Lime CRM decision deferred until real pipeline data exists",
]
for item in loose_ends:
    story.append(Paragraph(f"\u2022  {item}", styles["bullet"]))

# ── PRIORITIZED TO-DO LIST ──
story.append(Spacer(1, 8))
story.append(HRFlowable(width="100%", thickness=2, color=DA_ORANGE, spaceAfter=4))
story.append(Paragraph("Prioritized To-Do List", styles["section"]))

# Tier 1
tier1_header = [
    [Paragraph("TIER 1 \u2014 DO THIS WEEK (Execution)", styles["table_header"]),
     Paragraph("", styles["table_header"])]
]
tier1_data = tier1_header + [
    [Paragraph("<b>1.</b>", styles["table_cell"]),
     Paragraph("<b>Activate first batch from triage (30-50 prospects).</b> Pick your best-tiered prospects and move them out of \u201cnew\u201d into the pipeline. Nothing else matters until prospects are flowing.", styles["table_cell"])],
    [Paragraph("<b>2.</b>", styles["table_cell"]),
     Paragraph("<b>Run 5 consecutive days of outreach.</b> Use the Daily Outreach Plan. Target: 8 comments, 3-4 DMs, a few connection requests per day. Log everything in the tools.", styles["table_cell"])],
    [Paragraph("<b>3.</b>", styles["table_cell"]),
     Paragraph("<b>Generate 3-5 snapshots for top prospects.</b> Use the snapshot generator to create personalized PDF/JPG assets for your highest-value targets.", styles["table_cell"])],
    [Paragraph("<b>4.</b>", styles["table_cell"]),
     Paragraph("<b>First weekly review (today, Friday).</b> Even if data is thin, establish the habit. Run the Reports tab, note your baseline.", styles["table_cell"])],
]

tier1_table = Table(tier1_data, colWidths=[0.4 * inch, 6.2 * inch])
tier1_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_ORANGE),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
    ("SPAN", (0, 0), (-1, 0)),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("BACKGROUND", (0, 1), (-1, -1), DA_WHITE),
]))
story.append(tier1_table)
story.append(Spacer(1, 10))

# Tier 2
tier2_header = [
    [Paragraph("TIER 2 \u2014 DO THIS MONTH (Cleanup)", styles["table_header"]),
     Paragraph("", styles["table_header"])]
]
tier2_data = tier2_header + [
    [Paragraph("<b>5.</b>", styles["table_cell"]),
     Paragraph("<b>Delete 2 junk entries</b> from prospects.json (Fake Company, School Tech Supply).", styles["table_cell"])],
    [Paragraph("<b>6.</b>", styles["table_cell"]),
     Paragraph("<b>Fix the YouTube 16.1% stat</b> in the report agent \u2014 clarify it\u2019s Perplexity-specific or find the real \u201call AI search\u201d number.", styles["table_cell"])],
    [Paragraph("<b>7.</b>", styles["table_cell"]),
     Paragraph("<b>Consolidate to one folder.</b> Working in Claude code/ and committing from digital-accomplice-tools/ adds friction. Pick one.", styles["table_cell"])],
    [Paragraph("<b>8.</b>", styles["table_cell"]),
     Paragraph("<b>Activate second wave</b> (another 50-100 prospects) once you have a rhythm with the first batch.", styles["table_cell"])],
]

tier2_table = Table(tier2_data, colWidths=[0.4 * inch, 6.2 * inch])
tier2_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_BLUE_GRAY),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
    ("SPAN", (0, 0), (-1, 0)),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("BACKGROUND", (0, 1), (-1, -1), DA_WHITE),
]))
story.append(tier2_table)
story.append(Spacer(1, 10))

# Tier 3
tier3_header = [
    [Paragraph("TIER 3 \u2014 DECIDE LATER", styles["table_header"]),
     Paragraph("", styles["table_header"])]
]
tier3_data = tier3_header + [
    [Paragraph("<b>9.</b>", styles["table_cell"]),
     Paragraph("<b>Lime CRM</b> \u2014 Revisit once you have 2-3 weeks of real pipeline data.", styles["table_cell"])],
    [Paragraph("<b>10.</b>", styles["table_cell"]),
     Paragraph("<b>Fix gotReply() stale UI</b> \u2014 Cosmetic only, low impact.", styles["table_cell"])],
    [Paragraph("<b>11.</b>", styles["table_cell"]),
     Paragraph("<b>Scale to full 45-60 touches/day</b> \u2014 Get comfortable at 15-20 first.", styles["table_cell"])],
]

tier3_table = Table(tier3_data, colWidths=[0.4 * inch, 6.2 * inch])
tier3_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_GRAY),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_BLACK),
    ("SPAN", (0, 0), (-1, 0)),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("BACKGROUND", (0, 1), (-1, -1), DA_WHITE),
]))
story.append(tier3_table)

# Bottom line
story.append(Spacer(1, 16))
story.append(HRFlowable(width="100%", thickness=1, color=DA_ORANGE, spaceAfter=8))
story.append(Paragraph(
    "<b>Bottom Line:</b> You built a machine. Now turn it on. Priority #1 is activating prospects and logging real outreach this week. Everything else is polish.",
    ParagraphStyle("bottomline", fontName="Helvetica", fontSize=11, textColor=DA_BLACK, leading=15, spaceBefore=4, spaceAfter=16)
))

# Footer
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceAfter=6))
story.append(Paragraph(
    f"Digital Accomplice \u2022 Status Report \u2022 Generated {datetime.now().strftime('%B %d, %Y')}",
    styles["footer"]
))

doc.build(story)
print(f"PDF saved to: {output_path}")
