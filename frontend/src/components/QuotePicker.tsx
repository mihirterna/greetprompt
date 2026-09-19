import React, { useState } from 'react';
import {
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import {
  OccasionDefinition,
  Language,
  LanguageInfo,
  TextAlignment,
  TextSize,
  FoilAccent,
  MessageTone,
} from '../types';

interface QuotePickerProps {
  occasionDef?: OccasionDefinition;
  language: Language;
  supportedLanguages: LanguageInfo[];
  customTitle: string;
  customQuote: string;
  customSubtitle: string;
  textAlignment: TextAlignment;
  textSize: TextSize;
  foilAccent: FoilAccent;
  recipientName?: string;
  senderName?: string;
  onChangeLanguage: (lang: Language) => void;
  onChangeTitle: (title: string) => void;
  onChangeQuote: (quote: string) => void;
  onChangeSubtitle: (subtitle: string) => void;
  onChangeAlignment: (align: TextAlignment) => void;
  onChangeTextSize: (size: TextSize) => void;
  onChangeFoilAccent: (foil: FoilAccent) => void;
}

export const QuotePicker: React.FC<QuotePickerProps> = ({
  occasionDef,
  language,
  supportedLanguages,
  customTitle,
  customQuote,
  customSubtitle,
  textAlignment,
  textSize,
  foilAccent,
  recipientName,
  senderName,
  onChangeLanguage,
  onChangeTitle,
  onChangeQuote,
  onChangeSubtitle,
  onChangeAlignment,
  onChangeTextSize,
  onChangeFoilAccent,
}) => {
  const [selectedTone, setSelectedTone] = useState<MessageTone>('devotional');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.id === language) || supportedLanguages[0];
  const isRtl = !!currentLangObj?.isRtl;

  const tones: Array<{ id: MessageTone; label: string; icon: string }> = [
    { id: 'devotional', label: 'Devotional', icon: '🙏' },
    { id: 'poetic', label: 'Poetic', icon: '🌸' },
    { id: 'cheerful', label: 'Cheerful', icon: '☕' },
    { id: 'formal', label: 'Formal', icon: '🤝' },
  ];

  // Call Llama 3.1 AI to generate message
  const handleGenerateAiMessage = async () => {
    if (!occasionDef) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/ai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: occasionDef.id,
          language,
          tone: selectedTone,
          recipientName,
          senderName,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.header) onChangeTitle(data.header);
        if (data.quote) onChangeQuote(data.quote);
        if (data.trailer) onChangeSubtitle(data.trailer);
      }
    } catch (err) {
      console.warn('Failed to generate AI message:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Language Quick Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Select Language:</span>
          <span className="text-[10px] text-amber-400 font-semibold">
            {supportedLanguages.length} Languages Available
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {supportedLanguages.map((langObj) => {
            const isSelected = language === langObj.id;
            return (
              <button
                key={langObj.id}
                type="button"
                onClick={() => {
                  onChangeLanguage(langObj.id);
                  const defaultH =
                    occasionDef?.defaultTitle[langObj.id] ||
                    occasionDef?.defaultTitle.en ||
                    occasionDef?.label ||
                    '';
                  const defaultQ =
                    occasionDef?.sampleQuotes[langObj.id]?.[0] ||
                    occasionDef?.sampleQuotes.en?.[0] ||
                    '';
                  if (defaultH) onChangeTitle(defaultH);
                  if (defaultQ) onChangeQuote(defaultQ);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-white/10 text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{langObj.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AI Message Generator Action Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-slate-900/80 border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Message Writer:</span>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiMessage}
            disabled={isGeneratingAi}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Writing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 stroke-[2.5]" />
                <span>AI Write Blessing</span>
              </>
            )}
          </button>
        </div>

        {/* Tone Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tones.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTone(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                selectedTone === t.id
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Editable Header / Greeting Title */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Greeting Title:</span>
          <span className="text-[10px] text-slate-500 font-normal">Header Text</span>
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="e.g. शुभ दीपावली / Happy Birthday"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* 4. Editable Main Body Quote */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Main Blessing / Quote:</span>
          <span className="text-[10px] text-slate-500 font-normal">Card Body</span>
        </label>
        <textarea
          rows={3}
          value={customQuote}
          onChange={(e) => onChangeQuote(e.target.value)}
          placeholder="Type or paste your personalized blessings, Sanskrit shloka, or poem..."
          className="w-full p-3 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600 resize-none"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* 5. Editable Trailer / Subtitle Sign-Off */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Footer Blessing:</span>
          <span className="text-[10px] text-slate-500 font-normal">Bottom Sign-off</span>
        </label>
        <input
          type="text"
          value={customSubtitle}
          onChange={(e) => onChangeSubtitle(e.target.value)}
          placeholder="✨ WISHING YOU JOY, PEACE & BLESSINGS ✨"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* 6. Typography Formatting Controls (Alignment, Size, Metallic Shimmer) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Alignment */}
        <div className="space-y-1 p-2 rounded-xl bg-slate-950/50 border border-white/5">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <AlignLeft className="w-3 h-3 text-amber-400" />
            <span>Alignment</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => onChangeAlignment('left')}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all ${
                textAlignment === 'left'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
              title="Left Align"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeAlignment('center')}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all ${
                textAlignment === 'center'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
              title="Center Align"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeAlignment('right')}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all ${
                textAlignment === 'right'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
              title="Right Align"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Sizing */}
        <div className="space-y-1 p-2 rounded-xl bg-slate-950/50 border border-white/5">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Type className="w-3 h-3 text-amber-400" />
            <span>Text Size</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['compact', 'standard', 'grand'] as TextSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeTextSize(s)}
                className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  textSize === s
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'compact' ? 'S' : s === 'standard' ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>

        {/* Metallic Foil Palette */}
        <div className="space-y-1 p-2 rounded-xl bg-slate-950/50 border border-white/5">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Palette className="w-3 h-3 text-amber-400" />
            <span>Foil Accent</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => onChangeFoilAccent('gold')}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                foilAccent === 'gold'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-amber-300 hover:bg-white/10'
              }`}
              title="24K Yellow Gold"
            >
              Gold
            </button>
            <button
              type="button"
              onClick={() => onChangeFoilAccent('rose_gold')}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                foilAccent === 'rose_gold'
                  ? 'bg-gradient-to-r from-rose-300 to-pink-500 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-rose-300 hover:bg-white/10'
              }`}
              title="Rose Gold"
            >
              Rose
            </button>
            <button
              type="button"
              onClick={() => onChangeFoilAccent('silver')}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                foilAccent === 'silver'
                  ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              title="Silver & Pearl"
            >
              Silver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
