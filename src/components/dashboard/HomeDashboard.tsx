import React from 'react';
import { GameId, GameProgress, NavSection, PlayerProfile, Achievement, DailyChallenge } from '../../types/game';
import { sounds } from '../../utils/audio';
import {
  Compass,
  Palette,
  MoveRight,
  Sparkles,
  Trophy,
  Calendar,
  Play,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react';

interface HomeDashboardProps {
  profile: PlayerProfile;
  progress: Record<GameId, GameProgress>;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  onNavigate: (section: NavSection) => void;
  onContinuePlaying: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  progress,
  achievements,
  dailyChallenges,
  onNavigate,
  onContinuePlaying,
}) => {
  const totalCompleted =
    progress['treasure-hunt'].completedLevels.length +
    progress['art-puzzles'].completedLevels.length +
    progress['arrow-puzzles'].completedLevels.length;

  const totalStars =
    Object.values(progress['treasure-hunt'].stars).reduce((a, b) => a + b, 0) +
    Object.values(progress['art-puzzles'].stars).reduce((a, b) => a + b, 0) +
    Object.values(progress['arrow-puzzles'].stars).reduce((a, b) => a + b, 0);

  const xpNeeded = profile.level * 100;
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-10">
      
      {/* 1. Hero Player Banner & Profile Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Player Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
                {profile.avatar}
              </div>
            </div>

            {/* Greetings & Level */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Hero of the Realm
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">Level {profile.level} Adventurer</span>
              </div>
              <h1 className="font-fantasy text-2xl sm:text-4xl font-extrabold text-white tracking-wide">
                Welcome back, {profile.username}!
              </h1>
              
              {/* XP Bar */}
              <div className="flex items-center gap-3 mt-2.5">
                <div className="w-40 sm:w-56 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <span className="font-mono-numbers text-xs text-slate-400">
                  {profile.xp} / {xpNeeded} XP
                </span>
              </div>
            </div>
          </div>

          {/* Quick Continue Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                onContinuePlaying();
              }}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-105 flex items-center gap-2 group"
            >
              <Play className="w-4 h-4 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>Continue Playing</span>
            </button>
          </div>
        </div>

        {/* Metric Badges in Hero Footer */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 mb-0.5">Diamond Wallet</span>
            <span className="font-mono-numbers text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-1.5">
              💎 {profile.diamonds.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 mb-0.5">Total Completed</span>
            <span className="font-mono-numbers text-lg sm:text-xl font-bold text-emerald-400">
              {totalCompleted} / 450 Levels
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 mb-0.5">Total Stars</span>
            <span className="font-mono-numbers text-lg sm:text-xl font-bold text-yellow-400 flex items-center gap-1">
              ⭐ {totalStars}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 mb-0.5">Achievements</span>
            <span className="font-mono-numbers text-lg sm:text-xl font-bold text-purple-400">
              {unlockedAchievementsCount} / {achievements.length} Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Prominent Game Mode Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-fantasy text-xl sm:text-2xl font-bold text-white tracking-wide">
            EXPLORE THE THREE REALMS
          </h2>
          <span className="text-xs text-slate-400">450 Independent Levels</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Treasure Hunt */}
          <div className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/10">
            <div>
              {/* Artwork Box */}
              <div className="w-full aspect-[16/10] rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/20 p-4 mb-5 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-500/40">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                  🧭
                </div>
                <div className="font-fantasy text-base font-bold text-emerald-200">
                  15 Mystical Worlds
                </div>
                <span className="text-[11px] text-emerald-400/80">
                  Riddles · Ciphers · Relics
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-fantasy text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Treasure Hunt
                </h3>
                <span className="font-mono-numbers text-xs font-bold text-emerald-400">
                  {progress['treasure-hunt'].completedLevels.length}/150 Done
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Explore enchanted forests, pyramids, crystal caverns, and volcano valleys with the ancient AI riddle oracle.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(progress['treasure-hunt'].completedLevels.length / 150) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('treasure-hunt');
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:border-emerald-400"
            >
              <span>Continue Adventure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Art Puzzles */}
          <div className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/10">
            <div>
              {/* Artwork Box */}
              <div className="w-full aspect-[16/10] rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 border border-indigo-500/20 p-4 mb-5 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-indigo-500/40">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <div className="font-fantasy text-base font-bold text-indigo-200">
                  5 Artisan Tiers
                </div>
                <span className="text-[11px] text-indigo-400/80">
                  Pictorial Jigsaws · Artifact Restoration
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-fantasy text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Art Puzzles
                </h3>
                <span className="font-mono-numbers text-xs font-bold text-indigo-400">
                  {progress['art-puzzles'].completedLevels.length}/150 Done
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Reconstruct vibrant pictorial paintings, fit museum relics, and assemble mythic artifact silhouettes.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(progress['art-puzzles'].completedLevels.length / 150) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('art-puzzles');
              }}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:border-indigo-400"
            >
              <span>Play Art Puzzles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Arrow Puzzles */}
          <div className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/10">
            <div>
              {/* Artwork Box */}
              <div className="w-full aspect-[16/10] rounded-2xl bg-gradient-to-br from-cyan-950 via-sky-900 to-slate-950 border border-cyan-500/20 p-4 mb-5 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-500/40">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                  🏹
                </div>
                <div className="font-fantasy text-base font-bold text-cyan-200">
                  Tangled Arrow Mazes
                </div>
                <span className="text-[11px] text-cyan-400/80">
                  Winding Paths · Collision Escapes · Lives
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-fantasy text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Arrow Puzzles
                </h3>
                <span className="font-mono-numbers text-xs font-bold text-cyan-400">
                  {progress['arrow-puzzles'].completedLevels.length}/150 Done
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Untangle complex directional traffic, navigate winding snake arrow paths, and escape without collisions.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(progress['arrow-puzzles'].completedLevels.length / 150) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigate('arrow-puzzles');
              }}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:border-cyan-400"
            >
              <span>Play Arrow Puzzles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Daily Challenges Teaser & Achievements Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Challenges (Left, 7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-fantasy text-lg font-bold text-white">
                  TODAY'S DAILY QUESTS
                </h3>
              </div>
              <button
                onClick={() => { sounds.playClick(); onNavigate('daily'); }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View All Quests →
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {dailyChallenges.slice(0, 2).map((dc) => (
                <div
                  key={dc.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block mb-0.5">
                      {dc.title}
                    </span>
                    <p className="text-xs text-slate-400">{dc.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono-numbers text-xs font-bold text-amber-300">
                      +💎 {dc.rewardDiamonds}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onNavigate('daily');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        dc.completed
                          ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {dc.claimed ? 'Claimed' : dc.completed ? 'Claim' : 'Play'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Showcase (Right, 5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-fantasy text-lg font-bold text-white">
                  ACHIEVEMENTS
                </h3>
              </div>
              <button
                onClick={() => { sounds.playClick(); onNavigate('achievements'); }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                All Badges →
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {achievements.slice(0, 3).map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3"
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{ach.title}</span>
                      <span className="text-[11px] font-mono-numbers text-amber-300">
                        💎 {ach.rewardDiamonds}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
