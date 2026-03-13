const docx = require('docx');
const fs = require('fs');
const { execSync } = require('child_process');

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType } = docx;

const DA_ORANGE = 'F8901E';
const BLACK = '000000';
const BLUE_GRAY = '5A6B7A';
const GRAY = 'CBCBCB';
const LIGHT_GRAY = 'F5F5F5';

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 120 }, children: [new TextRun({ text, bold: true, font: 'Arial', size: 32, color: BLACK })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 }, children: [new TextRun({ text, bold: true, font: 'Arial', size: 26, color: BLACK })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 80 }, children: [new TextRun({ text, bold: true, font: 'Arial', size: 22, color: DA_ORANGE })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: opts.after || 140 }, children: [new TextRun({ text, font: 'Arial', size: 20, color: opts.color || BLUE_GRAY, bold: opts.bold || false, italics: opts.italics || false })] });
}
function bp(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, font: 'Arial', size: 20, color: BLUE_GRAY })] });
}
function bpBold(b, n) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: b, font: 'Arial', size: 20, color: BLACK, bold: true }), new TextRun({ text: n, font: 'Arial', size: 20, color: BLUE_GRAY })] });
}
function divider() {
  return new Paragraph({ spacing: { before: 160, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: DA_ORANGE } }, children: [] });
}
function tc(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    children: [new Paragraph({ spacing: { before: 50, after: 50 }, children: [new TextRun({ text, font: 'Arial', size: 18, color: opts.hc || BLUE_GRAY, bold: opts.bold || false })] })],
  });
}

