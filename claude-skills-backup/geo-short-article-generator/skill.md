---
name: geo-short-article-generator
description: Turns a YouTube Short clip into a GEO-optimized blog page that answers one specific question. Use this skill when Dane has cut a short from a long-form interview and wants a ~600-word landing page that AI engines (ChatGPT, Perplexity, Gemini) can cite. Trigger phrases include "make a page for this short", "GEO short article", "build a short landing page", "turn this short into a Wix page", or any variation of converting a YouTube Short into a citable web page. Sibling to geo-article-generator. Part of the YouTube Publish System (see youtube-publish-system/ folder).
---

# GEO Short Article Generator

> **Status:** New skill — built 2026-05-02 alongside post-publish schema audit.

## Purpose

Each YouTube Short answers ONE question. This skill turns each short into its own ~600-word blog page so AI search engines can cite it independently of the long-form article. Three shorts → three citation surfaces from the same recording.

## Inputs

1. **Short transcript snippet** — the spoken content of the short (~30–60 seconds of speech, ~80–200 words). Plain text.
2. **The ONE question this short answers** — e.g. "What's the biggest mistake studios make with AI?" If Dane doesn't provide it, ASK before drafting. The whole page serves this question.
3. **YouTube Short URL** — full URL of the published short (e.g. `https://youtube.com/shorts/Abc123Xyz45`). If Dane forgets to provide this, ASK before drafting — the page should not ship without the embedded short.
4. **Parent long-form video URL** — the full long-form interview YouTube URL. Used for the "Watch the full interview" backlink.
5. **Guest name** — full name of the interviewee.
6. **Short number** — which of the 3 shorts this is (1, 2, or 3). Used for the output filename.

The parent long-form Wix URL is NOT an input — the skill always emits the literal placeholder `__LONGFORM_WIX_URL__` in its place. The `publish-interview.js` orchestrator substitutes the real URL after the long-form is published.

## Output Format

A single markdown file. Target ~600 words. Structure:

1. **H1** — the question, phrased as a real person would type it (under 70 chars)
2. **One-sentence hook** — answers the question in plain language, immediately under H1
3. **YouTube Short embed** — `<iframe>` block linking to the published short
4. **Quick Answer** — 2–3 bullet summary, scannable
5. **One H2 section** — ~300–400 words expanding the answer with context, specifics, and one direct quote from the short
6. **FAQ block** — 3 Q&A pairs (questions a real person would type into ChatGPT about this topic)
7. **"Watch the full interview"** — 1-sentence pointer to the parent long-form (with link)
8. **JSON-LD schema** — `Article` + `FAQPage` + `VideoObject` schemas, each as a separate `<script type="application/ld+json">` block at the bottom

Output path convention: `youtube-publish-system/output-samples/<guest-slug>-short-<n>-<question-slug>.md`

## Constraints

- **No hallucination.** Every factual claim must trace back to either the short transcript or the parent long-form transcript. If something is unclear, omit it.
- **5th–8th grade reading level.** Short sentences, plain words.
- **Pasteable to Wix.** Markdown renders cleanly in Wix blog editor. Iframe fallback: Wix native Video element with the same Short URL if Wix strips the iframe.
- **DA voice.** Casual but credible. Match `da-content-agent` voice rules. No corporate filler, no em dashes (use commas).
- **Tighter than long-form.** ~600 words, NOT 1,200. Shorts are bite-sized — the page should match.

## Reference

- Build plan: `youtube-publish-system/BUILD_PLAN.md` (Phase 3 — shorts pipeline)
- Sibling skill: `geo-article-generator` (long-form, ~1,200 words)
- Brand voice: `docs/DA_Brand_Standards_Skill_CORRECTED.md`

## Logic

Follow these steps in order. Do NOT skip steps or batch them.

### Step 1 — Load voice rules

Before reading the transcript, load DA voice rules from the `da-content-agent` skill (or read `docs/DA_Brand_Standards_Skill_CORRECTED.md`). Voice = casual but credible, short sentences, no corporate filler, no em dashes (use commas), no buzzwords ("synergy", "leverage", "unlock", "robust", "seamless", "best-in-class", "game-changer").

