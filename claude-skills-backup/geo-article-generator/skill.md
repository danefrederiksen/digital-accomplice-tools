---
name: geo-article-generator
description: Turns a long-form interview transcript into a GEO-optimized article ready to paste into Wix. Use this skill when Dane has a Riverside interview transcript and wants a 1,200-word article with H1/H2 structure, FAQ block, key takeaways, and JSON-LD schema markup. Trigger phrases include "make an article from this transcript", "GEO article", "turn this transcript into a Wix article", "build the article for [guest name]", or any variation of converting an interview transcript into website content. Part of the YouTube Publish System (see youtube-publish-system/ folder).
---

# GEO Article Generator

> **Status:** Steps 1.3–1.4 complete (article logic + JSON-LD schema). Wix-paste verification in Step 1.5.

## Purpose

Convert a long-form interview transcript (Riverside export, ~30–60 min) into a GEO-optimized markdown article that Dane can paste directly into Wix. Output is structured so AI search engines (ChatGPT, Perplexity, Gemini) can cite the article when answering questions about the guest or topic.

## Inputs

1. **Transcript** — plain-text file (`.txt`). Riverside-style timestamped or untimestamped. Path provided by Dane or pasted inline.
2. **Guest name** — full name of the interviewee (e.g. "Todd Fairbairn").
3. **YouTube video URL** — the published YouTube link for the interview (e.g. `https://www.youtube.com/watch?v=gb_zGCPPVvU`). Used for the on-page embed and the `VideoObject` schema. If Dane forgets to provide this, ASK before drafting — the article should not ship without the video.
4. **Episode angle** *(optional)* — one-line framing if Dane has a specific hook. If omitted, the skill picks the strongest angle from the transcript.
5. **The short titles** *(optional)* — the H1 questions of the sibling short articles, in order. **Any number of shorts is supported** (typically 2–5). If Dane provides them, the article gets a "Watch the shorts" cross-link section before the transcript (Step 12.5). The Wix URLs use placeholders (`__SHORT_1_WIX_URL__`, `__SHORT_2_WIX_URL__`, ... `__SHORT_N_WIX_URL__`) that the `publish-interview.js` orchestrator substitutes at publish time. If Dane skips this input, no cross-link section is emitted.

## Output Format

A single markdown file. Target ~1,200 words. Structure:

1. **H1** — article title (under 60 chars, includes guest name + hook)
2. **Optional intro** — 1–2 sentences setting up the guest (skip if H1 + Takeaways already do that work)
3. **YouTube video embed** — `<iframe>` block linking to the published video (right below intro, above Key Takeaways)
4. **Key Takeaways** — 3–5 bullet summary, scannable
5. **H2 sections** — 4–6 sections covering the substance of the interview
6. **FAQ block** — 3–5 Q&A pairs (the questions should match what real people ask AI engines about this topic)
7. **JSON-LD schema** — `Article` + `FAQPage` + `VideoObject` schemas, each as a separate `<script type="application/ld+json">` block at the bottom

Output path convention: `youtube-publish-system/output-samples/<guest-slug>-article.md`

## Constraints

- **No hallucination.** Every factual claim must trace back to the transcript. If something is unclear, omit it.
- **5th–8th grade reading level.** Short sentences, plain words.
- **Pasteable to Wix.** Markdown renders cleanly in Wix blog editor. FAQ may need HTML if Wix mangles markdown lists (verified in Step 1.5).
- **DA voice.** Casual but credible. Match `da-content-agent` voice rules. No corporate filler, no em dashes (use commas).

## Reference

- Build plan: `youtube-publish-system/BUILD_PLAN.md` (Phase 1)
- Status: `youtube-publish-system/STATUS.md`
- Sample transcript for testing: `youtube-publish-system/tests/todd-fairbairn-transcript.txt`

## Logic

Follow these steps in order. Do NOT skip steps or batch them.

### Step 1 — Load voice rules

Before reading the transcript, load DA voice rules from the `da-content-agent` skill (or read `docs/DA_Brand_Standards_Skill_CORRECTED.md` if the skill is unavailable). Voice = casual but credible, short sentences, no corporate filler, no em dashes (use commas), no buzzwords ("synergy", "leverage", "unlock"). The article must sound like Dane wrote it after listening to the interview, not like a generic AI summary.

