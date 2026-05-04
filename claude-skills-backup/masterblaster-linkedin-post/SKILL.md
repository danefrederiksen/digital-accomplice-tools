---
name: masterblaster-linkedin-post
description: Generates the LinkedIn post draft that promotes a freshly-published MasterBlaster guest interview. Always run this as the LAST step of MasterBlaster (after Wix publish, YouTube metadata patch, and YouTube public flip). Trigger phrases: "linkedin post for [guest]", "draft the linkedin post", or any MasterBlaster end-of-flow request. Outputs `<guest>-linkedin-post.md` in `youtube-publish-system/output-samples/` containing the post body, first comment, image brief, and posting recs. Part of the YouTube Publish System (MasterBlaster).
---

# MasterBlaster LinkedIn Post Generator

## Purpose

The final deliverable in every MasterBlaster run. Drafts a 200–350 word LinkedIn post that drives traffic to the freshly-published long-form interview, plus the first comment (where the link goes) and an image brief. Dane needs to be able to copy-paste-and-go without rewriting voice or formatting.

## When to use

- ALWAYS after a successful MasterBlaster publish (Wix + YouTube + public).
- Standalone, when Dane asks for a LinkedIn post about a specific interview.

## Inputs

1. **Guest name** — full name (e.g. "Kaleigh Moore").
2. **Guest credentials** — 1-2 line resume of why they're credible (where they've written/worked, current role, any degree/title).
3. **Long-form Wix URL** — the published interview URL.
4. **The ONE most citable stat or claim from the interview** — the surprising specific that will anchor the hook (e.g. "Reddit, YouTube, and LinkedIn are the top 3 sites LLMs cite for B2B").
5. **3 supporting takeaways** — bullet-worthy points covered in the interview (for the "we also covered" mini-list near the end).
6. **Comment keyword** — single word for the DM-trigger CTA (default: "INTERVIEW" or guest first name).

If any of these aren't provided, ASK before drafting. Don't invent the citable stat — it must come from the actual interview.

## Output Format

Single markdown file at `youtube-publish-system/output-samples/<guest-slug>-linkedin-post.md` with these sections:

1. **Header** — guest name, recording date, long-form URL, comment keyword
2. **Post Body** — fenced code block, paste-ready
3. **First Comment** — fenced code block, paste-ready (contains the URL)
4. **Image Brief** — bullet list, vertical 1200×1500, DA brand-compliant
5. **Posting Recs** — day, time, engagement window reminder, DM-reply note

## Post Body Format Rules (LOCKED)

These rules are non-negotiable. They follow Dane's voice + LinkedIn rules from `da-content-agent` and `linkedin-content`.

- **Word count:** 200–350 words (count and verify before writing the file)
- **Hook:** Curiosity-gap or contrarian. NEVER list-promise ("8 things..."). Lead with a specific noun (a stat, a name, or a category-shifting claim).
- **Hook structure that works** (use this pattern when the citable stat is itself a list of 2-4 nouns):
  ```
  [Noun 1]. [Noun 2]. [Noun 3].

  [Reveal what they are.]

  [Negation that creates a contrast — "not your X. Not your Y."]

  [Credentialed source line.]

  [Stakes line — "that should reset every X."]
  ```
- **No em-dashes anywhere.** Use commas, periods, or colons. The single allowed em-dash exception is in quote attributions like `— Guest Name` in image briefs (not in the post body).
- **No hashtags.** Zero. Ever.
- **No external links in the post body.** The URL goes in the first comment only.
- **Emoji:** ⁉️ for the question-list section (Dane signature). Maximum one other emoji elsewhere if any. Never more than one ⁉️ run per post.
- **Question list:** Use 3 ⁉️ questions that flip the citable stat into a self-audit ("Is your X doing Y?"). Place after the first body section, before the second deeper take.
- **Bulleted "we also covered" list:** 3 bullets. Use • not -. One short concrete teaser per bullet.
- **CTA:** "Comment [KEYWORD] and I'll send you..." pattern. Don't link. Don't pitch services. The post earns the DM, the DM does the rest.
- **No buzzwords.** Strip "leverage", "synergy", "unlock", "robust", "seamless", "best-in-class", "game-changer".
- **Specifics required.** Name the brands the guest worked at. Cite the timeline ("12 years"). Reference the actual companies discussed in the interview (HubSpot, AirOps, Gong, Stripe, etc.).

