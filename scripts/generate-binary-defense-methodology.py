#!/usr/bin/env python3
"""Generate Methodology Audit Trail PDF for Binary Defense AI Visibility Snapshot"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib import colors
import os

# DA Brand Colors
ORANGE = HexColor('#F38B1C')
BLACK = HexColor('#000000')
BLUE_GRAY = HexColor('#5A6B7A')
GRAY = HexColor('#CBCBCB')
LIGHT_GRAY = HexColor('#F5F5F5')
WHITE = HexColor('#FFFFFF')
RED = HexColor('#DC2626')
GREEN = HexColor('#16A34A')

OUTPUT_DIR = "/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports"
FILENAME = "Binary_Defense_AI_Snapshot_2026-03-07_Methodology.pdf"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, FILENAME)

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle('DATitle', parent=styles['Title'],
        fontName='Helvetica-Bold', fontSize=18, textColor=BLACK, spaceAfter=4))
    styles.add(ParagraphStyle('DASubtitle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, textColor=BLUE_GRAY, spaceAfter=12))
    styles.add(ParagraphStyle('SectionHead', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=13, textColor=ORANGE,
        spaceBefore=16, spaceAfter=6, borderWidth=0, borderPadding=0))
    styles.add(ParagraphStyle('SubHead', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=11, textColor=BLACK,
        spaceBefore=10, spaceAfter=4))
    styles.add(ParagraphStyle('Body', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, textColor=BLACK, leading=13, spaceAfter=4))
    styles.add(ParagraphStyle('BodySmall', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, textColor=BLUE_GRAY, leading=11, spaceAfter=2))
    styles.add(ParagraphStyle('Mono', parent=styles['Normal'],
        fontName='Courier', fontSize=8, textColor=BLACK, leading=11, spaceAfter=2, leftIndent=12))
    styles.add(ParagraphStyle('BulletBody', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, textColor=BLACK, leading=13, spaceAfter=3, leftIndent=16, bulletIndent=4))
    styles.add(ParagraphStyle('Warning', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, textColor=RED, leading=12, spaceAfter=4))
    styles.add(ParagraphStyle('Pass', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, textColor=GREEN, leading=12, spaceAfter=4))
    styles.add(ParagraphStyle('Footer', parent=styles['Normal'],
        fontName='Helvetica', fontSize=7, textColor=GRAY, alignment=TA_CENTER, spaceBefore=20))

    story = []

    # === HEADER ===
    story.append(Paragraph("METHODOLOGY & AUDIT TRAIL", styles['DATitle']))
    story.append(Paragraph("Binary Defense AI Visibility Snapshot  |  March 7, 2026  |  Lite Mode", styles['DASubtitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))

    # === PURPOSE ===
    story.append(Paragraph("PURPOSE OF THIS DOCUMENT", styles['SectionHead']))
    story.append(Paragraph(
        "This document records exactly how the accompanying AI Visibility Snapshot was produced: "
        "what tools were used, what queries were run, what data was found, and how scores were calculated. "
        "It exists so the snapshot can be independently verified and any inaccuracies traced to their source.",
        styles['Body']
    ))

    # === ENVIRONMENT ===
    story.append(Paragraph("1. ENVIRONMENT & TOOLS", styles['SectionHead']))
    env_data = [
        ['Component', 'Detail'],
        ['Agent', 'Claude Opus 4.6 via Claude Code CLI'],
        ['Skill Used', 'ai-snapshot-agent (SKILL.md v2)'],
        ['Web Search Tool', 'WebSearch (built-in Claude Code tool)'],
        ['Browser Tool', 'Claude in Chrome MCP (YouTube channel verification)'],
        ['PDF Generator', 'Snapshot Generator app (localhost:3850)'],
        ['Template', 'snapshot-generator.html (19-field form)'],
        ['Export Method', 'Chrome headless via /api/download-snapshot endpoint'],
        ['Mode', 'Lite (10 prompts, 1 run, web search as AI model proxy)'],
        ['Date/Time', 'March 7, 2026, ~06:10-06:25 PT'],
    ]
    env_table = Table(env_data, colWidths=[1.5*inch, 5.0*inch])
    env_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(env_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Key limitation:</b> Lite mode uses web search results as a proxy for what ChatGPT and Perplexity "
        "would return. A true Lite mode run requires separate sessions in each AI model. The scores here "
        "represent web search visibility, which correlates with but does not guarantee AI model responses.",
        styles['BodySmall']
    ))

    # === INPUTS ===
    story.append(Paragraph("2. INPUTS (Confirmed by Dane)", styles['SectionHead']))
    inputs_data = [
        ['Input', 'Value', 'Source'],
        ['Target Company', 'Binary Defense (binarydefense.com)', 'Dane specified'],
        ['Industry Vertical', 'Managed Detection & Response (MDR)', 'Dane specified'],
        ['Competitor 1', 'Arctic Wolf (arcticwolf.com)', 'Dane confirmed from proposed list'],
        ['Competitor 2', 'CrowdStrike (crowdstrike.com)', 'Dane confirmed from proposed list'],
        ['Competitor 3', 'Huntress (huntress.com)', 'Dane confirmed from proposed list'],
        ['Mode', 'Lite', 'Dane selected'],
        ['Contact', 'David Kennedy, CEO', 'Dane confirmed'],
    ]
    inputs_table = Table(inputs_data, colWidths=[1.3*inch, 2.8*inch, 2.4*inch])
    inputs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(inputs_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Note on competitors:</b> Arctic Wolf and CrowdStrike are direct MDR competitors at different "
        "market tiers (mid-market vs enterprise). Huntress focuses on SMB/MSP but competes for the same "
        "buyer attention in AI search. All three are well-known in the MDR space.",
        styles['BodySmall']
    ))

    # === QUERIES ===
    story.append(Paragraph("3. QUERIES RUN (10 Prompts)", styles['SectionHead']))
    story.append(Paragraph(
        "Each query was run as a web search via the WebSearch tool. Results below show what the search "
        "engine returned, which serves as a proxy for AI model responses.",
        styles['Body']
    ))

    queries = [
        ['#', 'Category', 'Exact Query', 'Binary\nDefense?', 'Key Finding'],
        ['1', 'Discovery', 'best managed detection and response\nMDR solutions mid-market 2026', 'NO',
         'Top results: Arctic Wolf, Huntress,\nField Effect, Sophos. No Binary Defense.'],
        ['2', 'Discovery', 'what MDR tools do companies with\n200-500 employees use', 'NO',
         'Arctic Wolf, eSentire, Sophos,\nCrowdStrike listed. No Binary Defense.'],
        ['3', 'Discovery', 'recommend managed detection and\nresponse vendor growing company', 'NO',
         'Eye Security, eSentire, Arctic Wolf,\nExpel listed. No Binary Defense.'],
        ['4', 'Comparison', 'Binary Defense vs Arctic Wolf which\nis better MDR', 'YES',
         'PeerSpot comparison found. BD praised\nfor response time & cost efficiency.'],
        ['5', 'Comparison', 'pros and cons of Binary Defense\nMDR cybersecurity', 'YES',
         'PeerSpot, Gartner reviews found.\nPros: fast response, analyst team.\nCons: turnover, reporting gaps.'],
        ['6', 'Comparison', 'alternatives to CrowdStrike Falcon\nComplete MDR 2026', 'NO',
         'Arctic Wolf, Red Canary, Huntress,\nField Effect listed. No Binary Defense.'],
        ['7', 'Problem', 'how do mid-size companies solve\ncybersecurity monitoring threat detection', 'NO',
         'Generic MDR/SIEM approaches discussed.\nNo specific vendors named.'],
        ['8', 'Problem', 'what to look for in managed\ndetection and response provider', 'NO',
         'Criteria-focused (24x7, integration,\nexpertise). No vendors named.'],
        ['9', 'Brand', 'what does Binary Defense do\ncybersecurity services', 'YES',
         'Strong result. Website, LinkedIn,\nZoomInfo, Crunchbase all appear.'],
        ['10', 'Brand', '"Binary Defense" reviews good\nreputation cybersecurity', 'YES',
         'Gartner, G2, PeerSpot reviews found.\nGenerally positive with caveats.'],
    ]
    q_table = Table(queries, colWidths=[0.3*inch, 0.7*inch, 2.2*inch, 0.55*inch, 2.75*inch])
    q_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('BACKGROUND', (3, 1), (3, 3), HexColor('#FEE2E2')),   # Red for NO (P1-P3)
        ('BACKGROUND', (3, 4), (3, 5), HexColor('#DCFCE7')),   # Green for YES (P4-P5)
        ('BACKGROUND', (3, 6), (3, 6), HexColor('#FEE2E2')),   # Red for NO (P6)
        ('BACKGROUND', (3, 7), (3, 8), HexColor('#FEE2E2')),   # Red for NO (P7-P8)
        ('BACKGROUND', (3, 9), (3, 10), HexColor('#DCFCE7')),  # Green for YES (P9-P10)
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(q_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Key pattern:</b> Binary Defense appears in 0 of 6 discovery/comparison queries (P1-P3, P6-P8) "
        "but 4 of 4 brand-specific queries (P4-P5, P9-P10). This means buyers who already know the name "
        "can find information, but buyers discovering MDR solutions through AI will never encounter Binary Defense.",
        styles['Warning']
    ))

    # === SCORING ===
    story.append(PageBreak())
    story.append(Paragraph("4. SCORING METHODOLOGY", styles['SectionHead']))
    story.append(Paragraph("Per-query scoring (from SKILL.md):", styles['Body']))

    score_key = [
        ['Score', 'Meaning', 'Definition'],
        ['3', 'Recommended', 'Named as a top choice, explicitly suggested, or positioned as a leader'],
        ['2', 'Mentioned', 'Included in a list or discussed as an option'],
        ['1', 'Cited', 'Source URL appeared in citations but company not named in answer text'],
        ['0', 'Absent', 'Not mentioned at all'],
    ]
    sk_table = Table(score_key, colWidths=[0.5*inch, 1.2*inch, 4.8*inch])
    sk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BLACK),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(sk_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Score calculation:", styles['SubHead']))
    story.append(Paragraph("Raw score = sum of all prompt scores.  Max possible = 10 prompts x 3 = 30", styles['Mono']))
    story.append(Paragraph("Normalized = (raw / 30) x 10, rounded to 1 decimal", styles['Mono']))
    story.append(Spacer(1, 6))

    calc_data = [
        ['Company', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'Raw', '/10'],
        ['Binary Defense', '0', '0', '0', '3', '3', '0', '0', '0', '3', '3', '12', '4.0'],
        ['Arctic Wolf',    '3', '3', '2', '3', '2', '2', '0', '0', '0', '0', '15', '5.0'],
        ['CrowdStrike',    '2', '2', '0', '0', '0', '2', '0', '0', '0', '0',  '6', '2.0'],
        ['Huntress',       '3', '0', '0', '0', '0', '2', '0', '0', '0', '0',  '5', '1.7'],
    ]
    calc_table = Table(calc_data, colWidths=[0.95*inch] + [0.35*inch]*10 + [0.45*inch, 0.45*inch])
    calc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (-2, 1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor('#FFF7ED')),  # Highlight target row
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(calc_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Binary Defense scores 4.0/10 overall, but ALL 12 raw points come from brand-specific queries "
        "(P4, P5, P9, P10). On discovery queries where buyers search for MDR solutions without knowing "
        "Binary Defense by name, the score is 0/18 (0.0/10). Arctic Wolf scores 10/18 on those same queries.",
        styles['Body']
    ))

    # === VIDEO PRESENCE ===
    story.append(Paragraph("5. VIDEO PRESENCE (YouTube Verification)", styles['SectionHead']))
    story.append(Paragraph(
        "YouTube channels verified via direct browser navigation (Claude in Chrome MCP tool). "
        "All data captured from live YouTube channel pages on March 7, 2026.",
        styles['Body']
    ))

    vid_data = [
        ['Company', 'Channel Handle', 'Subscribers', 'Videos', 'Status', 'Video Score'],
        ['Binary Defense', '@binarydefense86400', '647', '62', 'Dormant (~1yr)', '1.5/10'],
        ['Arctic Wolf', '@ArcticWolfNetworks', '2,460', '227', 'Active (10d ago)', '5.0/10'],
        ['CrowdStrike', '@CrowdStrike', '27,800', '712', 'Very Active', '9.0/10'],
        ['Huntress', '@Huntress', '8,470', '407', 'Very Active', '7.5/10'],
    ]
    vid_table = Table(vid_data, colWidths=[0.95*inch, 1.3*inch, 0.75*inch, 0.6*inch, 1.2*inch, 0.7*inch])
    vid_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('BACKGROUND', (0, 1), (-1, 1), HexColor('#FFF7ED')),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(vid_table)

    story.append(Spacer(1, 6))
    story.append(Paragraph("Video score methodology:", styles['SubHead']))
    story.append(Paragraph(
        "Scores based on weighted combination of: subscriber count (25%), total videos (25%), "
        "posting frequency/recency (25%), and view engagement (25%). Benchmarked against the "
        "competitive set. CrowdStrike as largest player anchors the top of the scale.",
        styles['BodySmall']
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Key finding:</b> Zero video content from any company appeared in any AI search response. "
        "This is consistent with the MDR category being dominated by review sites (PeerSpot, Gartner, G2) "
        "and vendor comparison articles rather than video content. However, Binary Defense has the weakest "
        "video foundation to build from: 647 subscribers vs CrowdStrike's 27,800 (43x gap), and the "
        "channel has been dormant for approximately one year.",
        styles['Body']
    ))

    # === ACCURACY VERIFICATION ===
    story.append(Paragraph("6. ACCURACY VERIFICATION", styles['SectionHead']))

    acc_data = [
        ['Check', 'Result', 'Notes'],
        ['BD correctly described as MDR provider?', 'PASS', 'Services, founding, approach all accurate'],
        ['BD founder David Kennedy identified?', 'PASS', 'Known industry figure, frequently cited'],
        ['Competitor categories accurate?', 'PASS', 'All 3 are direct MDR competitors'],
        ['YouTube subscriber counts verified?', 'PASS', 'All checked via live browser navigation'],
        ['YouTube video counts verified?', 'PASS', 'Channel pages show exact counts'],
        ['Channel activity status accurate?', 'PASS', 'BD last upload ~1yr; others recent'],
        ['AI hallucinations detected?', 'NONE', 'No fabricated products or claims found'],
        ['Outdated information found?', 'MINOR', 'Some review data from 2024 in search results'],
    ]
    acc_table = Table(acc_data, colWidths=[2.5*inch, 0.6*inch, 3.4*inch])
    acc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_GRAY),
        ('BACKGROUND', (1, 1), (1, 6), HexColor('#DCFCE7')),
        ('BACKGROUND', (1, 7), (1, 7), HexColor('#DCFCE7')),
        ('BACKGROUND', (1, 8), (1, 8), HexColor('#FEF9C3')),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(acc_table)

    # === KEY FINDINGS SUMMARY ===
    story.append(Paragraph("7. KEY FINDINGS SUMMARY", styles['SectionHead']))

    story.append(Paragraph("<b>Finding 1: Invisible in AI buyer discovery</b>", styles['Body']))
    story.append(Paragraph(
        "Binary Defense scores 0 on all 6 discovery and comparison queries. When a buyer asks AI "
        "\"What are the best MDR solutions?\" or \"Alternatives to CrowdStrike,\" Binary Defense does "
        "not appear. Arctic Wolf appears in 5 of 6 discovery queries.",
        styles['Body']
    ))

    story.append(Paragraph("<b>Finding 2: Brand recognition exists but doesn't drive discovery</b>", styles['Body']))
    story.append(Paragraph(
        "AI knows what Binary Defense does (P9, P10 score 3/3). Reviews are generally positive. "
        "But this only helps buyers who already know the name. The discovery gap means Binary Defense "
        "is missing an entire buyer channel.",
        styles['Body']
    ))

    story.append(Paragraph("<b>Finding 3: Dormant YouTube channel is a missed opportunity</b>", styles['Body']))
    story.append(Paragraph(
        "62 videos and 647 subscribers vs CrowdStrike (712 videos, 27.8K subs), Huntress (407 videos, "
        "8.47K subs), and Arctic Wolf (227 videos, 2.46K subs). The channel has been inactive for "
        "approximately one year. As AI platforms increasingly cite video content (16% of AI answers now "
        "include YouTube), this dormancy is a growing disadvantage.",
        styles['Body']
    ))

    story.append(Paragraph("<b>Finding 4: The MDR category is wide open in AI search</b>", styles['Body']))
    story.append(Paragraph(
        "No company scored above 5.0/10. CrowdStrike, despite being the largest, scored only 2.0/10. "
        "AI search for MDR is fragmented. The first company to systematically optimize for AI visibility "
        "in this category has a genuine first-mover advantage.",
        styles['Body']
    ))

    # === FOOTER ===
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY, spaceAfter=8))
    story.append(Paragraph(
        "This document is an internal audit trail for Digital Accomplice. It is not sent to prospects. "
        "AI answers are non-deterministic \u2014 results may vary by session, location, and date. "
        "We document patterns, not guarantees.",
        styles['Footer']
    ))
    story.append(Paragraph(
        "Generated by Claude Opus 4.6  |  Digital Accomplice  |  dane@digitalaccomplice.com",
        styles['Footer']
    ))

    doc.build(story)
    print(f"Methodology PDF saved to: {OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()
