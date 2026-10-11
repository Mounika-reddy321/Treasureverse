import React, { useState, useEffect } from 'react';
import { DailyChallenge, GameId } from '../../types/game';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Calendar, Sparkles, CheckCircle2, Play, Trophy, Clock } from 'lucide-react';

interface DailyChallengesPageProps {
  challenges: DailyChallenge[];
  onClaim: (challengeId: string) => boolean;
  onPlayChallenge: (gameId: GameId, targetLevel: number) => void;
  onBackToHome: () => void;
}

export const DailyChallengesPage: React.FC<DailyChallengesPageProps> = ({
  challenges,
  onClaim,
  onPlayChallenge,
  onBackToHome,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
              <Calendar className="w-5 h-5 text-amber-400" />
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                DAILY EXPEDITIONS
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Fresh daily trials across the three realms with bonus diamond bounties.
            </p>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400">Next Reset In</span>
            <span className="font-mono-numbers font-bold text-amber-300">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="flex flex-col gap-4">
        {challenges.map((c) => {
          const gameNames: Record<GameId, string> = {
            'treasure-hunt': 'Treasure Hunt',
            'art-puzzles': 'Art Puzzles',
            'arrow-puzzles': 'Arrow Puzzles',
          };

          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                c.claimed
                  ? 'bg-slate-950/40 border-slate-900 opacity-70'
                  : c.completed
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                  {c.gameId === 'treasure-hunt' ? '🧭' : c.gameId === 'art-puzzles' ? '🎨' : '🏹'}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {gameNames[c.gameId]} · Level {c.targetLevel}
                    </span>
                    {c.claimed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
                        Claimed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{c.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{c.description}</p>
                </div>
              </div>

              {/* Action & Reward */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[11px] text-slate-400">Bounty</span>
                  <span className="font-mono-numbers text-base font-bold text-amber-300">
                    +💎 {c.rewardDiamonds}
                  </span>
                </div>

                {c.claimed ? (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Completed</span>
                  </div>
                ) : c.completed ? (
                  <button
                    onClick={() => {
                      sounds.playGemCollect();
                      onClaim(c.id);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Claim Reward</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onPlayChallenge(c.gameId, c.targetLevel);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Play Quest</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
