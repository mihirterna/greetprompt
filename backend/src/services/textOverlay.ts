import { CardRequest, Language } from '../types';
import { OCCASIONS, SCENES, ALL_LANGUAGES } from '../templates/scenes';

export interface OverlayOptions {
  request: CardRequest;
  bgDataUrl: string;
}

export function generateCardSvg({ request, bgDataUrl }: OverlayOptions): string {
  const occasion = OCCASIONS[request.occasion] || OCCASIONS.good_morning;
  const scene = SCENES[request.sceneId] || occasion.scenes[0] || SCENES.gm_sunrise;
  const lang: Language = (request.language as Language) || 'en';

  const width = 1080;
  const height = 1350; // Standard 4:5 Mobile Portrait

  // Custom or Default Texts
  const title =
    request.customTitle?.trim() ||
    occasion.defaultTitle[lang] ||
    occasion.defaultTitle.en ||
    occasion.label;

  const quote =
    request.customQuote?.trim() ||
    occasion.sampleQuotes[lang]?.[0] ||
    occasion.sampleQuotes.en?.[0] ||
    'Wishing you joy and peace.';

  const subtitle =
    request.customSubtitle?.trim() || '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨';

  const recipient = request.recipientName?.trim();
  const sender = request.senderName?.trim();

  // Alignment calculations
  const alignment = request.textAlignment || 'center';
  const textAnchor = alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';
  const contentX = alignment === 'left' ? 110 : alignment === 'right' ? 970 : 540;

  // Font sizing scale
  const sizeMode = request.textSize || 'standard';
  const sizeMultiplier = sizeMode === 'compact' ? 0.85 : sizeMode === 'grand' ? 1.18 : 1.0;

  // Foil Palette Accents
  const foilMode = request.foilAccent || 'gold';
  let g1 = scene.colorPalette.goldGradient[0];
  let g2 = scene.colorPalette.goldGradient[1];
  let g3 = scene.colorPalette.goldGradient[2];

  if (foilMode === 'rose_gold') {
    g1 = '#FFE4E6';
    g2 = '#FDA4AF';
    g3 = '#E11D48';
  } else if (foilMode === 'silver') {
    g1 = '#F1F5F9';
    g2 = '#CBD5E1';
    g3 = '#64748B';
  }

  // Font family mapping per language script
  const fontObj = ALL_LANGUAGES[lang] || ALL_LANGUAGES.en;
  const headerFont = fontObj.fontFamily;
  const isRtl = !!fontObj.isRtl;

  let quoteFont = fontObj.fontFamily;
  if (['mr', 'hi'].includes(lang)) {
    quoteFont = "'Kalam', 'Rozha One', serif";
  } else if (lang === 'fr' || lang === 'it') {
    quoteFont = "'Playfair Display', serif";
  }

  // 1. Title Multi-line & Sizing Layout (Prevents horizontal title cropping)
  const titleLayout = formatTitleLayout(title, lang, sizeMultiplier);

  // 2. Multi-line quote wrapping & layout calculation for 4:5 Mobile Portrait
  const isIndic = ['hi', 'mr', 'gu', 'pa', 'te', 'ta', 'bn'].includes(lang);
  const isCjk = ['ja', 'zh', 'ko'].includes(lang);
  const isArabic = lang === 'ar';

  const maxLineChars = Math.round(
    (isCjk ? 24 : isArabic ? 34 : isIndic ? 33 : 36) / sizeMultiplier
  );
  const quoteLines = wrapText(quote, maxLineChars);

  // Dynamic typography scale based on quote line count so quotes of any length fit smoothly
  let quoteFontSize = Math.round(36 * sizeMultiplier);
  let lineSpacing = Math.round((isIndic ? 54 : 50) * sizeMultiplier);

  if (quoteLines.length === 4) {
    quoteFontSize = Math.round(32 * sizeMultiplier);
    lineSpacing = Math.round((isIndic ? 48 : 45) * sizeMultiplier);
  } else if (quoteLines.length === 5) {
    quoteFontSize = Math.round(28 * sizeMultiplier);
    lineSpacing = Math.round((isIndic ? 42 : 39) * sizeMultiplier);
  } else if (quoteLines.length >= 6) {
    quoteFontSize = Math.round(24 * sizeMultiplier);
    lineSpacing = Math.round((isIndic ? 36 : 34) * sizeMultiplier);
  }

  // quoteStartY adapts based on recipient presence and line count
  let quoteStartY = recipient ? 540 : 500;
  if (!recipient && quoteLines.length >= 5) {
    quoteStartY = 460;
  } else if (recipient && quoteLines.length >= 5) {
    quoteStartY = 530;
  }

  const dividerY = quoteStartY + (quoteLines.length - 1) * lineSpacing + 42;
  const senderY = dividerY + 44;
  const trailerY = height - 90;

  // 3. Dynamic Recipient Badge Dimensions
  const recipientPillWidth = Math.max(260, Math.min(740, (recipient?.length || 0) * 16 + 64));
  const recipientRectX =
    alignment === 'left'
      ? 110
      : alignment === 'right'
      ? 970 - recipientPillWidth
      : 540 - recipientPillWidth / 2;
  const recipientContentX =
    alignment === 'left'
      ? 110 + recipientPillWidth / 2
      : alignment === 'right'
      ? 970 - recipientPillWidth / 2
      : 540;

  // 4. Dynamic Sender Signature Line Width
  const senderLineWidth = Math.max(340, Math.min(760, ((sender?.length || 0) + 22) * 11));
  const senderLineX1 =
    alignment === 'left'
      ? 110
      : alignment === 'right'
      ? 970 - senderLineWidth
      : 540 - senderLineWidth / 2;
  const senderLineX2 =
    alignment === 'left'
      ? 110 + senderLineWidth
      : alignment === 'right'
      ? 970
      : 540 + senderLineWidth / 2;

  return `
<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Embedded Google Fonts for Worldwide Multi-Script Rendering -->
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&amp;family=Anek+Bangla:wght@600;700&amp;family=Anek+Gurmukhi:wght@600;700&amp;family=Anek+Gujarati:wght@600;700&amp;family=Anek+Tamil:wght@600;700&amp;family=Anek+Telugu:wght@600;700&amp;family=Cairo:wght@700;900&amp;family=Cinzel:wght@700;900&amp;family=Great+Vibes&amp;family=Kalam:wght@400;700&amp;family=Noto+Serif+JP:wght@600;800&amp;family=Noto+Serif+KR:wght@600;800&amp;family=Noto+Serif+SC:wght@600;800&amp;family=Playfair+Display:ital,wght@0,600;0,800;1,500&amp;family=Poppins:wght@400;600;700&amp;family=Rasa:wght@600;700&amp;family=Rozha+One&amp;family=Yatra+One&amp;display=swap');

      .font-header-festive {
        font-family: ${headerFont};
        font-weight: 800;
        letter-spacing: ${isRtl ? '0px' : '1px'};
        text-rendering: geometricPrecision;
        font-feature-settings: "kern" 1, "liga" 1;
        ${isRtl ? 'direction: rtl; unicode-bidi: embed;' : ''}
      }
      .font-recipient {
        font-family: 'Poppins', ${headerFont}, sans-serif;
        font-weight: 700;
        letter-spacing: 1px;
      }
      .font-quote {
        font-family: ${quoteFont};
        font-weight: 500;
        line-height: 1.5;
        text-rendering: geometricPrecision;
        font-feature-settings: "kern" 1, "liga" 1;
        ${isRtl ? 'direction: rtl; unicode-bidi: embed;' : ''}
      }
      .font-sender {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        letter-spacing: 1.5px;
      }
      .font-trailer {
        font-family: 'Cinzel', 'Poppins', sans-serif;
        font-weight: 700;
        letter-spacing: 2px;
      }
    </style>

    <!-- Metallic Foil Linear Gradient -->
    <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${g1}" />
      <stop offset="35%" stop-color="#FFFFFF" />
      <stop offset="65%" stop-color="${g2}" />
      <stop offset="100%" stop-color="${g3}" />
    </linearGradient>

    <!-- Warm Radial Vignette Scrim -->
    <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.30" />
      <stop offset="55%" stop-color="#000000" stop-opacity="0.58" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88" />
    </radialGradient>

    <!-- Drop Shadows for Crisp Contrast -->
    <filter id="luxuryGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.95 0"/>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- Background Raster (Curated Preset or Neural SDXL Diffusion) -->
  <image href="${bgDataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />

  <!-- Atmospheric Darkening Vignette Layer -->
  <rect width="${width}" height="${height}" fill="url(#vignetteGrad)" />

  <!-- 24K Gold Filigree Border Frame (Outer & Inner Inset) -->
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="36" ry="36" fill="none" stroke="url(#goldFoil)" stroke-width="3" stroke-opacity="0.85" filter="url(#luxuryGlow)" />
  <rect x="42" y="42" width="${width - 84}" height="${height - 84}" rx="28" ry="28" fill="none" stroke="url(#goldFoil)" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="8,5" />

  <!-- Corner Mandala Ornaments (Top-Left & Top-Right) -->
  <g stroke="url(#goldFoil)" stroke-width="1.5" fill="none" opacity="0.8">
    <path d="M 44 90 C 70 90, 90 70, 90 44" />
    <path d="M 44 110 C 90 110, 110 90, 110 44" stroke-width="0.75" />
    <circle cx="90" cy="90" r="4" fill="url(#goldFoil)" />

    <path d="M ${width - 44} 90 C ${width - 70} 90, ${width - 90} 70, ${width - 90} 44" />
    <path d="M ${width - 44} 110 C ${width - 90} 110, ${width - 110} 90, ${width - 110} 44" stroke-width="0.75" />
    <circle cx="${width - 90}" cy="90" r="4" fill="url(#goldFoil)" />
  </g>

  <!-- 1. GREETING HEADER (Gold Foil with Glow, Multi-line & Safely Scaled) -->
  <g class="font-header-festive">
    ${titleLayout.lines
      .map((line, idx) => {
        const lineY = titleLayout.startY + idx * titleLayout.lineSpacing;
        return `<text x="${contentX}" y="${lineY}" text-anchor="${textAnchor}" font-size="${titleLayout.fontSize}" fill="url(#goldFoil)" filter="url(#luxuryGlow)">${escapeXml(
          line
        )}</text>`;
      })
      .join('\n    ')}
  </g>

  <!-- Decorative Sparkle Icon -->
  <g transform="translate(${contentX - 12}, ${titleLayout.startY + (titleLayout.lines.length - 1) * titleLayout.lineSpacing + 25})" fill="url(#goldFoil)" opacity="0.9">
    <path d="M 12 0 L 15 9 L 24 12 L 15 15 L 12 24 L 9 15 L 0 12 L 9 9 Z" />
  </g>

  <!-- 2. RECIPIENT DEDICATION (If Specified - Dynamic Pill Width) -->
  ${
    recipient
      ? `
  <g filter="url(#softShadow)">
    <rect x="${recipientRectX}" y="470" width="${recipientPillWidth}" height="42" rx="21" fill="#000000" fill-opacity="0.55" stroke="url(#goldFoil)" stroke-width="1.2" />
    <text
      x="${recipientContentX}"
      y="497"
      text-anchor="middle"
      font-size="20"
      fill="#FFFFFF"
      class="font-recipient"
    >${escapeXml(recipient)}</text>
  </g>`
      : ''
  }

  <!-- 3. MAIN BLESSING / QUOTE (Non-destructive wrapping & adaptive font scale) -->
  <g filter="url(#softShadow)" class="font-quote">
    ${quoteLines
      .map((line, idx) => {
        const lineY = quoteStartY + idx * lineSpacing;
        return `<text x="${contentX}" y="${lineY}" text-anchor="${textAnchor}" font-size="${quoteFontSize}" fill="#FFFFFF" opacity="0.98">${escapeXml(
          line
        )}</text>`;
      })
      .join('\n    ')}
  </g>

  <!-- 4. SENDER SIGNATURE (If Specified - Dynamic Divider Line) -->
  ${
    sender
      ? `
  <g filter="url(#softShadow)">
    <line x1="${senderLineX1}" y1="${dividerY}" x2="${senderLineX2}" y2="${dividerY}" stroke="url(#goldFoil)" stroke-width="1.5" stroke-opacity="0.6" />
    <text
      x="${contentX}"
      y="${senderY}"
      text-anchor="${textAnchor}"
      font-size="22"
      fill="url(#goldFoil)"
      class="font-sender"
    >– With Warm Regards, ${escapeXml(sender)} –</text>
  </g>`
      : ''
  }

  <!-- 5. TRAILER / FOOTER BLESSINGS -->
  <text
    x="540"
    y="${trailerY}"
    text-anchor="middle"
    font-size="14"
    fill="url(#goldFoil)"
    opacity="0.75"
    class="font-trailer"
    filter="url(#softShadow)"
  >${escapeXml(subtitle)}</text>
</svg>`.trim();
}