### Step 2 — Read the full transcript

Read the entire transcript file before writing anything. Do not skim. Note:
- Guest's specific stories, numbers, names, dates
- Direct quotes that capture their voice
- Counterintuitive claims or contrarian takes (these are the GEO gold — AI engines cite surprising specifics, not platitudes)
- The 1–2 ideas that would make a stranger stop scrolling

If the transcript has timestamps, ignore them in the output but use them mentally to track sequence.

### Step 3 — Pick the angle

If Dane provided an episode angle, use it. Otherwise, pick the strongest hook yourself:
- What's the ONE claim or insight a reader would screenshot?
- What does this guest say that nobody else is saying?
- What problem does the reader have that this guest solves?

State the angle in one sentence before drafting. The whole article serves this angle.

### Step 4 — Draft the H1 title

Rules:
- Under 60 characters (hard cap — count them)
- Includes guest name OR a number/specific claim from the transcript
- Reads like a real person typing it, not a SEO bot
- No colons stacked with subtitles; one clean line
- No clickbait, no "You Won't Believe..."

Two formats that work:
- `[Specific claim]. [Guest name] on [topic].` — e.g., `3-Person Team. Zero Slop. Todd Fairbairn on AI ops.`
- `How [Guest] [did something specific]` — e.g., `How Todd Fairbairn Runs a Studio With 3 People`

### Step 5 — Write Key Takeaways (3–5 bullets)

Place this block immediately after the H1, before any H2.

Format:
```
## Key Takeaways

- [One specific, citation-worthy claim from the interview]
- [Second claim — different angle]
- [Third — actionable or counterintuitive]
- [(Optional) Fourth]
- [(Optional) Fifth]
```

Each bullet must:
- Be under 20 words
- Contain a specific noun (name, number, tool, place) — not just an idea
- Stand alone (a reader who reads ONLY this list still gets value)
- Be directly traceable to a sentence in the transcript

### Step 6 — Outline 4–6 H2 sections

Sections should follow the natural arc of the conversation, but rearranged so the strongest material is up top. Don't preserve transcript order if a later moment is the actual hook.

Each H2 should answer ONE question. Phrase the H2 as a statement OR a real question someone might type into ChatGPT (the latter is better for GEO). Examples:

- `Why a 3-person team beats a 30-person agency`
- `What does Todd's daily AI workflow look like?`
- `The biggest mistake most studios make`
- `How to cut production time without cutting quality`

Avoid generic H2s like "Background" or "About Todd" — they don't earn their place in an AI citation.

### Step 7 — Write each H2 section (~150–250 words each)

