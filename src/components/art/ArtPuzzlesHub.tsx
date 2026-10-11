import React, { useState } from 'react';
import { GameProgress, ArtLevel } from '../../types/game';
import { ALL_ART_LEVELS } from '../../data/artLevels';
import { ArrowLeft, Lock, Star, Palette, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ArtPuzzlesHubProps {
  progress: GameProgress;
  onSelectLevel: (levelNum: number) => void;
  onBackToHome: () => void;
}

export const ArtPuzzlesHub: React.FC<ArtPuzzlesHubProps> = ({
  progress,
  onSelectLevel,
  onBackToHome,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(() => {
    return Math.min(5, Math.ceil(progress.unlockedLevel / 30));
  });

  const tiers = [
    { id: 1, name: 'Apprentice Artisan', range: [1, 30], color: 'text-emerald-400', desc: 'Picture jigsaw assembly & visual relics' },
    { id: 2, name: 'Master Craftsman', range: [31, 60], color: 'text-cyan-400', desc: 'Complex mythic paintings & artifact frames' },
    { id: 3, name: 'Mosaic Virtuoso', range: [61, 90], color: 'text-indigo-400', desc: 'Starlight beasts & celestial restoration' },
    { id: 4, name: 'Grand Restorer', range: [91, 120], color: 'text-purple-400', desc: 'Nautical galleons & ancient sacred emblems' },
    { id: 5, name: 'Mythic Sovereign', range: [121, 150], color: 'text-amber-400', desc: 'Advanced visual reasoning & grand masterpieces' },
  ];

  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const [tierStart, tierEnd] = currentTier.range;
  const currentLevels = ALL_ART_LEVELS.slice(tierStart - 1, tierEnd);

  const completedInTier = currentLevels.filter((lvl) =>
    progress.completedLevels.includes(lvl.level)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sounds.playClick(); onBackToHome(); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                ART PUZZLES
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Visual Reasoning & Masterpieces · {progress.completedLevels.length}/150 Restored
            </p>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Restored Works</span>
            <span className="font-mono-numbers text-base font-bold text-indigo-400">
              {progress.completedLevels.length} / 150
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Stars</span>
            <span className="font-mono-numbers text-base font-bold text-amber-300 flex items-center gap-1">
              ⭐ {Object.values(progress.stars).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tier Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {tiers.map((t) => {
          const isUnlocked = progress.unlockedLevel >= t.range[0];
          const isSelected = selectedTier === t.id;
          const clearedCount = progress.completedLevels.filter(
            (lvl) => lvl >= t.range[0] && lvl <= t.range[1]
          ).length;

          return (
            <button
              key={t.id}
              onClick={() => {
                sounds.playClick();
                setSelectedTier(t.id);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Palette className={`w-4 h-4 ${t.color}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold">{t.name}</span>
                <span className="text-[11px] font-mono-numbers text-slate-500">
                  Levels {t.range[0]}–{t.range[1]} · {clearedCount}/20 Done
                </span>
              </div>
              {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Tier Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-950 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1 block">
            Tier {currentTier.id} of 5
          </span>
          <h2 className="font-fantasy text-2xl font-bold text-white mb-2">
            {currentTier.name}
          </h2>
          <p className="text-sm text-slate-300 mb-4">{currentTier.desc}</p>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedInTier / 20) * 100}%` }}
              />
            </div>
            <span className="font-mono-numbers text-xs font-bold text-slate-400">
              {completedInTier} / 20 Mastered
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const nextLvl = currentLevels.find((lvl) => !progress.completedLevels.includes(lvl.level))?.level || tierStart;
            if (nextLvl <= progress.unlockedLevel) {
              sounds.playClick();
              onSelectLevel(nextLvl);
            }
          }}
          disabled={progress.unlockedLevel < tierStart}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          <span>Continue Tier</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Levels 1-20 for Current Tier Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {currentLevels.map((lvl) => {
          const isCompleted = progress.completedLevels.includes(lvl.level);
          const isUnlocked = lvl.level <= progress.unlockedLevel;
          const starsCount = progress.stars[lvl.level] || 0;

          return (
            <button
              key={lvl.level}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  sounds.playClick();
                  onSelectLevel(lvl.level);
                }
              }}
              className={`rounded-2xl p-5 border text-left flex flex-col justify-between transition-all duration-200 min-h-[140px] group ${
                isCompleted
                  ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10'
                  : isUnlocked
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500/50 hover:border-cyan-400 shadow-md shadow-cyan-500/10 hover:scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="font-mono-numbers text-xs font-bold text-slate-400">
                  Level {lvl.level}
                </span>

                {isCompleted ? (
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= starsCount ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-600'}`}
                      />
                    ))}
                  </div>
                ) : isUnlocked ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-200 group-hover:text-white line-clamp-1 mb-1">
                  {lvl.title}
                </h3>
                <span className="text-[11px] text-slate-500 capitalize">
                  {lvl.type.replace('-', ' ')}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Reward</span>
                <span className="font-mono-numbers font-bold text-amber-300">
                  💎 {lvl.rewardDiamonds}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