interface TitleLayout {
  lines: string[];
  fontSize: number;
  lineSpacing: number;
  startY: number;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text || !text.trim()) return [''];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

function formatTitleLayout(
  title: string,
  lang: string,
  sizeMultiplier: number
): TitleLayout {
  const isIndic = ['hi', 'mr', 'gu', 'pa', 'te', 'ta', 'bn'].includes(lang);
  const isCjk = ['ja', 'zh', 'ko'].includes(lang);
  const isArabic = lang === 'ar';

  const baseHeaderFontSize = isArabic ? 64 : isCjk ? 58 : isIndic ? 62 : 56;
  const initialFontSize = Math.round(baseHeaderFontSize * sizeMultiplier);
  const trimmed = title.trim();

  // If title is short (<= 18 chars) or single word: single line with safe width cap (880px)
  if (trimmed.length <= 18 || !trimmed.includes(' ')) {
    const charWidthFactor = isIndic ? 0.68 : isCjk ? 1.0 : 0.62;
    const maxSafeSize = Math.floor(880 / Math.max(1, trimmed.length * charWidthFactor));
    const finalSize = Math.min(initialFontSize, Math.max(34, maxSafeSize));
    return {
      lines: [trimmed],
      fontSize: finalSize,
      lineSpacing: Math.round(finalSize * 1.25),
      startY: 280,
    };
  }

  // Multi-word title: split into 2 balanced lines
  const words = trimmed.split(/\s+/);
  let bestSplitIndex = Math.ceil(words.length / 2);
  let minDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(' ').length;
    const l2 = words.slice(i).join(' ').length;
    const diff = Math.abs(l1 - l2);
    if (diff < minDiff) {
      minDiff = diff;
      bestSplitIndex = i;
    }
  }

  const line1 = words.slice(0, bestSplitIndex).join(' ');
  const line2 = words.slice(bestSplitIndex).join(' ');
  const lines = [line1, line2];

  const maxChars = Math.max(line1.length, line2.length);
  const charWidthFactor = isIndic ? 0.68 : isCjk ? 1.0 : 0.62;
  const maxSafeSize = Math.floor(880 / Math.max(1, maxChars * charWidthFactor));
  const targetSize = Math.round(initialFontSize * 0.88);
  const finalSize = Math.min(targetSize, Math.max(32, maxSafeSize));
  const lineSpacing = Math.round(finalSize * (isIndic ? 1.28 : 1.22));
  const startY = 280 - Math.round(lineSpacing * 0.45);

  return {
    lines,
    fontSize: finalSize,
    lineSpacing,
    startY,
  };
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
