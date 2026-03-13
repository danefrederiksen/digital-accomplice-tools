const docx = require('docx');
const fs = require('fs');
const path = require('path');

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType } = docx;

const DA_ORANGE = 'F8901E';
const BLACK = '000000';
const BLUE_GRAY = '5A6B7A';
const GRAY = 'CBCBCB';
const WHITE = 'FFFFFF';
const LIGHT_GRAY = 'F5F5F5';

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 300, after: 120 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22, color: BLACK })],
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 160 },
    children: [new TextRun({ text, font: 'Arial', size: 21, color: opts.color || BLUE_GRAY, bold: opts.bold || false, italics: opts.italics || false })],
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    bullet: { level: opts.level || 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 21, color: BLUE_GRAY })],
  });
}

function boldBody(boldPart, normalPart) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({ text: boldPart, font: 'Arial', size: 21, color: BLACK, bold: true }),
      new TextRun({ text: normalPart, font: 'Arial', size: 21, color: BLUE_GRAY }),
    ],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: DA_ORANGE } },
    children: [],
  });
}

function tableCell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, font: 'Arial', size: 19, color: opts.headerColor || BLUE_GRAY, bold: opts.bold || false })],
    })],
  });
}

async function build() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 21 } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } },
      },
      children: [
        // TITLE
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: 'DIGITAL ACCOMPLICE', font: 'Arial', size: 18, color: DA_ORANGE, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Snapshot Offer Evolution: From Diagnosis to Prescription', font: 'Arial', size: 40, color: BLACK, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: 'Strategic Plan — March 13, 2026', font: 'Arial', size: 22, color: BLUE_GRAY })],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: 'Version 1.0 — Working Draft', font: 'Arial', size: 20, color: GRAY, italics: true })],
        }),
        divider(),

        // SECTION 1: WHAT'S HAPPENING
        heading('1. What\'s Happening'),
        body('The AI Visibility Snapshot has been live for ~2 weeks. It\'s working as a door-opener — people respond, they engage, they want to talk. But the pattern emerging from real conversations is clear: the snapshot diagnoses a problem, then the only next step is "book a call." That\'s too big a jump for most prospects.'),
        body('Here\'s how the offer has evolved through 4 real interactions:'),

        // Evolution table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                tableCell('Version', { bold: true, shading: LIGHT_GRAY, width: 12, headerColor: BLACK }),
                tableCell('Prospect', { bold: true, shading: LIGHT_GRAY, width: 18, headerColor: BLACK }),
                tableCell('How Snapshot Was Used', { bold: true, shading: LIGHT_GRAY, width: 35, headerColor: BLACK }),
                tableCell('Result', { bold: true, shading: LIGHT_GRAY, width: 35, headerColor: BLACK }),
              ],
            }),
            new TableRow({
              children: [
                tableCell('V1'),
                tableCell('Joe Pope / Hinge'),
                tableCell('Free snapshot as lead magnet. CTA: "book a call."'),
                tableCell('Joe asked for one on Hinge vs competitors. Engaged.'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('V2'),
                tableCell('Colin Crook / Adyen'),
                tableCell('Snapshot as partnership tool. Offered text-only version for co-branding.'),
                tableCell('Colin engaged. Discussed co-offering on a call.'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('V3'),
                tableCell('Brenton / Double Cross'),
                tableCell('Full audit + methodology doc. Transparent about limitations. CTA: video plan + Calendly.'),
                tableCell('Brenton replied same day. Asked about "options for dealing with the problems." Key signal.'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('V4'),
                tableCell('Hydden / Margie'),
                tableCell('Re-engagement tool for cold referral thread. Softer pitch: "worth a peek?"'),
                tableCell('Pending response.'),
              ],
            }),
          ],
        }),

        new Paragraph({ spacing: { after: 100 }, children: [] }),
        boldBody('The market signal: ', 'Brenton\'s response — and Dane\'s own instinct in the reply ("another person mentioned wanting options for dealing with the problems it calls out") — confirms the gap. People see the diagnosis. They want the prescription.'),

        divider(),

        // SECTION 2: THE PROBLEM
        heading('2. The Problem'),
        body('Right now the funnel looks like this:'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: 'Snapshot (free)  →  Book a Call  →  ???', font: 'Arial', size: 26, bold: true, color: BLACK })],
        }),
        body('Three issues with this:'),
        bullet('"Book a call" is a high-commitment ask. It requires time, social energy, and implies a sales conversation. Cold/warm prospects aren\'t ready for that.'),
        bullet('The snapshot creates urgency but doesn\'t resolve it. The prospect thinks: "OK, I\'m invisible to AI. Now what?" If the only answer is "talk to me," many will do nothing.'),
        bullet('You lose the initiative. Instead of delivering value that pulls them forward, you\'re asking them to take a step. The energy shifts from "this guy is helping me" to "this guy wants a meeting."'),

        divider(),

        // SECTION 3: THE SOLUTION
        heading('3. The Solution: Add a Recommendations Brief'),
        body('Insert a free, low-commitment step between the snapshot and the call. A "Recommendations Brief" — a short, actionable document that tells the prospect exactly what to do about the gaps the snapshot found.'),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: 'Snapshot (free)  →  Recommendations Brief (free)  →  Call (natural)', font: 'Arial', size: 26, bold: true, color: DA_ORANGE })],
        }),

        body('The call still happens. But now they ask for it instead of you pushing it.'),

        // Comparison table
        heading('Why This Is Better', HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                tableCell('', { bold: true, shading: LIGHT_GRAY, width: 30, headerColor: BLACK }),
                tableCell('Book a Call', { bold: true, shading: LIGHT_GRAY, width: 35, headerColor: BLACK }),
                tableCell('Recommendations Brief', { bold: true, shading: LIGHT_GRAY, width: 35, headerColor: BLACK }),
              ],
            }),
            ...([
              ['Commitment level', 'High (time + social)', 'Low (just say yes)'],
              ['What they get', 'A conversation', 'A tangible deliverable'],
              ['What you learn', 'Their problems live', 'Their priorities from their reply'],
              ['Positions you as', 'Salesperson', 'Expert advisor'],
              ['Natural next step', 'Proposal (too fast)', '"Want help executing any of these?"'],
              ['If they go silent', 'Dead lead', 'You still gave value — door stays open'],
            ].map(row => new TableRow({
              children: [
                tableCell(row[0], { bold: true }),
                tableCell(row[1]),
                tableCell(row[2]),
              ],
            }))),
          ],
        }),

        new Paragraph({ spacing: { after: 100 }, children: [] }),

        divider(),

        // SECTION 4: WHAT THE RECOMMENDATIONS BRIEF CONTAINS
        heading('4. What the Recommendations Brief Contains'),
        body('This is not a proposal. It\'s a gift. It positions you as the expert who already did the thinking. The prospect reads it and either (a) wants to talk, or (b) tries to do it themselves and realizes they need help.'),

        heading('Three Tiers — Always Include All Three', HeadingLevel.HEADING_2),

        boldBody('Tier 1: Quick Wins (do this week)', ''),
        bullet('2-3 actions that cost nothing and take <2 hours'),
        bullet('Examples: "Add transcripts to your existing 12 YouTube videos," "Pin your best explainer video to your LinkedIn featured section," "Add FAQ schema to your top 3 service pages"'),
        bullet('Purpose: Prove you\'re not gatekeeping. Give them something real. If they do these and see results, trust goes up.'),

        boldBody('Tier 2: 90-Day Plan (do this quarter)', ''),
        bullet('3-5 structured actions with timelines'),
        bullet('Examples: "Launch a 6-episode FAQ video series targeting your top buyer-intent queries," "Repurpose your conference talks into YouTube chapters with keyword-optimized titles," "Build a competitor comparison video addressing the 3 queries where [Competitor] outranks you"'),
        bullet('Purpose: Show the scope of what\'s possible. This is where most prospects realize they need help.'),

        boldBody('Tier 3: Full Strategy (engagement-level)', ''),
        bullet('The complete content engine: video production, YouTube optimization, distribution, AI visibility monitoring'),
        bullet('This tier deliberately feels like "too much to do alone"'),
        bullet('Purpose: Natural bridge to "want help with this?" — without ever saying it directly'),

        body('Estimated time to produce: 30-45 minutes per prospect (you\'re already doing most of this research in the snapshot process).', { italics: true }),

        divider(),

        // SECTION 5: UPDATED CTA LANGUAGE
        heading('5. Updated CTA Language'),

        heading('For Initial Outreach (Email/DM)', HeadingLevel.HEADING_2),
        body('"I run free AI visibility snapshots — shows what\'s getting cited when buyers ask about your space. If the data looks interesting, I\'ll follow up with a short recommendations brief: 3 things you could do about it, ranked by effort. No call required."', { italics: true }),

        heading('For Snapshot Delivery (Follow-Up)', HeadingLevel.HEADING_2),
        body('"Here\'s your snapshot. If you want, I can put together a quick recommendations brief — 3 tiers of what to do about these gaps, from quick wins you can do this week to a full content strategy. Takes me about 30 minutes. Want me to run it?"', { italics: true }),

        heading('For Recommendations Brief Delivery', HeadingLevel.HEADING_2),
        body('"Here\'s the brief. Tier 1 stuff you can knock out this week. If any of the Tier 2 or 3 ideas interest you, happy to hop on for 15 minutes to talk through which ones make sense for your situation."', { italics: true }),

        heading('For Cold Re-Engagement (Like Hydden)', HeadingLevel.HEADING_2),
        body('"I\'ve been building an AI visibility tool that shows what buyers actually see when they search your space. Happy to run one for you — and if the gaps are interesting, I\'ll include a short action plan. Worth a peek?"', { italics: true }),

        divider(),

        // SECTION 6: IMPLEMENTATION
        heading('6. Implementation Checklist'),

        boldBody('Immediate (this week):', ''),
        bullet('Build a Recommendations Brief template (1-page, DA-branded, 3 tiers)'),
        bullet('Update email signature CTA from "Book a Meeting" to snapshot offer language'),
        bullet('Update DM templates in prospecting tools to use new CTA copy'),
        bullet('Test the brief on Brenton/Double Cross — he literally asked for this'),

        boldBody('Short-term (next 2 weeks):', ''),
        bullet('Build the brief generation into the snapshot workflow (Step 4 already produces the raw recommendations — just format and deliver)'),
        bullet('Create brief versions for each snapshot type: B2B, cybersecurity, referral partner, consumer brand (Double Cross)'),
        bullet('Update the snapshot generator tool to optionally output a recommendations brief alongside the snapshot'),

        boldBody('Track & Measure:', ''),
        bullet('Snapshot acceptance rate (% who say yes to receiving one)'),
        bullet('Brief acceptance rate (% who want the recommendations after seeing the snapshot)'),
        bullet('Call conversion rate (% who book a call after receiving the brief)'),
        bullet('Compare against current snapshot → call conversion rate'),

        divider(),

        // SECTION 7: THE BIGGER PICTURE
        heading('7. The Bigger Picture'),
        body('This isn\'t just a CTA fix. It\'s the beginning of a productized service ladder:'),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: 'Free Snapshot → Free Brief → Paid Strategy Session → Retainer', font: 'Arial', size: 24, bold: true, color: DA_ORANGE })],
        }),

        body('Each step gives more value and earns more trust. The prospect self-selects their speed. Fast movers skip to the call. Slow movers get nurtured with real deliverables instead of "just checking in" follow-ups.'),
        body('And every brief you send is a portfolio piece. It demonstrates expertise before money changes hands. That\'s the whole DA thesis: prove value first, then ask for the engagement.'),

        divider(),

        // FOOTER
        new Paragraph({
          spacing: { before: 300 },
          children: [
            new TextRun({ text: 'Digital Accomplice', font: 'Arial', size: 18, color: DA_ORANGE, bold: true }),
            new TextRun({ text: '  |  ', font: 'Arial', size: 18, color: GRAY }),
            new TextRun({ text: 'digitalaccomplice.com', font: 'Arial', size: 18, color: BLUE_GRAY }),
            new TextRun({ text: '  |  ', font: 'Arial', size: 18, color: GRAY }),
            new TextRun({ text: 'dane@digitalaccomplice.com', font: 'Arial', size: 18, color: BLUE_GRAY }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: '"Tell your story, grow revenue, zero frustration."', font: 'Arial', size: 18, color: GRAY, italics: true })],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = '/Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/1.6_Scripts_and_Templates/DA_Snapshot_Offer_Evolution_Plan_2026-03-13.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('Saved to: ' + outputPath);
}

build().catch(console.error);