## First Comment Format

Two lines max:

```
Full interview + N shorts here:

<long-form Wix URL>
```

If only the long-form is published (no shorts), drop the "+ N shorts" part.

## Image Brief Format

DA-brand-compliant vertical 1200×1500. Required fields:

- **Layout:** Guest headshot placement, text block placement
- **Headline (large, Inter Bold):** The hook noun-list verbatim (e.g., "Reddit. YouTube. LinkedIn.")
- **Subhead (smaller, Inter Regular):** One-line context
- **Attribution:** `— Guest Name, [credentials in 3-5 words]`
- **Brand:** DA Orange (#F8901E) accent bar, "Digital Accomplice" wordmark
- **Style notes:** No gradients, no shadows. Flat color blocks. White or light-gray background.

## Posting Recs (boilerplate — include verbatim)

- **Day:** Tuesday, Wednesday, or Thursday
- **Time:** 5–7 AM or 8–10 AM Pacific
- **First 60 min = 70% of reach.** Be available to reply.
- **DM auto-reply:** Set up so anyone who comments "[KEYWORD]" gets the long-form URL automatically.

## Logic — Step by Step

### Step 1 — Pull the citable stat from the interview

Read the long-form transcript or article. Identify the ONE moment that, if quoted standalone, would make a stranger stop scrolling. Usually a number, a list of specific names, or a contrarian claim.

If the user provided the stat, verify it traces to the transcript. If they didn't, propose 2-3 candidates and ASK before drafting.

### Step 2 — Draft the hook

Use the curiosity-gap noun-list pattern when the stat is itself a list. Otherwise lead with a single specific (a number with stakes, a contrarian framing, or a credentialed name).

Hook must be punchy enough that someone reading only the first 3 lines (LinkedIn truncates around there on mobile) would tap "see more".

### Step 3 — Draft the body

Structure:
- 2-3 sentences expanding the citable stat (why it's true, what it implies)
- Concrete evidence: name brands, name people, name platforms
- The ⁉️ question list (3 questions that flip the stat into a self-audit)
- One more deeper take from the interview (e.g., the economic angle or the timeline)
- "We also covered" bulleted teaser (3 bullets)
- CTA: "Comment [KEYWORD] and I'll send you..."

### Step 4 — Voice + format pass

Re-read against:
- No em-dashes. Search for `—` and `–`. Replace with `,`, `.`, or `:`.
- No buzzwords.
- 200–350 words. Count.
- Sentences over 25 words: split.
- 1-2 emoji max (⁉️ counts as one type even if used 3x).
- First sentence: under 12 words.

### Step 5 — Write the file

Output path: `youtube-publish-system/output-samples/<guest-slug>-linkedin-post.md`

Where `<guest-slug>` is the guest's name lowercased and hyphenated (e.g., `kaleigh-moore`).

If the file already exists, ask before overwriting.

### Step 6 — Report back

Tell Dane:
- File path
- Word count of the post body
- Hook used (curiosity-gap vs contrarian vs credentialed)
- Comment keyword
- Posting day/time recommendation
- One thing to verify before posting (e.g., "I quoted Kaleigh as saying X — confirm that traces to the transcript")

## Reference

- Voice: `da-content-agent` skill (loaded automatically)
- LinkedIn rules: `linkedin-content` skill (formatting, hook performance data)
- Sample reference output: `youtube-publish-system/output-samples/kaleigh-moore-linkedin-post.md` (first run, 2026-05-04)
- Brand: `docs/DA_Brand_Standards_Skill_CORRECTED.md`
