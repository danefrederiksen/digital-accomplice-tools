const docx = require('docx');
const fs = require('fs');

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
    children: Array.isArray(text) ? text : [new TextRun({ text, font: 'Arial', size: 21, color: BLUE_GRAY })],
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

function richBullet(boldPart, normalPart) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
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

function accentBox(text) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
    indent: { left: 300, right: 300 },
    children: [new TextRun({ text, font: 'Arial', size: 22, color: BLACK, italics: true })],
  });
}

function centerBold(text, color = BLACK, size = 26) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text, font: 'Arial', size, bold: true, color })],
  });
}

async function build() {
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 21 } } } },
    sections: [{
      properties: {
        page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } },
      },
      children: [
        // TITLE BLOCK
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: 'DIGITAL ACCOMPLICE', font: 'Arial', size: 18, color: DA_ORANGE, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Snapshot Offer v2: From Diagnosis to Prescription', font: 'Arial', size: 40, color: BLACK, bold: true })],
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: 'Strategic Plan — March 13, 2026', font: 'Arial', size: 22, color: BLUE_GRAY })],
        }),
        new Paragraph({
          spacing: { after: 20 },
          children: [new TextRun({ text: 'v2.0 — Updated tier structure based on market feedback', font: 'Arial', size: 20, color: GRAY, italics: true })],
        }),
        divider(),

        // ===== SECTION 1: THE INSIGHT =====
        heading('1. The Insight'),
        body('Two weeks of live snapshot outreach produced a clear signal: people engage with the diagnosis, but then stall. The snapshot tells them "you\'re invisible to AI" — and the only next step is "book a call." That\'s too big a jump.'),
        body('Brenton Thomas at Hinge said it directly: he wanted "options for dealing with the problems it calls out." Another prospect echoed the same thing. The market is asking for a prescription, not just a diagnosis.'),
        boldBody('The fix: ', 'Add a free Recommendations Brief between the snapshot and the call. Three tiers of actionable recommendations — all value, no ask. The call happens naturally when they want help executing.'),

        divider(),

        // ===== SECTION 2: THE NEW FUNNEL =====
        heading('2. The New Funnel'),

        centerBold('Snapshot (free)  →  Recommendations Brief (free)  →  Call (they ask)', DA_ORANGE),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                tableCell('Step', { bold: true, shading: LIGHT_GRAY, width: 18, headerColor: BLACK }),
                tableCell('What They Get', { bold: true, shading: LIGHT_GRAY, width: 32, headerColor: BLACK }),
                tableCell('What It Does', { bold: true, shading: LIGHT_GRAY, width: 25, headerColor: BLACK }),
                tableCell('Your Time', { bold: true, shading: LIGHT_GRAY, width: 25, headerColor: BLACK }),
              ],
            }),
            new TableRow({
              children: [
                tableCell('1. Snapshot'),
                tableCell('AI visibility audit vs. 3 competitors. Branded PDF + DM infographic.'),
                tableCell('Creates urgency. Shows the gap. Establishes credibility.'),
                tableCell('45 min - 2 hrs (tool-assisted)'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('2. Recs Brief'),
                tableCell('3-tier action plan: today / this quarter / what we\'d build. 1-2 pages.'),
                tableCell('Gives the prescription. Proves expertise. Prospect self-selects.'),
                tableCell('30-45 min (builds on snapshot research)'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('3. Call'),
                tableCell('15-min walkthrough of which recommendations fit their situation.'),
                tableCell('They asked for it. Discovery happens naturally.'),
                tableCell('15 min'),
              ],
            }),
          ],
        }),

        new Paragraph({ spacing: { after: 100 }, children: [] }),
        body('Each step gives value. Each step earns trust. The prospect controls the pace. Fast movers skip straight to the call. Slow movers get nurtured with real deliverables instead of "just checking in" follow-ups.'),

        divider(),

        // ===== SECTION 3: RECOMMENDATIONS BRIEF STRUCTURE =====
        heading('3. The Recommendations Brief — Structure'),
        body('This is not a proposal. It\'s a gift. Every tier is something they receive — not something you ask them to do. The call is never a "tier." It\'s the natural result of reading all three.'),

        // TIER 1
        new Paragraph({
          spacing: { before: 300, after: 80 },
          shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
          children: [
            new TextRun({ text: '  TIER 1: DO THIS TODAY', font: 'Arial', size: 24, color: DA_ORANGE, bold: true }),
          ],
        }),
        boldBody('What it is: ', '2-3 actions they can do in under an hour, for free, right now.'),
        boldBody('Purpose: ', 'Proves you\'re not gatekeeping. Builds instant trust. If they do these and see results, you\'re already their advisor.'),
        body('Example actions (customized per prospect):'),
        bullet('Add transcripts + timestamps to your existing YouTube videos (improves AI discoverability)'),
        bullet('Pin your best explainer video to your LinkedIn featured section'),
        bullet('Add FAQ schema markup to your top 3 service pages'),
        bullet('Update your YouTube channel description with buyer-intent keywords'),
        bullet('Create a 60-second "what we do" LinkedIn video from your existing pitch deck'),

        boldBody('What this signals to the prospect: ', '"This person just gave me real, usable advice. For free. Before I asked."'),

        // TIER 2
        new Paragraph({
          spacing: { before: 300, after: 80 },
          shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
          children: [
            new TextRun({ text: '  TIER 2: DO THIS QUARTER', font: 'Arial', size: 24, color: DA_ORANGE, bold: true }),
          ],
        }),
        boldBody('What it is: ', '3-5 structured actions with rough timelines. The real content strategy.'),
        boldBody('Purpose: ', 'Shows the scope of what\'s possible. This is where most prospects realize "I could do this... but I won\'t." That\'s the gap you fill.'),
        body('Example actions (customized per prospect):'),
        bullet('Launch a 6-episode FAQ video series targeting your top buyer-intent queries (the ones where competitors outrank you in AI results)'),
        bullet('Repurpose your 3 best conference talks into YouTube chapters with keyword-optimized titles'),
        bullet('Build a competitor comparison video addressing the specific queries where [Competitor X] gets cited and you don\'t'),
        bullet('Create a "Why Us" video that directly answers the #1 question AI gets asked about your category'),
        bullet('Establish a monthly video cadence: 2 short-form (LinkedIn) + 1 long-form (YouTube) per month'),

        boldBody('What this signals to the prospect: ', '"OK, I can see the plan. This is real. But doing all of this myself would take months and I\'d probably get it wrong."'),

        // TIER 3
        new Paragraph({
          spacing: { before: 300, after: 80 },
          shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
          children: [
            new TextRun({ text: '  TIER 3: WHAT WE\'D BUILD FOR YOU', font: 'Arial', size: 24, color: DA_ORANGE, bold: true }),
          ],
        }),
        boldBody('What it is: ', 'The full content engine — video strategy, production, distribution, AI visibility monitoring. Not a proposal. Not pricing. Just the vision of "done right."'),
        boldBody('Purpose: ', 'Makes the gap between where they are and where they could be feel concrete and achievable. Aspirational but grounded. The prospect thinks: "I want that."'),
        body('Example framing (customized per prospect):'),
        bullet('Full video content strategy aligned to AI search behavior + buyer journey'),
        bullet('Monthly production: 4 YouTube videos, 8 LinkedIn clips, ongoing optimization'),
        bullet('Quarterly AI visibility re-scoring — track progress against competitors'),
        bullet('YouTube channel overhaul: branding, playlists, metadata, thumbnails'),
        bullet('Content repurposing pipeline: every video becomes 5+ assets across platforms'),
        bullet('Ongoing strategic advisory — what to make next based on what\'s working'),

        boldBody('What this signals to the prospect: ', '"That\'s what I actually need. And this is the person who already understands my situation."'),

        // THE CTA
        new Paragraph({
          spacing: { before: 300, after: 80 },
          shading: { type: ShadingType.SOLID, color: LIGHT_GRAY },
          children: [
            new TextRun({ text: '  THE SINGLE CTA (bottom of brief)', font: 'Arial', size: 24, color: DA_ORANGE, bold: true }),
          ],
        }),
        accentBox('"If any of this interests you, I\'m happy to talk through which pieces make sense for your situation."'),
        body('One line. Not a tier — just an open door. No Calendly link. No pressure. If they want the call, they\'ll reply. If they don\'t, you still gave massive value and the door stays open.'),

        divider(),

        // ===== SECTION 4: KEY DESIGN PRINCIPLES =====
        heading('4. Key Design Principles'),

        richBullet('Every tier is a gift, not an ask. ', 'The moment one tier becomes "now do something for me" (book a call), you break the giving pattern. All three tiers deliver value. The call is the consequence, not a tier.'),
        richBullet('Time-based framing creates natural urgency. ', '"Today / This Quarter / What We\'d Build" is more actionable than abstract labels. Prospects think in time, not tiers.'),
        richBullet('Tier 1 is the trust builder. ', 'Giving away genuinely useful advice — things they can do RIGHT NOW — is the strongest credibility signal. It says: "I\'m not hoarding knowledge to sell it to you."'),
        richBullet('Tier 2 is the gap revealer. ', 'The prospect sees what "good" looks like and realizes they can\'t/won\'t do it alone. You don\'t need to say "you need help." The tier says it for you.'),
        richBullet('Tier 3 is aspirational, not salesy. ', 'No pricing. No proposal language. Just: "here\'s what the full version looks like." Let them imagine having it.'),
        richBullet('The brief builds on snapshot research. ', 'You\'re already doing 80% of this work in the snapshot process (competitor analysis, gap identification, channel audit). The brief is formatting what you already know into actionable recommendations.'),

        divider(),

        // ===== SECTION 5: CTA LANGUAGE =====
        heading('5. Updated CTA Language — Copy/Paste Ready'),

        heading('Initial Outreach (Email or DM)', HeadingLevel.HEADING_2),
        accentBox('"I run free AI visibility snapshots — shows what buyers actually see when they search your space. If the data is interesting, I\'ll follow up with a short action plan: things you can do today, this quarter, and what a full strategy looks like. No call required."'),

        heading('Snapshot Delivery Email', HeadingLevel.HEADING_2),
        accentBox('"Here\'s your snapshot. Want me to put together a quick recommendations brief? Three levels: stuff you can do today for free, a 90-day plan, and what the full build would look like. Takes me about 30 minutes. Just say the word."'),

        heading('Recommendations Brief Delivery', HeadingLevel.HEADING_2),
        accentBox('"Here\'s the brief. The Tier 1 stuff you can knock out today — those are real, no strings attached. If any of the bigger pieces interest you, happy to talk through which ones make sense for your situation."'),

        heading('Cold Re-Engagement (Dormant Threads)', HeadingLevel.HEADING_2),
        accentBox('"I\'ve been building something new — an AI visibility tool that shows what buyers see when they search your category. Happy to run one for you, and if the gaps are interesting, I\'ll include a short action plan. Worth a peek?"'),

        heading('Partner Pitch (Colin, Margie, Christine)', HeadingLevel.HEADING_2),
        accentBox('"The snapshot gets attention, but I\'ve added a recommendations brief that gives prospects an actual action plan — not just a diagnosis. Three tiers: do this today, do this quarter, here\'s the full build. It\'s a much better bridge to the conversation. Want to co-offer this to your clients?"'),

        divider(),

        // ===== SECTION 6: PRODUCTION WORKFLOW =====
        heading('6. How to Produce a Recommendations Brief'),

        boldBody('Step 1: Run the snapshot. ', 'This generates all the research you need — competitor analysis, gap identification, channel audit, AI query results.'),
        boldBody('Step 2: Draft the brief. ', 'Pull from the snapshot data to write 3 tiers of recommendations. Customize examples to the prospect\'s actual gaps. 30-45 minutes.'),
        boldBody('Step 3: Format and brand. ', 'DA-branded 1-2 page PDF. Clean, scannable, same design language as the snapshot. Build a template so this is fast.'),
        boldBody('Step 4: Deliver. ', 'Send with the brief delivery CTA language above. No Calendly link in this email.'),
        boldBody('Step 5: Follow up (if silent after 5 days). ', '"Just checking — did the recommendations brief land? Happy to answer any questions about the Tier 1 actions if you want to start there."'),

        body('Target turnaround: Send the brief within 48 hours of delivering the snapshot, while the data is still fresh in their mind.', { italics: true }),

        divider(),

        // ===== SECTION 7: WHAT TO BUILD =====
        heading('7. Implementation — What to Build'),

        heading('This Week', HeadingLevel.HEADING_2),
        bullet('Design the Recommendations Brief template (DA-branded, 1-2 page PDF)'),
        bullet('Write the first brief for Brenton/Double Cross — he literally asked for this'),
        bullet('Update DM templates in prospecting tools with new CTA copy'),
        bullet('Update email signature block — swap "Book a Meeting" for snapshot offer language'),

        heading('Next 2 Weeks', HeadingLevel.HEADING_2),
        bullet('Build brief generation into the snapshot workflow (template + variable fields)'),
        bullet('Create brief variants by vertical: B2B services, cybersecurity, consumer brand, referral partner'),
        bullet('Test the full funnel: Snapshot → Brief → Call on 3-5 prospects'),
        bullet('Pitch the co-offering to Colin and Christine with updated partner language'),

        heading('Measure', HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                tableCell('Metric', { bold: true, shading: LIGHT_GRAY, width: 40, headerColor: BLACK }),
                tableCell('What It Tells You', { bold: true, shading: LIGHT_GRAY, width: 35, headerColor: BLACK }),
                tableCell('Target', { bold: true, shading: LIGHT_GRAY, width: 25, headerColor: BLACK }),
              ],
            }),
            new TableRow({
              children: [
                tableCell('Snapshot acceptance rate'),
                tableCell('Is the initial offer compelling?'),
                tableCell('>40% of outreach'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('Brief acceptance rate'),
                tableCell('Does the snapshot create enough interest to want more?'),
                tableCell('>60% of snapshot recipients'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('Call conversion rate'),
                tableCell('Does the brief convert to conversations?'),
                tableCell('>30% of brief recipients'),
              ],
            }),
            new TableRow({
              children: [
                tableCell('Snapshot-to-call (old funnel)'),
                tableCell('Baseline comparison'),
                tableCell('Track current rate'),
              ],
            }),
          ],
        }),

        new Paragraph({ spacing: { after: 100 }, children: [] }),

        divider(),

        // ===== SECTION 8: THE SERVICE LADDER =====
        heading('8. The Bigger Picture — Service Ladder'),

        body('This isn\'t just a CTA fix. It\'s the beginning of a productized service ladder where each step earns more trust and delivers more value:'),

        centerBold('Free Snapshot  →  Free Brief  →  Paid Strategy Session  →  Retainer', DA_ORANGE, 24),

        richBullet('Free Snapshot: ', 'Door-opener. Gets attention. Establishes you as someone with real data, not just opinions.'),
        richBullet('Free Brief: ', 'Trust-builder. Proves you can think strategically about their specific situation. Separates you from every other agency sending cold emails.'),
        richBullet('Paid Strategy Session: ', 'The natural next step when they say "can you help us do Tier 2 and 3?" One-time paid engagement to build a detailed roadmap. This is where money starts.'),
        richBullet('Retainer: ', 'Ongoing video strategy + production. The full DA engagement. This is where the real revenue lives.'),

        new Paragraph({ spacing: { after: 100 }, children: [] }),
        body('Every brief you send is also a portfolio piece. It demonstrates expertise before money changes hands. That\'s the whole DA thesis: prove value first, then ask for the engagement.'),

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
  const outputPath = '/Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/1.6_Scripts_and_Templates/DA_Snapshot_Offer_v2_Plan_2026-03-13.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('Saved to: ' + outputPath);
}

build().catch(console.error);
