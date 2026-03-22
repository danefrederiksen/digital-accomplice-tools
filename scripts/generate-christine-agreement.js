const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  Header, Footer, PageNumber, PageBreak
} = require("docx");

const DA_ORANGE = "F8901E";
const DARK = "1A1A1A";
const GRAY = "666666";
const LIGHT_BG = "FFF7EF";
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading(text, size = 28) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Inter", size, color: DARK })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: "Inter", size: 20, color: DARK, ...opts })],
  });
}

function bulletItem(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, font: "Inter", size: 20, bold: true, color: DARK }));
  }
  children.push(new TextRun({ text, font: "Inter", size: 20, color: DARK }));
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children,
  });
}

function sectionDivider() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: DA_ORANGE, space: 1 } },
    children: [],
  });
}

function signatureLine(name, role) {
  return [
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: DARK, space: 1 } },
      spacing: { after: 40 },
      children: [new TextRun({ text: " ", font: "Inter", size: 20 })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text: name, font: "Inter", size: 20, bold: true, color: DARK })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text: role, font: "Inter", size: 18, color: GRAY })],
    }),
    new Paragraph({
      spacing: { after: 0 },
      children: [new TextRun({ text: "Date: _______________", font: "Inter", size: 18, color: GRAY })],
    }),
  ];
}

async function generate() {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 0 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DA_ORANGE, space: 4 } },
              children: [
                new TextRun({ text: "DIGITAL ACCOMPLICE", font: "Inter", size: 18, bold: true, color: DA_ORANGE }),
                new TextRun({ text: "  |  Compensation Agreement", font: "Inter", size: 18, color: GRAY }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD", space: 4 } },
              children: [
                new TextRun({ text: "This is a mutual reference document, not a legal contract.  |  Page ", font: "Inter", size: 16, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Inter", size: 16, color: GRAY }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 40 },
          children: [new TextRun({ text: "Compensation & Revenue-Share Agreement", font: "Inter", size: 36, bold: true, color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Between Dane Frederiksen and Christine [Last Name]", font: "Inter", size: 22, color: GRAY })],
        }),

        // Effective Date + Role
        new Table({
          width: { size: 9720, type: WidthType.DXA },
          columnWidths: [4860, 4860],
          rows: [new TableRow({
            children: [
              new TableCell({
                borders: noBorders, width: { size: 4860, type: WidthType.DXA },
                children: [body("Effective Date: _______________")],
              }),
              new TableCell({
                borders: noBorders, width: { size: 4860, type: WidthType.DXA },
                children: [body("Entity: Digital Accomplice LLC")],
              }),
            ],
          })],
        }),

        sectionDivider(),

        // Christine's Role
        heading("Role & Responsibilities"),
        body("Christine serves as a strategic partner responsible for:"),
        bulletItem("Sales development and client acquisition"),
        bulletItem("Project management and delivery oversight"),
        bulletItem("Strategy and service package design"),
        bulletItem("Client support and relationship management"),

        sectionDivider(),

        // Phase 1
        heading("Phase 1: Revenue Build"),
        new Table({
          width: { size: 9720, type: WidthType.DXA },
          columnWidths: [3240, 6480],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Split", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("50/50 on gross profit (revenue minus COGS)")] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Base Pay", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("None")] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Duration", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Until Phase 2 trigger is met, or 6-month cap (see below)")] }),
            ]}),
          ],
        }),

        sectionDivider(),

        // Phase 2
        heading("Phase 2: Scaled Operations"),
        new Table({
          width: { size: 9720, type: WidthType.DXA },
          columnWidths: [3240, 6480],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Trigger", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("2 consecutive months at $10K+ total monthly revenue")] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Base Pay", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("$2,000/month")] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 3240, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("Commission", { bold: true })] }),
              new TableCell({ borders, width: { size: 6480, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [body("20% of gross profit on all revenue (recurring and new)")] }),
            ]}),
          ],
        }),

        sectionDivider(),

        // COGS
        heading("Approved COGS Categories"),
        body("The following are deducted from revenue before calculating gross profit:"),
        bulletItem("Freelance contractors and subcontractors"),
        bulletItem("Travel expenses (client-related)"),
        bulletItem("Gear rental"),
        bulletItem("Stock assets (footage, music, graphics)"),
        bulletItem("Third-party post-production"),
        body("Any expense outside this list requires mutual written agreement before the project begins.", { italics: true, color: GRAY }),

        sectionDivider(),

        // Protections
        heading("Protections for Dane"),
        bulletItem("If total revenue drops below $8K for 2 consecutive months during Phase 2, compensation reverts to Phase 1 (50/50, no base) until the $10K threshold is met again.", "Revert Clause: "),
        bulletItem("If $10K/month is not reached within 6 months of the effective date, this agreement is renegotiated.", "Phase 1 Time Cap: "),
        bulletItem("If Christine departs, she earns commission on revenue from her sourced clients for 90 days after departure. After 90 days, those client relationships belong to Digital Accomplice.", "Trailing Commission: "),

        new Paragraph({ spacing: { before: 160 }, children: [] }),

        heading("Protections for Christine"),
        bulletItem("Christine receives a revenue and COGS breakdown for every commissioned deal, delivered within 10 business days of project close.", "P&L Visibility: "),
        bulletItem("Phase 2 activates automatically after 2 consecutive months at $10K+. No subjective judgment.", "Defined Trigger: "),
        bulletItem("The $2K/month base in Phase 2 provides income stability not present in Phase 1.", "Income Floor: "),
        bulletItem("COGS categories are fixed. Neither party can inflate project costs without mutual agreement.", "Cost Transparency: "),

        sectionDivider(),

        // Signatures
        heading("Signatures"),
        body("By signing below, both parties acknowledge and agree to the terms outlined in this document."),

        new Table({
          width: { size: 9720, type: WidthType.DXA },
          columnWidths: [4860, 4860],
          rows: [new TableRow({
            children: [
              new TableCell({
                borders: noBorders, width: { size: 4860, type: WidthType.DXA },
                children: signatureLine("Dane Frederiksen", "Founder, Digital Accomplice"),
              }),
              new TableCell({
                borders: noBorders, width: { size: 4860, type: WidthType.DXA },
                children: signatureLine("Christine [Last Name]", "Strategic Partner"),
              }),
            ],
          })],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/DA_Compensation_Agreement_Christine.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Saved to:", outPath);
}

generate().catch(console.error);
