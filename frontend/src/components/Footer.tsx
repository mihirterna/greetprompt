import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gold-gradient flex items-center justify-center text-slate-950 font-black text-xs">
            ✨
          </div>
          <span className="font-bold text-slate-300">GreetPrompt.com</span>
          <span>— AI Wishing Cards &amp; Scene Prompt Studio</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>Crafted with love for sharing blessings worldwide</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-500">Optimized for WhatsApp Sharing</span>
        </div>
      </div>
    </footer>
  );
};
