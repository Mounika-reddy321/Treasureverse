import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, Lock, Loader2, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
  levelNumber: number;
  title: string;
  story?: string;
  objective: string;
  puzzleContext?: any;
  defaultHint1: string;
  defaultHint2: string;
  defaultHint3?: string;
  diamonds: number;
  onSpendDiamonds: (amount: number, reason: string) => boolean;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  gameType,
  levelNumber,
  title,
  story,
  objective,
  puzzleContext,
  defaultHint1,
  defaultHint2,
  defaultHint3,
  diamonds,
  onSpendDiamonds,
}) => {
  const [unlockedTiers, setUnlockedTiers] = useState<Record<number, string>>({});
  const [loadingTier, setLoadingTier] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const hintCosts: Record<number, number> = {
    1: 10,
    2: 20,
    3: 35,
  };

  const handleUnlockHint = async (tier: number) => {
    setErrorMessage(null);
    const cost = hintCosts[tier];

    if (diamonds < cost) {
      sounds.playError();
      setErrorMessage(`Insufficient diamonds! You need ${cost} 💎 but only have ${diamonds} 💎.`);
      return;
    }

    const success = onSpendDiamonds(cost, `Hint Tier ${tier} for ${gameType} Lvl ${levelNumber}`);
    if (!success) {
      sounds.playError();
      setErrorMessage('Could not deduct diamonds. Please check your wallet balance.');
      return;
    }

    sounds.playHint();
    setLoadingTier(tier);

    try {
      const res = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType,
          levelNumber,
          title,
          story,
          objective,
          puzzleContext,
          hintTier: tier,
        }),
      });

      if (!res.ok) throw new Error('Server request failed');
      const data = await res.json();
      const hintResult = data.hint || (tier === 1 ? defaultHint1 : tier === 2 ? defaultHint2 : defaultHint3 || 'Check previous patterns');
      setUnlockedTiers((prev) => ({ ...prev, [tier]: hintResult }));
    } catch (err) {
      // Deterministic fallback
      const fallback = tier === 1 ? defaultHint1 : tier === 2 ? defaultHint2 : defaultHint3 || 'Check previous patterns';
      setUnlockedTiers((prev) => ({ ...prev, [tier]: fallback }));
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-fantasy text-lg font-bold text-white tracking-wide">
                ORACLE HINT ASSISTANT
              </h3>
              <p className="text-xs text-slate-400">
                {gameType} · Level {levelNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current wallet alert */}
        <div className="mt-4 mb-4 flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400">Available Diamonds:</span>
          <span className="font-mono-numbers font-bold text-amber-300 flex items-center gap-1">
            💎 {diamonds}
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3 Hint Tiers */}
        <div className="flex flex-col gap-3.5 mb-6">
          {[
            {
              tier: 1,
              name: 'Tier 1: Subtle Whispers',
              desc: 'A gentle directional nudge that retains full mystery.',
              cost: 10,
              badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
            },
            {
              tier: 2,
              name: 'Tier 2: Guided Insight',
              desc: 'Points directly toward the critical puzzle mechanism.',
              cost: 20,
              badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
            },
            {
              tier: 3,
              name: 'Tier 3: Prophetic Answer',
              desc: 'Reveals the exact steps and formula to conquer the level.',
              cost: 35,
              badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-950/30',
            },
          ].map(({ tier, name, desc, cost, badgeColor }) => {
            const isUnlocked = Boolean(unlockedTiers[tier]);
            const isLoading = loadingTier === tier;

            return (
              <div
                key={tier}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${badgeColor}`}>
                      {name}
                    </span>
                  </div>

                  {!isUnlocked && (
                    <button
                      onClick={() => handleUnlockHint(tier)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Divining...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock ({cost} 💎)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-2">{desc}</p>

                {isUnlocked && (
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-sm text-indigo-100 animate-fade-in flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{unlockedTiers[tier]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            Close Oracle
          </button>
        </div>

      </div>
    </div>
  );
};
