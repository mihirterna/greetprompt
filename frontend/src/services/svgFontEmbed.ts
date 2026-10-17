// Rasterizing an SVG through <img> + canvas never loads external resources,
// so card exports (WhatsApp share / HD download) silently lost every Google
// Font and fell back to serif. This module inlines the font subsets actually
// used by the card artwork as base64 @font-face rules inside the SVG.

const FONT_FAMILIES = [
  'family=Poppins:wght@400;600;700',
  'family=Cinzel:wght@700;900',
  'family=Great+Vibes',
  'family=Playfair+Display:ital,wght@0,500;0,600;0,800;1,500',
  'family=Kalam:wght@400;700',
  'family=Rozha+One',
  'family=Yatra+One',
  'family=Rasa:wght@600;700',
  'family=Cairo:wght@700;900',
  'family=Amiri:wght@700',
  'family=Anek+Bangla:wght@600;700',
  'family=Anek+Gurmukhi:wght@600;700',
  'family=Anek+Gujarati:wght@600;700',
  'family=Anek+Tamil:wght@600;700',
  'family=Anek+Telugu:wght@600;700',
  'family=Noto+Serif+JP:wght@600;800',
  'family=Noto+Serif+KR:wght@600;800',
  'family=Noto+Serif+SC:wght@600;800',
];

const FONT_CSS_URL = `https://fonts.googleapis.com/css2?${FONT_FAMILIES.join('&')}&display=swap`;

const CSS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_EMBED_BYTES = 4_000_000; // safety cap for the embedded font payload
const MAX_EMBED_FILES = 80;

interface FontFace {
  family: string;
  css: string;
  url: string;
  ranges: Array<[number, number]> | null;
}

let cssCache: { fetchedAt: number; faces: FontFace[] } | null = null;
const fontDataUrlCache = new Map<string, string>();

function parseUnicodeRanges(css: string): Array<[number, number]> | null {
  const match = css.match(/unicode-range:\s*([^;]+);/i);
  if (!match) return null;

  const ranges: Array<[number, number]> = [];
  for (const part of match[1].split(',')) {
    const token = part.trim().match(/^u\+([0-9a-f]+)(?:-([0-9a-f]+))?$/i);
    if (token) {
      const start = parseInt(token[1], 16);
      const end = token[2] ? parseInt(token[2], 16) : start;
      ranges.push([start, end]);
    }
  }
  return ranges.length > 0 ? ranges : null;
}

function parseFontFaces(css: string): FontFace[] {
  const faces: FontFace[] = [];
  const blockPattern = /@font-face\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(css))) {
    const body = match[1];
    const familyMatch = body.match(/font-family:\s*['"]?([^'";]+)['"]?\s*;/i);
    const urlMatch = body.match(/url\((https:\/\/[^)]+)\)/i);
    if (!familyMatch || !urlMatch) continue;

    faces.push({
      family: familyMatch[1].trim(),
      css: body.trim(),
      url: urlMatch[1],
      ranges: parseUnicodeRanges(body),
    });
  }
  return faces;
}

async function getFontFaces(): Promise<FontFace[]> {
  if (cssCache && Date.now() - cssCache.fetchedAt < CSS_CACHE_TTL_MS) {
    return cssCache.faces;
  }
  const res = await fetch(FONT_CSS_URL, { mode: 'cors' });
  if (!res.ok) throw new Error(`Font CSS request failed: ${res.status}`);
  const faces = parseFontFaces(await res.text());
  cssCache = { fetchedAt: Date.now(), faces };
  return faces;
}

function collectGlyphs(svg: string): Set<number> {
  const glyphs = new Set<number>([32]); // space
  const textPattern = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match: RegExpExecArray | null;

  while ((match = textPattern.exec(svg))) {
    const decoded = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
    for (const char of decoded) {
      const code = char.codePointAt(0);
      if (code !== undefined) glyphs.add(code);
    }
  }
  return glyphs;
}

function rangesIntersectGlyphs(ranges: Array<[number, number]>, glyphs: Set<number>): boolean {
  for (const [start, end] of ranges) {
    for (const code of glyphs) {
      if (code >= start && code <= end) return true;
    }
  }
  return false;
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const cached = fontDataUrlCache.get(url);
  if (cached) return cached;

  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`Font file request failed: ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());

  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const dataUrl = `data:font/woff2;base64,${btoa(binary)}`;
  fontDataUrlCache.set(url, dataUrl);
  return dataUrl;
}

/**
 * Inline the font subsets used by the SVG so canvas rasterization keeps the
 * real typography. Returns the original SVG unchanged on any failure.
 */
export async function embedFontsInSvg(svg: string): Promise<string> {
  try {
    const svgTagMatch = svg.match(/<svg[^>]*>/);
    if (!svgTagMatch) return svg;

    // Family names must be matched outside @import/url() references, which
    // list every family regardless of what the artwork actually uses.
    const searchable = svg.replace(/@import[^;]+;/g, '').replace(/url\([^)]*\)/g, '');
    const glyphs = collectGlyphs(svg);

    const faces = await getFontFaces();
    const rules: string[] = [];
    let totalBytes = 0;
    let fileCount = 0;

    for (const face of faces) {
      if (fileCount >= MAX_EMBED_FILES || totalBytes >= MAX_EMBED_BYTES) break;
      if (!searchable.includes(face.family)) continue;
      if (face.ranges && !rangesIntersectGlyphs(face.ranges, glyphs)) continue;

      const dataUrl = await fetchAsDataUrl(face.url);
      totalBytes += dataUrl.length;
      fileCount += 1;

      rules.push(`@font-face{${face.css.replace(face.url, dataUrl)}}`);
    }

    if (rules.length === 0) return svg;

    const styleTag = `<style type="text/css">${rules.join('')}</style>`;
    return svg.replace(svgTagMatch[0], (tag) => tag + styleTag);
  } catch (err) {
    console.warn('Font embedding skipped:', err);
    return svg;
  }
}
