import React, { useState } from 'react';
import { GameId, GameProgress, PlayerProfile, WalletTransaction } from '../../types/game';
import { sounds } from '../../utils/audio';
import { ArrowLeft, User, Sparkles, Check, Edit2, History, Star, Trophy, Clock } from 'lucide-react';

interface ProfilePageProps {
  profile: PlayerProfile;
  progress: Record<GameId, GameProgress>;
  transactions: WalletTransaction[];
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onBackToHome: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  progress,
  transactions,
  onUpdateProfile,
  onBackToHome,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      sounds.playClick();
      onUpdateProfile({ username: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const totalLevels =
    progress['treasure-hunt'].completedLevels.length +
    progress['art-puzzles'].completedLevels.length +
    progress['arrow-puzzles'].completedLevels.length;

  const totalStars =
    Object.values(progress['treasure-hunt'].stars).reduce((a, b) => a + b, 0) +
    Object.values(progress['art-puzzles'].stars).reduce((a, b) => a + b, 0) +
    Object.values(progress['arrow-puzzles'].stars).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-8">
      
      {/* Header */}
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
            <User className="w-5 h-5 text-violet-400" />
            <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              PLAYER DOSSIER
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Explorer credentials, adventure stats, and unified diamond wallet ledger.
          </p>
        </div>
      </div>

      {/* Main Profile Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with changer */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl">
                {profile.avatar}
              </div>
            </div>
          </div>

          <div>
            {/* Username */}
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-xs"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-fantasy text-2xl font-bold text-white">
                    {profile.username}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-500 hover:text-white"
                    title="Edit Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Explorer Rank: Level {profile.level} · {profile.xp} XP
            </p>
          </div>
        </div>

        {/* Available Avatars Switcher */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 mb-2 font-semibold">
            Unlocked Avatars:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.unlockedAvatars.map((av) => (
              <button
                key={av}
                onClick={() => {
                  sounds.playClick();
                  onUpdateProfile({ avatar: av });
                }}
                className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-all ${
                  profile.avatar === av
                    ? 'border-amber-400 bg-amber-500/20 scale-110 shadow-md'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Across 3 Games */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
            Treasure Hunt
          </span>
          <span className="font-mono-numbers text-2xl font-bold text-white block mb-1">
            {progress['treasure-hunt'].completedLevels.length} / 150
          </span>
          <span className="text-xs text-slate-400">
            Worlds Discovered: {Math.ceil(progress['treasure-hunt'].unlockedLevel / 10)} / 15
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block mb-1">
            Art Puzzles
          </span>
          <span className="font-mono-numbers text-2xl font-bold text-white block mb-1">
            {progress['art-puzzles'].completedLevels.length} / 150
          </span>
          <span className="text-xs text-slate-400">
            Tiers Mastered: {Math.ceil(progress['art-puzzles'].unlockedLevel / 30)} / 5
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
            Arrow Puzzles
          </span>
          <span className="font-mono-numbers text-2xl font-bold text-white block mb-1">
            {progress['arrow-puzzles'].completedLevels.length} / 150
          </span>
          <span className="text-xs text-slate-400">
            Vector Navigation Ranks: {Math.ceil(progress['arrow-puzzles'].unlockedLevel / 30)} / 5
          </span>
        </div>
      </div>

      {/* Wallet Transaction Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-fantasy text-lg font-bold text-white">
              DIAMOND WALLET TRANSACTION LEDGER
            </h3>
          </div>
          <span className="font-mono-numbers text-xs text-slate-400">
            Balance: 💎 {profile.diamonds}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Reason</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-950/40">
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'EARN'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-200">{tx.reason}</td>
                  <td className="py-2.5 text-right font-mono-numbers font-bold">
                    <span className={tx.type === 'EARN' ? 'text-emerald-400' : 'text-red-400'}>
                      {tx.type === 'EARN' ? '+' : '-'}💎 {tx.amount}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono-numbers text-slate-500">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
