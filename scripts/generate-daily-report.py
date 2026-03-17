#!/usr/bin/env python3
"""Generate Daily Report PDF for Digital Accomplice Prospecting Pipeline"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import json
from datetime import datetime

# DA Brand Colors
DA_ORANGE = HexColor('#F8901E')
DA_BLACK = HexColor('#000000')
DA_BLUE_GRAY = HexColor('#5A6B7A')
DA_GRAY = HexColor('#CBCBCB')
DA_LIGHT_GRAY = HexColor('#F5F5F5')
DA_WHITE = HexColor('#FFFFFF')
DA_GREEN = HexColor('#28A745')
DA_RED = HexColor('#DC3545')

OUTPUT_PATH = "/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports/Daily_Report_2026-03-06_Claude_Code_v3.pdf"

# ── Styles ──────────────────────────────────────────────
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'DATitle', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=22, textColor=DA_BLACK,
    spaceAfter=4
)
style_subtitle = ParagraphStyle(
    'DASubtitle', parent=styles['Normal'],
    fontName='Helvetica', fontSize=11, textColor=DA_BLUE_GRAY,
    spaceAfter=16
)
style_section = ParagraphStyle(
    'DASection', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=14, textColor=DA_ORANGE,
    spaceBefore=16, spaceAfter=8
)
style_subsection = ParagraphStyle(
    'DASubsection', parent=styles['Heading3'],
    fontName='Helvetica-Bold', fontSize=11, textColor=DA_BLACK,
    spaceBefore=10, spaceAfter=4
)
style_body = ParagraphStyle(
    'DABody', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10, textColor=DA_BLACK,
    leading=14
)
style_stat_label = ParagraphStyle(
    'DAStatLabel', parent=styles['Normal'],
    fontName='Helvetica', fontSize=9, textColor=DA_BLUE_GRAY,
    alignment=TA_CENTER
)
style_stat_value = ParagraphStyle(
    'DAStatValue', parent=styles['Normal'],
    fontName='Helvetica-Bold', fontSize=22, textColor=DA_BLACK,
    alignment=TA_CENTER
)
style_footer = ParagraphStyle(
    'DAFooter', parent=styles['Normal'],
    fontName='Helvetica', fontSize=8, textColor=DA_GRAY,
    alignment=TA_CENTER
)

# ── Data ────────────────────────────────────────────────

# Today's activity (from tool activity logs)
today_dms = 10          # 4 (Tool #1) + 6 (Tool #5)
today_followups = 16    # 11 (Tool #1) + 2 (Tool #2) + 3 (Tool #5)
today_conn_reqs = 10    # 7 (Tool #4) + 3 (Tool #6)
today_replies = 2       # 1 (Tool #1) + 1 (Tool #5)
today_comments = 3      # Comment log
today_added = 16        # 11 (Tool #4) + 5 (Tool #6)
today_total_touches = today_dms + today_followups + today_conn_reqs + today_comments  # 39

# Week activity
week_tool1 = 70
week_tool2 = 34
week_tool3 = 32
week_tool4 = 175
week_tool5 = 34
week_tool6 = 13
week_comments = 10
week_total = week_tool1 + week_tool2 + week_tool3 + week_tool4 + week_tool5 + week_tool6 + week_comments  # 368

# Pipeline (main dashboard)
total_prospects = 1003
status_new = 997
status_warming = 2
status_outreach = 4
connected = 419
seq_active = 4
seq_pending = 1
reports_generated = 2

# Tool-level data
tool_data = [
    ("Tool #1 - B2B 1st Conn DM", 7, "7 follow_up_1", 17, 70),
    ("Tool #2 - Cyber 1st Conn DM", 11, "10 follow_up_1, 1 dm_sent", 2, 34),
    ("Tool #3 - B2B 2nd Conn DM", 0, "-", 0, 32),
    ("Tool #4 - Cyber 2nd Conn DM", 221, "213 not started, 8 conn sent", 18, 175),
    ("Tool #5 - Referral 1st Conn", 58, "48 not started, 6 dm_sent, 3 f/u, 1 replied", 10, 34),
    ("Tool #6 - Referral 2nd Conn", 30, "22 not started, 8 conn sent", 8, 13),
    ("Tool #11 - Comment Queue", "-", "-", 3, 10),
]

# Follow-ups due today
followups_due = [
    "Lee Frederiksen (podcast_guest - step 2)",
    "Margie Agin (active sequence)",
    "YoungSae Song (connected_icp - step 1)",
    "Alexandria Jakaitis (referral - follow_up_1)",
]

# ── Build PDF ───────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=letter,
    topMargin=0.6*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.75*inch,
    rightMargin=0.75*inch
)

story = []

# ── Header ──────────────────────────────────────────────
story.append(Paragraph("Daily Pipeline Report", style_title))
story.append(Paragraph("Friday, March 6, 2026  |  Digital Accomplice Prospecting System", style_subtitle))

# Orange divider
story.append(HRFlowable(width="100%", thickness=3, color=DA_ORANGE, spaceAfter=16))

# ── Today's Scorecard ──────────────────────────────────
story.append(Paragraph("Today's Scorecard", style_section))

scorecard_data = [
    [Paragraph("DMs Sent", style_stat_label),
     Paragraph("Follow-Ups", style_stat_label),
     Paragraph("Conn Requests", style_stat_label),
     Paragraph("Comments", style_stat_label),
     Paragraph("Replies", style_stat_label),
     Paragraph("Total Touches", style_stat_label)],
    [Paragraph(str(today_dms), style_stat_value),
     Paragraph(str(today_followups), style_stat_value),
     Paragraph(str(today_conn_reqs), style_stat_value),
     Paragraph(str(today_comments), style_stat_value),
     Paragraph(str(today_replies), style_stat_value),
     Paragraph(str(today_total_touches), style_stat_value)],
]

col_w = (doc.width) / 6
scorecard_table = Table(scorecard_data, colWidths=[col_w]*6, rowHeights=[20, 40])
scorecard_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 8),
    ('LINEBELOW', (0, 0), (-1, 0), 0.5, DA_GRAY),
]))
story.append(scorecard_table)
story.append(Spacer(1, 6))

# Targets comparison
target_text = (
    '<font color="#5A6B7A"><b>vs. Daily Targets:</b> DMs 3-4 new/day '
    f'{"<font color=#28A745>&#10003;</font>" if today_dms >= 3 else "<font color=#DC3545>&#10007;</font>"}  |  '
    f'Comments 8/day {"<font color=#DC3545>&#10007; (3/8)</font>" if today_comments < 8 else "<font color=#28A745>&#10003;</font>"}  |  '
    f'Total touches 45-60 {"<font color=#DC3545>&#10007; (39/45)</font>" if today_total_touches < 45 else "<font color=#28A745>&#10003;</font>"}'
    '</font>'
)
story.append(Paragraph(target_text, style_body))

# ── Week-to-Date ────────────────────────────────────────
story.append(Paragraph("Week-to-Date (Mon Mar 2 - Fri Mar 6)", style_section))

week_text = (
    f"<b>Total activity across all tools: {week_total} actions</b><br/>"
    f"Target: 225-300 touches/week  |  "
    f'{"<font color=#28A745>ON TRACK</font>" if week_total >= 225 else "<font color=#F8901E>BUILDING</font>"}'
)
story.append(Paragraph(week_text, style_body))
story.append(Spacer(1, 4))

# ── Tool-by-Tool Breakdown ─────────────────────────────
story.append(Paragraph("Tool-by-Tool Breakdown", style_section))

tool_table_data = [
    [Paragraph("<b>Tool</b>", style_body),
     Paragraph("<b>Prospects</b>", style_body),
     Paragraph("<b>Status Mix</b>", style_body),
     Paragraph("<b>Today</b>", style_body),
     Paragraph("<b>Week</b>", style_body)],
]

for name, prospects, status_mix, today_count, week_count in tool_data:
    tool_table_data.append([
        Paragraph(name, style_body),
        Paragraph(str(prospects), style_body),
        Paragraph(str(status_mix), style_body),
        Paragraph(str(today_count), style_body),
        Paragraph(str(week_count), style_body),
    ])

tool_table = Table(tool_table_data, colWidths=[2*inch, 0.7*inch, 2.3*inch, 0.6*inch, 0.6*inch])
tool_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
    ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ('ALIGN', (3, 0), (4, -1), 'CENTER'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
    ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(tool_table)

# ── Pipeline Overview ───────────────────────────────────
story.append(Paragraph("Pipeline Overview (Main Dashboard)", style_section))

pipeline_data = [
    [Paragraph("Total Prospects", style_stat_label),
     Paragraph("New (Triage)", style_stat_label),
     Paragraph("Warming", style_stat_label),
     Paragraph("Outreach Sent", style_stat_label),
     Paragraph("Connected", style_stat_label)],
    [Paragraph(f"<b>{total_prospects}</b>", style_stat_value),
     Paragraph(f"<b>{status_new}</b>", style_stat_value),
     Paragraph(f"<b>{status_warming}</b>", style_stat_value),
     Paragraph(f"<b>{status_outreach}</b>", style_stat_value),
     Paragraph(f"<b>{connected}</b>", style_stat_value)],
]

pip_col_w = doc.width / 5
pipeline_table = Table(pipeline_data, colWidths=[pip_col_w]*5, rowHeights=[20, 36])
pipeline_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), DA_LIGHT_GRAY),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LINEBELOW', (0, 0), (-1, 0), 0.5, DA_GRAY),
    ('TOPPADDING', (0, 0), (-1, 0), 6),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 6),
]))
story.append(pipeline_table)
story.append(Spacer(1, 4))

seq_text = (
    f"<b>Active sequences:</b> {seq_active}  |  "
    f"<b>Connection pending:</b> {seq_pending}  |  "
    f"<b>Reports generated:</b> {reports_generated}"
)
story.append(Paragraph(seq_text, style_body))

# ── Follow-Ups Due Today ───────────────────────────────
story.append(Paragraph("Follow-Ups Due Today", style_section))
for fu in followups_due:
    story.append(Paragraph(f"&#8226;  {fu}", style_body))

# ── Today's Key Actions ────────────────────────────────
story.append(Paragraph("Today's Key Actions", style_section))

actions = [
    "<b>B2B 1st Conn (Tool #1):</b> 11 follow-ups sent, 4 new DMs, 1 reply received. All 7 prospects in follow_up_1.",
    "<b>Cyber 1st Conn (Tool #2):</b> 2 follow-ups sent. 10 in follow_up_1, 1 DM pending.",
    "<b>Cyber 2nd Conn (Tool #4):</b> 7 connection requests sent + 11 new prospects added. 221 total (213 not started - big triage queue).",
    "<b>Referral 1st Conn (Tool #5):</b> 6 new DMs sent, 3 follow-ups, 1 reply! 10 prospects active today.",
    "<b>Referral 2nd Conn (Tool #6):</b> 3 connection requests + 5 new prospects added.",
    "<b>Comments (Tool #11):</b> 3 comments logged (target: 8/day - needs ramp).",
]
for a in actions:
    story.append(Paragraph(f"&#8226;  {a}", style_body))
    story.append(Spacer(1, 2))

# ── Observations ────────────────────────────────────────
story.append(Paragraph("Observations", style_section))

observations = [
    "<b>Momentum building:</b> 39 touches today, 368 this week. Referral outreach is ramping fast (10 actions today).",
    "<b>2 replies today</b> - one in B2B, one in Referral. Follow up immediately.",
    "<b>Comment volume low:</b> 3/8 target. This is the easiest engagement type - prioritize hitting 8/day next week.",
    "<b>Cyber 2nd Conn is loaded:</b> 221 prospects, 213 not started. Big opportunity to batch-activate connection requests.",
    "<b>Main dashboard underused:</b> Most action is happening in the individual tools. The 997 'new' prospects in the dashboard represent the long-term triage backlog.",
    "<b>It's Friday</b> - time for your weekly pipeline review. Pull the Reports tab for full week metrics.",
]
for o in observations:
    story.append(Paragraph(f"&#8226;  {o}", style_body))
    story.append(Spacer(1, 2))

# ── Footer ──────────────────────────────────────────────
story.append(Spacer(1, 20))
story.append(HRFlowable(width="100%", thickness=1, color=DA_GRAY, spaceAfter=8))
story.append(Paragraph(
    "Digital Accomplice  |  Daily Pipeline Report  |  Generated by Claude Code  |  March 6, 2026",
    style_footer
))

# ── Generate ────────────────────────────────────────────
doc.build(story)
print(f"Report saved to: {OUTPUT_PATH}")
