import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  Zap,
  Smartphone,
} from 'lucide-react';
import {
  CardRequest,
  CardResponse,
  QualityMode,
  OccasionDefinition,
  SceneDefinition,
} from '../types';

interface CardPreviewProps {
  request: CardRequest;
  generatedCard: CardResponse | null;
  customGeneratedBackground?: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  onChangeQuality: (mode: QualityMode) => void;
  occasionDef?: OccasionDefinition;
  sceneDef?: SceneDefinition;
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

export const CardPreview: React.FC<CardPreviewProps> = ({
  request,
  generatedCard,
  customGeneratedBackground,
  isLoading,
  onGenerate,
  onChangeQuality,
  occasionDef,
  sceneDef,
}) => {
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const lang = request.language || 'en';
  const isCustomPromptMode = request.backgroundMode === 'custom_prompt';

  // Active Background Image (Preserves custom generated AI image even when text/alignment is edited)
  const activeBgUrl = customGeneratedBackground || sceneDef?.previewImage;

  // Custom or Default Texts
  const title =
    request.customTitle?.trim() ||
    occasionDef?.defaultTitle[lang] ||
    occasionDef?.defaultTitle.en ||
    occasionDef?.label ||
    'Good Morning';

  const quote =
    request.customQuote?.trim() ||
    occasionDef?.sampleQuotes[lang]?.[0] ||
    occasionDef?.sampleQuotes.en?.[0] ||
    'Wishing you joy, peace and happiness.';

  const subtitle =
    request.customSubtitle?.trim() || '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨';

  // Typography Alignment & Scale
  const alignment = request.textAlignment || 'center';
  const textAnchor = alignment === 'left' ? 'start' : alignment === 'right' ? 'end' : 'middle';
  const contentX = alignment === 'left' ? 110 : alignment === 'right' ? 970 : 540;

  const sizeMode = request.textSize || 'standard';
  const sizeMultiplier = sizeMode === 'compact' ? 0.85 : sizeMode === 'grand' ? 1.18 : 1.0;

  // Foil Shimmer Palette
  const foilMode = request.foilAccent || 'gold';
  let g1 = sceneDef?.colorPalette.goldGradient[0] || '#FFF275';
  let g2 = sceneDef?.colorPalette.goldGradient[1] || '#FFA751';
  let g3 = sceneDef?.colorPalette.goldGradient[2] || '#E5A638';

  if (foilMode === 'rose_gold') {
    g1 = '#FFE4E6';
    g2 = '#FDA4AF';
    g3 = '#E11D48';
  } else if (foilMode === 'silver') {
    g1 = '#F1F5F9';
    g2 = '#CBD5E1';
    g3 = '#64748B';
  }

  const p = sceneDef?.colorPalette || {
    primary: '#FFE259',
    secondary: '#FFA751',
    accent: '#FF7043',
    goldGradient: [g1, g2, g3],
    scrimOverlay: 'rgba(15, 8, 4, 0.42)',
    textColor: '#FFFFFF',
  };

  let previewHeaderFont = "'Cinzel', 'Playfair Display', serif";
  let previewQuoteFont = "'Playfair Display', serif";

  if (lang === 'ar') {
    previewHeaderFont = "'Cairo', 'Amiri', serif";
    previewQuoteFont = "'Amiri', serif";
  } else if (['ja', 'ko', 'zh'].includes(lang)) {
    previewHeaderFont = "'Noto Serif JP', 'Noto Serif KR', 'Noto Serif SC', serif";
    previewQuoteFont = "'Noto Serif JP', serif";
  } else if (['mr', 'hi'].includes(lang)) {
    previewHeaderFont = "'Rozha One', 'Yatra One', serif";
    previewQuoteFont = "'Kalam', 'Rozha One', serif";
  } else if (['gu', 'pa', 'te', 'ta', 'bn'].includes(lang)) {
    previewHeaderFont = "'Anek Gujarati', 'Anek Gurmukhi', 'Anek Telugu', 'Anek Tamil', 'Anek Bangla', sans-serif";
    previewQuoteFont = "'Anek Gujarati', 'Anek Gurmukhi', 'Anek Telugu', sans-serif";
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
  let quoteStartY = request.recipientName ? 540 : 500;
  if (!request.recipientName && quoteLines.length >= 5) {
    quoteStartY = 460;
  } else if (request.recipientName && quoteLines.length >= 5) {
    quoteStartY = 530;
  }

  const dividerY = quoteStartY + (quoteLines.length - 1) * lineSpacing + 42;
  const senderY = dividerY + 44;
  const trailerY = 1350 - 90;

  // 3. Dynamic Recipient Badge Dimensions
  const recipientText = request.recipientName?.trim() || '';
  const recipientPillWidth = Math.max(260, Math.min(740, recipientText.length * 16 + 64));
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
  const senderText = request.senderName?.trim() || '';
  const senderLineWidth = Math.max(340, Math.min(760, (senderText.length + 22) * 11));
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

  // Helper: Inline external image URLs into base64
  const inlineSvgImages = async (svg: string): Promise<string> => {
    const imageMatch = svg.match(/<image[^>]+(?:href|xlink:href)=["']([^"']+)["']/i);
    if (!imageMatch) return svg;

    const src = imageMatch[1];
    if (src.startsWith('data:')) return svg;

    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      return svg
        .replace(new RegExp(`href=["']${src.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}["']`, 'g'), `href="${base64}"`)
        .replace(new RegExp(`xlink:href=["']${src.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}["']`, 'g'), `xlink:href="${base64}"`);
    } catch (err) {
      console.warn('Could not inline SVG image:', err);
      return svg;
    }
  };

  // Convert SVG to PNG Blob for 1-Click WhatsApp Sharing & Download
  const getCardBlob = async (): Promise<Blob | null> => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // Continue if document.fonts.ready rejects
      }
    }

    let svgString = generatedCard?.svgContent;

    if (!svgString && previewContainerRef.current) {
      const svgEl = previewContainerRef.current.querySelector('svg');
      if (svgEl) {
        svgString = new XMLSerializer().serializeToString(svgEl);
      }
    }

    if (!svgString) return null;

    svgString = await inlineSvgImages(svgString);

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const image = new Image();
      image.crossOrigin = 'anonymous';

      const blob = new Blob([svgString!], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(blob);

      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(blobURL);
        canvas.toBlob((pngBlob) => resolve(pngBlob), 'image/png', 0.95);
      };
      image.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve(null);
      };
      image.src = blobURL;
    });
  };

  // 1-Click WhatsApp Share (Image + Text Caption Combined)
  const handleWhatsAppShare = async () => {
    setSharing(true);
    const recipientText = request.recipientName ? ` for ${request.recipientName}` : '';
    const senderText = request.senderName ? `\n\n– With Warm Regards, ${request.senderName}` : '';
    const shareText = `✨ *${title}*${recipientText} ✨\n\n"${quote}"${senderText}\n\n${subtitle}\n\n✨ *Create your personalized card free:* https://greetprompt.com`;

    try {
      const blob = await getCardBlob();

      if (
        blob &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], 'wish.png', { type: 'image/png' })] })
      ) {
        const file = new File([blob], `${title.replace(/\s+/g, '_')}_card.png`, {
          type: 'image/png',
        });
        await navigator.share({
          title,
          text: shareText,
          files: [file],
        });
      } else {
        // Desktop / Non-WebShare Fallback: Download card image directly so user has file ready to attach
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '_')}_card.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.warn('Share error or cancelled:', err);
    } finally {
      setSharing(false);
    }
  };

  // Direct HD Download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await getCardBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    const params = new URLSearchParams();
    if (request.occasion) params.set('occasion', request.occasion);
    if (request.sceneId) params.set('scene', request.sceneId);
    if (request.recipientName) params.set('to', request.recipientName);
    if (request.senderName) params.set('from', request.senderName);
    if (request.language) params.set('lang', request.language);
    const shareableUrl = `https://greetprompt.com/?${params.toString()}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Mobile Format & Quality Controls Bar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-2xl border border-white/10 glass-card">
        {/* Mobile Portrait Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-300">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>4:5 Mobile Portrait</span>
        </div>

        {/* Quality Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeQuality('lightning')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              request.qualityMode === 'lightning'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Fast Generation"
          >
            <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
            <span>Fast</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeQuality('ultra_hd')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              request.qualityMode === 'ultra_hd'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ultra High Definition"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ultra HD</span>
          </button>
        </div>
      </div>

      {/* Primary Card Preview Container (100% Scalable 4:5 Aspect Ratio) */}
      <div
        ref={previewContainerRef}
        className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/25 bg-slate-950 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:block"
      >
        <svg
          viewBox="0 0 1080 1350"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&amp;family=Anek+Bangla:wght@600;700&amp;family=Anek+Gurmukhi:wght@600;700&amp;family=Anek+Gujarati:wght@600;700&amp;family=Anek+Tamil:wght@600;700&amp;family=Anek+Telugu:wght@600;700&amp;family=Cairo:wght@700;900&amp;family=Cinzel:wght@700;900&amp;family=Great+Vibes&amp;family=Kalam:wght@400;700&amp;family=Noto+Serif+JP:wght@600;800&amp;family=Noto+Serif+KR:wght@600;800&amp;family=Noto+Serif+SC:wght@600;800&amp;family=Playfair+Display:ital,wght@0,600;0,800;1,500&amp;family=Poppins:wght@400;600;700&amp;family=Rasa:wght@600;700&amp;family=Rozha+One&amp;family=Yatra+One&amp;display=swap');
            </style>
            <radialGradient id="clientVignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.30" />
              <stop offset="55%" stopColor="#000000" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
            </radialGradient>
            <radialGradient id="clientBackdropGlow" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor={p.primary} stopOpacity="0.45" />
              <stop offset="45%" stopColor={p.secondary} stopOpacity="0.25" />
              <stop offset="85%" stopColor={p.accent} stopOpacity="0.10" />
              <stop offset="100%" stopColor="#050811" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="clientGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g1} />
              <stop offset="35%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor={g2} />
              <stop offset="100%" stopColor={g3} />
            </linearGradient>
            <filter id="clientShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.95" />
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Layer 1: Photographic Artwork (Preserves generated AI background) */}
          {activeBgUrl ? (
            <image
              href={activeBgUrl}
              xlinkHref={activeBgUrl}
              width="1080"
              height="1350"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <rect width="1080" height="1350" fill="url(#clientBackdropGlow)" />
          )}

            {/* Layer 2: Vignette Scrim */}
            <rect width="1080" height="1350" fill="url(#clientVignette)" />

            {/* Layer 3: Border Frame */}
            <rect
              x="28"
              y="28"
              width="1024"
              height="1294"
              rx="36"
              fill="none"
              stroke="url(#clientGold)"
              strokeWidth="3"
              opacity="0.85"
            />
            <rect
              x="42"
              y="42"
              width="996"
              height="1266"
              rx="28"
              fill="none"
              stroke="url(#clientGold)"
              strokeWidth="1.5"
              opacity="0.5"
              strokeDasharray="8,5"
            />

            {/* Corner Mandala Accents */}
            <g stroke="url(#clientGold)" strokeWidth="1.5" fill="none" opacity="0.8">
              <path d="M 44 90 C 70 90, 90 70, 90 44" />
              <path d="M 44 110 C 90 110, 110 90, 110 44" strokeWidth="0.75" />
              <circle cx="90" cy="90" r="4" fill="url(#clientGold)" />

              <path d="M 1036 90 C 1010 90, 990 70, 990 44" />
              <path d="M 1036 110 C 990 110, 970 90, 970 44" strokeWidth="0.75" />
              <circle cx="990" cy="90" r="4" fill="url(#clientGold)" />
            </g>

            {/* 1. Title Header (Auto-wrapped and safely scaled to avoid clipping) */}
            <g filter="url(#clientShadow)">
              {titleLayout.lines.map((line, idx) => (
                <text
                  key={idx}
                  x={contentX}
                  y={titleLayout.startY + idx * titleLayout.lineSpacing}
                  textAnchor={textAnchor}
                  fill="url(#clientGold)"
                  fontSize={titleLayout.fontSize}
                  fontFamily={previewHeaderFont}
                  fontWeight="800"
                >
                  {line}
                </text>
              ))}
            </g>

            {/* 2. Recipient Badge (Dynamic width and centered pill) */}
            {request.recipientName && (
              <g filter="url(#clientShadow)">
                <rect
                  x={recipientRectX}
                  y="470"
                  width={recipientPillWidth}
                  height="42"
                  rx="21"
                  fill="rgba(0, 0, 0, 0.55)"
                  stroke="url(#clientGold)"
                  strokeWidth="1.2"
                />
                <text
                  x={recipientContentX}
                  y="497"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="20"
                  fontFamily={`'Poppins', ${previewHeaderFont}, sans-serif`}
                  fontWeight="700"
                >
                  {recipientText}
                </text>
              </g>
            )}

            {/* 3. Main Quote (Non-destructive wrapping & adaptive font scale) */}
            <g filter="url(#clientShadow)">
              {quoteLines.map((line, idx) => {
                const lineY = quoteStartY + idx * lineSpacing;
                return (
                  <text
                    key={idx}
                    x={contentX}
                    y={lineY}
                    textAnchor={textAnchor}
                    fill="#FFFFFF"
                    fontSize={quoteFontSize}
                    fontFamily={previewQuoteFont}
                    fontWeight="500"
                    opacity="0.98"
                  >
                    {line}
                  </text>
                );
              })}
            </g>

            {/* 4. Sender Signature (Dynamic width divider) */}
            {request.senderName && (
              <g filter="url(#clientShadow)">
                <line
                  x1={senderLineX1}
                  y1={dividerY}
                  x2={senderLineX2}
                  y2={dividerY}
                  stroke="url(#clientGold)"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
                <text
                  x={contentX}
                  y={senderY}
                  textAnchor={textAnchor}
                  fill="url(#clientGold)"
                  fontSize="22"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="600"
                  letterSpacing="1.5"
                >
                  – With Warm Regards, {request.senderName} –
                </text>
              </g>
            )}

            {/* 5. Trailer / Subtitle Footer */}
            <text
              x="540"
              y={trailerY}
              textAnchor="middle"
              fill="url(#clientGold)"
              fontSize="14"
              fontFamily="'Cinzel', 'Poppins', sans-serif"
              fontWeight="700"
              letterSpacing="2"
              opacity="0.75"
              filter="url(#clientShadow)"
            >
              {subtitle}
            </text>
          </svg>

        {/* Loading Overlay Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center px-4">
              <div className="text-sm font-bold text-white mb-0.5">
                {isCustomPromptMode ? 'Creating Custom Artwork...' : 'Personalizing Wishing Card...'}
              </div>
              <div className="text-[11px] text-amber-300/80">
                {isCustomPromptMode
                  ? 'Generating artwork from your prompt'
                  : 'Applying gold typography & blessings'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons Bar */}
      <div className="space-y-2.5">
        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCustomPromptMode ? (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{isLoading ? 'Creating Artwork...' : 'Generate Custom Artwork'}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isLoading ? 'Composing...' : 'Create & Share Wishing Card'}</span>
            </>
          )}
        </button>

        {/* Share & Download Toolbar */}
        <div className="grid grid-cols-3 gap-2">
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={sharing}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Share to WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{sharing ? 'Sharing...' : 'WhatsApp'}</span>
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Download Card"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Saving...' : 'Download'}</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Copy Card Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