### Step 2 — Read the short transcript

Read the full short transcript carefully. It's small — read it twice. Note:
- The exact claim or insight the guest makes
- One or two phrases that capture their voice (these become quotes)
- Any specifics — names, numbers, tools, places — mentioned

### Step 3 — Confirm the question

Re-read Dane's stated question. Does the short actually answer it? If not, flag it before drafting. If yes, this question is the H1 (or close to it) and the whole page serves it.

### Step 4 — Draft the H1

Rules:
- Under 70 characters (hard cap — count them)
- Phrased as a question a real person would type into ChatGPT or Perplexity
- Natural language ("What's the biggest mistake...", "How does Todd...", "Why do most studios...")
- No clickbait, no "You Won't Believe..."
- No colons stacked with subtitles

Two formats that work:
- `[Question]?` — e.g., `What's the biggest mistake most studios make with AI?`
- `How [Guest] [verb] [object]` — e.g., `How Todd Fairbairn cuts edit time by 80%`

### Step 5 — Write the one-sentence hook

Right under the H1, before the embed. One sentence (max 25 words) that answers the question directly. GEO best practice: front-load the answer so AI engines see it in the first 100 words.

Example:
- H1: `What's the biggest mistake most studios make with AI?`
- Hook: `Most studios bolt AI onto a broken workflow instead of redesigning the workflow first — and then they wonder why it doesn't save time.`

### Step 6 — Generate YouTube Short embed snippet

Place this immediately after the hook, before Quick Answer. The embed is an `<iframe>` pointing at the Short's `embed` URL. Strip any `&list=...`, `&t=...`, or other query params from Dane's input — only the bare 11-character video ID belongs in the embed URL.

To get the Short ID:
- From `https://youtube.com/shorts/Abc123Xyz45` → `Abc123Xyz45`
- From `https://www.youtube.com/shorts/Abc123Xyz45?feature=share` → `Abc123Xyz45`

Embed format (paste verbatim, swap in the Short ID — note 9:16 aspect ratio for shorts):

```html
<iframe width="315" height="560" src="https://www.youtube.com/embed/<SHORT_ID>" title="YouTube Short player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

Wix-paste note: same fallback as long-form — if Wix strips the iframe, use a Wix native Video element pointing at the Short URL.

### Step 7 — Write Quick Answer (2–3 bullets)

Place immediately after the embed, before the H2 section.

Format:
```
## Quick Answer

- [First specific, citation-worthy claim from the short]
- [Second claim — different angle or detail]
- [(Optional) Third — actionable or counterintuitive]
```

Each bullet must:
- Be under 18 words
- Contain a specific noun (name, number, tool, place) when possible
- Stand alone — a reader who reads ONLY this list still gets value
- Be directly traceable to the short transcript

### Step 8 — Write the H2 section (~300–400 words)

ONE H2 section. The H2 should be a slightly different framing of the H1 (so the page doesn't feel repetitive) but still answer the same question.

Examples for a question H1:
- H1: `What's the biggest mistake most studios make with AI?`
- H2: `Why most AI workflows fail before they start`

