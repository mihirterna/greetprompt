import React, { useState } from 'react';
import { OccasionDefinition, OccasionId } from '../types';

interface OccasionPickerProps {
  occasions: OccasionDefinition[];
  selectedOccasion: OccasionId;
  onSelectOccasion: (id: OccasionId) => void;
}

const OCCASION_URL_PATHS: Record<string, string> = {
  ganesh_chaturthi: '/ganesh-chaturthi/',
  diwali: '/diwali/',
  good_morning: '/good-morning/',
  birthday: '/birthday/',
  navratri: '/navratri/',
  new_year: '/new-year/',
  gratitude: '/?occasion=gratitude',
  motivation: '/?occasion=motivation',
};

export const OccasionPicker: React.FC<OccasionPickerProps> = ({
  occasions,
  selectedOccasion,
  onSelectOccasion,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Occasions' },
    { id: 'festival', label: '🪔 Festivals' },
    { id: 'daily', label: '☀️ Daily' },
    { id: 'celebration', label: '🎂 Celebrations' },
    { id: 'mindset', label: '⚡ Mindset' },
  ];

  const filteredOccasions = occasions.filter(
    (occ) => activeCategory === 'all' || occ.category === activeCategory
  );

  return (
    <div className="space-y-3 pt-1">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Occasions Grid with Crawlable <a> Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filteredOccasions.map((occ) => {
          const isSelected = selectedOccasion === occ.id;
          const href = OCCASION_URL_PATHS[occ.id] || `/?occasion=${occ.id}`;

          return (
            <a
              key={occ.id}
              href={href}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return; // let the browser handle new-tab / window navigation
                }
                e.preventDefault();
                onSelectOccasion(occ.id);
                const currentUrl = window.location.pathname + window.location.search;
                if (currentUrl !== href) {
                  window.history.pushState({}, '', href);
                  // Notify listeners so <title> / canonical follow the URL.
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className={`group relative p-3 rounded-2xl text-left transition-all border block ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40 scale-[1.01]'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {occ.icon}
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold truncate ${
                    isSelected ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {occ.label}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 line-clamp-1 block">
                {occ.scenes?.length || 1} curated themes
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
