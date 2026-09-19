import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionStepProps {
  stepNumber: number;
  title: string;
  summaryBadge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const AccordionStep: React.FC<AccordionStepProps> = ({
  stepNumber,
  title,
  summaryBadge,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
        isOpen
          ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
          : 'bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-900/60'
      }`}
    >
      {/* Clickable Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
              isOpen
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/10 text-slate-300'
            }`}
          >
            {stepNumber}
          </div>
          <span className="font-bold text-sm text-white tracking-wide truncate">{title}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Summary Badge when collapsed or active */}
          {summaryBadge && <div className="hidden xs:block">{summaryBadge}</div>}

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
              isOpen ? 'rotate-180 bg-white/10 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};
