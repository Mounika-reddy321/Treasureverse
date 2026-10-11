import React, { useState } from 'react';
import { Achievement } from '../../types/game';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Trophy, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface AchievementsPageProps {
  achievements: Achievement[];
  onBackToHome: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  achievements,
  onBackToHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sounds.playClick(); onBackToHome(); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                HALL OF ACHIEVEMENTS
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Honors and milestones earned on your journey through TreasureVerse.
            </p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400">Mastery:</span>
          <span className="font-mono-numbers text-base font-bold text-amber-300">
            {unlockedCount} / {achievements.length} Badges
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 w-fit">
        {(['all', 'unlocked', 'locked'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { sounds.playClick(); setFilter(tab); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((ach) => {
          const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/60 border-slate-900 opacity-75'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl shrink-0 shadow-inner ${
                  ach.unlocked
                    ? 'bg-amber-950/40 border-amber-500/50'
                    : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-white">{ach.title}</h3>
                  <span className="font-mono-numbers text-xs font-bold text-amber-300">
                    💎 +{ach.rewardDiamonds}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3">{ach.description}</p>

                {/* Progress Bar & Numbers */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked ? 'bg-amber-400' : 'bg-slate-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-mono-numbers text-[11px] font-semibold text-slate-400 shrink-0">
                    {ach.progress} / {ach.target}
                  </span>
                </div>

                {ach.unlocked && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