async function build() {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } },
      children: [
        // TITLE
        new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: 'DIGITAL ACCOMPLICE', font: 'Arial', size: 16, color: DA_ORANGE, bold: true })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Snapshot v2 — Design Doc / Generator Prompt', font: 'Arial', size: 36, color: BLACK, bold: true })] }),
        new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: 'March 13, 2026  |  Working Spec', font: 'Arial', size: 20, color: GRAY })] }),
        divider(),

        // WHAT THIS IS
        h1('What This Is'),
        p('A single branded PNG that combines the AI visibility diagnosis AND the recommendations brief into one clean, bold graphic. Replaces the 8-page report for most outreach. The full report still exists for deep-dive conversations — this is the door-opener version.'),

        // OUTPUT FORMAT
        h1('Output Format'),
        bpBold('PNG image. ', 'Single file. No HTML delivered, no PDF.'),
        bpBold('Dimensions: ', '1080 x 1350px (portrait, LinkedIn/DM) OR 1920 x 1080px (landscape, email/deck). Generator supports both.'),
        bpBold('Pipeline: ', 'HTML template rendered via Chrome headless → PNG screenshot. HTML is just the rendering engine.'),
        bpBold('File naming: ', '[Company]_AI_Snapshot_v2_[date].png'),
        bpBold('Resolution: ', '2x pixel density for crisp text on retina screens.'),

        // DESIGN CONSTRAINTS
        h1('Design Constraints'),
        bp('One image. Everything fits in one graphic. No pages, no scrolling.'),
        bp('5th grade reading level. No jargon. No long sentences. Max 3 syllables per word.'),
        bp('Bold and scannable. Message lands in 10 seconds of skimming.'),
        bp('DA brand: Orange #F8901E, Black #000, Blue-Gray #5A6B7A, White #FFF, Light Gray #F5F5F5.'),
        bp('Font: Poppins (Arial fallback). No gradients, no shadows.'),
        divider(),

        // LAYOUT
        h1('Image Layout (top to bottom)'),

        // Section 1
        h3('1. HEADER BAR'),
        bp('DA logo (small, top left)'),
        bp('"AI VISIBILITY SNAPSHOT" label (top right, small caps, gray)'),
        bp('Company name: large, bold, black'),
        bp('Date generated'),

        // Section 2
        h3('2. HEADLINE (the hook)'),
        p('One bold sentence that creates urgency. Generated from data.'),
        p('Format: "[Company] has [X]. AI doesn\'t know it exists."', { bold: true }),
        p('Examples:'),
        bp('"Double Cross has a 95-point rating. AI recommends Grey Goose instead."'),
        bp('"BreachRx has 14 years of expertise. AI cites 0 of it."'),
        bp('"GISI has 200+ federal contracts. AI sends buyers to Deloitte."'),
        p('Rules: Use their strongest asset + the gap. Short. Punchy. Make them feel it.', { italics: true }),

        // Section 3
        h3('3. THE SCORE BOX (3 stats, side by side)'),
        p('Three bold stat cards in a horizontal row. Orange numbers, black labels.'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [tc('0/20', { bold: true, shading: LIGHT_GRAY, width: 33, hc: DA_ORANGE }), tc('3 competitors', { bold: true, shading: LIGHT_GRAY, width: 34, hc: DA_ORANGE }), tc('0 videos', { bold: true, shading: LIGHT_GRAY, width: 33, hc: DA_ORANGE })] }),
            new TableRow({ children: [tc('AI mentions', { width: 33 }), tc('rank higher', { width: 34 }), tc('found by AI', { width: 33 })] }),
          ],
        }),
        new Paragraph({ spacing: { after: 80 }, children: [] }),
        p('Pick the three most damning numbers from the audit. Always include AI mentions as stat 1.', { italics: true }),

        // Section 4
        h3('4. COMPETITIVE BAR CHART'),
        bp('Simple horizontal bars. 4 companies (target + 3 competitors).'),
        bp('Bars show AI citation score out of 20.'),
        bp('Target company bar = orange. Competitors = gray.'),
        bp('Labels on left, scores on right. No axis labels, no legend.'),
        p('A child could read it.', { italics: true }),

        // Section 5
        h3('5. THE PRESCRIPTION — 3 TIERS'),
        p('Three stacked boxes, full width. Light gray background. Orange tier labels. 2 bullet points each.'),

        h2('Box 1: "DO THIS TODAY (free, <1 hour)"'),
        bp('2 specific actions they can do right now. Free. Immediate.'),
        bp('Example: "Add transcripts to your 12 existing YouTube videos"'),
        bp('Example: "Pin your best explainer to LinkedIn featured"'),
        p('Purpose: Proves you\'re not gatekeeping. Builds instant trust.', { italics: true }),

        h2('Box 2: "DO THIS QUARTER (the real plan)"'),
        bp('2 bigger moves with rough timelines.'),
        bp('Example: "Launch a 6-video FAQ series targeting queries where [Competitor] outranks you"'),
        bp('Example: "Build a competitor comparison video for your #1 buyer-intent query"'),
        p('Purpose: Where most prospects realize "I could do this... but I won\'t."', { italics: true }),

        h2('Box 3: "WHAT WE\'D BUILD FOR YOU (the full engine)"'),
        bp('2 aspirational bullets. The vision of "done right."'),
        bp('Example: "Monthly video production + AI visibility tracking vs. competitors"'),
        bp('Example: "Full YouTube channel strategy: branding, metadata, optimization, distribution"'),
        p('Purpose: Makes the gap feel concrete. No pricing. Just the picture.', { italics: true }),

        // Section 6
        h3('6. SINGLE CTA LINE'),
        p('Centered. Regular weight. Not loud.'),
        p('"If any of this interests you, I\'m happy to talk through which pieces fit."', { bold: true }),
        p('Below it: Dane\'s name, email. "Digital Accomplice — AI visibility through video."'),

        // Section 7
        h3('7. FOOTER'),
        p('"Methodology: [X] buyer-intent queries tested across ChatGPT + Perplexity. Results reflect patterns, not guarantees. Full methodology available on request."', { italics: true, color: GRAY }),

        divider(),

        // GENERATOR INPUT FIELDS
        h1('Generator Input Fields'),
        p('22 fields needed to produce the graphic:'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [tc('Field', { bold: true, shading: LIGHT_GRAY, width: 25, hc: BLACK }), tc('Type', { bold: true, shading: LIGHT_GRAY, width: 12, hc: BLACK }), tc('Example', { bold: true, shading: LIGHT_GRAY, width: 63, hc: BLACK })] }),
            ...([
              ['company_name', 'text', '"Double Cross Vodka"'],
              ['headline', 'text', '"Double Cross has a 95-point rating. AI recommends Grey Goose instead."'],
              ['stat_1_number', 'text', '"0/20"'],
              ['stat_1_label', 'text', '"AI mentions"'],
              ['stat_2_number', 'text', '"3"'],
              ['stat_2_label', 'text', '"competitors rank higher"'],
              ['stat_3_number', 'text', '"0"'],
              ['stat_3_label', 'text', '"videos found by AI"'],
              ['target_name', 'text', '"Double Cross"'],
              ['target_score', 'number', '1'],
              ['comp_1_name', 'text', '"Grey Goose"'],
              ['comp_1_score', 'number', '16'],
              ['comp_2_name', 'text', '"Belvedere"'],
              ['comp_2_score', 'number', '14'],
              ['comp_3_name', 'text', '"Tito\'s"'],
              ['comp_3_score', 'number', '12'],
              ['tier1_action1', 'text', '"Add transcripts to your 12 existing YouTube videos"'],
              ['tier1_action2', 'text', '"Pin your best product review to LinkedIn featured"'],
              ['tier2_action1', 'text', '"Launch a 6-video tasting series targeting \'best premium vodka\'"'],
              ['tier2_action2', 'text', '"Build a comparison video for \'best vodka for martini\'"'],
              ['tier3_action1', 'text', '"Monthly video production + quarterly AI visibility re-scoring"'],
              ['tier3_action2', 'text', '"Full YouTube channel relaunch: branding, metadata, optimization"'],
              ['num_queries', 'number', '20'],
              ['ai_platforms', 'text', '"ChatGPT + Perplexity"'],
              ['date', 'text', '"March 13, 2026"'],
            ].map(r => new TableRow({ children: [tc(r[0], { width: 25 }), tc(r[1], { width: 12 }), tc(String(r[2]), { width: 63 })] }))),
          ],
        }),

        new Paragraph({ spacing: { after: 100 }, children: [] }),
        divider(),

        // VISUAL HIERARCHY
        h1('Visual Hierarchy'),
        p('What the eye hits first, in order:'),
        bpBold('1. Headline ', '— the hook. Biggest text on the page.'),
        bpBold('2. 3 stat cards ', '— the damage. Bold orange numbers.'),
        bpBold('3. Bar chart ', '— the gap. Visual proof.'),
        bpBold('4. Tier boxes ', '— the fix. What to do about it.'),
        bpBold('5. CTA ', '— the door. Quiet, confident.'),
        p('Everything else is supporting. Header and footer should be invisible unless you look for them.'),

        divider(),

        // EXPORT ENDPOINT
        h1('Export Endpoint'),
        p('POST /api/export-snapshot-v2', { bold: true }),
        bp('Renders the HTML template with input data'),
        bp('Screenshots via Chrome headless at 2x resolution'),
        bp('Returns PNG buffer'),
        bp('Supports ?format=portrait (1080x1350, default) or ?format=landscape (1920x1080)'),

        divider(),

        // WHAT THIS IS NOT
        h1('What This Is NOT'),
        bp('Not an HTML page. HTML is only the rendering layer — the deliverable is a PNG.'),
        bp('Not an 8-page report. That still exists for deep conversations.'),
        bp('Not a proposal. No pricing. No scope. No contract language.'),
        bp('Not a sales pitch. It\'s a gift that happens to make them want to talk to you.'),

        divider(),

        // TONE
        h1('Tone'),
        p('Write like you\'re explaining something important to a smart friend who\'s busy. No fluff. No filler. Every word earns its spot.'),

        // FOOTER
        new Paragraph({ spacing: { before: 300 }, children: [
          new TextRun({ text: 'Digital Accomplice', font: 'Arial', size: 16, color: DA_ORANGE, bold: true }),
          new TextRun({ text: '  |  digitalaccomplice.com  |  dane@digitalaccomplice.com', font: 'Arial', size: 16, color: GRAY }),
        ] }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const docxPath = '/Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/1.2_Snapshots/Snapshot_v2_Design_Doc_2026-03-13.docx';
  fs.writeFileSync(docxPath, buffer);
  console.log('DOCX saved to: ' + docxPath);

  // Convert to PDF via LibreOffice or textutil
  try {
    execSync(`cd "/Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/1.2_Snapshots" && /Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf "Snapshot_v2_Design_Doc_2026-03-13.docx" 2>&1`);
    console.log('PDF saved to: /Users/danefrederiksen/Desktop/Digital Accomplice/1_Sales/1.2_Snapshots/Snapshot_v2_Design_Doc_2026-03-13.pdf');
  } catch(e) {
    console.log('LibreOffice not available, trying alternative...');
    try {
      execSync(`cupsfilter "${docxPath}" > "${docxPath.replace('.docx','.pdf')}" 2>/dev/null`);
      console.log('PDF saved via cupsfilter');
    } catch(e2) {
      console.log('PDF conversion needs manual step. DOCX is ready — open in Preview or Word and Export as PDF.');
    }
  }
}

build().catch(console.error);