The section should:
- Lead with the answer in the first sentence (front-load again)
- Back it up with specifics from the short transcript (number, name, story)
- Include ONE direct quote, formatted as `> "quote text" — Guest Name`
- Pull supporting context from the parent long-form transcript IF Dane provides it AND it strengthens the answer (mark as inference if the guest didn't say it directly in the short)
- Keep paragraphs to 2–3 sentences max
- Use a sub-list (3–4 bullets) if it improves scannability — not required

### Step 9 — Write the FAQ block (3 Q&A pairs)

Same rules as long-form GEO article — but only 3 questions, not 5. AI engines pull verbatim Q&A pairs into their answers.

Format:
```
## Frequently Asked Questions

### [Question as a real person would type it]
[Answer — 2–3 sentences, direct, traceable to the short or parent transcript]

### [Next question]
[Answer]

### [Third question]
[Answer]
```

Question rules:
- Phrase as a complete question with a question mark
- 6–14 words
- Natural language ("How does Todd...", "What does it mean to...", "Why do most...")
- Each question must have a clear answer in the short OR the parent transcript

Answer rules:
- First sentence answers the question directly
- 2–3 sentences total (tighter than long-form)
- Include at least one specific in 2 of the 3 answers
- No "It depends" hedging unless the guest hedges

### Step 10 — Write the "Watch the full interview" pointer

Place after FAQ, before schema blocks. ONE sentence + two links. The Wix URL uses a literal placeholder that the `publish-interview.js` orchestrator substitutes at publish time.

Format (exact — do NOT replace the placeholder):
```
---

**Want the full conversation?** Watch [the full interview with <Guest Name>](<parent long-form YouTube URL>) — or read [the full article](__LONGFORM_WIX_URL__).
```

The `__LONGFORM_WIX_URL__` token must appear verbatim. If Dane plans to publish manually (without the orchestrator), he replaces it by hand before publishing — but the skill always emits the placeholder.

### Step 11 — Final pass: voice + accuracy

Before writing the file, re-read your draft against these checks:

1. **No hallucination check.** Every name, number, and claim should trace to a specific transcript line (short OR parent). If a claim is your inference rather than the guest's words, either remove it or rewrite it as inference (`This suggests...` rather than `Todd said...`).
2. **Em-dash check.** Search for `—` in prose and replace with commas. Quote attributions are the only exception (`> "..." — GuestName`).
3. **Buzzword check.** Strip "leverage", "synergy", "unlock", "robust", "seamless", "best-in-class", "game-changer".
4. **Reading level.** Sentences over 25 words: split them. Words a 13-year-old wouldn't use: replace.
5. **Word count.** Target 500–700. If under 500, the H2 section is too thin. If over 700, cut adjectives.
6. **Question alignment.** Re-read the H1, the hook, the H2, and the first FAQ. They should all be answering the same question, just from different angles. If they drift, refocus.

### Step 11.5 — Append full clip transcript

Add a `## Full Clip Transcript` H2 section to the page. Placement: AFTER the "Watch the full interview" pointer (Step 10), BEFORE the JSON-LD `<script>` blocks. Visible, not collapsed.

For shorts, the transcript is short (60–200 words) and serves both as citation surface for AI engines AND as the full-text version of the spoken content.

Cleanup rules:
- **Strip timestamps.** Remove `[00:00:34]`, `(0:34)`, etc.
- **Keep speaker labels** if present. Most shorts are guest-only, so it may just be `Christopher: ...` or even no labels at all (one continuous statement).
- **Preserve the words.** Do not paraphrase or summarize. Fix obvious export typos only.

Format (single speaker — most common for shorts):

```markdown
## Full Clip Transcript

[Full text of the short, exactly as the guest said it. One block of text, no labels needed if it's a single speaker.]
```

Format (back-and-forth):

```markdown
## Full Clip Transcript

Dane: [first thing Dane says]

Christopher: [first thing the guest says]
```

### Step 12 — Generate JSON-LD schema

Three schemas, each as a separate `<script type="application/ld+json">` block at the bottom. Same structure as the long-form GEO article, but point at the SHORT (not the long-form).

**Schema A — `Article`:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<H1 verbatim>",
  "description": "<the one-sentence hook, verbatim — under 160 chars>",
  "author": {
    "@type": "Person",
    "name": "Dane Frederiksen",
    "url": "https://digitalaccomplice.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Digital Accomplice",
    "url": "https://digitalaccomplice.com"
  },
  "datePublished": "<today's date in YYYY-MM-DD>",
  "about": {
    "@type": "Person",
    "name": "<guest full name>"
  }
}
</script>
```

**Schema B — `FAQPage`:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "<exact FAQ question text>",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "<exact FAQ answer text>"
      }
    }
    // ... one object per FAQ Q&A pair (exactly 3)
  ]
}
</script>
```

