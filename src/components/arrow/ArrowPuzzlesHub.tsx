import React, { useState } from 'react';
import { GameProgress, ArrowLevel } from '../../types/game';
import { ALL_ARROW_LEVELS } from '../../data/arrowLevels';
import { ArrowLeft, Lock, Star, MoveRight, Sparkles, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ArrowPuzzlesHubProps {
  progress: GameProgress;
  onSelectLevel: (levelNum: number) => void;
  onBackToHome: () => void;
}

export const ArrowPuzzlesHub: React.FC<ArrowPuzzlesHubProps> = ({
  progress,
  onSelectLevel,
  onBackToHome,
}) => {
  const [selectedRank, setSelectedRank] = useState<number>(() => {
    return Math.min(5, Math.ceil(progress.unlockedLevel / 30));
  });

  const ranks = [
    { id: 1, name: 'Wayfinder Novice', range: [1, 30], color: 'text-cyan-400', desc: 'Basic directional flight & unobstructed escapes' },
    { id: 2, name: 'Path Explorer', range: [31, 60], color: 'text-blue-400', desc: 'Obstacles, blocked corridors & sequence matching' },
    { id: 3, name: 'Maze Runner', range: [61, 90], color: 'text-indigo-400', desc: 'Directional diverters & labyrinth pathfinding' },
    { id: 4, name: 'Arrow Captain', range: [91, 120], color: 'text-purple-400', desc: 'Multi-arrow chain reactions & move restrictions' },
    { id: 5, name: 'Grand Navigator', range: [121, 150], color: 'text-amber-400', desc: 'Mastery over spatial vectors & complex traffic grids' },
  ];

  const currentRank = ranks.find((r) => r.id === selectedRank) || ranks[0];
  const [rankStart, rankEnd] = currentRank.range;
  const currentLevels = ALL_ARROW_LEVELS.slice(rankStart - 1, rankEnd);

  const completedInRank = currentLevels.filter((lvl) =>
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
              <span className="text-xl">🏹</span>
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                ARROW PUZZLES
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Directional Logic & Spatial Pathfinding · {progress.completedLevels.length}/150 Solved
            </p>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Vectors Solved</span>
            <span className="font-mono-numbers text-base font-bold text-cyan-400">
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

      {/* Rank Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        {ranks.map((r) => {
          const isUnlocked = progress.unlockedLevel >= r.range[0];
          const isSelected = selectedRank === r.id;
          const clearedCount = progress.completedLevels.filter(
            (lvl) => lvl >= r.range[0] && lvl <= r.range[1]
          ).length;

          return (
            <button
              key={r.id}
              onClick={() => {
                sounds.playClick();
                setSelectedRank(r.id);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500/60 text-white shadow-lg shadow-cyan-500/10 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <MoveRight className={`w-4 h-4 ${r.color}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold">{r.name}</span>
                <span className="text-[11px] font-mono-numbers text-slate-500">
                  Levels {r.range[0]}–{r.range[1]} · {clearedCount}/20 Done
                </span>
              </div>
              {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Rank Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-950 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 block">
            Rank {currentRank.id} of 5
          </span>
          <h2 className="font-fantasy text-2xl font-bold text-white mb-2">
            {currentRank.name}
          </h2>
          <p className="text-sm text-slate-300 mb-4">{currentRank.desc}</p>
          <div className="flex items-center gap-3">
            <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedInRank / 20) * 100}%` }}
              />
            </div>
            <span className="font-mono-numbers text-xs font-bold text-slate-400">
              {completedInRank} / 20 Cleared
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const nextLvl = currentLevels.find((lvl) => !progress.completedLevels.includes(lvl.level))?.level || rankStart;
            if (nextLvl <= progress.unlockedLevel) {
              sounds.playClick();
              onSelectLevel(nextLvl);
            }
          }}
          disabled={progress.unlockedLevel < rankStart}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          <span>Continue Rank</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Levels Grid */}
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
                  ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10'
                  : isUnlocked
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/50 hover:border-amber-400 shadow-md shadow-amber-500/10 hover:scale-[1.02]'
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
