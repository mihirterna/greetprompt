import React, { useState } from 'react';
import { OccasionId, TimeOfDay } from '../types';
import { Wand2, X, RefreshCw } from 'lucide-react';

interface SmartPromptInputProps {
  value: string;
  onChange: (val: string) => void;
  occasionId: OccasionId;
  placeholder?: string;
}

export const SmartPromptInput: React.FC<SmartPromptInputProps> = ({
  value,
  onChange,
  occasionId,
  placeholder = 'Describe any scene (e.g. Lord Krishna on a chariot, vintage red bicycle, sunrise over Alpine peaks...)',
}) => {
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  // One-tap AI scene suggestion (backend endpoint — no client-side engine).
  const handleSuggestPrompt = async () => {
    setIsSuggesting(true);
    const hour = new Date().getHours();
    let timeOfDay: TimeOfDay = 'morning';
    if (hour >= 5 && hour < 9) timeOfDay = 'sunrise';
    else if (hour >= 9 && hour < 16) timeOfDay = 'morning';
    else if (hour >= 16 && hour < 19) timeOfDay = 'sunset';
    else timeOfDay = 'night';

    try {
      const res = await fetch('/api/ai/prompt-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: occasionId,
          timeOfDay,
          currentPrompt: value,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.prompt) onChange(data.prompt);
      }
    } catch (err) {
      console.warn('Failed to suggest prompt:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full rounded-xl bg-slate-950/90 border border-white/15 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3.5 py-2.5 pr-9 bg-transparent text-slate-100 text-xs sm:text-sm font-sans focus:outline-none placeholder:text-slate-500 resize-none"
          style={{ lineHeight: '1.5rem', fontFamily: 'inherit' }}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
            title="Clear prompt"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSuggestPrompt}
          disabled={isSuggesting}
          className="py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isSuggesting ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Suggesting...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3 h-3 text-amber-400" />
              <span>✨ Suggest a scene</span>
            </>
          )}
        </button>
        <span className="text-[10px] text-slate-500">Optional — describe any visual you like</span>
      </div>
    </div>
  );
};