**Schema C — `VideoObject`** (for the Short, NOT the long-form):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "<H1 verbatim>",
  "description": "<same description as Article schema>",
  "thumbnailUrl": "https://i.ytimg.com/vi/<SHORT_ID>/maxresdefault.jpg",
  "uploadDate": "<YYYY-MM-DDTHH:MM:SS-07:00 — full ISO 8601 with Pacific timezone offset. Use the YouTube Short upload date if known, otherwise use the article publish date with 00:00:00-07:00. Bare date strings without time/timezone trigger Google warnings.>",
  "contentUrl": "https://youtube.com/shorts/<SHORT_ID>",
  "embedUrl": "https://www.youtube.com/embed/<SHORT_ID>"
}
</script>
```

Rules (same as long-form skill):
- All three blocks at the very bottom, after the "Watch the full interview" line, separated by blank lines, in order: `Article` → `FAQPage` → `VideoObject`.
- The `headline` (Article) and `name` (VideoObject) match the H1 verbatim.
- The `description` is 1 sentence, under 160 chars, derived from the hook (do not invent). Reuse across `Article` and `VideoObject`.
- Each FAQ Q&A pair maps 1:1 to the markdown FAQ. Question and answer text match verbatim.
- Use today's date (UTC) in `YYYY-MM-DD` format for `datePublished`. The currentDate is in the system context.
- For `VideoObject`: `<SHORT_ID>` is the same 11-character ID used in the iframe.
- No trailing commas. Validate JSON mentally — Wix silently drops malformed blocks.
- Do not add `image`, `url`, or `mainEntityOfPage` fields. Dane will fill those in Wix when he picks a hero image and slug.

### Step 13 — Write the file

Output path: `youtube-publish-system/output-samples/<guest-slug>-short-<n>-<question-slug>.md`

Where:
- `<guest-slug>` is the guest's name lowercased and hyphenated (`todd-fairbairn`)
- `<n>` is the short number (1, 2, or 3)
- `<question-slug>` is the H1 lowercased, hyphenated, no question marks, max 40 chars (`whats-the-biggest-mistake-studios-make`)

Example: `todd-fairbairn-short-1-whats-the-biggest-mistake-studios-make.md`

The file contains, in order: H1, hook, YouTube Short iframe, Quick Answer, H2 section, FAQ block, "Watch the full interview" line, **Full Clip Transcript section** (per Step 11.5), then all three JSON-LD `<script>` blocks.

If the file already exists, ask Dane before overwriting.

### Step 14 — Generate the cross-link footer for the long-form article

After all 3 short pages are written (this only fires when Dane has run the skill 3 times for the same guest, OR when Dane explicitly asks for the cross-link block), output a markdown block Dane can paste into the long-form Wix article:

```markdown
---

## Watch the shorts

Each short answers one specific question from the interview:

- **[Short 1 H1]** — [Short 1 Wix URL or YouTube Short URL]
- **[Short 2 H1]** — [Short 2 Wix URL or YouTube Short URL]
- **[Short 3 H1]** — [Short 3 Wix URL or YouTube Short URL]
```

If Dane hasn't published the short pages yet, leave Wix URLs as `<TBD>` placeholders and tell him to fill in once each short page is live.

This block goes at the bottom of the long-form article, above the JSON-LD schemas. Dane pastes it manually into the Wix post (or runs a future Wix-API patch script — not yet built).

### Step 15 — Run schema audit (optional but recommended)

After Dane publishes the short page to Wix, recommend he run the audit:

```bash
node youtube-publish-system/scripts/audit-schema.js <live-short-page-url>
```

The audit confirms all 3 schemas (Article, FAQPage, VideoObject) parse cleanly, FAQ Q&A count matches, and `uploadDate` has full ISO 8601 + timezone.

### Step 16 — Report back

After writing the file, tell Dane:
- Output path
- Final word count (article body, schema not counted)
- The H1 you chose (so he can confirm it matches the question he intended)
- One thing to verify (e.g., "I quoted Todd as saying X — confirm that's what he said in the short")
- Confirm all three schema blocks were generated, FAQ Q&A count in schema matches markdown, Short ID in iframe and `VideoObject` matches Dane's URL
- If this is short 3 of 3 for this guest, also output the cross-link footer block (Step 14)
- Remind him to run the audit script after publishing
