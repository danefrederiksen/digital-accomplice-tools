const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
        WidthType, ShadingType, PageNumber, PageBreak, TabStopType, TabStopPosition } = require('docx');
const fs = require('fs');

const DA_ORANGE = "F8901E";
const DA_BLACK = "000000";
const DA_BLUEGRAY = "5A6B7A";
const DA_GRAY = "CBCBCB";
const DA_LIGHTGRAY = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: DA_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const cellPad = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: DA_BLACK, type: ShadingType.CLEAR },
    margins: cellPad,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: WHITE })] })],
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { fill: DA_LIGHTGRAY, type: ShadingType.CLEAR } : undefined,
    margins: cellPad,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), font: "Arial", size: 20, bold: !!opts.bold, color: opts.color || DA_BLACK })],
    })],
  });
}

function accentCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: DA_ORANGE, type: ShadingType.CLEAR },
    margins: cellPad,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.RIGHT,
      children: [new TextRun({ text: String(text), font: "Arial", size: 20, bold: true, color: WHITE })],
    })],
  });
}

function spacer(h = 100) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

function heading(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DA_ORANGE, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: DA_BLACK })],
  });
}

function subheading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: DA_BLUEGRAY })],
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: DA_BLACK })],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [
    // ========== PAGE 1: TITLE + EXECUTIVE SUMMARY ==========
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1200, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: DA_ORANGE, space: 6 } },
            children: [
              new TextRun({ text: "DIGITAL ACCOMPLICE", font: "Arial", size: 16, bold: true, color: DA_ORANGE }),
              new TextRun({ text: "  |  Weekly Build Report", font: "Arial", size: 16, color: DA_BLUEGRAY }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: DA_GRAY, space: 4 } },
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: DA_BLUEGRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: DA_BLUEGRAY }),
            ],
          })],
        }),
      },
      children: [
        // Title block
        new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: "WEEKLY BUILD REPORT", font: "Arial", size: 40, bold: true, color: DA_BLACK })],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: "March 1 \u2013 5, 2026", font: "Arial", size: 28, color: DA_ORANGE })],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "Prepared for Dane Frederiksen  |  Digital Accomplice", font: "Arial", size: 20, color: DA_BLUEGRAY })],
        }),

        // Hero stats row
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: DA_BLACK, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "26,502", font: "Arial", size: 44, bold: true, color: DA_ORANGE })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Lines of Code + Docs", font: "Arial", size: 18, color: WHITE })] }),
                ],
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: DA_ORANGE, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "14", font: "Arial", size: 44, bold: true, color: WHITE })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Applications Built", font: "Arial", size: 18, color: WHITE })] }),
                ],
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: DA_BLACK, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4.6x", font: "Arial", size: 44, bold: true, color: DA_ORANGE })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Outreach Capacity Increase", font: "Arial", size: 18, color: WHITE })] }),
                ],
              }),
            ],
          })],
        }),

        spacer(300),

        heading("Executive Summary"),
        bodyText("In 5 days, we built a complete prospecting infrastructure: 11 channel-specific outreach tools, a unified comment queue, and a templatized AI Visibility Snapshot generator. The system holds 1,396 total prospects across all tools and increases outreach capacity from ~65 touches/week to 225\u2013300/week."),
        spacer(),

        // ========== SECTION: TIME INVESTMENT ==========
        heading("Time Investment"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4000, 2680, 2680],
          rows: [
            new TableRow({ children: [headerCell("Day", 4000), headerCell("Hours (Est.)", 2680), headerCell("Primary Work", 2680)] }),
            new TableRow({ children: [dataCell("Saturday, Mar 1", 4000), dataCell("8\u20139", 2680, { align: AlignmentType.CENTER }), dataCell("Tools #1\u201311 + start-all", 2680)] }),
            new TableRow({ children: [dataCell("Sunday, Mar 2", 4000, { shade: true }), dataCell("5\u20136", 2680, { shade: true, align: AlignmentType.CENTER }), dataCell("2nd-connection scripts, data loading", 2680, { shade: true })] }),
            new TableRow({ children: [dataCell("Monday, Mar 3", 4000), dataCell("5\u20136", 2680, { align: AlignmentType.CENTER }), dataCell("Tool polish, brand guidelines, Comment Queue", 2680)] }),
            new TableRow({ children: [dataCell("Tuesday, Mar 4", 4000, { shade: true }), dataCell("4\u20135", 2680, { shade: true, align: AlignmentType.CENTER }), dataCell("Snapshot methodology + pilot research", 2680, { shade: true })] }),
            new TableRow({ children: [dataCell("Wednesday, Mar 5", 4000), dataCell("4\u20135", 2680, { align: AlignmentType.CENTER }), dataCell("Snapshot generator + exports + agent v2", 2680)] }),
            new TableRow({ children: [
              dataCell("TOTAL", 4000, { bold: true }),
              accentCell("26\u201331 hrs", 2680),
              dataCell("", 2680),
            ] }),
          ],
        }),

        spacer(200),

        // ========== PAGE BREAK ==========
        new Paragraph({ children: [new PageBreak()] }),

        // ========== SECTION: CODE OUTPUT ==========
        heading("Code Output"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5000, 2180, 2180],
          rows: [
            new TableRow({ children: [headerCell("Component", 5000), headerCell("Files", 2180), headerCell("Lines of Code", 2180)] }),
            new TableRow({ children: [dataCell("11 Prospecting Tools (HTML + JS servers)", 5000), dataCell("23", 2180, { align: AlignmentType.CENTER }), dataCell("16,614", 2180, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Main Dashboard (warming-app)", 5000, { shade: true }), dataCell("2", 2180, { shade: true, align: AlignmentType.CENTER }), dataCell("3,076", 2180, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("AI Visibility Snapshot Generator", 5000), dataCell("5", 2180, { align: AlignmentType.CENTER }), dataCell("1,950", 2180, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Utility Scripts (import, finder, stress test)", 5000, { shade: true }), dataCell("6", 2180, { shade: true, align: AlignmentType.CENTER }), dataCell("1,556", 2180, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Documentation & Plans", 5000), dataCell("11", 2180, { align: AlignmentType.CENTER }), dataCell("3,306", 2180, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [
              dataCell("TOTAL", 5000, { bold: true }),
              dataCell("47", 2180, { bold: true, align: AlignmentType.CENTER }),
              accentCell("26,502", 2180),
            ] }),
          ],
        }),

        spacer(200),

        // ========== SECTION: PROSPECT DATA ==========
        heading("Prospect Pipeline (Quantified)"),
        subheading("Main Dashboard"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            new TableRow({ children: [headerCell("Status", 4680), headerCell("Count", 2340), headerCell("% of Total", 2340)] }),
            new TableRow({ children: [dataCell("New (triage queue)", 4680), dataCell("997", 2340, { align: AlignmentType.CENTER }), dataCell("99.4%", 2340, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Outreach Sent", 4680, { shade: true }), dataCell("4", 2340, { shade: true, align: AlignmentType.CENTER }), dataCell("0.4%", 2340, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Warming", 4680), dataCell("2", 2340, { align: AlignmentType.CENTER }), dataCell("0.2%", 2340, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [
              dataCell("TOTAL", 4680, { bold: true }),
              accentCell("1,003", 2340),
              dataCell("", 2340),
            ] }),
          ],
        }),

        spacer(100),
        subheading("By Tier (Main Dashboard)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            new TableRow({ children: [headerCell("Tier", 4680), headerCell("Count", 2340), headerCell("% of Total", 2340)] }),
            new TableRow({ children: [dataCell("Tier 1 (highest priority)", 4680), dataCell("541", 2340, { align: AlignmentType.CENTER }), dataCell("53.9%", 2340, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Tier 2", 4680, { shade: true }), dataCell("263", 2340, { shade: true, align: AlignmentType.CENTER }), dataCell("26.2%", 2340, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("Tier 3", 4680), dataCell("199", 2340, { align: AlignmentType.CENTER }), dataCell("19.8%", 2340, { align: AlignmentType.CENTER })] }),
          ],
        }),

        spacer(100),
        subheading("Channel Tools (Loaded This Week)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1500, 1500, 1480, 1380],
          rows: [
            new TableRow({ children: [
              headerCell("Tool", 3500), headerCell("Prospects", 1500), headerCell("DMs Sent", 1500), headerCell("Follow-Ups", 1480), headerCell("Actions", 1380),
            ] }),
            new TableRow({ children: [dataCell("#1 B2B 1st Conn", 3500), dataCell("35", 1500, { align: AlignmentType.CENTER }), dataCell("31", 1500, { align: AlignmentType.CENTER }), dataCell("8", 1480, { align: AlignmentType.CENTER }), dataCell("68", 1380, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#2 Cyber 1st Conn", 3500, { shade: true }), dataCell("11", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("3", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("8", 1480, { shade: true, align: AlignmentType.CENTER }), dataCell("36", 1380, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#3 B2B 2nd Conn", 3500), dataCell("30", 1500, { align: AlignmentType.CENTER }), dataCell("\u2014", 1500, { align: AlignmentType.CENTER }), dataCell("\u2014", 1480, { align: AlignmentType.CENTER }), dataCell("32", 1380, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#4 Cyber 2nd Conn", 3500, { shade: true }), dataCell("234", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("\u2014", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1", 1480, { shade: true, align: AlignmentType.CENTER }), dataCell("157", 1380, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#5 Referral 1st", 3500), dataCell("58", 1500, { align: AlignmentType.CENTER }), dataCell("4", 1500, { align: AlignmentType.CENTER }), dataCell("\u2014", 1480, { align: AlignmentType.CENTER }), dataCell("24", 1380, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#6 Referral 2nd", 3500, { shade: true }), dataCell("25", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("\u2014", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("5", 1480, { shade: true, align: AlignmentType.CENTER }), dataCell("5", 1380, { shade: true, align: AlignmentType.CENTER })] }),
            new TableRow({ children: [dataCell("#11 Comment Queue", 3500), dataCell("\u2014", 1500, { align: AlignmentType.CENTER }), dataCell("\u2014", 1500, { align: AlignmentType.CENTER }), dataCell("\u2014", 1480, { align: AlignmentType.CENTER }), dataCell("13", 1380, { align: AlignmentType.CENTER })] }),
            new TableRow({ children: [
              dataCell("TOTAL", 3500, { bold: true }),
              accentCell("393", 1500),
              dataCell("38", 1500, { bold: true, align: AlignmentType.CENTER }),
              dataCell("22", 1480, { bold: true, align: AlignmentType.CENTER }),
              accentCell("335", 1380),
            ] }),
          ],
        }),

        spacer(100),
        bodyText("Combined prospect count across all systems: 1,003 (dashboard) + 393 (channel tools) = 1,396 total prospects under management."),

        new Paragraph({ children: [new PageBreak()] }),

        // ========== SECTION: TOOLS BUILT ==========
        heading("11 Prospecting Tools Built"),
        bodyText("Each tool is a single-file HTML app with its own Node.js server, JSON data store, and DA brand styling. All run simultaneously via start-all.js."),
        spacer(50),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [600, 3260, 1500, 1500, 2500],
          rows: [
            new TableRow({ children: [headerCell("#", 600), headerCell("Tool Name", 3260), headerCell("Port", 1500), headerCell("Lines", 1500), headerCell("Channel", 2500)] }),
            new TableRow({ children: [dataCell("1", 600), dataCell("B2B 1st Connections DM", 3260), dataCell("3851", 1500, { align: AlignmentType.CENTER }), dataCell("1,285", 1500, { align: AlignmentType.CENTER }), dataCell("LinkedIn DM", 2500)] }),
            new TableRow({ children: [dataCell("2", 600, { shade: true }), dataCell("Cyber 1st Connections DM", 3260, { shade: true }), dataCell("3852", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1,357", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("LinkedIn DM", 2500, { shade: true })] }),
            new TableRow({ children: [dataCell("3", 600), dataCell("B2B 2nd Connections", 3260), dataCell("3853", 1500, { align: AlignmentType.CENTER }), dataCell("1,402", 1500, { align: AlignmentType.CENTER }), dataCell("LinkedIn Connect + DM", 2500)] }),
            new TableRow({ children: [dataCell("4", 600, { shade: true }), dataCell("Cyber 2nd Connections", 3260, { shade: true }), dataCell("3854", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1,400", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("LinkedIn Connect + DM", 2500, { shade: true })] }),
            new TableRow({ children: [dataCell("5", 600), dataCell("Referral Partner 1st Conn", 3260), dataCell("3855", 1500, { align: AlignmentType.CENTER }), dataCell("1,285", 1500, { align: AlignmentType.CENTER }), dataCell("LinkedIn DM", 2500)] }),
            new TableRow({ children: [dataCell("6", 600, { shade: true }), dataCell("Referral Partner 2nd Conn", 3260, { shade: true }), dataCell("3856", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1,429", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("LinkedIn Connect + DM", 2500, { shade: true })] }),
            new TableRow({ children: [dataCell("7", 600), dataCell("B2B Leads w/ Emails", 3260), dataCell("3857", 1500, { align: AlignmentType.CENTER }), dataCell("1,319", 1500, { align: AlignmentType.CENTER }), dataCell("Email", 2500)] }),
            new TableRow({ children: [dataCell("8", 600, { shade: true }), dataCell("Cyber Leads w/ Emails", 3260, { shade: true }), dataCell("3858", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1,319", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("Email", 2500, { shade: true })] }),
            new TableRow({ children: [dataCell("9", 600), dataCell("Substack Subscriber Emails", 3260), dataCell("3859", 1500, { align: AlignmentType.CENTER }), dataCell("1,314", 1500, { align: AlignmentType.CENTER }), dataCell("Email", 2500)] }),
            new TableRow({ children: [dataCell("10", 600, { shade: true }), dataCell("Customers w/ Emails", 3260, { shade: true }), dataCell("3860", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("1,391", 1500, { shade: true, align: AlignmentType.CENTER }), dataCell("Email", 2500, { shade: true })] }),
            new TableRow({ children: [dataCell("11", 600), dataCell("Comment Queue (unified)", 3260), dataCell("3861", 1500, { align: AlignmentType.CENTER }), dataCell("3,040", 1500, { align: AlignmentType.CENTER }), dataCell("LinkedIn Comments", 2500)] }),
          ],
        }),

        spacer(200),

        // ========== SECTION: AI SNAPSHOT ==========
        heading("AI Visibility Snapshot Generator"),
        bodyText("Rebuilt from concept to production-ready tool. Form-based UI generates branded one-page PDF and DM infographic JPG for any company in under 5 minutes."),
        spacer(50),

        subheading("Pilot Data: Hinge Marketing"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [headerCell("Metric", 4680), headerCell("Result", 4680)] }),
            new TableRow({ children: [dataCell("Queries tested (ChatGPT + Perplexity)", 4680), dataCell("20", 4680, { bold: true })] }),
            new TableRow({ children: [dataCell("Hinge mention score", 4680, { shade: true }), dataCell("7.0 / 10", 4680, { shade: true, bold: true })] }),
            new TableRow({ children: [dataCell("Top competitor (Rattleback)", 4680), dataCell("1.8 / 10", 4680)] }),
            new TableRow({ children: [dataCell("Jumpfactor score", 4680, { shade: true }), dataCell("0.0 / 10", 4680, { shade: true })] }),
            new TableRow({ children: [dataCell("Edge Marketing score", 4680), dataCell("0.3 / 10", 4680)] }),
            new TableRow({ children: [dataCell("Hinge YouTube videos", 4680, { shade: true }), dataCell("332 (1.53K subscribers)", 4680, { shade: true, bold: true })] }),
            new TableRow({ children: [dataCell("Videos cited in any AI answer", 4680), dataCell("0 out of 332", 4680, { bold: true, color: DA_ORANGE })] }),
            new TableRow({ children: [dataCell("Deliverables generated", 4680, { shade: true }), dataCell("PDF + JPG (automated export)", 4680, { shade: true })] }),
          ],
        }),

        spacer(100),
        subheading("Generator Specs"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [headerCell("Component", 4680), headerCell("Detail", 4680)] }),
            new TableRow({ children: [dataCell("Input form fields", 4680), dataCell("19", 4680)] }),
            new TableRow({ children: [dataCell("Auto-generated text sections", 4680, { shade: true }), dataCell("9 (header through methodology)", 4680, { shade: true })] }),
            new TableRow({ children: [dataCell("Export formats", 4680), dataCell("PDF (letter-size) + JPG (social DM)", 4680)] }),
            new TableRow({ children: [dataCell("Export method", 4680, { shade: true }), dataCell("Chrome headless via Node server", 4680, { shade: true })] }),
            new TableRow({ children: [dataCell("Code", 4680), dataCell("1,950 lines across 5 files", 4680)] }),
            new TableRow({ children: [dataCell("Port", 4680, { shade: true }), dataCell("3850", 4680, { shade: true })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ========== SECTION: DELIVERABLES ==========
        heading("Deliverables Produced This Week"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [600, 5260, 3500],
          rows: [
            new TableRow({ children: [headerCell("#", 600), headerCell("Deliverable", 5260), headerCell("Format", 3500)] }),
            new TableRow({ children: [dataCell("1", 600), dataCell("11 prospecting tool apps", 5260), dataCell("HTML + Node.js", 3500)] }),
            new TableRow({ children: [dataCell("2", 600, { shade: true }), dataCell("start-all.js launcher", 5260, { shade: true }), dataCell("Node.js", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("3", 600), dataCell("AI Visibility Snapshot Generator", 5260), dataCell("HTML + Node.js", 3500)] }),
            new TableRow({ children: [dataCell("4", 600, { shade: true }), dataCell("Hinge Marketing AI Snapshot", 5260, { shade: true }), dataCell("PDF + JPG + HTML", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("5", 600), dataCell("DA Brand Guidelines", 5260), dataCell("PDF + HTML", 3500)] }),
            new TableRow({ children: [dataCell("6", 600, { shade: true }), dataCell("Prospecting Tools Action Plan", 5260, { shade: true }), dataCell("HTML", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("7", 600), dataCell("DA Offers Testing Playbook", 5260), dataCell("DOCX", 3500)] }),
            new TableRow({ children: [dataCell("8", 600, { shade: true }), dataCell("DA System Documentation", 5260, { shade: true }), dataCell("Markdown", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("9", 600), dataCell("Prospect Tools Status Report", 5260), dataCell("HTML", 3500)] }),
            new TableRow({ children: [dataCell("10", 600, { shade: true }), dataCell("Comment Queue Design Doc", 5260, { shade: true }), dataCell("Markdown", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("11", 600), dataCell("Daily Outreach Plan", 5260), dataCell("Markdown", 3500)] }),
            new TableRow({ children: [dataCell("12", 600, { shade: true }), dataCell("Competitive Video Research Agent v2", 5260, { shade: true }), dataCell("Markdown (prompt)", 3500, { shade: true })] }),
            new TableRow({ children: [dataCell("13", 600), dataCell("2nd-Connection Finder scripts (3 versions)", 5260), dataCell("Node.js", 3500)] }),
            new TableRow({ children: [dataCell("14", 600, { shade: true }), dataCell("Stress test suite (Tool #11)", 5260, { shade: true }), dataCell("Node.js", 3500, { shade: true })] }),
          ],
        }),
        spacer(50),
        bodyText("Total files created or modified this week: 47. Total deliverable artifacts: 21 (counting PDFs, JPGs, DOCXs, HTMLs)."),

        spacer(200),

        // ========== SECTION: CAPACITY IMPACT ==========
        heading("Business Impact: Outreach Capacity"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [headerCell("Metric", 3120), headerCell("Before (Feb 28)", 3120), headerCell("After (Mar 5)", 3120)] }),
            new TableRow({ children: [dataCell("Outreach tools", 3120), dataCell("1 (manual tracking)", 3120, { align: AlignmentType.CENTER }), dataCell("11 (dedicated per channel)", 3120, { align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Touches per week", 3120, { shade: true }), dataCell("~65", 3120, { shade: true, align: AlignmentType.CENTER }), dataCell("225\u2013300", 3120, { shade: true, align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Capacity increase", 3120), dataCell("\u2014", 3120, { align: AlignmentType.CENTER }), accentCell("3.5\u20134.6x", 3120)] }),
            new TableRow({ children: [dataCell("LinkedIn DMs/day", 3120, { shade: true }), dataCell("~3", 3120, { shade: true, align: AlignmentType.CENTER }), dataCell("Up to 30 (platform cap)", 3120, { shade: true, align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Emails/day", 3120), dataCell("~5\u20138", 3120, { align: AlignmentType.CENTER }), dataCell("15\u201328", 3120, { align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Prospects under management", 3120, { shade: true }), dataCell("988", 3120, { shade: true, align: AlignmentType.CENTER }), dataCell("1,396", 3120, { shade: true, align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Channels tracked", 3120), dataCell("1 (LinkedIn DMs only)", 3120, { align: AlignmentType.CENTER }), dataCell("4 (DM, Connect, Email, Comments)", 3120, { align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Sales collateral generator", 3120, { shade: true }), dataCell("No", 3120, { shade: true, align: AlignmentType.CENTER }), dataCell("Yes (PDF + JPG in <5 min)", 3120, { shade: true, align: AlignmentType.CENTER, bold: true })] }),
            new TableRow({ children: [dataCell("Daily time saved (tracking overhead)", 3120), dataCell("\u2014", 3120, { align: AlignmentType.CENTER }), dataCell("30\u201345 min/day", 3120, { align: AlignmentType.CENTER, bold: true })] }),
          ],
        }),

        spacer(200),

        // ========== SECTION: WHAT'S NEXT ==========
        heading("What\u2019s Next"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Load remaining prospect data into email tools (#7\u201310)", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "First full week of daily outreach using all 11 tools (target: 225+ touches)", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Generate 3\u20135 AI Visibility Snapshots for top Tier 1 prospects", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Friday weekly review: first real metrics from the pipeline", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Track reply rates to validate offer-market fit across segments", font: "Arial", size: 20 })] }),

        spacer(300),

        // Bottom line
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [9360],
          rows: [new TableRow({
            children: [new TableCell({
              borders: noBorders,
              width: { size: 9360, type: WidthType.DXA },
              shading: { fill: DA_BLACK, type: ShadingType.CLEAR },
              margins: { top: 200, bottom: 200, left: 300, right: 300 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BOTTOM LINE", font: "Arial", size: 24, bold: true, color: DA_ORANGE })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "26,502 lines of code. 14 applications. 1,396 prospects loaded. 335 actions logged.", font: "Arial", size: 20, color: WHITE })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [new TextRun({ text: "Outreach capacity increased 4.6x. Infrastructure is built. Now it\u2019s about execution.", font: "Arial", size: 20, color: WHITE })] }),
              ],
            })],
          })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/danefrederiksen/Desktop/Claude code/DA_Weekly_Report_Mar1-5_2026.docx", buffer);
  console.log("Done. File written.");
});
