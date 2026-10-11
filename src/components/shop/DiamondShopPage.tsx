import React, { useState } from 'react';
import { PlayerProfile } from '../../types/game';
import { sounds } from '../../utils/audio';
import { ArrowLeft, ShoppingBag, Sparkles, Check, AlertCircle, Gift } from 'lucide-react';

interface DiamondShopPageProps {
  profile: PlayerProfile;
  onSpendDiamonds: (amount: number, reason: string) => boolean;
  onAddDiamonds: (amount: number, reason: string) => void;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onBackToHome: () => void;
}

export const DiamondShopPage: React.FC<DiamondShopPageProps> = ({
  profile,
  onSpendDiamonds,
  onAddDiamonds,
  onUpdateProfile,
  onBackToHome,
}) => {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const avatarItems = [
    { id: '🧙‍♂️', name: 'Elder Mage', cost: 120, desc: 'Master of arcane temporal riddles.' },
    { id: '🐉', name: 'Elder Wyrm', cost: 200, desc: 'Lord of the volcanic dragon hoards.' },
    { id: '🦅', name: 'Celestial Phoenix', cost: 150, desc: 'Reborn from blazing stellar ashes.' },
    { id: '🤖', name: 'Cyber Automaton', cost: 100, desc: 'Precision vector calculation processor.' },
    { id: '🧪', name: 'Royal Alchemist', cost: 80, desc: 'Concocter of transmutation pigments.' },
    { id: '🛡️', name: 'Valkyrie Paladin', cost: 140, desc: 'Guardian of the crystalline gates.' },
  ];

  const handleBuyAvatar = (avatarIcon: string, cost: number, name: string) => {
    setFeedback(null);
    if (profile.unlockedAvatars.includes(avatarIcon)) {
      // Already unlocked, equip it!
      sounds.playClick();
      onUpdateProfile({ avatar: avatarIcon });
      setFeedback({ message: `Equipped ${name} as your active avatar!`, type: 'success' });
      return;
    }

    if (profile.diamonds < cost) {
      sounds.playError();
      setFeedback({
        message: `Insufficient diamonds! You need ${cost} 💎 but only have ${profile.diamonds} 💎.`,
        type: 'error',
      });
      return;
    }

    const success = onSpendDiamonds(cost, `Purchased Avatar: ${name}`);
    if (success) {
      sounds.playGemCollect();
      const nextUnlocked = [...profile.unlockedAvatars, avatarIcon];
      onUpdateProfile({
        avatar: avatarIcon,
        unlockedAvatars: nextUnlocked,
      });
      setFeedback({ message: `Unlocked and equipped ${name}!`, type: 'success' });
    }
  };

  const handleOpenFortuneChest = () => {
    setFeedback(null);
    const chestCost = 40;
    if (profile.diamonds < chestCost) {
      sounds.playError();
      setFeedback({
        message: `Insufficient diamonds! Opening the Fortune Chest costs ${chestCost} 💎.`,
        type: 'error',
      });
      return;
    }

    const deducted = onSpendDiamonds(chestCost, 'Opened Fortune Mystery Chest');
    if (deducted) {
      sounds.playGemCollect();
      // Roll random reward between 35 and 110 diamonds
      const rollReward = Math.floor(Math.random() * 75) + 35;
      onAddDiamonds(rollReward, `Fortune Chest Reward (${rollReward} 💎)`);
      const net = rollReward - chestCost;
      setFeedback({
        message: `The Fortune Chest opened with glorious light! You discovered ${rollReward} 💎 (${net >= 0 ? `+${net}` : net} net change).`,
        type: 'success',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-8">
      
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
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                DIAMOND BAZAAR
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Exchange your hard-earned diamonds for exclusive hero avatars, frames, and mystery chests.
            </p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span className="text-xs text-slate-400">Your Wallet:</span>
          <span className="font-mono-numbers text-base font-bold text-amber-300">
            💎 {profile.diamonds.toLocaleString()}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/80 border-red-500/40 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Featured: Mystery Fortune Chest */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/25 shrink-0">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              <span>Weekly Mystery</span>
              <span>·</span>
              <span>Variable Fortune</span>
            </div>
            <h2 className="font-fantasy text-xl sm:text-2xl font-bold text-white mb-1">
              Arcane Fortune Chest
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Test your luck with the celestial fortune box. Win up to 110 sparkling diamonds!
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenFortuneChest}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
        >
          <Gift className="w-4 h-4" />
          <span>Open Chest (40 💎)</span>
        </button>
      </div>

      {/* Hero Avatars Grid */}
      <div>
        <h2 className="font-fantasy text-xl font-bold text-white mb-4">
          EXCLUSIVE HERO AVATARS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {avatarItems.map((item) => {
            const isUnlocked = profile.unlockedAvatars.includes(item.id);
            const isEquipped = profile.avatar === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-inner">
                    {item.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono-numbers text-xs font-bold text-amber-300">
                    {isUnlocked ? 'Unlocked' : `💎 ${item.cost}`}
                  </span>

                  <button
                    onClick={() => handleBuyAvatar(item.id, item.cost, item.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isEquipped
                        ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                        : isUnlocked
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : 'Purchase'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
