import React, { useState, useEffect, useRef } from 'react';
import { OccasionId, CulturalSphere, TimeOfDay } from '../types';
import { predictPromptCompletion } from '../services/localCopilotEngine';
import { Sparkles, CornerDownLeft, X, Wand2, RefreshCw } from 'lucide-react';

interface SmartPromptInputProps {
  value: string;
  onChange: (val: string) => void;
  occasionId: OccasionId;
  sphere?: CulturalSphere;
  placeholder?: string;
}

export const SmartPromptInput: React.FC<SmartPromptInputProps> = ({
  value,
  onChange,
  occasionId,
  sphere = 'global',
  placeholder = 'Type anything (e.g. Lord Krishna on a chariot, vintage red bicycle, sunset over Alps...)',
}) => {
  const [ghostSuffix, setGhostSuffix] = useState<string>('');
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Synchronous Predictor
  const updatePrediction = (text: string) => {
    if (!text.trim() || text.length < 2) {
      setGhostSuffix('');
      return;
    }
    const newPrediction = predictPromptCompletion(text, occasionId, sphere);
    setGhostSuffix(newPrediction);
  };

  // Re-predict whenever context (occasion or sphere) changes
  useEffect(() => {
    updatePrediction(value);
  }, [occasionId, sphere]);

  // Handle Input Changes with Instant Synchronous Suffix Shrinking / Clearing
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 1. If ghostSuffix exists and user typed a character
    if (ghostSuffix && newVal.length > value.length && newVal.startsWith(value)) {
      const addedChar = newVal.substring(value.length);
      if (ghostSuffix.startsWith(addedChar)) {
        setGhostSuffix(ghostSuffix.substring(addedChar.length));
        return;
      }
    }

    setGhostSuffix('');

    debounceTimerRef.current = setTimeout(() => {
      updatePrediction(newVal);
    }, 40);
  };

  // Accept Ghost Completion
  const acceptCompletion = () => {
    if (ghostSuffix) {
      const fullText = value + ghostSuffix;
      onChange(fullText);
      setGhostSuffix('');
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = fullText.length;
        textareaRef.current.selectionEnd = fullText.length;
      }
    }
  };

  // Keyboard Navigation: Tab / Enter to accept, Escape to dismiss
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ghostSuffix && (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      acceptCompletion();
    } else if (ghostSuffix && e.key === 'ArrowRight') {
      const el = e.currentTarget;
      if (el.selectionStart === value.length) {
        e.preventDefault();
        acceptCompletion();
      }
    } else if (e.key === 'Escape') {
      setGhostSuffix('');
    }
  };

  // Context-Aware AI Prompt Suggestion
  const handleSuggestPrompt = async () => {
    setIsSuggestingPrompt(true);
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
          sphere,
          timeOfDay,
          currentPrompt: value,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.prompt) {
          onChange(data.prompt);
          setGhostSuffix('');
        }
      }
    } catch (err) {
      console.warn('Failed to suggest prompt:', err);
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Action Bar: Suggest Prompt with AI */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">Visual Scene Description:</span>

        <button
          type="button"
          onClick={handleSuggestPrompt}
          disabled={isSuggestingPrompt}
          className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isSuggestingPrompt ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Suggesting...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3 h-3 text-amber-400" />
              <span>✨ AI Suggest Scene Prompt</span>
            </>
          )}
        </button>
      </div>

      <div className="relative w-full rounded-xl bg-slate-950/90 border border-white/15 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-hidden">
        {/* Layer 1: Background Ghost-Text Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 px-3.5 py-2.5 text-xs sm:text-sm font-sans pointer-events-none whitespace-pre-wrap break-words select-none z-0"
          style={{
            lineHeight: '1.5rem',
            fontFamily: 'inherit',
          }}
        >
          <span className="invisible">{value}</span>
          {ghostSuffix && (
            <span className="text-amber-300/60 font-medium bg-amber-500/10 rounded px-0.5 animate-pulse">
              {ghostSuffix}
            </span>
          )}
        </div>

        {/* Layer 2: Transparent Interactive Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="relative w-full px-3.5 py-2.5 bg-transparent text-slate-100 text-xs sm:text-sm font-sans focus:outline-none placeholder:text-slate-500 resize-none z-10"
          style={{
            lineHeight: '1.5rem',
            fontFamily: 'inherit',
          }}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setGhostSuffix('');
            }}
            className="absolute top-2 right-2 p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all z-20"
            title="Clear prompt"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Copilot Status & Mobile Tab Accept Pill */}
      {ghostSuffix ? (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold shadow-sm">Tab ↹</kbd> to complete
            </span>
          </div>

          <button
            type="button"
            onClick={acceptCompletion}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <CornerDownLeft className="w-3 h-3 stroke-[3]" />
            <span>Apply</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>✨ Smart typing suggestions active</span>
          <span>Edit prompt freely before generating</span>
        </div>
      )}
    </div>
  );
};
