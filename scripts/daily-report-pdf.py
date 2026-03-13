#!/usr/bin/env python3
"""
Daily Prospecting Report — PDF Generator
DA-branded daily scorecard with pipeline snapshot and A/B test tracking.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import datetime
import os

# DA Brand Colors
DA_ORANGE = HexColor("#F38B1C")
DA_BLACK = HexColor("#000000")
DA_BLUE_GRAY = HexColor("#5A6B7A")
DA_GRAY = HexColor("#CBCBCB")
DA_WHITE = HexColor("#FFFFFF")
DA_LIGHT_GRAY = HexColor("#F5F5F5")
DA_GREEN = HexColor("#2ECC71")
DA_RED = HexColor("#E74C3C")
DA_YELLOW = HexColor("#F1C40F")

OUTPUT_DIR = "/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/daily reports"
DATE = "2026-03-11"
DATE_DISPLAY = "Tuesday, March 11, 2026"

# ── DATA ──
scorecard = {
    "DMs Sent": {"done": 34, "target": "3-4", "target_num": 4},
    "Follow-Ups Sent": {"done": 0, "target": "—", "target_num": 0},
    "Comments": {"done": 6, "target": "8", "target_num": 8},
    "Connection Requests": {"done": 0, "target": "5-6", "target_num": 6},
    "Emails Sent": {"done": 0, "target": "15-28", "target_num": 15},
    "Prospects Added": {"done": 175, "target": "—", "target_num": 0},
    "Prospects Removed": {"done": 7, "target": "—", "target_num": 0},
}
total_touches = 34 + 0 + 6 + 0 + 0  # DMs + follow-ups + comments + conn reqs + emails
total_target = "45-60"

pipeline = [
    ("Tool #1: B2B 1st DMs", 196, 136, 33, 27, 0, 0),
    ("Tool #2: Cyber 1st DMs", 154, 143, 0, 11, 0, 0),
    ("Tool #3: B2B 2nd DMs", 25, 24, 0, 0, 0, 1),
    ("Tool #4: Cyber 2nd DMs", 229, 221, 0, 0, 0, 8),
    ("Tool #5: Referral 1st", 46, 4, 38, 3, 1, 0),
    ("Tool #6: Referral 2nd", 30, 22, 0, 0, 0, 8),
    ("Tool #9: Substack", 155, 155, 0, 0, 0, 0),
    ("Tool #12: Referral Email", 1, 1, 0, 0, 0, 0),
]
# (name, total, not_started, dm_sent, follow_up, replied, conn_pending)

overdue = {"Tool #1: B2B 1st DMs": 7, "Tool #5: Referral 1st": 9}
overdue_total = 16

ab_model_a = [
    ("David Zeledon", "AthenaHQ", "Head of Growth"),
    ("Claire Umeda", "HOPPR", "VP Marketing & Comms"),
    ("Rachel Snowbeck", "Atmosera", "Dir of Marketing"),
    ("Mandy Dhaliwal", "Quiq", "Board of Directors"),
    ("Kaori Rei", "BytePlus", "Growth Content Strategy"),
]
ab_model_b = [
    ("Veronica Saron", "RelationalAI", "VP of Marketing"),
    ("Jane Perederey", "Forte DGTL", "Dir of Marketing & Comms"),
    ("Casie Abello", "ChaosTrack", "Advisor"),
    ("Dee Anna McPherson", "Shorthand", "Board Member"),
    ("Debbi Dougherty", "Mediavine", "SVP Marketing"),
]


def grade(done, target_num):
    if target_num == 0:
        return "—", DA_BLUE_GRAY
    ratio = done / target_num
    if ratio >= 1.0:
        return "A", DA_GREEN
    elif ratio >= 0.75:
        return "B", HexColor("#27AE60")
    elif ratio >= 0.5:
        return "C", DA_YELLOW
    elif ratio >= 0.25:
        return "D", DA_ORANGE
    else:
        return "F", DA_RED


def draw_bar(c, x, y, width, done, target_num, bar_height=12):
    if target_num == 0:
        return
    fill = min(done / target_num, 1.0)
    # Background
    c.setFillColor(HexColor("#E8E8E8"))
    c.roundRect(x, y, width, bar_height, 3, fill=1, stroke=0)
    # Fill
    g, color = grade(done, target_num)
    c.setFillColor(color)
    c.roundRect(x, y, width * fill, bar_height, 3, fill=1, stroke=0)


def build_pdf():
    filename = f"Daily_Report_{DATE}_Claude_Code.pdf"
    filepath = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    c = canvas.Canvas(filepath, pagesize=letter)
    W, H = letter
    margin = 0.6 * inch

    # ════════════════════════════════════════
    # PAGE 1 — SCORECARD
    # ════════════════════════════════════════

    # Header bar
    c.setFillColor(DA_BLACK)
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(DA_ORANGE)
    c.rect(0, H - 64, W, 4, fill=1, stroke=0)

    c.setFillColor(DA_WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, H - 40, "DAILY PROSPECTING REPORT")
    c.setFont("Helvetica", 11)
    c.drawRightString(W - margin, H - 35, DATE_DISPLAY)
    c.setFillColor(DA_ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(W - margin, H - 50, "DIGITAL ACCOMPLICE")

    y = H - 100

    # Overall grade
    overall_grade, overall_color = grade(total_touches, 45)
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin, y, "TODAY'S SCORECARD")

    # Big number box
    box_x = W - margin - 120
    c.setFillColor(overall_color)
    c.roundRect(box_x, y - 8, 120, 35, 5, fill=1, stroke=0)
    c.setFillColor(DA_WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(box_x + 60, y + 2, f"{total_touches} / {total_target}")
    c.setFont("Helvetica", 8)
    c.drawCentredString(box_x + 60, y - 6, "TOTAL TOUCHES")

    y -= 40

    # Scorecard table header
    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "METRIC")
    c.drawString(margin + 200, y, "DONE")
    c.drawString(margin + 250, y, "TARGET")
    c.drawString(margin + 310, y, "GRADE")
    c.drawString(margin + 360, y, "PROGRESS")

    c.setStrokeColor(DA_GRAY)
    c.setLineWidth(0.5)
    y -= 5
    c.line(margin, y, W - margin, y)
    y -= 18

    # Scorecard rows
    for metric, vals in scorecard.items():
        g, color = grade(vals["done"], vals["target_num"])

        c.setFillColor(DA_BLACK)
        c.setFont("Helvetica", 10)
        c.drawString(margin, y, metric)

        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin + 205, y, str(vals["done"]))

        c.setFont("Helvetica", 10)
        c.setFillColor(DA_BLUE_GRAY)
        c.drawString(margin + 255, y, str(vals["target"]))

        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin + 320, y, g)

        draw_bar(c, margin + 360, y - 2, 130, vals["done"], vals["target_num"])

        y -= 22

    # ── OVERDUE ALERT ──
    y -= 15
    if overdue_total > 0:
        c.setFillColor(HexColor("#FDF2F2"))
        c.roundRect(margin, y - 45, W - 2 * margin, 55, 5, fill=1, stroke=0)
        c.setStrokeColor(DA_RED)
        c.setLineWidth(2)
        c.roundRect(margin, y - 45, W - 2 * margin, 55, 5, fill=0, stroke=1)
        c.setLineWidth(0.5)

        c.setFillColor(DA_RED)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(margin + 12, y - 5, f"WARNING: {overdue_total} OVERDUE FOLLOW-UPS")

        c.setFillColor(DA_BLACK)
        c.setFont("Helvetica", 9)
        detail_y = y - 22
        for tool_name, count in overdue.items():
            c.drawString(margin + 20, detail_y, f"• {tool_name}: {count} overdue")
            detail_y -= 13

    y -= 75

    # ── A/B TEST SECTION ──
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin, y, "A/B DM TEST — March 11, 2026")
    y -= 5
    c.setStrokeColor(DA_ORANGE)
    c.setLineWidth(2)
    c.line(margin, y, margin + 220, y)
    c.setLineWidth(0.5)
    y -= 18

    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica", 9)
    c.drawString(margin, y, "Model A: AI Snapshot offer — pre-built, company-specific, video gap angle")
    y -= 13
    c.drawString(margin, y, "Model B: Competitor snapshot offer — \"send me your top 3 competitors\" CTA")
    y -= 20

    # Model A table
    c.setFillColor(DA_ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "MODEL A — 5 prospects")
    y -= 15

    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "NAME")
    c.drawString(margin + 150, y, "COMPANY")
    c.drawString(margin + 300, y, "TITLE")
    c.drawString(margin + 430, y, "STATUS")
    y -= 3
    c.setStrokeColor(DA_GRAY)
    c.line(margin, y, W - margin, y)
    y -= 14

    c.setFont("Helvetica", 9)
    for name, company, title in ab_model_a:
        c.setFillColor(DA_BLACK)
        c.drawString(margin, y, name)
        c.drawString(margin + 150, y, company)
        c.setFillColor(DA_BLUE_GRAY)
        c.drawString(margin + 300, y, title)
        c.setFillColor(DA_ORANGE)
        c.drawString(margin + 430, y, "DM Sent")
        y -= 14

    y -= 10

    # Model B table
    c.setFillColor(DA_ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "MODEL B — 5 prospects")
    y -= 15

    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "NAME")
    c.drawString(margin + 150, y, "COMPANY")
    c.drawString(margin + 300, y, "TITLE")
    c.drawString(margin + 430, y, "STATUS")
    y -= 3
    c.line(margin, y, W - margin, y)
    y -= 14

    c.setFont("Helvetica", 9)
    for name, company, title in ab_model_b:
        c.setFillColor(DA_BLACK)
        c.drawString(margin, y, name)
        c.drawString(margin + 150, y, company)
        c.setFillColor(DA_BLUE_GRAY)
        c.drawString(margin + 300, y, title)
        c.setFillColor(DA_ORANGE)
        c.drawString(margin + 430, y, "DM Sent")
        y -= 14

    y -= 10
    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(margin, y, "Track: reply rate, time-to-reply, reply quality. First check: March 14 (3 business days).")

    # Footer
    c.setFillColor(DA_GRAY)
    c.setFont("Helvetica", 7)
    c.drawString(margin, 30, f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')} PT — Digital Accomplice Prospecting System")
    c.drawRightString(W - margin, 30, "Page 1 of 2")

    # ════════════════════════════════════════
    # PAGE 2 — PIPELINE SNAPSHOT
    # ════════════════════════════════════════
    c.showPage()

    # Header bar
    c.setFillColor(DA_BLACK)
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(DA_ORANGE)
    c.rect(0, H - 64, W, 4, fill=1, stroke=0)

    c.setFillColor(DA_WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, H - 40, "PIPELINE SNAPSHOT")
    c.setFont("Helvetica", 11)
    c.drawRightString(W - margin, H - 35, DATE_DISPLAY)
    c.setFillColor(DA_ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(W - margin, H - 50, "DIGITAL ACCOMPLICE")

    y = H - 100

    # Total pipeline summary
    total_all = sum(p[1] for p in pipeline)
    total_not_started = sum(p[2] for p in pipeline)
    total_dm = sum(p[3] for p in pipeline)
    total_fu = sum(p[4] for p in pipeline)
    total_replied = sum(p[5] for p in pipeline)
    total_conn = sum(p[6] for p in pipeline)

    # Summary boxes
    box_w = 95
    box_h = 45
    boxes = [
        ("TOTAL", str(total_all), DA_BLACK),
        ("NOT STARTED", str(total_not_started), DA_BLUE_GRAY),
        ("DM SENT", str(total_dm), DA_ORANGE),
        ("FOLLOW-UP", str(total_fu), HexColor("#2980B9")),
        ("REPLIED", str(total_replied), DA_GREEN),
        ("CONN PENDING", str(total_conn), HexColor("#8E44AD")),
    ]

    box_x = margin
    for label, val, color in boxes:
        c.setFillColor(color)
        c.roundRect(box_x, y - box_h + 10, box_w - 5, box_h, 4, fill=1, stroke=0)
        c.setFillColor(DA_WHITE)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(box_x + (box_w - 5) / 2, y - 10, val)
        c.setFont("Helvetica", 7)
        c.drawCentredString(box_x + (box_w - 5) / 2, y - box_h + 14, label)
        box_x += box_w

    y -= box_h + 25

    # Pipeline table
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin, y, "TOOL-BY-TOOL BREAKDOWN")
    y -= 5
    c.setStrokeColor(DA_ORANGE)
    c.setLineWidth(2)
    c.line(margin, y, margin + 200, y)
    c.setLineWidth(0.5)
    y -= 20

    # Table header
    cols = [margin, margin + 155, margin + 210, margin + 270, margin + 340, margin + 400, margin + 460]
    headers = ["TOOL", "TOTAL", "NOT STARTED", "DM SENT", "FOLLOW-UP", "REPLIED", "CONN PEND"]

    c.setFillColor(DA_BLUE_GRAY)
    c.setFont("Helvetica-Bold", 8)
    for i, h in enumerate(headers):
        c.drawString(cols[i], y, h)

    y -= 4
    c.setStrokeColor(DA_GRAY)
    c.line(margin, y, W - margin, y)
    y -= 16

    # Table rows
    for row in pipeline:
        name, total, ns, dm, fu, rep, cp = row
        c.setFillColor(DA_BLACK)
        c.setFont("Helvetica", 9)
        c.drawString(cols[0], y, name)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(cols[1], y, str(total))
        c.setFillColor(DA_BLUE_GRAY)
        c.setFont("Helvetica", 10)
        c.drawString(cols[2], y, str(ns))
        c.setFillColor(DA_ORANGE)
        c.drawString(cols[3], y, str(dm))
        c.setFillColor(HexColor("#2980B9"))
        c.drawString(cols[4], y, str(fu))
        c.setFillColor(DA_GREEN)
        c.drawString(cols[5], y, str(rep))
        c.setFillColor(HexColor("#8E44AD"))
        c.drawString(cols[6], y, str(cp))
        y -= 18

    # Totals row
    y -= 3
    c.setStrokeColor(DA_BLACK)
    c.setLineWidth(1)
    c.line(margin, y + 12, W - margin, y + 12)
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(cols[0], y, "TOTALS")
    c.drawString(cols[1], y, str(total_all))
    c.drawString(cols[2], y, str(total_not_started))
    c.setFillColor(DA_ORANGE)
    c.drawString(cols[3], y, str(total_dm))
    c.setFillColor(HexColor("#2980B9"))
    c.drawString(cols[4], y, str(total_fu))
    c.setFillColor(DA_GREEN)
    c.drawString(cols[5], y, str(total_replied))
    c.setFillColor(HexColor("#8E44AD"))
    c.drawString(cols[6], y, str(total_conn))

    y -= 40

    # ── KEY OBSERVATIONS ──
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin, y, "KEY OBSERVATIONS")
    y -= 5
    c.setStrokeColor(DA_ORANGE)
    c.setLineWidth(2)
    c.line(margin, y, margin + 160, y)
    c.setLineWidth(0.5)
    y -= 18

    observations = [
        "DMs crushed target — 34 sent vs. 3-4 target (850%+ of daily goal). Massive import day.",
        "175 new prospects added to Tool #1 — pipeline is loaded for weeks of outreach.",
        f"{overdue_total} overdue follow-ups across Tools #1 and #5. These are leaking pipeline value.",
        "Zero connection requests, emails, or follow-ups sent today. Three channels untouched.",
        "6 comments logged — 75% of daily target. Close but not quite.",
        "A/B DM test launched: 5 Model A (snapshot offer) + 5 Model B (competitor CTA). First read: March 14.",
        f"836 total prospects across all tools. {total_not_started} not started — massive runway ahead.",
    ]

    c.setFont("Helvetica", 9)
    for obs in observations:
        c.setFillColor(DA_ORANGE)
        c.drawString(margin, y, "•")
        c.setFillColor(DA_BLACK)
        # Word wrap
        words = obs.split()
        line = ""
        x_start = margin + 12
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, "Helvetica", 9) > (W - 2 * margin - 15):
                c.drawString(x_start, y, line)
                y -= 13
                line = word
            else:
                line = test
        if line:
            c.drawString(x_start, y, line)
        y -= 18

    # ── TOMORROW'S PRIORITIES ──
    y -= 5
    c.setFillColor(DA_BLACK)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin, y, "PRIORITY ACTIONS")
    y -= 5
    c.setStrokeColor(DA_ORANGE)
    c.setLineWidth(2)
    c.line(margin, y, margin + 140, y)
    c.setLineWidth(0.5)
    y -= 18

    priorities = [
        "Clear overdue follow-ups — oldest first (Mar 4-5). Send or kill. Don't let them sit.",
        "Send 5-6 connection requests (Tools #3, #4, #6) — fill tomorrow's pipeline.",
        "Send 15+ emails across Substack, Cyber, and Referral Email tools.",
        "Hit 8 comments (Tool #11) — warm up 2nd connections before DMs.",
        "Check 17 pending connection requests — accept and DM anyone who connected.",
    ]

    c.setFont("Helvetica", 9)
    for i, p in enumerate(priorities):
        c.setFillColor(DA_ORANGE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margin, y, f"{i+1}.")
        c.setFillColor(DA_BLACK)
        c.setFont("Helvetica", 9)
        words = p.split()
        line = ""
        x_start = margin + 16
        for word in words:
            test = line + " " + word if line else word
            if c.stringWidth(test, "Helvetica", 9) > (W - 2 * margin - 20):
                c.drawString(x_start, y, line)
                y -= 13
                line = word
            else:
                line = test
        if line:
            c.drawString(x_start, y, line)
        y -= 16

    # Footer
    c.setFillColor(DA_GRAY)
    c.setFont("Helvetica", 7)
    c.drawString(margin, 30, f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')} PT — Digital Accomplice Prospecting System")
    c.drawRightString(W - margin, 30, "Page 2 of 2")

    c.save()
    print(f"PDF saved: {filepath}")
    return filepath


if __name__ == "__main__":
    build_pdf()
