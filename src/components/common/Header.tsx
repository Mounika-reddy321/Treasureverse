import React from 'react';
import { NavSection, PlayerProfile } from '../../types/game';
import { Sparkles, Volume2, VolumeX, Menu, Compass, Palette, MoveRight, Calendar, ShoppingBag, Trophy, User, Settings as SettingsIcon } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HeaderProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  profile: PlayerProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenMobileMenu: () => void;
  onOpenAIOracle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onNavigate,
  profile,
  soundEnabled,
  onToggleSound,
  onOpenMobileMenu,
  onOpenAIOracle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              sounds.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-fantasy text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-200 to-cyan-200 whitespace-nowrap">
                TREASUREVERSE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => { sounds.playClick(); onNavigate('home'); }}
            className={`whitespace-nowrap transition-colors hover:text-amber-300 py-1 border-b-2 ${
              currentSection === 'home' ? 'border-amber-400 text-amber-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('treasure-hunt'); }}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-emerald-300 py-1 border-b-2 ${
              currentSection === 'treasure-hunt' ? 'border-emerald-400 text-emerald-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Treasure Hunt</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('art-puzzles'); }}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-indigo-300 py-1 border-b-2 ${
              currentSection === 'art-puzzles' ? 'border-indigo-400 text-indigo-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Art Puzzles</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('arrow-puzzles'); }}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-cyan-300 py-1 border-b-2 ${
              currentSection === 'arrow-puzzles' ? 'border-cyan-400 text-cyan-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span>Arrow Puzzles</span>
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('daily'); }}
            className={`whitespace-nowrap transition-colors hover:text-amber-300 py-1 border-b-2 ${
              currentSection === 'daily' ? 'border-amber-400 text-amber-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => { sounds.playClick(); onNavigate('shop'); }}
            className={`whitespace-nowrap transition-colors hover:text-pink-300 py-1 border-b-2 ${
              currentSection === 'shop' ? 'border-pink-400 text-pink-300 font-semibold' : 'border-transparent text-slate-300'
            }`}
          >
            Shop
          </button>
        </nav>

        {/* Zone 3: Wallet, Profile & Audio Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Diamond Wallet Badge */}
          <button
            onClick={() => { sounds.playClick(); onNavigate('shop'); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 hover:border-amber-400/60 transition-all hover:scale-105 group"
            title="Your Diamond Wallet"
          >
            <span className="text-base group-hover:rotate-12 transition-transform">💎</span>
            <span className="font-mono-numbers text-sm font-bold text-amber-300">
              {profile.diamonds.toLocaleString()}
            </span>
          </button>

          {/* AI Oracle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAIOracle();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            title="Open Gemini AI Oracle (Learn how AI powers this game!)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Oracle</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) sounds.playClick();
            }}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Player Avatar & Level */}
          <button
            onClick={() => { sounds.playClick(); onNavigate('profile'); }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group"
            title="View Player Profile"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-sm shadow-inner">
              {profile.avatar}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                Lvl {profile.level}
              </span>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => { sounds.playClick(); onNavigate('settings'); }}
            className="hidden sm:flex p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
