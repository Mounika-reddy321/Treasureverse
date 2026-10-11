import React, { useState, useEffect } from 'react';
import {
  GameId,
  GameProgress,
  NavSection,
  PlayerProfile,
  WalletTransaction,
  Achievement,
  DailyChallenge,
} from './types/game';
import { GameStorageService, AppSettings } from './services/storage';
import { sounds } from './utils/audio';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AIOracleModal } from './components/common/AIOracleModal';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { TreasureHuntHub } from './components/treasure/TreasureHuntHub';
import { TreasureGamePlay } from './components/treasure/TreasureGamePlay';
import { ALL_TREASURE_LEVELS, getTreasureLevel } from './data/treasureLevels';
import { ArtPuzzlesHub } from './components/art/ArtPuzzlesHub';
import { ArtGamePlay } from './components/art/ArtGamePlay';
import { ALL_ART_LEVELS, getArtLevel } from './data/artLevels';
import { ArrowPuzzlesHub } from './components/arrow/ArrowPuzzlesHub';
import { ArrowGamePlay } from './components/arrow/ArrowGamePlay';
import { ALL_ARROW_LEVELS, getArrowLevel } from './data/arrowLevels';
import { DailyChallengesPage } from './components/daily/DailyChallengesPage';
import { DiamondShopPage } from './components/shop/DiamondShopPage';
import { AchievementsPage } from './components/achievements/AchievementsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Active level states (null means browsing the hub)
  const [activeTreasureLevel, setActiveTreasureLevel] = useState<number | null>(null);
  const [activeArtLevel, setActiveArtLevel] = useState<number | null>(null);
  const [activeArrowLevel, setActiveArrowLevel] = useState<number | null>(null);
  const [isGlobalAIOracleOpen, setIsGlobalAIOracleOpen] = useState<boolean>(false);

  // Persistent game states
  const [profile, setProfile] = useState<PlayerProfile>(() => GameStorageService.getProfile());
  const [progress, setProgress] = useState<Record<GameId, GameProgress>>(() => GameStorageService.getProgress());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => GameStorageService.getTransactions());
  const [achievements, setAchievements] = useState<Achievement[]>(() => GameStorageService.getAchievements());
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => GameStorageService.getDailyChallenges());
  const [settings, setSettings] = useState<AppSettings>(() => GameStorageService.getSettings());

  // Initialize sounds settings on mount
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
    sounds.volume = settings.soundVolume;
  }, [settings.soundEnabled, settings.soundVolume]);

  const refreshAllState = () => {
    setProfile(GameStorageService.getProfile());
    setProgress(GameStorageService.getProgress());
    setTransactions(GameStorageService.getTransactions());
    setAchievements(GameStorageService.getAchievements());
    setDailyChallenges(GameStorageService.getDailyChallenges());
  };

  const handleSpendDiamonds = (amount: number, reason: string): boolean => {
    const success = GameStorageService.spendDiamonds(amount, reason);
    if (success) {
      refreshAllState();
    }
    return success;
  };

  const handleAddDiamonds = (amount: number, reason: string) => {
    GameStorageService.addDiamonds(amount, reason);
    refreshAllState();
  };

  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    const current = GameStorageService.getProfile();
    const next = { ...current, ...updated };
    GameStorageService.saveProfile(next);
    setProfile(next);
  };

  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    const current = GameStorageService.getSettings();
    const next = { ...current, ...updated };
    GameStorageService.saveSettings(next);
    setSettings(next);
  };

  const handleResetAllData = () => {
    GameStorageService.resetAllData();
    refreshAllState();
    setActiveTreasureLevel(null);
    setActiveArtLevel(null);
    setActiveArrowLevel(null);
    setCurrentSection('home');
  };

  const handleClaimDaily = (challengeId: string): boolean => {
    const claimed = GameStorageService.claimDailyChallenge(challengeId);
    if (claimed) {
      refreshAllState();
    }
    return claimed;
  };

  const handleCompleteTreasureLevel = (stars: number, score: number, baseReward: number) => {
    if (activeTreasureLevel === null) return { newlyCompleted: false, diamondsEarned: 0 };
    const res = GameStorageService.completeLevel('treasure-hunt', activeTreasureLevel, stars, score, baseReward);
    refreshAllState();
    return res;
  };

  const handleCompleteArtLevel = (stars: number, score: number, baseReward: number) => {
    if (activeArtLevel === null) return { newlyCompleted: false, diamondsEarned: 0 };
    const res = GameStorageService.completeLevel('art-puzzles', activeArtLevel, stars, score, baseReward);
    refreshAllState();
    return res;
  };

  const handleCompleteArrowLevel = (stars: number, score: number, baseReward: number) => {
    if (activeArrowLevel === null) return { newlyCompleted: false, diamondsEarned: 0 };
    const res = GameStorageService.completeLevel('arrow-puzzles', activeArrowLevel, stars, score, baseReward);
    refreshAllState();
    return res;
  };

  const handleContinuePlaying = () => {
    // Pick the game with highest unlocked uncompleted level, or last played
    const thUnlocked = progress['treasure-hunt'].unlockedLevel;
    const artUnlocked = progress['art-puzzles'].unlockedLevel;
    const arrowUnlocked = progress['arrow-puzzles'].unlockedLevel;

    // Check which one is not completed
    if (!progress['treasure-hunt'].completedLevels.includes(thUnlocked)) {
      setCurrentSection('treasure-hunt');
      setActiveTreasureLevel(thUnlocked);
    } else if (!progress['art-puzzles'].completedLevels.includes(artUnlocked)) {
      setCurrentSection('art-puzzles');
      setActiveArtLevel(artUnlocked);
    } else {
      setCurrentSection('arrow-puzzles');
      setActiveArrowLevel(arrowUnlocked);
    }
  };

  const handleNavigate = (sec: NavSection) => {
    setCurrentSection(sec);
    // When navigating to hub directly, exit any active level screen
    if (sec === 'treasure-hunt') setActiveTreasureLevel(null);
    if (sec === 'art-puzzles') setActiveArtLevel(null);
    if (sec === 'arrow-puzzles') setActiveArrowLevel(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayDailyChallenge = (gameId: GameId, targetLevel: number) => {
    if (gameId === 'treasure-hunt') {
      setCurrentSection('treasure-hunt');
      setActiveTreasureLevel(targetLevel);
    } else if (gameId === 'art-puzzles') {
      setCurrentSection('art-puzzles');
      setActiveArtLevel(targetLevel);
    } else {
      setCurrentSection('arrow-puzzles');
      setActiveArrowLevel(targetLevel);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        currentSection={currentSection}
        onNavigate={handleNavigate}
        profile={profile}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAIOracle={() => setIsGlobalAIOracleOpen(true)}
      />

      {/* Global AI Oracle Modal */}
      <AIOracleModal
        isOpen={isGlobalAIOracleOpen}
        onClose={() => setIsGlobalAIOracleOpen(false)}
        currentGame={currentSection}
        currentLevel={activeTreasureLevel || activeArtLevel || activeArrowLevel || 1}
      />

      {/* Mobile Drawer */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentSection={currentSection}
        onNavigate={handleNavigate}
        diamonds={profile.diamonds}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {/* 1. Home Dashboard */}
        {currentSection === 'home' && (
          <HomeDashboard
            profile={profile}
            progress={progress}
            achievements={achievements}
            dailyChallenges={dailyChallenges}
            onNavigate={handleNavigate}
            onContinuePlaying={handleContinuePlaying}
          />
        )}

        {/* 2. Treasure Hunt Game View or Hub */}
        {currentSection === 'treasure-hunt' && (
          activeTreasureLevel === null ? (
            <TreasureHuntHub
              progress={progress['treasure-hunt']}
              onSelectLevel={(lvl) => setActiveTreasureLevel(lvl)}
              onBackToHome={() => handleNavigate('home')}
            />
          ) : (
            <TreasureGamePlay
              key={`th-${activeTreasureLevel}`}
              level={getTreasureLevel(activeTreasureLevel)}
              progress={progress['treasure-hunt']}
              diamonds={profile.diamonds}
              onSpendDiamonds={handleSpendDiamonds}
              onCompleteLevel={handleCompleteTreasureLevel}
              onBackToHub={() => {
                setActiveTreasureLevel(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNextLevel={() => {
                setActiveTreasureLevel((prev) => (prev !== null && prev < 150 ? prev + 1 : prev));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* 3. Art Puzzles Game View or Hub */}
        {currentSection === 'art-puzzles' && (
          activeArtLevel === null ? (
            <ArtPuzzlesHub
              progress={progress['art-puzzles']}
              onSelectLevel={(lvl) => {
                setActiveArtLevel(lvl);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToHome={() => handleNavigate('home')}
            />
          ) : (
            <ArtGamePlay
              key={`art-${activeArtLevel}`}
              level={getArtLevel(activeArtLevel)}
              progress={progress['art-puzzles']}
              diamonds={profile.diamonds}
              onSpendDiamonds={handleSpendDiamonds}
              onCompleteLevel={handleCompleteArtLevel}
              onBackToHub={() => {
                setActiveArtLevel(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNextLevel={() => {
                setActiveArtLevel((prev) => (prev !== null && prev < 150 ? prev + 1 : prev));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* 4. Arrow Puzzles Game View or Hub */}
        {currentSection === 'arrow-puzzles' && (
          activeArrowLevel === null ? (
            <ArrowPuzzlesHub
              progress={progress['arrow-puzzles']}
              onSelectLevel={(lvl) => {
                setActiveArrowLevel(lvl);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToHome={() => handleNavigate('home')}
            />
          ) : (
            <ArrowGamePlay
              key={`arrow-${activeArrowLevel}`}
              level={getArrowLevel(activeArrowLevel)}
              progress={progress['arrow-puzzles']}
              diamonds={profile.diamonds}
              onSpendDiamonds={handleSpendDiamonds}
              onCompleteLevel={handleCompleteArrowLevel}
              onBackToHub={() => {
                setActiveArrowLevel(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNextLevel={() => {
                setActiveArrowLevel((prev) => (prev !== null && prev < 150 ? prev + 1 : prev));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {/* 5. Daily Challenges Page */}
        {currentSection === 'daily' && (
          <DailyChallengesPage
            challenges={dailyChallenges}
            onClaim={handleClaimDaily}
            onPlayChallenge={handlePlayDailyChallenge}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* 6. Diamond Shop Page */}
        {currentSection === 'shop' && (
          <DiamondShopPage
            profile={profile}
            onSpendDiamonds={handleSpendDiamonds}
            onAddDiamonds={handleAddDiamonds}
            onUpdateProfile={handleUpdateProfile}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* 7. Achievements Page */}
        {currentSection === 'achievements' && (
          <AchievementsPage
            achievements={achievements}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* 8. Profile Page */}
        {currentSection === 'profile' && (
          <ProfilePage
            profile={profile}
            progress={progress}
            transactions={transactions}
            onUpdateProfile={handleUpdateProfile}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {/* 9. Settings Page */}
        {currentSection === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
            onBackToHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Clean Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-fantasy font-bold text-slate-300">TREASUREVERSE</span>
            <span>—</span>
            <span>AI-Powered Multi-Game Adventure Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => handleNavigate('treasure-hunt')} className="hover:text-slate-300">
              Treasure Hunt
            </button>
            <button onClick={() => handleNavigate('art-puzzles')} className="hover:text-slate-300">
              Art Puzzles
            </button>
            <button onClick={() => handleNavigate('arrow-puzzles')} className="hover:text-slate-300">
              Arrow Puzzles
            </button>
            <button onClick={() => handleNavigate('shop')} className="hover:text-slate-300">
              Diamond Bazaar
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
