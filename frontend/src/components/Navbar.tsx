import React, { useState } from 'react';
import { Sparkles, Globe, ChevronDown, Check } from 'lucide-react';
import { CulturalSphere, CulturalSphereInfo } from '../types';

interface NavbarProps {
  currentSphere: CulturalSphere;
  spheres: CulturalSphereInfo[];
  onSelectSphere: (sphere: CulturalSphere) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSphere,
  spheres,
  onSelectSphere,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeSphere = spheres.find((s) => s.id === currentSphere) || spheres[0];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A10]/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/30">
            <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                GreetPrompt
              </span>
              <span className="text-amber-400 font-black text-base sm:text-lg">.com</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              AI Wishing Cards &amp; Scene Prompt Studio
            </p>
          </div>
        </div>

        {/* Global Cultural Sphere Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all text-xs font-bold text-slate-200 shadow-md hover:bg-slate-800"
          >
            <span className="text-base">{activeSphere?.flag || '🌐'}</span>
            <span className="hidden sm:inline font-semibold">{activeSphere?.label || 'Global'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0D121F] border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Select Cultural Region &amp; Themes</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auto-adapts visual scenes, language and greetings
                  </p>
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {spheres.map((s) => {
                    const isSelected = s.id === currentSphere;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onSelectSphere(s.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 ring-1 ring-amber-400/20'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{s.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{s.label}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {s.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
