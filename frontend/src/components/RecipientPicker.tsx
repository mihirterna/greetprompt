import React from 'react';
import { User, HeartHandshake } from 'lucide-react';
import { OccasionDefinition, Language } from '../types';

interface RecipientPickerProps {
  occasionDef?: OccasionDefinition;
  language: Language;
  recipientName: string;
  senderName: string;
  onChangeRecipient: (val: string) => void;
  onChangeSender: (val: string) => void;
}

export const RecipientPicker: React.FC<RecipientPickerProps> = ({
  occasionDef,
  language,
  recipientName,
  senderName,
  onChangeRecipient,
  onChangeSender,
}) => {
  const suggestions = occasionDef?.recipientSuggestions || [
    { label: 'Family', en: 'Dearest Family', native: 'Familia / परिवार' },
    { label: 'Mom', en: 'Dearest Mom', native: 'Mom / माता जी' },
    { label: 'Dad', en: 'Respected Dad', native: 'Dad / पिता जी' },
    { label: 'Friend', en: 'Dear Friend', native: 'Friend / मित्र' },
    { label: 'Everyone', en: 'Everyone', native: 'All / सभी जन' },
  ];

  const isNonEnglish = language !== 'en';

  const recipientPlaceholder =
    language === 'mr'
      ? 'उदा. आदरणीय रमेश काका / कुटुंब'
      : language === 'hi'
      ? 'उदा. आदरणीय रमेश अंकल'
      : language === 'gu'
      ? 'દા.ત. આદરણીય રમેશભાઈ'
      : 'e.g. Ramesh Uncle / Mom';

  const senderPlaceholder =
    language === 'mr'
      ? 'उदा. राहुल / सस्नेह कुटुंब'
      : language === 'hi'
      ? 'उदा. राहुल / सपरिवार'
      : 'e.g. Rahul / With Family';

  return (
    <div className="space-y-3 pt-1">
      {/* 1-Tap Quick-Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {suggestions.map((sug, idx) => {
          let nativePart = sug.native;
          if (nativePart && nativePart.includes('/')) {
            const parts = nativePart.split('/').map((s) => s.trim());
            nativePart = parts[parts.length - 1];
          }
          const textToInsert = isNonEnglish && nativePart ? nativePart : sug.en;
          const isSelected = recipientName === textToInsert;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeRecipient(textToInsert)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-semibold'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {sug.label} <span className="text-[10px] opacity-70">({textToInsert})</span>
            </button>
          );
        })}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Recipient Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Recipient / To:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={recipientName}
              onChange={(e) => onChangeRecipient(e.target.value)}
              placeholder={recipientPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Sender Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            From / Sender: (Optional)
          </label>
          <div className="relative">
            <HeartHandshake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={senderName}
              onChange={(e) => onChangeSender(e.target.value)}
              placeholder={senderPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
