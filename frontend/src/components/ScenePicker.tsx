import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { SceneDefinition, OccasionId } from '../types';
import { SmartPromptInput } from './SmartPromptInput';

interface ScenePickerProps {
  scenes: SceneDefinition[];
  selectedSceneId: string;
  occasionId: OccasionId;
  customPrompt: string;
  onSelectScene: (sceneId: string) => void;
  onChangeCustomPrompt: (prompt: string) => void;
}

export const ScenePicker: React.FC<ScenePickerProps> = ({
  scenes,
  selectedSceneId,
  occasionId,
  customPrompt,
  onSelectScene,
  onChangeCustomPrompt,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const hasCustomScene = !!customPrompt.trim();

  return (
    <div className="space-y-3 pt-1">
      {/* Curated scene gallery for the selected occasion */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {scenes.map((scene) => {
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

              {/* Selected Check */}
              <div className="absolute top-2 right-2 z-10">
                {isSelected && !hasCustomScene ? (
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-950/50 backdrop-blur-sm border border-white/20 group-hover:border-white/50" />
                )}
              </div>

              {/* Single-Line Title */}
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

      {/* Advanced: custom AI scene — deliberately collapsed to keep the default flow lean */}
      <div className="rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left transition-colors hover:bg-white/5"
        >
          <span className="text-xs font-semibold text-slate-300">
            <span className="text-amber-400">✨</span> Custom scene
            <span className="text-slate-500 font-normal"> (describe your own visual)</span>
          </span>
          <span className="flex items-center gap-2 flex-shrink-0">
            {hasCustomScene && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                Active
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isCustomOpen ? 'rotate-180' : ''
              }`}
            />
          </span>
        </button>

        {isCustomOpen && (
          <div className="px-3 pb-3 pt-2 border-t border-white/5">
            <SmartPromptInput
              value={customPrompt}
              onChange={onChangeCustomPrompt}
              occasionId={occasionId}
            />
            {hasCustomScene && (
              <p className="mt-2 text-[10px] text-slate-500">
                Custom scene active — tap any gallery scene above to switch back to presets.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
