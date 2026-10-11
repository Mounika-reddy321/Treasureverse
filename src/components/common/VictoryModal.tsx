import React, { useEffect } from 'react';
import { Star, RotateCcw, ArrowRight, Grid, X } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  gameTitle: string;
  levelNumber: number;
  stars: number;
  diamondsEarned: number;
  isFirstTime: boolean;
  movesOrTimeText?: string;
  onReplay: () => void;
  onNextLevel: () => void;
  onBackToHub: () => void;
  onClose?: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  gameTitle,
  levelNumber,
  stars,
  diamondsEarned,
  isFirstTime,
  movesOrTimeText,
  onReplay,
  onNextLevel,
  onBackToHub,
  onClose,
  hasNextLevel,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playLevelComplete();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-fade-in"
        onClick={() => {
          if (onClose) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/20 z-10 animate-scale-up">
        
        {/* Close X Button if onClose provided */}
        {onClose && (
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="Dismiss to view board"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Glow Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

        {/* Top Celebration Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
          🏆
        </div>

        {/* Headings */}
        <h2 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-1">
          VICTORY ACHIEVED!
        </h2>
        <p className="text-sm font-medium text-amber-300/90 mb-5">
          {gameTitle} · Level {levelNumber} Cleared
        </p>

        {/* Stars Display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starIndex) => {
            const active = starIndex <= stars;
            return (
              <div
                key={starIndex}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  active
                    ? 'text-amber-400 bg-amber-400/10 scale-110 shadow-sm shadow-amber-400/30'
                    : 'text-slate-600 bg-slate-800/40'
                }`}
              >
                <Star className={`w-8 h-8 ${active ? 'fill-amber-400 stroke-amber-300' : 'stroke-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Reward & Stats Pill */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Rewards</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base">💎</span>
              <span className="font-mono-numbers text-lg font-bold text-amber-300">
                {isFirstTime ? `+${diamondsEarned}` : 'Already Claimed'}
              </span>
            </div>
          </div>

          {movesOrTimeText && (
            <div className="h-8 w-px bg-slate-800" />
          )}

          {movesOrTimeText && (
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 mb-1">Performance</span>
              <span className="font-mono-numbers text-sm font-semibold text-cyan-300">
                {movesOrTimeText}
              </span>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              onClick={() => {
                sounds.playClick();
                onNextLevel();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Next Level (Level {levelNumber + 1})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              👑 You completed all 150 levels of {gameTitle}!
            </div>
          )}

          <div className="flex items-center gap-2.5 mt-1">
            <button
              onClick={() => {
                sounds.playClick();
                onBackToHub();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors border border-slate-700 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-slate-400" />
              <span>All Levels</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onReplay();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Replay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
