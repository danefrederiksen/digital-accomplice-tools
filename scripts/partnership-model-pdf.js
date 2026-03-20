const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
        PageNumber, HeadingLevel, LevelFormat } = require('docx');
const fs = require('fs');

const ORANGE = 'F8901E';
const BLACK = '1A1A1A';
const GRAY = '5A6B7A';
const LIGHT = 'F5F5F5';
const WHITE = 'FFFFFF';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBCBCB' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: BLACK, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: 'Inter', size: 17, color: WHITE })] })]
  });
}

function cell(text, width, shade = WHITE) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: 'Inter', size: 17, color: BLACK })] })]
  });
}

function boldCell(text, width, shade = WHITE) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: 'Inter', size: 17, color: BLACK })] })]
  });
}

function sectionHead(text) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true, font: 'Inter', size: 22, color: ORANGE })]
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: 'Inter', size: 18, color: BLACK })]
  });
}

function bulletItem(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, font: 'Inter', size: 17, color: BLACK })]
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 180 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: 'Inter', size: 18 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'DIGITAL ACCOMPLICE', bold: true, font: 'Inter', size: 16, color: ORANGE }),
            new TextRun({ text: '  |  Partnership Model  |  March 2026  |  INTERNAL', font: 'Inter', size: 14, color: GRAY })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Digital Accomplice  |  Confidential  |  Page ', font: 'Inter', size: 14, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Inter', size: 14, color: GRAY })
          ]
        })]
      })
    },
    children: [
      // Title
      new Paragraph({
        spacing: { before: 200, after: 40 },
        children: [new TextRun({ text: 'DA Partnership Model', bold: true, font: 'Inter', size: 36, color: BLACK })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORANGE, space: 6 } },
        children: [new TextRun({ text: 'How Dane, Christine, and Colton work together', font: 'Inter', size: 22, color: GRAY })]
      }),

      // Structure
      sectionHead('THE MODEL'),
      bodyText('DA is the hub. Christine is the client-facing arm. Colton/Avey Creative is the production arm. Dane controls brand, pipeline, margin, and creative direction.'),

      // Roles table
      sectionHead('ROLES'),
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [2200, 4200, 3680],
        rows: [
          new TableRow({ children: [headerCell('Person', 2200), headerCell('Role', 4200), headerCell('Owns', 3680)] }),
          new TableRow({ children: [
            boldCell('Dane', 2200, LIGHT),
            cell('CEO, Creative Director, Sales, AI Visibility Strategy', 4200, LIGHT),
            cell('Brand, pipeline, methodology, production oversight, creative direction on set', 3680, LIGHT)
          ]}),
          new TableRow({ children: [
            boldCell('Christine', 2200),
            cell('Director of Client Strategy', 4200),
            cell('Client relationships, discovery calls, proposals, project management, content strategy', 3680)
          ]}),
          new TableRow({ children: [
            boldCell('Colton', 2200, LIGHT),
            cell('Production Lead (Avey Creative)', 4200, LIGHT),
            cell('Shooting, editing, post-production, delivery. White-label under DA brand.', 3680, LIGHT)
          ]}),
        ]
      }),

      // Compensation
      sectionHead('COMPENSATION'),
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [2200, 2600, 2600, 2680],
        rows: [
          new TableRow({ children: [headerCell('Person', 2200), headerCell('Base', 2600), headerCell('Per Project', 2600), headerCell('Notes', 2680)] }),
          new TableRow({ children: [
            boldCell('Christine', 2200, LIGHT),
            cell('$1,500\u2013$2,000/mo retainer', 2600, LIGHT),
            cell('Scoped per engagement (see pricing)', 2600, LIGHT),
            cell('Retainer starts when managing pipeline. No commission-only.', 2680, LIGHT)
          ]}),
          new TableRow({ children: [
            boldCell('Colton', 2200),
            cell('Revenue share on joint projects', 2600),
            cell('Production fee per engagement', 2600),
            cell('DA marks up production into package price. Clients see one rate.', 2680)
          ]}),
          new TableRow({ children: [
            boldCell('Dane / DA', 2200, LIGHT),
            cell('Remaining margin after Christine + Colton fees', 2600, LIGHT),
            cell('\u2014', 2600, LIGHT),
            cell('DA owns the contract, invoices the client.', 2680, LIGHT)
          ]}),
        ]
      }),

      // Pricing
      sectionHead('PACKAGE PRICING (Associations / Events)'),
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [2800, 2200, 2400, 2680],
        rows: [
          new TableRow({ children: [headerCell('Package', 2800), headerCell('Client Pays', 2200), headerCell('Christine Fee', 2400), headerCell('Includes', 2680)] }),
          new TableRow({ children: [
            boldCell('A \u2014 Spotlight Session', 2800, LIGHT),
            cell('$2,500\u2013$3,000', 2200, LIGHT),
            cell('$400\u2013$600', 2400, LIGHT),
            cell('Brief, scheduling, comms, handoff', 2680, LIGHT)
          ]}),
          new TableRow({ children: [
            boldCell('B \u2014 Content Engine (monthly)', 2800),
            cell('$6,000\u2013$8,000/mo', 2200),
            cell('$1,500\u2013$2,500/mo', 2400),
            cell('Calendar, session planning, account mgmt, QC', 2680)
          ]}),
          new TableRow({ children: [
            boldCell('C \u2014 Brand Shoot (on-site)', 2800, LIGHT),
            cell('$10,000\u2013$15,000+', 2200, LIGHT),
            cell('$1,500\u2013$2,500', 2400, LIGHT),
            cell('Pre-prod, logistics, talent prep, client comms', 2680, LIGHT)
          ]}),
        ]
      }),

      // Methodology
      sectionHead('DA METHODOLOGY (5 Phases)'),
      bodyText('Named process that differentiates DA from commodity video shops. Strategy is embedded, not sold separately. Clients experience it as thoroughness, not consulting.'),
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [1200, 2400, 3240, 3240],
        rows: [
          new TableRow({ children: [headerCell('Phase', 1200), headerCell('Name', 2400), headerCell('What Happens', 3240), headerCell('Client Sees', 3240)] }),
          new TableRow({ children: [
            boldCell('1', 1200, LIGHT), cell('Visibility Audit', 2400, LIGHT),
            cell('AI snapshot + video competitive analysis', 3240, LIGHT),
            cell('Branded report: "here\'s where you stand"', 3240, LIGHT)
          ]}),
          new TableRow({ children: [
            boldCell('2', 1200), cell('Content Architecture', 2400),
            cell('Christine + Dane: what to say, to whom, where', 3240),
            cell('Content Roadmap document', 3240)
          ]}),
          new TableRow({ children: [
            boldCell('3', 1200, LIGHT), cell('Production', 2400, LIGHT),
            cell('Colton executes, Dane directs on set', 3240, LIGHT),
            cell('The shoot + Dane\'s creative authority', 3240, LIGHT)
          ]}),
          new TableRow({ children: [
            boldCell('4', 1200), cell('Repurposing + Distribution', 2400),
            cell('Full video \u2192 clips, transcripts, social, AI-optimized', 3240),
            cell('Distribution Map showing all outputs', 3240)
          ]}),
          new TableRow({ children: [
            boldCell('5', 1200, LIGHT), cell('Visibility Tracking', 2400, LIGHT),
            cell('90-day re-snapshot showing before/after', 3240, LIGHT),
            cell('Visibility Report with movement data', 3240, LIGHT)
          ]}),
        ]
      }),

      // Protections
      sectionHead('CLIENT RETENTION PROTECTIONS'),
      bulletItem('All contracts under DA entity \u2014 client\'s legal relationship is with Dane\'s company'),
      bulletItem('Christine introduced as "Director of Client Strategy at Digital Accomplice"'),
      bulletItem('Non-solicitation (12 months post-departure) for both Christine and Colton on DA-sourced clients'),
      bulletItem('Colton won\'t work directly with DA-sourced clients for 12 months (closes the back door)'),
      bulletItem('Dane stays visible: kickoff calls, quarterly strategy reviews, delivery milestones'),
      bulletItem('DA owns all IP: AI snapshot tool, methodology, repurposing framework, pipeline systems'),
      bulletItem('No non-compete, no exclusivity \u2014 either party walks with 30 days notice'),
      bulletItem('Review arrangement every 60 days; equity conversation after 90 days of proven revenue'),

      // Stealth strategy
      sectionHead('SELLING STRATEGY (NOT "STRATEGY")'),
      bodyText('Most clients think they need video, not strategy. DA embeds strategy invisibly:'),
      bulletItem('Lead with the problem: "Most companies spend $10K on video and get 300 views"'),
      bulletItem('Make clients ask for strategy by showing the gap \u2014 don\'t pitch it'),
      bulletItem('Name deliverables as action items, not consulting: Visibility Check, Content Roadmap, Distribution Map'),
      bulletItem('Premium pricing justified by volume of outputs + visibility tracking, not "strategy hours"'),
      bodyText('Result: Client sees a team that\'s way more thoughtful than any other video shop \u2014 and never hears the word "strategy."'),

      // Terms
      sectionHead('TERMS & GROUND RULES'),
      bulletItem('Full transparency on deal pricing and margins for joint projects'),
      bulletItem('Christine and Colton keep their own brands and clients \u2014 nothing changes there'),
      bulletItem('Cross-equity premature \u2014 revisit after 90 days of closed revenue together'),
      bulletItem('Arrangement reviewed every 60 days \u2014 either party can propose changes'),

      new Paragraph({ spacing: { before: 300 }, children: [] }),
      new Paragraph({
        spacing: { before: 100 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
        children: [new TextRun({ text: 'Draft \u2014 March 19, 2026 \u2014 Not a contract', italics: true, font: 'Inter', size: 16, color: GRAY })]
      }),
    ]
  }]
});

const outPath = '/Users/danefrederiksen/Desktop/Digital Accomplice/4_Operations/4.3_Processes/DA_Ops_Processes_PartnershipModel_2026-03-19.docx';
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('Saved to:', outPath);
});
