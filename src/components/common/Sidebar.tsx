import React from 'react';
import { NavSection } from '../../types/game';
import {
  Home,
  Compass,
  Palette,
  MoveRight,
  Calendar,
  ShoppingBag,
  Trophy,
  User,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  diamonds: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentSection,
  onNavigate,
  diamonds,
}) => {
  if (!isOpen) return null;

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'home', label: 'Home Dashboard', icon: <Home className="w-5 h-5" />, color: 'text-amber-400' },
    { id: 'treasure-hunt', label: 'Treasure Hunt (150 Lvl)', icon: <Compass className="w-5 h-5" />, color: 'text-emerald-400' },
    { id: 'art-puzzles', label: 'Art Puzzles (150 Lvl)', icon: <Palette className="w-5 h-5" />, color: 'text-indigo-400' },
    { id: 'arrow-puzzles', label: 'Arrow Puzzles (150 Lvl)', icon: <MoveRight className="w-5 h-5" />, color: 'text-cyan-400' },
    { id: 'daily', label: 'Daily Challenges', icon: <Calendar className="w-5 h-5" />, color: 'text-yellow-400' },
    { id: 'shop', label: 'Diamond Shop', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-pink-400' },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" />, color: 'text-amber-300' },
    { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" />, color: 'text-violet-400' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'text-slate-400' },
  ];

  const handleSelect = (sec: NavSection) => {
    sounds.playClick();
    onNavigate(sec);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-fantasy text-lg font-bold text-slate-100">TREASUREVERSE</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Diamond Balance preview */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Balance</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base">💎</span>
              <span className="font-mono-numbers text-sm font-bold text-amber-300">{diamonds}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/50'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-800/60 text-xs text-slate-500 text-center">
          TreasureVerse v1.0 · 450 Adventure Levels
        </div>
      </div>
    </div>
  );
};
