import React from 'react';
import { Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { SceneDefinition, CulturalSphere, OccasionId, BackgroundMode } from '../types';
import { SmartPromptInput } from './SmartPromptInput';

interface ScenePickerProps {
  scenes: SceneDefinition[];
  selectedSceneId: string;
  sphere: CulturalSphere;
  occasionId: OccasionId;
  backgroundMode: BackgroundMode;
  customPrompt: string;
  onSelectScene: (sceneId: string) => void;
  onChangeBackgroundMode: (mode: BackgroundMode) => void;
  onChangeCustomPrompt: (prompt: string) => void;
}

export const ScenePicker: React.FC<ScenePickerProps> = ({
  scenes,
  selectedSceneId,
  sphere,
  occasionId,
  backgroundMode,
  customPrompt,
  onSelectScene,
  onChangeBackgroundMode,
  onChangeCustomPrompt,
}) => {
  // Sort scenes prioritizing matching cultural sphere
  const sortedScenes = [...scenes].sort((a, b) => {
    const aMatch = a.sphere === sphere ? 2 : a.sphere === 'all' ? 1 : 0;
    const bMatch = b.sphere === sphere ? 2 : b.sphere === 'all' ? 1 : 0;
    return bMatch - aMatch;
  });

  return (
    <div className="space-y-3 pt-1">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => onChangeBackgroundMode('preset')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            backgroundMode === 'preset'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Curated Themes ({sortedScenes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeBackgroundMode('custom_prompt')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            backgroundMode === 'custom_prompt'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>✨ Custom AI Art Prompt</span>
        </button>
      </div>

      {/* MODE A: ULTRA-CLEAN VISUAL SCENE GALLERY */}
      {backgroundMode === 'preset' ? (
        <div className="space-y-2">
          {/* Visual 4:5 Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {sortedScenes.map((scene) => {
              const isSelected = scene.id === selectedSceneId;

              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => onSelectScene(scene.id)}
                  className={`group relative aspect-[4/5] rounded-2xl overflow-hidden border transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-xl shadow-amber-500/20 scale-[1.02]'
                      : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                  }`}
                >
                  {/* Photo Artwork Background */}
                  {scene.previewImage ? (
                    <img
                      src={scene.previewImage}
                      alt={scene.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: `${scene.colorPalette.primary}20` }}
                    />
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />

                  {/* Top Right Check Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-950/50 backdrop-blur-sm border border-white/20 group-hover:border-white/50" />
                    )}
                  </div>

                  {/* Bottom Single-Line Title */}
                  <div className="absolute bottom-2 inset-x-2 z-10">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{scene.icon}</span>
                      <span className="text-xs font-bold text-white truncate drop-shadow-md">
                        {scene.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* MODE B: PROMPT-DRIVEN ART STUDIO */
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">
              Describe Your Custom Visual Scene:
            </span>
          </div>

          {/* Smart Autocomplete Prompt Input */}
          <SmartPromptInput
            value={customPrompt}
            onChange={onChangeCustomPrompt}
            occasionId={occasionId}
            sphere={sphere}
            placeholder="Type anything (e.g. Lord Krishna on a chariot, vintage red bicycle, sunrise over snow peaks...)"
          />
        </div>
      )}
    </div>
  );
};
