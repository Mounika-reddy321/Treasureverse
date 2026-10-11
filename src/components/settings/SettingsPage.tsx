import React, { useState } from 'react';
import { AppSettings } from '../../services/storage';
import { sounds } from '../../utils/audio';
import { ArrowLeft, Settings as SettingsIcon, Volume2, VolumeX, Sparkles, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onBackToHome: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onBackToHome,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-8">
      
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
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              SETTINGS & PREFERENCES
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Audio volume, visual effects, and local game state management.
          </p>
        </div>
      </div>

      {/* Settings List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-6">
        
        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Audio Synthesizer FX</h3>
              <p className="text-xs text-slate-400">
                Play acoustic sound effects for moves, captures, riddles, and victories.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const nextVal = !settings.soundEnabled;
              sounds.enabled = nextVal;
              onUpdateSettings({ soundEnabled: nextVal });
              if (nextVal) sounds.playClick();
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                settings.soundEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Master Sound Volume</h3>
            <p className="text-xs text-slate-400">Adjust the synthesizer amplitude output.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                sounds.volume = vol;
                onUpdateSettings({ soundVolume: vol });
              }}
              className="w-32 accent-cyan-400"
            />
            <span className="font-mono-numbers text-xs text-slate-400 w-8 text-right">
              {Math.round(settings.soundVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Motion & Glow</h3>
              <p className="text-xs text-slate-400">
                Smooth transitions, sparkling stars, and arrow trajectory animations.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onUpdateSettings({ animationsEnabled: !settings.animationsEnabled });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.animationsEnabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                settings.animationsEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Reset Progress Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <h3 className="text-sm font-bold text-red-400">Reset All Game Progress</h3>
            <p className="text-xs text-slate-400">
              Permanently wipe all completed levels, stars, unlocked avatars, and wallet balance.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 text-center shadow-2xl z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center text-xl mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-fantasy text-xl font-bold text-white mb-2">
              CONFIRM HARD RESET?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              This will erase all 300 levels of progress, all 10 worlds, stars, and diamond transactions. This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowConfirmReset(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/25"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
