from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

DA_ORANGE = HexColor("#F8901E")
DA_BLACK = HexColor("#000000")
DA_BLUE_GRAY = HexColor("#5A6B7A")
DA_GRAY = HexColor("#CBCBCB")
DA_LIGHT_GRAY = HexColor("#F5F5F5")
DA_WHITE = HexColor("#FFFFFF")

output_path = "/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/Daily_Report_2026-03-06_Claude_Code.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.6*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.75*inch,
    rightMargin=0.75*inch,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle("Title2", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, textColor=DA_BLACK, spaceAfter=2)
subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=11, textColor=DA_BLUE_GRAY, spaceAfter=12)
h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13, textColor=DA_ORANGE, spaceBefore=16, spaceAfter=6)
h3_style = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=11, textColor=DA_BLACK, spaceBefore=8, spaceAfter=4)
body_style = ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica", fontSize=10, textColor=DA_BLACK, leading=14)
bullet_style = ParagraphStyle("Bullet", parent=body_style, leftIndent=18, bulletIndent=6, spaceBefore=2, spaceAfter=2)
small_style = ParagraphStyle("Small", parent=body_style, fontSize=9, textColor=DA_BLUE_GRAY)

story = []

# Title
story.append(Paragraph("Prospecting Tools Fix Plan — Progress Report", title_style))
story.append(Paragraph("Date: March 6, 2026  |  Digital Accomplice", subtitle_style))
story.append(HRFlowable(width="100%", thickness=2, color=DA_ORANGE, spaceAfter=12))

# Summary bar
summary_data = [["Steps Complete: 3 of 10", "Step 1: Partial", "Steps 5–10: Not Started"]]
summary_table = Table(summary_data, colWidths=[2.3*inch, 2.3*inch, 2.3*inch])
summary_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ("TEXTCOLOR", (0, 0), (-1, -1), DA_BLACK),
    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("BOX", (0, 0), (-1, -1), 1, DA_GRAY),
]))
story.append(summary_table)
story.append(Spacer(1, 12))

# Step 1
story.append(Paragraph("Step 1: Clean Tool #4 (Cyber 2nd Connections) — IN PROGRESS", h2_style))
story.append(Paragraph("<b>What was done:</b>", body_style))
for item in [
    "Deleted 5 junk section-header records",
    "Fixed 40 ICP records — names moved from company field to name",
    "Fixed all 17 REFERRAL records — same field swap fix",
    "Fixed all 3 UNKNOWN records — same fix",
    "Removed 29 junk/duplicate records total",
    "Record count: 245 → 221",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Spacer(1, 6))
story.append(Paragraph("<b>Still remaining:</b>", body_style))
for item in [
    "62 records have no company AND no LinkedIn URL — Dane researching manually (CSV exported)",
    "Internal duplicate check (~18 mentioned in original audit) — re-verify after cleanup",
    "Final record count and data integrity verification",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Paragraph("<b>Current Tool #4 stats:</b> 229 records (221 from Step 1 + 8 added from Step 2)", small_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceBefore=10, spaceAfter=6))

# Step 2
story.append(Paragraph("Step 2: Clean Tool #3 (B2B 2nd Connections) — COMPLETE", h2_style))
story.append(Paragraph("<b>What was found:</b>", body_style))
for item in [
    "All 30 records were cybersecurity people — zero actual B2B prospects",
    "Records 1–13: correct field format; Records 14–30: company/title swapped",
    "6 exact internal duplicates",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Spacer(1, 6))
story.append(Paragraph("<b>What was done:</b>", body_style))
for item in [
    "Backed up all affected files before changes",
    "16 people already in Tool #4 — confirmed as dupes, removed",
    "8 people NOT in Tool #4 — added with correct fields and LinkedIn URLs",
    "Kevin Bocek and Peter Prieto comment data preserved",
    "Tool #3 emptied and activity log cleared",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Paragraph("<b>Results:</b> Tool #4: 221 → 229 records. Tool #3: 30 → 0 (clean slate for real B2B data).", small_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceBefore=10, spaceAfter=6))

