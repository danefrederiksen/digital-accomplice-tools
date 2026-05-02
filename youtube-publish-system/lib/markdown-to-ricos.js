// Convert the markdown produced by the geo-article-generator skill into Wix Ricos rich content.
// The skill output uses a small subset of markdown — we only handle what it actually emits:
//   H1 (extracted as title, stripped from body), H2/H3 headings, paragraphs,
//   bulleted lists, blockquotes, inline bold/italic/links/code.
// Inline iframes and <script type="application/ld+json"> blocks are stripped by the caller —
// they're handled separately as YouTube embed + structured-data injection.

import { marked } from 'marked';

export function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

// Pulls all `<script type="application/ld+json">{...}</script>` blocks out of the markdown.
// Returns an array of raw JSON strings (one per script tag), trimmed.
export function extractJsonLdScripts(md) {
  const re = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    const json = m[1].trim();
    if (json) out.push(json);
  }
  return out;
}

// Build a Wix Blog seoData payload that injects the given JSON-LD scripts as tags.
// Wix's documented shape: tags[].type="script", props.type="application/ld+json", children=raw JSON string.
export function buildSeoData(jsonLdStrings) {
  return {
    tags: jsonLdStrings.map(json => ({
      type: 'script',
      props: { type: 'application/ld+json' },
      children: json,
    })),
  };
}

// Pulls the first YouTube URL out of an <iframe src="..."> in the markdown.
// Returns the canonical watch URL (https://www.youtube.com/watch?v=ID) or null.
export function extractYouTubeUrl(md) {
  const iframe = md.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/i);
  if (!iframe) return null;
  const src = iframe[1];
  const idMatch = src.match(/youtube(?:-nocookie)?\.com\/(?:embed|watch\?v=)\/?([A-Za-z0-9_-]{11})/);
  if (!idMatch) return null;
  return `https://www.youtube.com/watch?v=${idMatch[1]}`;
}

export function stripUnsupported(md) {
  let out = md;
  // Strip <script>...</script> blocks (JSON-LD schemas).
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // Strip iframe blocks (YouTube embed) — handled by Wix native video block instead.
  out = out.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
  // Strip the H1 — Wix renders the post title separately.
  out = out.replace(/^#\s+.+$/m, '');
  return out.trim();
}

function makeIdGen() {
  let n = 0;
  return () => `n${++n}`;
}

function inlineToTextNodes(tokens, decorationStack, idGen) {
  const out = [];
  if (!tokens) return out;
  for (const t of tokens) {
    if (t.type === 'text' || t.type === 'escape') {
      // Recurse if marked nested inline tokens (happens inside list items).
      if (t.tokens?.length) {
        out.push(...inlineToTextNodes(t.tokens, decorationStack, idGen));
      } else {
        out.push(textNode(t.text, decorationStack, idGen));
      }
    } else if (t.type === 'strong') {
      out.push(...inlineToTextNodes(
        t.tokens,
        [...decorationStack, { type: 'BOLD', fontWeightValue: 700 }],
        idGen,
      ));
    } else if (t.type === 'em') {
      out.push(...inlineToTextNodes(
        t.tokens,
        [...decorationStack, { type: 'ITALIC', italicData: true }],
        idGen,
      ));
    } else if (t.type === 'codespan') {
      out.push(textNode(t.text, [...decorationStack, { type: 'CODE' }], idGen));
    } else if (t.type === 'link') {
      const linkDeco = { type: 'LINK', linkData: { link: { url: t.href } } };
      out.push(...inlineToTextNodes(t.tokens, [...decorationStack, linkDeco], idGen));
    } else if (t.type === 'br') {
      out.push(textNode('\n', decorationStack, idGen));
    } else if (t.text) {
      out.push(textNode(t.text, decorationStack, idGen));
    }
  }
  return out;
}

function textNode(text, decorations, idGen) {
  return {
    type: 'TEXT',
    id: idGen(),
    nodes: [],
    textData: { text, decorations: [...decorations] },
  };
}

function blockToNode(token, idGen) {
  switch (token.type) {
    case 'heading':
      return {
        type: 'HEADING',
        id: idGen(),
        nodes: inlineToTextNodes(token.tokens, [], idGen),
        headingData: { level: token.depth },
      };
    case 'paragraph':
      return {
        type: 'PARAGRAPH',
        id: idGen(),
        nodes: inlineToTextNodes(token.tokens, [], idGen),
        paragraphData: {},
      };
    case 'list':
      return {
        type: token.ordered ? 'ORDERED_LIST' : 'BULLETED_LIST',
        id: idGen(),
        nodes: token.items.map(item => ({
          type: 'LIST_ITEM',
          id: idGen(),
          nodes: [{
            type: 'PARAGRAPH',
            id: idGen(),
            nodes: inlineToTextNodes(
              // marked wraps list-item content in a text token whose .tokens are the inline tokens.
              item.tokens?.[0]?.tokens || item.tokens || [],
              [],
              idGen,
            ),
            paragraphData: {},
          }],
        })),
      };
    case 'blockquote':
      return {
        type: 'BLOCKQUOTE',
        id: idGen(),
        nodes: token.tokens.map(t => blockToNode(t, idGen)).filter(Boolean),
      };
    case 'space':
    case 'html':
      return null;
    default:
      return null;
  }
}

export function markdownToRicos(md) {
  const cleaned = stripUnsupported(md);
  const tokens = marked.lexer(cleaned);
  const idGen = makeIdGen();
  const nodes = tokens.map(t => blockToNode(t, idGen)).filter(Boolean);
  return { nodes };
}

// Convert markdown into Ricos rich content with a YouTube VIDEO node inserted
// at the position where the original iframe appeared. Falls back to plain
// markdownToRicos() if no iframe is present.
export function markdownToRicosWithVideo(md) {
  const iframeMatch = md.match(/<iframe\b[\s\S]*?<\/iframe>/i);
  const youtubeUrl = extractYouTubeUrl(md);
  if (!iframeMatch || !youtubeUrl) return markdownToRicos(md);

  const before = md.slice(0, iframeMatch.index);
  const after = md.slice(iframeMatch.index + iframeMatch[0].length);

  const idGen = makeIdGen();
  const beforeNodes = marked.lexer(stripUnsupported(before)).map(t => blockToNode(t, idGen)).filter(Boolean);
  const videoNode = {
    type: 'VIDEO',
    id: idGen(),
    nodes: [],
    videoData: {
      containerData: {
        width: { size: 'CONTENT' },
        alignment: 'CENTER',
        textWrap: true,
      },
      video: { src: { url: youtubeUrl } },
    },
  };
  const afterNodes = marked.lexer(stripUnsupported(after)).map(t => blockToNode(t, idGen)).filter(Boolean);

  return { nodes: [...beforeNodes, videoNode, ...afterNodes] };
}