Per section:
- Lead with the answer in the first sentence (GEO: front-load, don't bury)
- Back it up with a specific from the transcript (number, name, story)
- Include at least one direct quote in the article overall (you don't need a quote in every section, but at least 1–2 across all sections — formatted as `> "quote text" — Todd Fairbairn`)
- Keep paragraphs to 2–3 sentences max
- Use a sub-list (3–5 bullets) in 1–2 sections where it improves scannability — but don't list-ify everything; prose carries the voice

Word count target across all sections: 700–900 words. Combined with takeaways + FAQ + intro snippet, the article lands at ~1,200.

### Step 8 — Write the FAQ block (3–5 Q&A pairs)

This is the highest-leverage GEO section. AI engines pull verbatim Q&A pairs into their answers. Write the questions the way a real person would type them into ChatGPT or Perplexity, not the way a marketer would write them.

Format:
```
## Frequently Asked Questions

### [Question as a real person would type it]
[Answer — 2–4 sentences, direct, traceable to transcript]

### [Next question]
[Answer]
```

Question rules:
- Phrase as a complete question with a question mark
- 6–14 words
- Use natural language ("How does Todd...", "What tools does...", "Why did Todd...")
- Each Q must have a clear answer in the transcript — if you have to invent the answer, drop the question

Answer rules:
- First sentence answers the question directly (front-loading again)
- 2–4 sentences total
- Include at least one specific (name, tool, number) in 3 of the 5 answers
- No "It depends" hedging unless the transcript explicitly hedges

### Step 9 — Optional intro paragraph

Below the H1, above the video embed: 1–2 sentences setting up who the guest is and why this conversation matters. Skip if the H1 + Key Takeaways already do that work. When in doubt, skip — bloat hurts GEO more than it helps.

### Step 10 — Generate YouTube embed snippet

Place this block immediately after the optional intro and BEFORE Key Takeaways. The embed is a `<iframe>` pointing at the video's `embed` URL, NOT the watch URL. Strip any `&list=...`, `&t=...`, or other query params from Dane's input — only the bare 11-character video ID belongs in the embed URL.

To get the video ID:
- From `https://www.youtube.com/watch?v=gb_zGCPPVvU&list=PLLG2L3M2Y916...` → `gb_zGCPPVvU`
- From `https://youtu.be/gb_zGCPPVvU` → `gb_zGCPPVvU`

Embed format (paste verbatim, swap in the video ID):

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/<VIDEO_ID>" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

Wix-paste note (for Step 13 reporting, not for the file): Wix's blog editor may strip raw `<iframe>` HTML for security. If it does, Dane's fallback is to delete the iframe block and use a Wix native Video element with the same YouTube URL — the page renders the same and the schema still tells AI engines it's the canonical video.

### Step 11 — Final pass: voice + accuracy

Before writing the file, re-read your draft against these checks:

1. **No hallucination check.** Every name, number, and claim should trace to a specific transcript line. If a claim is your inference rather than the guest's words, either remove it or rewrite it as inference (`This suggests...` rather than `Todd said...`).
2. **Em-dash check.** Search for `—` in prose and replace with commas. (DA voice rule.) Quote attributions are the only exception — keep `> "..." — GuestName` lines as-is, since that's standard quote convention and reads cleanly in Wix.
3. **Buzzword check.** Strip "leverage", "synergy", "unlock", "robust", "seamless", "best-in-class", "game-changer".
4. **Reading level.** Sentences over 25 words: split them. Words a 13-year-old wouldn't use: replace.
5. **Word count.** Run `wc -w` mentally. Target 1,100–1,300. If under, you skipped a section. If over, cut adjectives.

### Step 11.5 — Append full transcript

Add a `## Full Interview Transcript` H2 section to the article. Placement: AFTER the FAQ block, BEFORE the JSON-LD `<script>` blocks. Visible, not collapsed — AI engines cite text they can see, and the extra crawlable surface is the whole point of including it.

Cleanup rules:
- **Strip timestamps.** Remove `[00:12:34]`, `(12:34)`, `12:34 — `, or any timestamp pattern. Riverside/Otter exports have these and they read like noise.
- **Keep speaker labels.** Preserve `Dane:` / `<Guest first name>:` (or however the export labels them) so the back-and-forth reads clearly. Normalize the labels to `Dane:` and `<Guest first name>:` if the export uses inconsistent variants (`DF:`, `Dane Frederiksen:`, etc.).
- **Preserve the words.** Do NOT paraphrase, summarize, or "clean up" the transcript. Fix obvious export typos only (e.g., `youknow` → `you know`).
- **One blank line between speakers.** Helps Wix render it readable.

Format:

```markdown
## Full Interview Transcript

Dane: [first thing Dane says]

Christopher: [first thing the guest says]

Dane: [next exchange]

[... continue for the entire transcript]
```

Word count note: the transcript adds significant length to the article (often 3,000–8,000 words for a 30–60 min interview). That's expected and good for GEO. Word count targets in Step 11 (~1,200 words) refer to the article BODY only, not including the transcript.

### Step 12 — Generate JSON-LD schema

This is the GEO payload Wix will inline so AI engines and search crawlers can parse the article cleanly. THREE schemas, each as a separate `<script type="application/ld+json">` block at the bottom of the markdown file.

**Schema A — `Article`:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<H1 title verbatim>",
  "description": "<one-sentence summary, ~150 chars, derived from the intro or first key takeaway>",
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
    // ... one object per FAQ Q&A pair
  ]
}
</script>
```

**Schema C — `VideoObject`:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "<H1 title verbatim>",
  "description": "<same description as Article schema>",
  "thumbnailUrl": "https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg",
  "uploadDate": "<YYYY-MM-DDTHH:MM:SS-07:00 — full ISO 8601 with Pacific timezone offset. Use the YouTube upload date if known, otherwise use the article publish date with 00:00:00-07:00. Bare date strings without time/timezone trigger Google warnings.>",
  "contentUrl": "https://www.youtube.com/watch?v=<VIDEO_ID>",
  "embedUrl": "https://www.youtube.com/embed/<VIDEO_ID>"
}
</script>
```

