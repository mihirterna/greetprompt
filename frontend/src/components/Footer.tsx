import React from 'react';

const SEO_LINKS = [
  { href: '/diwali', label: 'Diwali Wishes', icon: '🪔' },
  { href: '/ganesh-chaturthi', label: 'Ganesh Chaturthi Cards', icon: '🌺' },
  { href: '/good-morning', label: 'Good Morning Blessings', icon: '☀️' },
  { href: '/birthday', label: 'Birthday Wishing Cards', icon: '🎂' },
  { href: '/navratri', label: 'Navratri & Garba Greetings', icon: '💃' },
  { href: '/new-year', label: 'New Year 2026 Wishes', icon: '🎆' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 py-10 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* SEO Crawlable Navigation */}
        <div className="border-b border-white/5 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mb-3 text-center sm:text-left">
            Explore AI Wishing Cards &amp; Greetings
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            {SEO_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors flex items-center gap-1.5 text-xs"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gold-gradient flex items-center justify-center text-slate-950 font-black text-xs">
              ✨
            </div>
            <a href="/" className="font-bold text-slate-300 hover:text-white transition-colors">
              GreetPrompt.com
            </a>
            <span>— Free AI Wishing Cards &amp; Scene Prompt Studio</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with love for sharing blessings worldwide</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500">Optimized for WhatsApp HD 1-Click Sharing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