# Step 3
story.append(Paragraph("Step 3: Reconcile Cross-Tool Duplicates (#1 vs #5) — COMPLETE", h2_style))
story.append(Paragraph("<b>What was found:</b>", body_style))
for item in [
    "0 actual name overlaps between Tool #1 (7 records) and Tool #5 (58 records)",
    "Original '27 duplicates' no longer exist in current data",
    "10 misfit records in Tool #5 (insurance, talent, entertainment, sports, crew, junk)",
    "1 record with swapped company/title fields (Oleksandr Korolko)",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Spacer(1, 6))
story.append(Paragraph("<b>What was done:</b>", body_style))
for item in [
    "Removed 10 misfits: John Thorpe, Justin Thomas, Nicklas Dunham, Patrick Cassidy, Jason Costes, Andy Haney, Benjamin C Little, Brandon Bichajian, Ruth Stroup, Julia Nimchinski",
    "Fixed Oleksandr Korolko swapped fields → company='InstaDives'",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Paragraph("<b>Results:</b> Tool #5: 58 → 48 records. Tool #1: 7 (unchanged).", small_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceBefore=10, spaceAfter=6))

# Step 4
story.append(Paragraph("Step 4: Clean comment-log.json — COMPLETE", h2_style))
story.append(Paragraph("<b>What was found:</b>", body_style))
for item in [
    "10 log entries, all valid (0 orphaned)",
    "All comment_counts match log entries",
    "Brian Rucker: already clean (0/0, no desync)",
    "Kevin Bocek + Peter Prieto had inflated counts in Tool #4 from Step 2 migration",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

story.append(Spacer(1, 6))
story.append(Paragraph("<b>What was done:</b>", body_style))
for item in [
    "Reset Kevin Bocek comment_count 1→0 in Tool #4",
    "Reset Peter Prieto comment_count 3→0 in Tool #4",
    "Note: Kevin/Peter duplicated across Tool #2 and Tool #4 (separate dedup issue)",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceBefore=10, spaceAfter=6))

# Steps 5-10 table
story.append(Paragraph("Steps 5–10: Not Started", h2_style))

table_data = [
    ["Step", "Task", "Status"],
    ["5", "Add search bar to Tools #1–#10", "Not started"],
    ["6", "Add activity feed link to Tools #1–#10", "Not started"],
    ["7", "Add delete button on dashboard cards", "Not started"],
    ["8", "Verify Tool #11 integration end-to-end", "Not started"],
    ["9", "Add editable offer / A-B testing", "Not started"],
    ["10", "Build unified hub dashboard", "Not started"],
]

t = Table(table_data, colWidths=[0.6*inch, 4.2*inch, 1.5*inch])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), DA_ORANGE),
    ("TEXTCOLOR", (0, 0), (-1, 0), DA_WHITE),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 10),
    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("ALIGN", (2, 0), (2, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("GRID", (0, 0), (-1, -1), 0.5, DA_GRAY),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(HRFlowable(width="100%", thickness=0.5, color=DA_GRAY, spaceBefore=14, spaceAfter=6))

# Also Pending
story.append(Paragraph("Also Pending (Not Part of Fix Plan)", h2_style))
for item in [
    "<b>Data imports (needs CSVs):</b> Tools #7, #8, #9, #10, #12",
    "<b>Quick fix:</b> Tool #1 missing 'Open LinkedIn' on Replied cards",
    "<b>Overdue follow-ups:</b> 3 in Tool #2, 4 in Tool #5",
]:
    story.append(Paragraph(item, bullet_style, bulletText="•"))

# Footer
story.append(Spacer(1, 24))
story.append(HRFlowable(width="100%", thickness=1, color=DA_ORANGE))
story.append(Spacer(1, 6))
footer_style = ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=DA_BLUE_GRAY, alignment=TA_CENTER)
story.append(Paragraph("Digital Accomplice  |  Prospecting Tools Fix Plan  |  Generated by Claude Code", footer_style))

doc.build(story)
print("PDF saved to:", output_path)
