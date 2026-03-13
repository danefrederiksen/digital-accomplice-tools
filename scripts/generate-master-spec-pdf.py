#!/usr/bin/env python3
"""Generate DA-branded PDF of the Prospecting Tools Master Spec."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib import colors
import os

# DA Brand Colors
DA_ORANGE = HexColor('#F38B1C')
DA_BLACK = HexColor('#000000')
DA_BLUE_GRAY = HexColor('#5A6B7A')
DA_GRAY = HexColor('#CBCBCB')
DA_WHITE = HexColor('#FFFFFF')
DA_LIGHT_GRAY = HexColor('#F5F5F5')

W, H = letter
OUTPUT = '/Users/danefrederiksen/Desktop/Claude code/reports/DA_Ops_Processes_ProspectingToolsMasterSpec_2026-03-09.pdf'

# Styles
sTitle = ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=24, textColor=DA_BLACK, spaceAfter=6, leading=28)
sSubtitle = ParagraphStyle('Subtitle', fontName='Helvetica', fontSize=11, textColor=DA_BLUE_GRAY, spaceAfter=20, leading=14)
sH1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16, textColor=DA_BLACK, spaceBefore=20, spaceAfter=10, leading=20)
sH2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=13, textColor=DA_ORANGE, spaceBefore=16, spaceAfter=8, leading=16)
sH3 = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=11, textColor=DA_BLACK, spaceBefore=12, spaceAfter=6, leading=14)
sBody = ParagraphStyle('Body', fontName='Helvetica', fontSize=9.5, textColor=DA_BLACK, spaceAfter=6, leading=13)
sBold = ParagraphStyle('BodyBold', fontName='Helvetica-Bold', fontSize=9.5, textColor=DA_BLACK, spaceAfter=6, leading=13)
sBullet = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=9.5, textColor=DA_BLACK, spaceAfter=4, leading=13, leftIndent=18, bulletIndent=6)
sCode = ParagraphStyle('Code', fontName='Courier', fontSize=8.5, textColor=DA_BLUE_GRAY, spaceAfter=6, leading=11, leftIndent=12, backColor=DA_LIGHT_GRAY)
sSmall = ParagraphStyle('Small', fontName='Helvetica', fontSize=8, textColor=DA_BLUE_GRAY, spaceAfter=4, leading=10)
sTH = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, textColor=DA_WHITE, leading=11)
sTD = ParagraphStyle('TD', fontName='Helvetica', fontSize=8.5, textColor=DA_BLACK, leading=11)
sTDSmall = ParagraphStyle('TDSmall', fontName='Helvetica', fontSize=7.5, textColor=DA_BLACK, leading=10)

def make_table(headers, rows, col_widths=None):
    """Build a DA-branded table."""
    data = [[Paragraph(h, sTH) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), sTD) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), DA_WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    t.setStyle(TableStyle(style))
    return t

def make_small_table(headers, rows, col_widths=None):
    """Build a smaller table for dense data."""
    data = [[Paragraph(h, sTH) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), sTDSmall) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(style))
    return t

def header_footer(canvas, doc):
    canvas.saveState()
    # Header line
    canvas.setStrokeColor(DA_ORANGE)
    canvas.setLineWidth(2)
    canvas.line(0.75*inch, H - 0.5*inch, W - 0.75*inch, H - 0.5*inch)
    canvas.setFont('Helvetica-Bold', 8)
    canvas.setFillColor(DA_ORANGE)
    canvas.drawString(0.75*inch, H - 0.45*inch, 'DIGITAL ACCOMPLICE')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(DA_BLUE_GRAY)
    canvas.drawRightString(W - 0.75*inch, H - 0.45*inch, 'Prospecting Tools Master Spec')
    # Footer
    canvas.setStrokeColor(DA_GRAY)
    canvas.setLineWidth(0.5)
    canvas.line(0.75*inch, 0.55*inch, W - 0.75*inch, 0.55*inch)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(DA_BLUE_GRAY)
    canvas.drawString(0.75*inch, 0.4*inch, 'DA Prospecting Tools Master Specification v1.0 | 2026-03-09')
    canvas.drawRightString(W - 0.75*inch, 0.4*inch, f'Page {doc.page}')
    canvas.restoreState()

def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=letter,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        leftMargin=0.75*inch, rightMargin=0.75*inch
    )
    story = []

    # ── COVER / TITLE ──
    story.append(Spacer(1, 40))
    story.append(Paragraph('DA Prospecting Tools', sTitle))
    story.append(Paragraph('Master Specification', ParagraphStyle('Title2', fontName='Helvetica-Bold', fontSize=20, textColor=DA_ORANGE, spaceAfter=12, leading=24)))
    story.append(HRFlowable(width='100%', thickness=2, color=DA_ORANGE, spaceAfter=12))
    story.append(Paragraph('Version 1.0  |  2026-03-09  |  Baseline for QA Testing', sSubtitle))
    story.append(Spacer(1, 20))

    # TOC
    story.append(Paragraph('Table of Contents', sH2))
    toc_items = [
        '1. System Overview', '2. Architecture', '3. Tool-by-Tool Specifications',
        '4. Cross-Tool Integration', '5. Feature Matrix', '6. Status Flows',
        '7. Template System', '8. Daily Targets', '9. Known Issues & Gaps', '10. QA Test Plan'
    ]
    for item in toc_items:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(PageBreak())

    # ── 1. SYSTEM OVERVIEW ──
    story.append(Paragraph('1. System Overview', sH1))
    story.append(Paragraph('12 prospecting tools + 1 hub dashboard. Each tool is a single-file HTML app backed by a Node.js Express server. All share a <font face="Courier">data/</font> folder for JSON storage. Tools are grouped by <b>channel</b> (LinkedIn DM vs Email) and <b>segment</b> (B2B, Cyber, Referral, Substack, Customer).', sBody))

    story.append(Paragraph('Tool Categories', sH2))
    story.append(make_table(
        ['Category', 'Tools', 'Channel', 'Core Action'],
        [
            ['LinkedIn 1st Connection DMs', '#1 B2B, #2 Cyber, #5 Referral', 'LinkedIn DM', 'Send DM to existing connections'],
            ['LinkedIn 2nd Connection Warming', '#3 B2B, #4 Cyber, #6 Referral', 'Comment then DM', 'Comment on posts to warm, then DM'],
            ['Email Outreach', '#7 B2B, #8 Cyber, #9 Substack, #10 Customer, #12 Referral', 'Email', 'Send email sequences'],
            ['Cross-Tool Aggregator', '#11 Comment Queue', 'LinkedIn Comment', 'Unified comment tracking across #3, #4, #5, #6'],
        ],
        col_widths=[1.5*inch, 1.8*inch, 1.2*inch, 2.2*inch]
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph('What Makes Each Category Different', sH2))
    story.append(Paragraph('<b>1st Connection DMs (#1, #2, #5):</b> You\'re already connected on LinkedIn. Tool shows prospect, you copy a DM template, paste into LinkedIn, mark sent, tool tracks follow-ups on a timed cadence.', sBody))
    story.append(Paragraph('<b>2nd Connection Warming (#3, #4, #6):</b> You\'re NOT connected. Can\'t DM directly. Instead: comment on their posts to get on their radar, after enough comments send a connection request, once connected send DM. Tool #11 (Comment Queue) aggregates the commenting workflow.', sBody))
    story.append(Paragraph('<b>Email Outreach (#7, #8, #9, #10, #12):</b> You have their email. Tool shows prospect, you copy email template, paste into Gmail, mark sent, tool tracks follow-ups.', sBody))
    story.append(Paragraph('<b>Comment Queue (#11):</b> Reads prospect data from Tools #3, #4, #5, #6. Tracks comments per prospect. When comment count hits 4, prospect becomes "DM-ready." Provides daily target selection algorithm.', sBody))

    story.append(PageBreak())

    # ── 2. ARCHITECTURE ──
    story.append(Paragraph('2. Architecture', sH1))
    story.append(Paragraph('Startup: <font face="Courier">node start-all.js</font> launches all 13 servers as child processes.', sBody))

    story.append(Paragraph('Port Map', sH2))
    story.append(make_table(
        ['Port', 'Tool', 'Name'],
        [
            ['3849', 'Hub', 'Hub Dashboard (cross-tool aggregator)'],
            ['3851', '#1', 'B2B 1st Connections DM Tracker'],
            ['3852', '#2', 'Cyber 1st Connections DM Tracker'],
            ['3853', '#3', 'B2B 2nd Connections DM Tracker'],
            ['3854', '#4', 'Cyber 2nd Connections DM Tracker'],
            ['3855', '#5', 'Referral Partner 1st Connections'],
            ['3856', '#6', 'Referral Partner 2nd Connections'],
            ['3857', '#7', 'B2B Leads w/ Emails'],
            ['3858', '#8', 'Cyber Leads w/ Emails'],
            ['3859', '#9', 'Substack Subscriber Emails'],
            ['3860', '#10', 'Customers w/ Emails'],
            ['3861', '#11', 'Comment Queue (unified)'],
            ['3862', '#12', 'Referral Partner Emails'],
        ],
        col_widths=[0.6*inch, 0.5*inch, 5.6*inch]
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph('Shared Infrastructure', sH2))
    infra_items = [
        '<b>Localhost only:</b> All servers bind to 127.0.0.1',
        '<b>CORS:</b> Restricted to same-origin localhost',
        '<b>Data directory:</b> <font face="Courier">data/</font> (shared across all tools)',
        '<b>Backups:</b> <font face="Courier">data/backups/</font> \u2014 auto-backup on every save, max 5 per tool',
        '<b>Sanitization:</b> Server strips control chars; client HTML-escapes',
        '<b>IDs:</b> UUID v4 for all prospects',
        '<b>Dedup:</b> By email (lowercase) on import',
        '<b>Activity logs:</b> Capped at 500 entries per tool',
    ]
    for item in infra_items:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(Spacer(1, 10))
    story.append(Paragraph('Data Files Per Tool', sH2))
    story.append(make_small_table(
        ['Tool', 'Prospects File', 'Activity File'],
        [
            ['#1', 'data/b2b-1st-prospects.json', 'data/b2b-1st-activity.json'],
            ['#2', 'data/cyber-1st-prospects.json', 'data/cyber-1st-activity.json'],
            ['#3', 'data/b2b-2nd-prospects.json', 'data/b2b-2nd-activity.json'],
            ['#4', 'data/cyber-2nd-prospects.json', 'data/cyber-2nd-activity.json'],
            ['#5', 'data/referral-1st-prospects.json', 'data/referral-1st-activity.json'],
            ['#6', 'data/referral-2nd-prospects.json', 'data/referral-2nd-activity.json'],
            ['#7', 'data/b2b-email-prospects.json', 'data/b2b-email-activity.json'],
            ['#8', 'data/cyber-email-prospects.json', 'data/cyber-email-activity.json'],
            ['#9', 'data/substack-prospects.json', 'data/substack-activity.json'],
            ['#10', 'data/customer-prospects.json', 'data/customer-activity.json'],
            ['#11', 'comment-log.json + warming-dm-log.json + screenshots.json', '(no separate activity file)'],
            ['#12', 'data/referral-email-prospects.json', 'data/referral-email-activity.json'],
        ],
        col_widths=[0.5*inch, 3.5*inch, 2.7*inch]
    ))

    story.append(PageBreak())

    # ── 3. TOOL-BY-TOOL SPECS ──
    story.append(Paragraph('3. Tool-by-Tool Specifications', sH1))

    # -- Tool #1 --
    story.append(Paragraph('Tool #1 \u2014 B2B 1st Connections DM Tracker', sH2))
    story.append(Paragraph('<b>Port:</b> 3851  |  <b>Files:</b> <font face="Courier">tools/b2b-outreach.html</font> + <font face="Courier">tools/b2b-serve.js</font>', sSmall))
    story.append(Paragraph('Track LinkedIn DM outreach to B2B prospects you\'re already connected with on LinkedIn.', sBody))
    story.append(make_small_table(
        ['Field', 'Type', 'Description'],
        [
            ['id', 'UUID', 'Auto-generated'],
            ['name', 'string', 'Full name (required)'],
            ['company', 'string', 'Company name'],
            ['title', 'string', 'Job title'],
            ['linkedinUrl', 'string', 'LinkedIn profile URL'],
            ['status', 'string', 'Current workflow status'],
            ['dmSentDate', 'date/null', 'When DM was sent'],
            ['followUp1Due', 'date/null', 'Auto-set: dmSentDate + 3 days'],
            ['followUp2Due', 'date/null', 'Auto-set: dmSentDate + 7 days'],
            ['followUp3Due', 'date/null', 'Auto-set: dmSentDate + 14 days'],
            ['reply', 'string', 'Their reply text'],
            ['nextStep', 'string', 'Next action planned'],
            ['offer', 'string', 'Which offer/message variant used'],
            ['abVariant', 'string', 'A/B test variant label'],
        ],
        col_widths=[1.2*inch, 0.8*inch, 4.7*inch]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Status Flow:</b> not_started \u2192 dm_sent \u2192 follow_up_1 \u2192 follow_up_2 \u2192 follow_up_3 \u2192 replied OR exhausted', sBody))
    story.append(Paragraph('<b>Cadence:</b> DM \u2192 +3d \u2192 FU1 \u2192 +4d \u2192 FU2 \u2192 +7d \u2192 FU3', sBody))
    story.append(Paragraph('<b>Daily Target:</b> 4 DMs/day  |  <b>UI Tabs:</b> Dashboard, Import, All Prospects, A/B Report, Activity Log', sBody))
    story.append(Paragraph('<b>Templates:</b> localStorage key <font face="Courier">da_templates_tool1</font>. Steps: offer, followup_1, followup_2, followup_3. Vars: {name}, {company}.', sBody))
    story.append(Paragraph('<b>Unique:</b> A/B Report tab, offer/abVariant fields, Open LinkedIn button, Activity Feed link.', sBody))

    # -- Tool #2 --
    story.append(Paragraph('Tool #2 \u2014 Cyber 1st Connections DM Tracker', sH2))
    story.append(Paragraph('<b>Port:</b> 3852  |  <b>Files:</b> <font face="Courier">tools/cyber-outreach.html</font> + <font face="Courier">tools/cyber-serve.js</font>', sSmall))
    story.append(Paragraph('Same as Tool #1 but for cybersecurity vertical. Identical schema, status flow, cadence, UI tabs.', sBody))
    story.append(Paragraph('<b>Differences:</b> Cyber-focused templates. Has <font face="Courier">draftReply</font> field (auto-generates reply). Templates: <font face="Courier">da_templates_tool2</font>.', sBody))

    # -- Tool #3 --
    story.append(Paragraph('Tool #3 \u2014 B2B 2nd Connections DM Tracker', sH2))
    story.append(Paragraph('<b>Port:</b> 3853  |  <b>Files:</b> <font face="Courier">tools/b2b-2nd-outreach.html</font> + <font face="Courier">tools/b2b-2nd-serve.js</font>', sSmall))
    story.append(Paragraph('Track warming + DM outreach to B2B prospects you\'re NOT connected with. Requires commenting first, then connecting, then DM\'ing.', sBody))
    story.append(Paragraph('<b>Additional fields:</b> connected (bool), comment_count (int, via #11), last_commented (date, via #11), warming_dm_sent (date, via #11), warming_reply_date (date, via #11), connectionRequestDate, draftReply.', sBody))
    story.append(Paragraph('<b>Status Flow:</b> not_started \u2192 commenting (via #11) \u2192 connection_sent \u2192 connected \u2192 dm_sent \u2192 FU1 \u2192 FU2 \u2192 FU3 \u2192 replied OR exhausted', sBody))
    story.append(Paragraph('<b>Key behavior:</b> 1) Start not_started, connected=false. 2) Use Tool #11 to log comments. 3) After 4+ comments, DM-ready. 4) Send connection request. 5) When accepted, mark connected. 6) Enter DM sequence.', sBody))
    story.append(Paragraph('<b>Unique:</b> Connected toggle, editable LinkedIn URL, comment count badge, warming status indicator.', sBody))

    # -- Tool #4 --
    story.append(Paragraph('Tool #4 \u2014 Cyber 2nd Connections DM Tracker', sH2))
    story.append(Paragraph('<b>Port:</b> 3854  |  Same as Tool #3 for cybersecurity vertical.', sSmall))
    story.append(Paragraph('Identical to #3 in schema and flow. <b>Differences:</b> Cyber templates. Has abVariants in ALLOWED_FIELDS but NOT draftReply (inconsistency with #3).', sBody))

    # -- Tool #5 --
    story.append(Paragraph('Tool #5 \u2014 Referral Partner 1st Connections', sH2))
    story.append(Paragraph('<b>Port:</b> 3855  |  Track DM outreach to referral partners you\'re already connected with.', sSmall))
    story.append(Paragraph('Same schema/flow as Tool #1. <b>Differences:</b> Partnership-focused templates. Rate-limited DM queue (shows only 2 at a time). Daily target: 2/day. Has A/B Report tab. Has comment_count/last_commented (read by Tool #11).', sBody))
    story.append(Paragraph('<b>Note:</b> Even though 1st connection, Tool #11 reads from it because referral partners benefit from warming when connected.', sBody))

    # -- Tool #6 --
    story.append(Paragraph('Tool #6 \u2014 Referral Partner 2nd Connections', sH2))
    story.append(Paragraph('<b>Port:</b> 3856  |  Track warming + DM to referral partners you\'re NOT connected with.', sSmall))
    story.append(Paragraph('Same as Tool #3 for referral segment. <b>Differences:</b> Referral templates. Editable LinkedIn URL. Has A/B templates but NO A/B Report tab (inconsistency). Daily target: 2/day.', sBody))

    story.append(PageBreak())

    # -- Tool #7 --
    story.append(Paragraph('Tool #7 \u2014 B2B Leads w/ Emails', sH2))
    story.append(Paragraph('<b>Port:</b> 3857  |  <b>Files:</b> <font face="Courier">tools/b2b-email-outreach.html</font> + <font face="Courier">tools/b2b-email-serve.js</font>', sSmall))
    story.append(Paragraph('Track email outreach to B2B prospects where you have their email address.', sBody))
    story.append(make_small_table(
        ['Field', 'Type', 'Description'],
        [
            ['id', 'UUID', 'Auto-generated'],
            ['name', 'string', 'Full name (required)'],
            ['company', 'string', 'Company name'],
            ['title', 'string', 'Job title'],
            ['email', 'string', 'Email address (required, dedup key)'],
            ['linkedinUrl', 'string', 'LinkedIn profile URL'],
            ['source', 'string', 'Lead source'],
            ['status', 'string', 'Current workflow status'],
            ['emailSentDate', 'date/null', 'When first email sent'],
            ['followUp1Due', 'date/null', 'Auto-set: emailSentDate + 4 days'],
            ['followUp2Due', 'date/null', 'Auto-set: emailSentDate + 9 days'],
            ['reply', 'string', 'Their reply text'],
            ['nextStep', 'string', 'Next action planned'],
        ],
        col_widths=[1.2*inch, 0.8*inch, 4.7*inch]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Status Flow:</b> not_started \u2192 email_sent \u2192 follow_up_1 \u2192 follow_up_2 \u2192 replied OR cold', sBody))
    story.append(Paragraph('<b>Cadence:</b> Email \u2192 +4d \u2192 FU1 \u2192 +5d \u2192 FU2 (final nudge)  |  <b>Daily Target:</b> 10/day', sBody))
    story.append(Paragraph('<b>UI Tabs:</b> Dashboard, Import, All Prospects, Activity Log', sBody))
    story.append(Paragraph('<b>Templates:</b> <font face="Courier">da_templates_tool7</font>. Steps: email (subj+body), follow_up_1 (subj+body), follow_up_2 (subj+body).', sBody))
    story.append(Paragraph('<b>Actions:</b> Copy Subject, Copy Email, Preview, Mark Email Sent / Mark Follow-Up Sent / Mark Final Nudge Sent / Got Reply / Mark Cold. Replied: Reply textarea + Next Step.', sBody))
    story.append(Paragraph('<b>Unique:</b> CSV import with executive title filter, 3-step timeline visualization, Activity Feed URL from LinkedIn, inline preview toggle.', sBody))

    # -- Tool #8 --
    story.append(Paragraph('Tool #8 \u2014 Cyber Leads w/ Emails', sH2))
    story.append(Paragraph('<b>Port:</b> 3858  |  Same as Tool #7 for cybersecurity vertical. Daily target: 10/day.', sSmall))
    story.append(Paragraph('Identical to #7. <b>Differences:</b> Cyber templates, CISO/CTO/VP Security title filter. Templates: <font face="Courier">da_templates_tool8</font>.', sBody))

    # -- Tool #9 --
    story.append(Paragraph('Tool #9 \u2014 Substack Subscriber Emails', sH2))
    story.append(Paragraph('<b>Port:</b> 3859  |  Track email outreach to Substack newsletter subscribers.', sSmall))
    story.append(Paragraph('<b>Extra field:</b> subscribedDate (when they subscribed).', sBody))
    story.append(Paragraph('<b>Differences from #7:</b> Longer cadence (+5d/+12d). Daily target: 5/day. No title filter on import. Substack CSV auto-detection. Name extraction from email prefix. "All Subscribers" tab label. Subscriber badge on cards.', sBody))

    # -- Tool #10 --
    story.append(Paragraph('Tool #10 \u2014 Customers w/ Emails', sH2))
    story.append(Paragraph('<b>Port:</b> 3860  |  Re-engage existing customers for upsells and referrals.', sSmall))
    story.append(Paragraph('<b>Extra fields:</b> lastProject, lastProjectDate, customerSince.', sBody))
    story.append(Paragraph('<b>DIFFERENT status flow:</b> not_started \u2192 check_in_sent \u2192 follow_up_sent \u2192 ask_sent \u2192 replied OR <b>nurture</b>', sBody))
    story.append(Paragraph('<b>Cadence (longest):</b> Check-In \u2192 +7d \u2192 Value Add \u2192 +10d \u2192 Ask  |  <b>Daily Target:</b> 3/day', sBody))
    story.append(Paragraph('<b>Template steps:</b> check_in, value_add, ask (not email/follow_up/final_nudge).', sBody))
    story.append(Paragraph('<b>Unique:</b> Nurture status (not "cold"). Re-Engage button resets while preserving customer history. Customer fields preserved on reset.', sBody))

    # -- Tool #11 --
    story.append(Paragraph('Tool #11 \u2014 Comment Queue (Unified Cross-Tool Aggregator)', sH2))
    story.append(Paragraph('<b>Port:</b> 3861  |  <b>FUNDAMENTALLY DIFFERENT</b> \u2014 no own prospects, aggregates from 4 source tools.', sSmall))
    story.append(make_small_table(
        ['Segment Key', 'Source Tool', 'Data File'],
        [
            ['b2b_2nd', '#3 B2B 2nd', 'data/b2b-2nd-prospects.json'],
            ['cyber_2nd', '#4 Cyber 2nd', 'data/cyber-2nd-prospects.json'],
            ['referral_1st', '#5 Referral 1st', 'data/referral-1st-prospects.json'],
            ['referral_2nd', '#6 Referral 2nd', 'data/referral-2nd-prospects.json'],
        ],
        col_widths=[1.3*inch, 1.7*inch, 3.7*inch]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Fields written back:</b> comment_count, last_commented, warming_dm_sent, warming_reply_date', sBody))
    story.append(Paragraph('<b>Warming pipeline (derived):</b> not_started (0) \u2192 commenting (1-3) \u2192 dm_ready (4+) \u2192 dm_sent \u2192 replied', sBody))
    story.append(Paragraph('<b>Key constant:</b> COMMENTS_TO_DM = 4', sBody))
    story.append(Paragraph('<b>Daily target:</b> 8 comments/day (40/week). Algorithm: priority tiers (Engaged > Stale > Refresh > New > Recent), deterministic daily shuffle, segment round-robin, screenshot override.', sBody))
    story.append(Paragraph('<b>UI Tabs (6):</b> Search, DM Queue, Sent/Replies, History, All Prospects, Uploads', sBody))
    story.append(Paragraph('<b>DM Templates:</b> Stored server-side (not localStorage). One per segment with {name}/{company} vars.', sBody))

    # -- Tool #12 --
    story.append(Paragraph('Tool #12 \u2014 Referral Partner Emails', sH2))
    story.append(Paragraph('<b>Port:</b> 3862  |  Track email outreach to referral partners where you have their email.', sSmall))
    story.append(Paragraph('<b>Extra field:</b> draftReply (auto-generated reply draft). Same status flow/cadence as #7 (+4d/+9d). Daily target: 3/day.', sBody))
    story.append(Paragraph('<b>Unique:</b> Draft Reply system with auto-generation, editable textarea, Copy Draft button. Import title filter includes "partner" and "agency."', sBody))

    story.append(PageBreak())

    # ── 4. CROSS-TOOL INTEGRATION ──
    story.append(Paragraph('4. Cross-Tool Integration', sH1))
    story.append(Paragraph('Data Flow', sH2))

    flow_lines = [
        'LINKEDIN DM TOOLS                          EMAIL TOOLS (independent)',
        '',
        '1st Connections (standalone):               #7 B2B Email',
        '  #1 B2B 1st                                #8 Cyber Email',
        '  #2 Cyber 1st                              #9 Substack Email',
        '                                            #10 Customer Email',
        '2nd Connections + Referral 1st:              #12 Referral Email',
        '  #3 B2B 2nd ----\\',
        '  #4 Cyber 2nd ---+---> #11 Comment Queue',
        '  #5 Referral 1st-+     (reads + writes back',
        '  #6 Referral 2nd/       warming data)',
    ]
    for line in flow_lines:
        story.append(Paragraph(line.replace(' ', '&nbsp;'), sCode))

    story.append(Spacer(1, 10))
    story.append(Paragraph('How Tool #11 Connects', sH3))
    connect_items = [
        'Tool #11 <b>reads</b> prospect name, company, LinkedIn URL, warming fields from source JSON files',
        'When you <b>log a comment</b>, it increments comment_count and updates last_commented in the source file',
        'When you <b>send a DM</b> from DM Queue, it sets warming_dm_sent in the source file',
        'When you <b>mark a reply</b>, it sets warming_reply_date in the source file',
        '<b>No file locking</b> \u2014 all servers read/write same JSON files (low risk for single user)',
    ]
    for item in connect_items:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(Spacer(1, 10))
    story.append(Paragraph('<b>Completely independent tools:</b> #1, #2, #7, #8, #9, #10, #12 have zero cross-tool data sharing.', sBody))

    story.append(PageBreak())

    # ── 5. FEATURE MATRIX ──
    story.append(Paragraph('5. Feature Matrix', sH1))
    story.append(Paragraph('YES = feature exists, \u2013 = missing, n/a = not applicable', sSmall))

    features = [
        ['Search bar',           '-','-','-','-','-','-','-','-','-','-','YES','-'],
        ['Activity Feed link',   '-','-','-','-','-','-','YES','YES','YES','YES','YES','YES'],
        ['Delete on dashboard',  '-','-','-','-','-','-','-','-','-','-','n/a','-'],
        ['Open LinkedIn button', 'YES','YES','YES','YES','YES','YES','YES','YES','-','YES','YES','YES'],
        ['Message templates',    'YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES'],
        ['A/B testing',          'YES','YES','-','-','YES','-','-','-','-','-','-','-'],
        ['A/B Report tab',       'YES','YES','-','-','YES','-','-','-','-','-','-','-'],
        ['Draft Reply',          '-','YES','YES','-','-','-','-','-','-','-','-','YES'],
        ['Editable LinkedIn URL','-','-','YES','-','-','YES','-','-','-','-','-','-'],
        ['Connected toggle',     '-','-','YES','YES','-','YES','-','-','-','-','-','-'],
        ['Comment warming',      '-','-','YES','YES','YES','YES','-','-','-','-','YES','-'],
        ['CSV import',           'YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','-','YES'],
        ['Screenshot/OCR',       '-','-','-','-','-','-','-','-','-','-','YES','-'],
        ['Daily target display', 'YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES','YES'],
    ]

    matrix_headers = ['Feature', '#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '#12']
    data = [[Paragraph(h, sTH) for h in matrix_headers]]
    for row in features:
        styled_row = [Paragraph(row[0], ParagraphStyle('MatrixLabel', fontName='Helvetica', fontSize=7, leading=9))]
        for cell in row[1:]:
            if cell == 'YES':
                styled_row.append(Paragraph('<font color="#F38B1C"><b>YES</b></font>', ParagraphStyle('MatrixYes', fontName='Helvetica-Bold', fontSize=7, leading=9, alignment=TA_CENTER)))
            else:
                styled_row.append(Paragraph(cell, ParagraphStyle('MatrixNo', fontName='Helvetica', fontSize=7, leading=9, alignment=TA_CENTER, textColor=DA_GRAY)))
        data.append(styled_row)

    cw = [1.3*inch] + [0.45*inch]*12
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DA_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), DA_WHITE),
        ('FONTSIZE', (0, 0), (-1, 0), 7),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('TOPPADDING', (0, 0), (-1, 0), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DA_WHITE, DA_LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, DA_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ── 6. STATUS FLOWS ──
    story.append(Paragraph('6. Status Flows', sH1))

    story.append(Paragraph('LinkedIn DM Tools (#1, #2, #3, #4, #5, #6)', sH2))
    story.append(Paragraph('not_started \u2192 dm_sent \u2192 follow_up_1 \u2192 follow_up_2 \u2192 follow_up_3 \u2192 replied OR exhausted', sCode))
    story.append(Paragraph('Cadence: DM \u2192 +3d \u2192 FU1 \u2192 +4d \u2192 FU2 \u2192 +7d \u2192 FU3. Got Reply possible at any stage.', sBody))

    story.append(Paragraph('2nd Connection Pre-Sequence (#3, #4, #6 only)', sH2))
    story.append(Paragraph('not_started \u2192 [commenting via #11] \u2192 connection_sent \u2192 connected \u2192 (enters DM sequence)', sCode))

    story.append(Paragraph('Email Tools (#7, #8, #12)', sH2))
    story.append(Paragraph('not_started \u2192 email_sent \u2192 follow_up_1 \u2192 follow_up_2 \u2192 replied OR cold', sCode))
    story.append(Paragraph('Cadence: Email \u2192 +4d \u2192 FU1 \u2192 +5d \u2192 FU2 (final nudge).', sBody))

    story.append(Paragraph('Substack Email (#9)', sH2))
    story.append(Paragraph('Same flow as #7/#8 but longer cadence: Email \u2192 +5d \u2192 FU1 \u2192 +7d \u2192 FU2.', sBody))

    story.append(Paragraph('Customer Email (#10)', sH2))
    story.append(Paragraph('not_started \u2192 check_in_sent \u2192 follow_up_sent \u2192 ask_sent \u2192 replied OR nurture', sCode))
    story.append(Paragraph('Cadence: Check-In \u2192 +7d \u2192 Value Add \u2192 +10d \u2192 Ask. Nurture instead of Cold.', sBody))

    story.append(Paragraph('Comment Queue Warming (#11)', sH2))
    story.append(Paragraph('not_started (0) \u2192 commenting (1-3) \u2192 dm_ready (4+) \u2192 dm_sent \u2192 replied', sCode))
    story.append(Paragraph('Derived status \u2014 computed from comment_count and DM fields, not stored.', sBody))

    # ── 7. TEMPLATE SYSTEM ──
    story.append(Paragraph('7. Template System', sH1))
    story.append(Paragraph('<b>Storage:</b> LinkedIn DM tools (#1-#6) and Email tools (#7-#10, #12) use localStorage (key: da_templates_toolN). Tool #11 DM templates are server-side in memory.', sBody))
    story.append(Paragraph('<b>Risk:</b> Templates in localStorage are lost if browser cache is cleared. Not backed up.', sBold))
    story.append(Paragraph('<b>Variables:</b> All tools support {name} and {company}, replaced at render time.', sBody))

    story.append(make_table(
        ['Category', 'Template Steps'],
        [
            ['LinkedIn DM (#1-#6)', 'offer, followup_1, followup_2, followup_3'],
            ['Email (#7, #8, #12)', 'email (subj+body), follow_up_1 (subj+body), follow_up_2 (subj+body)'],
            ['Substack (#9)', 'Same as email tools'],
            ['Customer (#10)', 'check_in (subj+body), value_add (subj+body), ask (subj+body)'],
            ['Comment Queue (#11)', 'One DM template per segment (b2b_2nd, cyber_2nd, referral_1st, referral_2nd)'],
        ],
        col_widths=[1.8*inch, 4.9*inch]
    ))

    story.append(PageBreak())

    # ── 8. DAILY TARGETS ──
    story.append(Paragraph('8. Daily Targets', sH1))
    story.append(make_table(
        ['Tool', 'Target', 'Unit'],
        [
            ['#1 B2B 1st DM', '4/day', 'DMs sent'],
            ['#2 Cyber 1st DM', '4/day', 'DMs sent'],
            ['#3 B2B 2nd DM', '4/day', 'DMs sent (connected)'],
            ['#4 Cyber 2nd DM', '4/day', 'DMs sent (connected)'],
            ['#5 Referral 1st DM', '2/day', 'DMs sent'],
            ['#6 Referral 2nd DM', '2/day', 'DMs sent (connected)'],
            ['#7 B2B Email', '10/day', 'Emails sent'],
            ['#8 Cyber Email', '10/day', 'Emails sent'],
            ['#9 Substack Email', '5/day', 'Emails sent'],
            ['#10 Customer Email', '3/day', 'Touches'],
            ['#11 Comment Queue', '8/day (40/week)', 'Comments logged'],
            ['#12 Referral Email', '3/day', 'Emails sent'],
        ],
        col_widths=[2*inch, 1.5*inch, 3.2*inch]
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph('<b>Total daily capacity:</b> ~20 DMs + ~31 emails + 8 comments = ~59 touches/day', sBold))

    # ── 9. KNOWN ISSUES ──
    story.append(Spacer(1, 20))
    story.append(Paragraph('9. Known Issues & Gaps', sH1))

    story.append(Paragraph('Data Issues', sH2))
    issues_data = [
        '<b>1.</b> Tool #4 junk data: ~60-80 junk records of 245 total need cleanup',
        '<b>2.</b> Tool #3 misclassified data: 13 wrong-segment, 6 dupes, 7 swapped fields',
        '<b>3.</b> Cross-tool duplicates: 27 people in both #1 and #5 (need classification)',
        '<b>4.</b> Comment log junk entries from junk prospects need removal',
    ]
    for item in issues_data:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(Paragraph('Feature Inconsistencies', sH2))
    issues_feat = [
        '<b>5.</b> Search bar missing from all tools except #11',
        '<b>6.</b> Activity Feed link missing from LinkedIn DM tools (#1-#6)',
        '<b>7.</b> Delete button missing on dashboard cards in all tools',
        '<b>8.</b> Draft Reply only in #2, #3, #12 \u2014 missing from #1, #4, #5, #6',
        '<b>9.</b> A/B Report tab only in #1, #2, #5 \u2014 #6 has A/B templates but no report',
        '<b>10.</b> Editable LinkedIn URL only in #3 and #6',
        '<b>11.</b> ALLOWED_FIELDS mismatch: #4 has abVariants but not draftReply; #3 opposite',
        '<b>12.</b> Tool #1 missing "Open LinkedIn" on Replied cards',
        '<b>13.</b> Template storage risk: localStorage only, not backed up',
    ]
    for item in issues_feat:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(Paragraph('Missing Features', sH2))
    issues_missing = [
        '<b>14.</b> Hub Dashboard (port 3849): planned but not fully built',
        '<b>15.</b> Editable offer / A/B testing should exist on all tools, only on #1, #2, #5',
        '<b>16.</b> Data import needed for email tools #7, #9, #10, #12',
    ]
    for item in issues_missing:
        story.append(Paragraph(item, sBullet, bulletText='\u2022'))

    story.append(PageBreak())

    # ── 10. QA TEST PLAN ──
    story.append(Paragraph('10. QA Test Plan', sH1))

    story.append(Paragraph('Per-Tool Smoke Test (run for each of 12 tools)', sH2))
    story.append(make_small_table(
        ['#', 'Test', 'Expected Result'],
        [
            ['1', 'Server starts on correct port', 'http://localhost:{port} loads UI'],
            ['2', 'Import a prospect (manual add)', 'Prospect appears in dashboard'],
            ['3', 'Import CSV (if applicable)', 'Prospects added, duplicates skipped'],
            ['4', 'View templates', 'Template editor opens, shows correct steps'],
            ['5', 'Edit a template', 'Saved to localStorage, persists on reload'],
            ['6', 'Copy template to clipboard', 'Correct text with variables replaced'],
            ['7', 'Take first action (Send DM / Send Email)', 'Status changes, follow-up dates set'],
            ['8', 'Verify follow-up timing', 'Follow-up card appears on correct date'],
            ['9', 'Take follow-up action', 'Status advances correctly'],
            ['10', 'Mark as Replied', 'Reply textarea appears, can save text'],
            ['11', 'Mark as Exhausted/Cold', 'Card moves to correct section'],
            ['12', 'Reset prospect', 'Fields cleared, status back to not_started'],
            ['13', 'Delete prospect', 'Removed from all views'],
            ['14', 'Activity log records actions', 'Each action creates a log entry'],
            ['15', 'Daily target counter', 'Shows correct count for today'],
            ['16', 'Page reload preserves data', 'All data intact after refresh'],
        ],
        col_widths=[0.35*inch, 2.65*inch, 3.7*inch]
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Tool #11 Integration Tests', sH2))
    story.append(make_small_table(
        ['#', 'Test', 'Expected Result'],
        [
            ['17', 'Search finds prospects from all 4 sources', 'Results from #3, #4, #5, #6'],
            ['18', 'Log a comment', 'comment_count incremented in source file'],
            ['19', '4th comment triggers dm_ready', 'Prospect appears in DM Queue'],
            ['20', 'Copy DM template', 'Correct segment-specific template'],
            ['21', 'Mark DM Sent', 'warming_dm_sent set in source file'],
            ['22', 'Mark Reply Received', 'warming_reply_date set in source file'],
            ['23', 'Daily targets load (8 prospects)', 'Algorithm selects from all segments'],
            ['24', 'Conversion funnel stats', 'Counts match actual data'],
        ],
        col_widths=[0.35*inch, 2.65*inch, 3.7*inch]
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph('Cross-Tool Data Integrity Tests', sH2))
    story.append(make_small_table(
        ['#', 'Test', 'Expected Result'],
        [
            ['25', 'Edit prospect in Tool #3, verify in #11', 'Changes visible in Comment Queue'],
            ['26', 'Log comment in #11, verify in #3', 'comment_count updated in Tool #3 data'],
            ['27', 'Start all servers simultaneously', 'No port conflicts, all 13 start'],
            ['28', 'Concurrent writes (unlikely)', 'No data corruption'],
        ],
        col_widths=[0.35*inch, 2.65*inch, 3.7*inch]
    ))

    story.append(PageBreak())

    # ── APPENDIX ──
    story.append(Paragraph('Appendix: Quick Reference', sH1))

    story.append(Paragraph('Starting Everything', sH2))
    story.append(Paragraph('cd /Users/danefrederiksen/Desktop/Claude\\ code', sCode))
    story.append(Paragraph('node start-all.js', sCode))

    story.append(Spacer(1, 10))
    story.append(Paragraph('All URLs', sH2))
    urls = [
        ['Hub Dashboard', 'http://localhost:3849'],
        ['#1  B2B 1st DM', 'http://localhost:3851'],
        ['#2  Cyber 1st DM', 'http://localhost:3852'],
        ['#3  B2B 2nd DM', 'http://localhost:3853'],
        ['#4  Cyber 2nd DM', 'http://localhost:3854'],
        ['#5  Referral 1st', 'http://localhost:3855'],
        ['#6  Referral 2nd', 'http://localhost:3856'],
        ['#7  B2B Email', 'http://localhost:3857'],
        ['#8  Cyber Email', 'http://localhost:3858'],
        ['#9  Substack', 'http://localhost:3859'],
        ['#10 Customer', 'http://localhost:3860'],
        ['#11 Comment Queue', 'http://localhost:3861'],
        ['#12 Referral Email', 'http://localhost:3862'],
    ]
    story.append(make_table(
        ['Tool', 'URL'],
        urls,
        col_widths=[2.5*inch, 4.2*inch]
    ))

    # Build
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f'PDF saved to: {OUTPUT}')

if __name__ == '__main__':
    build()