Rules:
- All three blocks go at the very bottom of the markdown file, after the FAQ section, separated by blank lines, in this order: `Article` → `FAQPage` → `VideoObject`.
- The `headline` (Article) and `name` (VideoObject) fields must match the H1 verbatim, characters and casing preserved.
- The `description` field must be 1 sentence, under 160 chars, derived from the article (do not invent). Reuse the same description across `Article` and `VideoObject`.
- Each FAQ Question/Answer pair maps 1:1 to the `## Frequently Asked Questions` block. Question text and answer text must match the markdown verbatim, including punctuation.
- Use today's date (UTC) in `YYYY-MM-DD` format for `datePublished`. The currentDate is in the system context.
- For `VideoObject`: `<VIDEO_ID>` is the same 11-character ID used in the iframe. Same value goes in `thumbnailUrl`, `contentUrl`, and `embedUrl` slots.
- No trailing commas. Validate the JSON mentally before writing — Wix will silently drop a block if JSON is malformed.
- Do not add `image`, `url`, or `mainEntityOfPage` fields to the Article schema. Dane will fill those in Wix when he picks a hero image and slug. Do not add `duration` to VideoObject unless Dane provides it.

### Step 12.5 — "Watch the shorts" cross-link section *(skip if Input #5 not provided)*

Place between FAQ and Full Interview Transcript. One bullet link per sibling short. Number of bullets matches the number of shorts Dane provided in Input #5 (typically 2–5; could be more). Wix URLs use literal placeholders that the `publish-interview.js` orchestrator substitutes at publish time.

Format (exact — do NOT replace the placeholders, and emit exactly N bullets where N = number of shorts):
```
## Watch the shorts

Each short answers one specific question from the interview:

- [<Short 1 title verbatim>](__SHORT_1_WIX_URL__)
- [<Short 2 title verbatim>](__SHORT_2_WIX_URL__)
- [<Short 3 title verbatim>](__SHORT_3_WIX_URL__)
... (continue for short 4, 5, ... if Dane provided more)
```

The placeholder tokens (`__SHORT_1_WIX_URL__`, `__SHORT_2_WIX_URL__`, etc.) must appear verbatim and must match the count of shorts. The orchestrator does dumb string replace on each one. If Dane plans to publish manually (without the orchestrator), he replaces them by hand before publishing.

### Step 13 — Write the file

Output path: `youtube-publish-system/output-samples/<guest-slug>-article.md`

Where `<guest-slug>` is the guest's name lowercased and hyphenated (e.g., `todd-fairbairn`).

The file contains, in order: H1, optional intro, YouTube embed iframe, Key Takeaways, H2 sections, FAQ block, **"Watch the shorts" cross-link section** (per Step 12.5, only if shorts exist), **Full Interview Transcript section** (per Step 11.5), then all three JSON-LD `<script>` blocks at the bottom (`Article` → `FAQPage` → `VideoObject`).

If the file already exists, ask Dane before overwriting.

### Step 14 — Report back

After writing, tell Dane:
- Output path
- Final word count (article body, schema not counted)
- The angle you chose
- One thing you want him to verify (e.g., "I quoted Todd as saying X, confirm that's what he said in the transcript around minute 12")
- Confirm all three schema blocks were generated, the FAQ Q&A count in the schema matches the markdown, and the video ID in both the iframe and `VideoObject` matches Dane's YouTube link
- Wix-paste note: if Wix's blog editor strips the raw `<iframe>`, fallback is to delete the iframe block and use a Wix native Video element with the same YouTube URL — the page renders the same and the schema still works.
