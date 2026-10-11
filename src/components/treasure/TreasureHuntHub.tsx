import React, { useState } from 'react';
import { TreasureWorld, GameProgress } from '../../types/game';
import { TREASURE_WORLDS, ALL_TREASURE_LEVELS } from '../../data/treasureLevels';
import { Lock, Star, ChevronRight, ArrowLeft, Trophy, Sparkles, Compass } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TreasureHuntHubProps {
  progress: GameProgress;
  onSelectLevel: (levelNum: number) => void;
  onBackToHome: () => void;
}

export const TreasureHuntHub: React.FC<TreasureHuntHubProps> = ({
  progress,
  onSelectLevel,
  onBackToHome,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(() => {
    // Default to the world containing the player's current unlocked level
    return Math.min(15, Math.ceil(progress.unlockedLevel / 10));
  });

  const activeWorld = TREASURE_WORLDS.find((w) => w.id === selectedWorldId) || TREASURE_WORLDS[0];
  const [startLvl, endLvl] = activeWorld.levelRange;
  const worldLevels = ALL_TREASURE_LEVELS.slice(startLvl - 1, endLvl);

  const completedInWorld = worldLevels.filter((lvl) =>
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
              <span className="text-xl">🧭</span>
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                TREASURE HUNT
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              15 Worlds · 150 Adventure Quests · {progress.completedLevels.length}/150 Discovered
            </p>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Total Cleared</span>
            <span className="font-mono-numbers text-base font-bold text-emerald-400">
              {progress.completedLevels.length} / 150
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Stars Earned</span>
            <span className="font-mono-numbers text-base font-bold text-amber-300 flex items-center gap-1">
              ⭐ {Object.values(progress.stars).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* World Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {TREASURE_WORLDS.map((w) => {
          const isWorldUnlocked = progress.unlockedLevel >= w.levelRange[0];
          const isSelected = selectedWorldId === w.id;
          const clearedCount = progress.completedLevels.filter(
            (lvl) => lvl >= w.levelRange[0] && lvl <= w.levelRange[1]
          ).length;

          return (
            <button
              key={w.id}
              onClick={() => {
                sounds.playClick();
                setSelectedWorldId(w.id);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-amber-500/60 text-white shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-lg">{w.icon}</span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold">
                  World {w.id}: {w.name}
                </span>
                <span className="text-[11px] font-mono-numbers text-slate-500">
                  {clearedCount}/10 Done
                </span>
              </div>
              {!isWorldUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* World Banner & Lore */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
              <span>World {activeWorld.id} of 15</span>
              <span>·</span>
              <span>Levels {startLvl}–{endLvl}</span>
            </div>
            <h2 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {activeWorld.icon} {activeWorld.name}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {activeWorld.lore}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedInWorld / 10) * 100}%` }}
                />
              </div>
              <span className="font-mono-numbers text-xs font-bold text-slate-400">
                {completedInWorld}/10 Quests Completed
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            {completedInWorld === 10 ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>World Mastered!</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  // Find first incomplete level in this world or level 1
                  const nextLvl = worldLevels.find((lvl) => !progress.completedLevels.includes(lvl.level))?.level || startLvl;
                  if (nextLvl <= progress.unlockedLevel) {
                    sounds.playClick();
                    onSelectLevel(nextLvl);
                  }
                }}
                disabled={progress.unlockedLevel < startLvl}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                <span>Continue World</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Levels 1-10 Grid for Current World */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {worldLevels.map((lvl) => {
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
              className={`relative group rounded-2xl p-5 border text-left flex flex-col justify-between transition-all duration-200 min-h-[140px] ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
                  : isUnlocked
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400 shadow-md shadow-amber-500/10 hover:scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Card Header: Level number + Lock/Status */}
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
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-600" />
                )}
              </div>

              {/* Title & Quest type */}
              <div>
                <h3 className="font-semibold text-sm text-slate-200 group-hover:text-white line-clamp-1 mb-1">
                  {lvl.title}
                </h3>
                <span className="text-[11px] text-slate-500 capitalize">
                  {lvl.puzzleType.replace('-', ' ')}
                </span>
              </div>

              {/* Footer Reward Indicator */}
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
