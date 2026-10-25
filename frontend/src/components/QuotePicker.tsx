import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw } from 'lucide-react';
import {
  OccasionDefinition,
  Language,
  LanguageInfo,
  StylePreset,
  MessageTone,
} from '../types';

interface QuotePickerProps {
  occasionDef?: OccasionDefinition;
  language: Language;
  supportedLanguages: LanguageInfo[];
  customTitle: string;
  customQuote: string;
  recipientName?: string;
  senderName?: string;
  stylePreset: StylePreset;
  onChangeLanguage: (lang: Language) => void;
  onChangeTitle: (title: string) => void;
  onChangeQuote: (quote: string) => void;
  /** Set automatically by the AI writer (trailer line) — no input shown. */
  onChangeSubtitle: (subtitle: string) => void;
  onChangeStyle: (preset: StylePreset) => void;
}

/**
 * The rest of supportedLanguages stays available through the overflow select —
 * hiding it from the chip row keeps the default flow to a glance.
 */
const QUICK_LANGUAGES: Language[] = ['hi', 'en', 'mr', 'hinglish'];

const STYLES: { id: StylePreset; label: string; hint: string; className: string }[] = [
  { id: 'classic', label: 'Classic', hint: 'Elegant gold', className: 'from-amber-400 to-yellow-500' },
  { id: 'bold', label: 'Bold', hint: 'Large gold', className: 'from-amber-300 to-amber-500' },
  { id: 'rose', label: 'Rose', hint: 'Rose gold', className: 'from-rose-300 to-pink-500' },
  { id: 'silver', label: 'Silver', hint: 'Silver pearl', className: 'from-slate-200 to-slate-400' },
];

export const QuotePicker: React.FC<QuotePickerProps> = ({
  occasionDef,
  language,
  supportedLanguages,
  customTitle,
  customQuote,
  recipientName,
  senderName,
  stylePreset,
  onChangeLanguage,
  onChangeTitle,
  onChangeQuote,
  onChangeSubtitle,
  onChangeStyle,
}) => {
  const [selectedTone, setSelectedTone] = useState<MessageTone>('devotional');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.id === language) || supportedLanguages[0];
  const isRtl = !!currentLangObj?.isRtl;

  const quickLanguages = supportedLanguages.filter((l) => QUICK_LANGUAGES.includes(l.id));
  const moreLanguages = supportedLanguages.filter((l) => !QUICK_LANGUAGES.includes(l.id));

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
      {/* 1. Language: quick chips + overflow */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Language:</span>
          {moreLanguages.length > 0 && (
            <select
              value={quickLanguages.some((l) => l.id === language) ? '' : language}
              onChange={(e) => {
                if (e.target.value) onChangeLanguage(e.target.value as Language);
              }}
              className="px-2 py-1 rounded-lg bg-slate-950/70 border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer max-w-[140px] truncate"
              aria-label="More languages"
            >
              <option value="" disabled hidden>
                More languages…
              </option>
              {moreLanguages.map((langObj) => (
                <option key={langObj.id} value={langObj.id}>
                  {langObj.nativeLabel}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickLanguages.map((langObj) => {
            const isSelected = language === langObj.id;
            return (
              <button
                key={langObj.id}
                type="button"
                onClick={() => onChangeLanguage(langObj.id)}
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

      {/* 2. AI Message Writer */}
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

        {/* Tone Chips */}
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

      {/* 3. Greeting Title */}
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

      {/* 4. Main Blessing / Quote */}
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

      {/* 5. Style — one row replaces alignment + size + foil pickers */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300">Style:</label>
          <span className="text-[10px] text-slate-500 font-normal">
            {STYLES.find((s) => s.id === stylePreset)?.hint || ''}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {STYLES.map((s) => {
            const isSelected = stylePreset === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeStyle(s.id)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${s.className} text-slate-950 shadow-sm`
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
