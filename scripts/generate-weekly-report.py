#!/usr/bin/env python3
"""Generate Weekly Pipeline Review PDF for Digital Accomplice"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

# DA Brand Colors
DA_ORANGE = HexColor('#F8901E')
DA_BLACK = HexColor('#000000')
DA_BLUE_GRAY = HexColor('#5A6B7A')
DA_GRAY = HexColor('#CBCBCB')
DA_LIGHT_GRAY = HexColor('#F5F5F5')
DA_WHITE = HexColor('#FFFFFF')
DA_GREEN = HexColor('#28A745')
DA_RED = HexColor('#DC3545')
DA_YELLOW = HexColor('#FFC107')

OUTPUT_PATH = "/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/Weekly_Review_2026-03-06_Claude_Code.pdf"

styles = getSampleStyleSheet()

style_title = ParagraphStyle('T', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24, textColor=DA_BLACK, spaceAfter=4)
style_subtitle = ParagraphStyle('ST', parent=styles['Normal'], fontName='Helvetica', fontSize=12, textColor=DA_BLUE_GRAY, spaceAfter=16)
style_section = ParagraphStyle('S', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, textColor=DA_ORANGE, spaceBefore=18, spaceAfter=8)
style_subsection = ParagraphStyle('SS', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11, textColor=DA_BLACK, spaceBefore=10, spaceAfter=4)
style_body = ParagraphStyle('B', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=DA_BLACK, leading=14)
style_body_sm = ParagraphStyle('BSM', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=DA_BLACK, leading=12)
style_stat_label = ParagraphStyle('SL', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=DA_BLUE_GRAY, alignment=TA_CENTER)
style_stat_value = ParagraphStyle('SV', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=24, textColor=DA_BLACK, alignment=TA_CENTER)
style_stat_value_sm = ParagraphStyle('SVS', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, textColor=DA_BLACK, alignment=TA_CENTER)
style_callout = ParagraphStyle('CO', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, textColor=DA_ORANGE, leading=16)
style_footer = ParagraphStyle('F', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=DA_GRAY, alignment=TA_CENTER)
style_grade = ParagraphStyle('G', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=36, textColor=DA_ORANGE, alignment=TA_CENTER)

doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=letter, topMargin=0.6*inch, bottomMargin=0.6*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
story = []

# ══════════════════════════════════════════════════════════
# HEADER
# ══════════════════════════════════════════════════════════
story.append(Paragraph("Weekly Pipeline Review", style_title))
story.append(Paragraph("Week of March 2-6, 2026  |  Digital Accomplice Prospecting System", style_subtitle))
story.append(HRFlowable(width="100%", thickness=3, color=DA_ORANGE, spaceAfter=16))

# ══════════════════════════════════════════════════════════
# TOP-LINE SCORECARD
# ══════════════════════════════════════════════════════════
story.append(Paragraph("Weekly Scorecard", style_section))

card_data = [
    [Paragraph("Total Outreach", style_stat_label),
     Paragraph("DMs Sent", style_stat_label),
     Paragraph("Follow-Ups", style_stat_label),
     Paragraph("Conn Requests", style_stat_label),
     Paragraph("Comments", style_stat_label),
     Paragraph("Replies", style_stat_label)],
    [Paragraph("111", style_stat_value),
     Paragraph("53", style_stat_value),
     Paragraph("26", style_stat_value),
     Paragraph("17", style_stat_value),
     Paragraph("10", style_stat_value),
     Paragraph("3", style_stat_value)],
]
cw = doc.width / 6
card_tbl = Table(card_data, colWidths=[cw]*6, rowHeights=[20, 44])
card_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LINEBELOW', (0, 0), (-1, 0), 0.5, DA_GRAY),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 8),
]))
story.append(card_tbl)
story.append(Spacer(1, 6))

# Targets
story.append(Paragraph(
    '<font color="#5A6B7A"><b>vs. Weekly Targets:</b></font>  '
    'Outreach 225-300 <font color="#DC3545"><b>111 (37-49%)</b></font>  |  '
    'Comments 40 <font color="#DC3545"><b>10 (25%)</b></font>  |  '
    'Reply rate 5-10% <font color="#28A745"><b>5.7% &#10003;</b></font>',
    style_body
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    '<font color="#5A6B7A"><b>Setup/admin actions:</b></font> 252 prospects added + 5 admin = 257  |  '
    '<b>Grand total: 368 actions</b>',
    style_body
))

# ══════════════════════════════════════════════════════════
# DAILY CONSISTENCY
# ══════════════════════════════════════════════════════════
story.append(Paragraph("Daily Consistency", style_section))

daily_data = [
    [Paragraph("<b>Day</b>", style_body_sm),
     Paragraph("<b>Outreach</b>", style_body_sm),
     Paragraph("<b>Target</b>", style_body_sm),
     Paragraph("<b>Hit?</b>", style_body_sm),
     Paragraph("<b>What Happened</b>", style_body_sm)],
    [Paragraph("Mon 3/2", style_body_sm), Paragraph("35", style_body_sm), Paragraph("45-60", style_body_sm),
     Paragraph('<font color="#F8901E">78%</font>', style_body_sm),
     Paragraph("Big ramp day. 29 DMs (Tool #1+2), 4 f/u, 1 conn req, 1 comment", style_body_sm)],
    [Paragraph("Tue 3/3", style_body_sm), Paragraph("23", style_body_sm), Paragraph("45-60", style_body_sm),
     Paragraph('<font color="#DC3545">51%</font>', style_body_sm),
     Paragraph("Focused on data entry (156 prospects added to Tool #4). 15 DMs, 8 f/u", style_body_sm)],
    [Paragraph("Wed 3/4", style_body_sm), Paragraph("9", style_body_sm), Paragraph("45-60", style_body_sm),
     Paragraph('<font color="#DC3545">20%</font>', style_body_sm),
     Paragraph("Low day. 4 comments, 5 prospects added to Tool #6. Gap in DM/follow-up", style_body_sm)],
    [Paragraph("Thu 3/5", style_body_sm), Paragraph("2", style_body_sm), Paragraph("45-60", style_body_sm),
     Paragraph('<font color="#DC3545">4%</font>', style_body_sm),
     Paragraph("Near-zero outreach. 2 comments only. Biggest gap of the week", style_body_sm)],
    [Paragraph("Fri 3/6", style_body_sm), Paragraph("42", style_body_sm), Paragraph("45-60", style_body_sm),
     Paragraph('<font color="#F8901E">93%</font>', style_body_sm),
     Paragraph("Strong comeback. 10 DMs, 16 f/u, 10 conn reqs, 3 comments, 2 replies", style_body_sm)],
]

daily_tbl = Table(daily_data, colWidths=[0.7*inch, 0.65*inch, 0.65*inch, 0.5*inch, 3.7*inch])
daily_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
    ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
    ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
    ('ALIGN', (1, 0), (3, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(daily_tbl)
story.append(Spacer(1, 6))

story.append(Paragraph(
    '<font color="#DC3545"><b>Pattern alert:</b></font> '
    'Mon + Fri = 77 outreach (69% of week). Wed + Thu = 11 (10%). '
    'The mid-week drop is the #1 thing to fix.',
    style_body
))

# ══════════════════════════════════════════════════════════
# TOOL-BY-TOOL PERFORMANCE
# ══════════════════════════════════════════════════════════
story.append(Paragraph("Tool-by-Tool Performance", style_section))

tool_tbl_data = [
    [Paragraph("<b>Tool</b>", style_body_sm),
     Paragraph("<b>Prospects</b>", style_body_sm),
     Paragraph("<b>Outreach</b>", style_body_sm),
     Paragraph("<b>Setup</b>", style_body_sm),
     Paragraph("<b>Replies</b>", style_body_sm),
     Paragraph("<b>Status</b>", style_body_sm)],
    [Paragraph("#1 B2B 1st DM", style_body_sm), Paragraph("7", style_body_sm),
     Paragraph("42", style_body_sm), Paragraph("28", style_body_sm), Paragraph("1", style_body_sm),
     Paragraph("All 7 in follow_up_1", style_body_sm)],
    [Paragraph("#2 Cyber 1st DM", style_body_sm), Paragraph("11", style_body_sm),
     Paragraph("21", style_body_sm), Paragraph("13", style_body_sm), Paragraph("0", style_body_sm),
     Paragraph("10 follow_up_1, 1 dm_sent", style_body_sm)],
    [Paragraph("#3 B2B 2nd DM", style_body_sm), Paragraph("0", style_body_sm),
     Paragraph("1", style_body_sm), Paragraph("31", style_body_sm), Paragraph("0", style_body_sm),
     Paragraph("31 added, 1 conn req", style_body_sm)],
    [Paragraph("#4 Cyber 2nd DM", style_body_sm), Paragraph("221", style_body_sm),
     Paragraph("8", style_body_sm), Paragraph("167", style_body_sm), Paragraph("0", style_body_sm),
     Paragraph("213 not started, 8 conn sent", style_body_sm)],
    [Paragraph("#5 Referral 1st", style_body_sm), Paragraph("58", style_body_sm),
     Paragraph("22", style_body_sm), Paragraph("12", style_body_sm), Paragraph("2", style_body_sm),
     Paragraph("6 dm_sent, 3 f/u, 1 replied", style_body_sm)],
    [Paragraph("#6 Referral 2nd", style_body_sm), Paragraph("30", style_body_sm),
     Paragraph("8", style_body_sm), Paragraph("5", style_body_sm), Paragraph("0", style_body_sm),
     Paragraph("8 conn sent, 22 not started", style_body_sm)],
    [Paragraph("#11 Comments", style_body_sm), Paragraph("-", style_body_sm),
     Paragraph("10", style_body_sm), Paragraph("-", style_body_sm), Paragraph("-", style_body_sm),
     Paragraph("10/40 target (25%)", style_body_sm)],
]

tool_tbl = Table(tool_tbl_data, colWidths=[1.1*inch, 0.65*inch, 0.65*inch, 0.5*inch, 0.5*inch, 2.8*inch])
tool_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
    ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
    ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
    ('ALIGN', (1, 0), (4, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(tool_tbl)

# ══════════════════════════════════════════════════════════
# PIPELINE SNAPSHOT
# ══════════════════════════════════════════════════════════
story.append(Paragraph("Pipeline Snapshot", style_section))

pipe_data = [
    [Paragraph("Total Across Tools", style_stat_label),
     Paragraph("Active (DM/F-up)", style_stat_label),
     Paragraph("Not Started", style_stat_label),
     Paragraph("Conn Pending", style_stat_label),
     Paragraph("Replied", style_stat_label)],
    [Paragraph("327", style_stat_value_sm),
     Paragraph("27", style_stat_value_sm),
     Paragraph("283", style_stat_value_sm),
     Paragraph("16", style_stat_value_sm),
     Paragraph("1", style_stat_value_sm)],
]
pw = doc.width / 5
pipe_tbl = Table(pipe_data, colWidths=[pw]*5, rowHeights=[20, 36])
pipe_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LINEBELOW', (0, 0), (-1, 0), 0.5, DA_GRAY),
    ('TOPPADDING', (0, 0), (-1, 0), 6),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 6),
]))
story.append(pipe_tbl)
story.append(Spacer(1, 4))

story.append(Paragraph(
    '<b>Main Dashboard:</b> 1,003 total (997 new/triage, 4 outreach_sent, 2 warming). '
    '419 connected. 4 active sequences. 2 reports generated.',
    style_body
))
story.append(Spacer(1, 4))
story.append(Paragraph(
    '<b>Reply:</b> Brenton Thomas MBA (Referral) replied this week. 2 additional replies received in activity logs (1 B2B, 1 Referral).',
    style_body
))

# ══════════════════════════════════════════════════════════
# PAGE 2 - ANALYSIS
# ══════════════════════════════════════════════════════════
story.append(PageBreak())

story.append(Paragraph("Weekly Pipeline Review", style_title))
story.append(Paragraph("Analysis + Next Week Plan  |  March 6, 2026", style_subtitle))
story.append(HRFlowable(width="100%", thickness=3, color=DA_ORANGE, spaceAfter=16))

# ── WEEK GRADE ──
story.append(Paragraph("Week Grade", style_section))

grade_data = [
    [Paragraph("B-", style_grade)],
    [Paragraph("Strong setup week. Pipeline is loaded. Outreach volume needs 2-3x to hit targets.", style_stat_label)],
]
grade_tbl = Table(grade_data, colWidths=[doc.width], rowHeights=[50, 28])
grade_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(grade_tbl)

# ── WHAT WENT WELL ──
story.append(Paragraph("What Went Well", style_section))
wins = [
    "<b>Pipeline loaded:</b> 252 prospects added across tools. Cyber 2nd Conn alone gained 167. You now have 327 prospects in the active tools + 1,003 in the main dashboard. No shortage of targets.",
    "<b>Reply rate is solid:</b> 5.7% (3 replies from 53 DMs). Industry benchmark is 3-5% for cold LinkedIn DM. You're at the top of that range.",
    "<b>Tool system works:</b> 11 tools all running, data flowing, comments logging, sequences tracking. The infrastructure investment from Feb is paying off.",
    "<b>Referral channel strong:</b> Tool #5 generated 2 replies from 13 DMs (15.4% reply rate). Referral partners are the warmest audience.",
    "<b>Friday recovery:</b> After a Wed/Thu dip, you came back with 42 outreach actions on Friday. Shows the discipline is there.",
]
for w in wins:
    story.append(Paragraph(f"&#8226;  {w}", style_body))
    story.append(Spacer(1, 3))

# ── WHAT NEEDS WORK ──
story.append(Paragraph("What Needs Work", style_section))
fixes = [
    "<b>Outreach volume:</b> 111 vs. 225-300 target. You're at 37-49%. The gap is ~114-189 more touches per week. This is the single biggest lever.",
    "<b>Mid-week consistency:</b> Wed (9) + Thu (2) = 11 total. That's less than a single good day. Block 60 min on Wed + Thu for outreach.",
    "<b>Comments underperforming:</b> 10/40 target (25%). Comments are the lowest-effort engagement. Aim for 8/day using the Comment Queue tool.",
    "<b>2nd connection tools underutilized:</b> 283 prospects in 'not_started' across Tools #3, #4, #6. Only 17 connection requests sent all week. These are your growth channels.",
    "<b>Email tools (7-10) empty:</b> No data in B2B Email, Cyber Email, Substack, or Customer tools. These represent the second half of your daily outreach plan.",
]
for f in fixes:
    story.append(Paragraph(f"&#8226;  {f}", style_body))
    story.append(Spacer(1, 3))

# ── NEXT WEEK PRIORITIES ──
story.append(Paragraph("Next Week Priorities (Mar 9-13)", style_section))

priorities = [
    "<b>1. Hit 45 outreach/day for 3+ days.</b> Mon/Tue/Fri you're close. Add Wed + Thu to make it consistent. Start with the easiest: 8 comments + 10 connection requests + 5 DMs + 5 follow-ups = 28 minimum floor.",
    "<b>2. Activate 2nd connection pipelines.</b> Send 10 connection requests/day from Tool #4 (Cyber 2nd). You have 213 not-started prospects there.",
    "<b>3. Comments to 8/day.</b> Open Comment Queue every morning. 15 minutes, 8 comments. Non-negotiable.",
    "<b>4. Load email tools.</b> Pick one email tool (#7 or #8) and add 20-30 prospects. Start email sequences to diversify beyond LinkedIn.",
    "<b>5. Follow up on replies.</b> Brenton Thomas MBA replied. 2 more in activity logs. These are the hottest leads - respond within 24 hours.",
]
for p in priorities:
    story.append(Paragraph(f"{p}", style_body))
    story.append(Spacer(1, 4))

# ── WEEKLY TARGETS ──
story.append(Paragraph("Next Week Targets", style_section))

target_data = [
    [Paragraph("<b>Metric</b>", style_body_sm),
     Paragraph("<b>This Week</b>", style_body_sm),
     Paragraph("<b>Next Week Target</b>", style_body_sm),
     Paragraph("<b>Stretch</b>", style_body_sm)],
    [Paragraph("DMs sent", style_body_sm), Paragraph("53", style_body_sm), Paragraph("60", style_body_sm), Paragraph("75", style_body_sm)],
    [Paragraph("Follow-ups", style_body_sm), Paragraph("26", style_body_sm), Paragraph("35", style_body_sm), Paragraph("50", style_body_sm)],
    [Paragraph("Connection requests", style_body_sm), Paragraph("17", style_body_sm), Paragraph("50", style_body_sm), Paragraph("75", style_body_sm)],
    [Paragraph("Comments", style_body_sm), Paragraph("10", style_body_sm), Paragraph("40", style_body_sm), Paragraph("40", style_body_sm)],
    [Paragraph("Replies", style_body_sm), Paragraph("3", style_body_sm), Paragraph("5", style_body_sm), Paragraph("8", style_body_sm)],
    [Paragraph("<b>Total outreach</b>", style_body_sm), Paragraph("<b>111</b>", style_body_sm), Paragraph("<b>225</b>", style_body_sm), Paragraph("<b>300</b>", style_body_sm)],
    [Paragraph("Days hitting 45+", style_body_sm), Paragraph("0/5", style_body_sm), Paragraph("3/5", style_body_sm), Paragraph("5/5", style_body_sm)],
]

target_tbl = Table(target_data, colWidths=[1.8*inch, 1.2*inch, 1.5*inch, 1.2*inch])
target_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
    ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
    ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
    ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('BACKGROUND', (0, -2), (-1, -2), HexColor('#FFF3E0')),
    ('FONTNAME', (0, -2), (-1, -2), 'Helvetica-Bold'),
]))
story.append(target_tbl)

# ── FOOTER ──
story.append(Spacer(1, 24))
story.append(HRFlowable(width="100%", thickness=1, color=DA_GRAY, spaceAfter=8))
story.append(Paragraph(
    "Digital Accomplice  |  Weekly Pipeline Review  |  Generated by Claude Code  |  March 6, 2026",
    style_footer
))

doc.build(story)
print(f"Report saved to: {OUTPUT_PATH}")
