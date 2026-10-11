import React, { useState, useEffect } from 'react';
import { TreasureLevel, GameProgress } from '../../types/game';
import { sounds } from '../../utils/audio';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  Heart,
  ChevronRight,
  Crown,
  Play,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Lock,
} from 'lucide-react';

interface TreasureGamePlayProps {
  level: TreasureLevel;
  progress: GameProgress;
  diamonds: number;
  onSpendDiamonds: (amount: number, reason: string) => boolean;
  onCompleteLevel: (stars: number, score: number, baseReward: number) => { newlyCompleted: boolean; diamondsEarned: number };
  onBackToHub: () => void;
  onNextLevel: () => void;
}

interface CoinItem {
  id: number;
  x: number; // Lateral position (-1: Left, 0: Center, 1: Right)
  distance: number; // 0 to 100% along village road
  collected: boolean;
}

interface GuardState {
  distance: number;
  lane: number;
  alert: boolean;
  speed: number;
}

interface ChestItem {
  id: number;
  label: string;
  distance: number;
  lane: number;
  unlocked: boolean;
  riddlePrompt: string;
  options: string[];
  answer: string;
  explanation: string;
  rewardCoins: number;
}

const SPEED_UPGRADES = [
  { level: 1, speed: 16, cost: 0, label: 'Level 1', free: true },
  { level: 2, speed: 20, cost: 25, label: 'Level 2', free: false },
  { level: 3, speed: 24, cost: 50, label: 'Level 3', free: false },
  { level: 4, speed: 28, cost: 75, label: 'Level 4', free: false },
  { level: 5, speed: 32, cost: 100, label: 'Level 5', free: false },
];

export const TreasureGamePlay: React.FC<TreasureGamePlayProps> = ({
  level,
  progress,
  diamonds,
  onSpendDiamonds,
  onCompleteLevel,
  onBackToHub,
  onNextLevel,
}) => {
  // Screen views matching reference image: 'intro' | 'game' | 'victory'
  const [currentView, setCurrentView] = useState<'intro' | 'game' | 'victory'>('game');
  const [introLoadingProgress, setIntroLoadingProgress] = useState<number>(78);

  // Persistent Player stats
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('vtgh_coins');
    return saved ? parseInt(saved, 10) : 124;
  });
  const [speedLevel, setSpeedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('vtgh_speed_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [health, setHealth] = useState<number>(85);

  // Character movement states (Roblox-style blocky adventurer)
  const [playerDistance, setPlayerDistance] = useState<number>(18); // 8% to 96%
  const [playerLane, setPlayerLane] = useState<number>(0); // -1.1 to 1.1
  const [facing, setFacing] = useState<'front' | 'back' | 'left' | 'right'>('front');
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [autoRun, setAutoRun] = useState<boolean>(false);
  const [stepCycle, setStepCycle] = useState<number>(0);

  // Modals & Toast
  const [isSpeedShopOpen, setIsSpeedShopOpen] = useState<boolean>(false);
  const [activeChestRiddle, setActiveChestRiddle] = useState<ChestItem | null>(null);
  const [selectedRiddleOption, setSelectedRiddleOption] = useState<string | null>(null);
  const [riddleFeedback, setRiddleFeedback] = useState<string | null>(null);
  const [isRiddleCorrect, setIsRiddleCorrect] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3 Hidden Chests in the village
  const [chests, setChests] = useState<ChestItem[]>([
    {
      id: 1,
      label: 'Old Miller’s Wooden Chest',
      distance: 30,
      lane: -0.9,
      unlocked: false,
      riddlePrompt: level.riddle?.prompt || 'What ancient tool did village builders use to find true north?',
      options: level.riddle?.options || ['Compass 🧭', 'Hammer 🔨', 'Lantern 🏮', 'Shovel ⛏️'],
      answer: level.riddle?.answer || 'Compass 🧭',
      explanation: level.riddle?.explanation || 'A magnetic compass guides travelers reliably!',
      rewardCoins: 35,
    },
    {
      id: 2,
      label: 'Cobblestone Fountain Vault',
      distance: 60,
      lane: 0.9,
      unlocked: false,
      riddlePrompt: 'Which friendly nocturnal animal keeps watch from the high village church spire?',
      options: ['Wise Owl 🦉', 'Farm Rooster 🐓', 'Canary Bird 🐦', 'Garden Mole 🦔'],
      answer: 'Wise Owl 🦉',
      explanation: 'The wise owl patrols the village rooftops in moonlight!',
      rewardCoins: 45,
    },
    {
      id: 3,
      label: 'Royal Watchtower Relic Box',
      distance: 88,
      lane: 0,
      unlocked: false,
      riddlePrompt: 'What shines brightest above the village at midnight when clouds part?',
      options: ['Full Moon 🌕', 'Street Campfire 🔥', 'Oil Lamp 🪔', 'Lightning Bug 🪲'],
      answer: 'Full Moon 🌕',
      explanation: 'The golden full moon illuminates every road in the kingdom!',
      rewardCoins: 60,
    },
  ]);

  // Floating Golden Coins along the game road
  const [coinItems, setCoinItems] = useState<CoinItem[]>([
    { id: 1, x: 0, distance: 15, collected: false },
    { id: 2, x: 0, distance: 22, collected: false },
    { id: 3, x: -0.8, distance: 28, collected: false },
    { id: 4, x: -0.8, distance: 36, collected: false },
    { id: 5, x: 0.8, distance: 44, collected: false },
    { id: 6, x: 0.8, distance: 52, collected: false },
    { id: 7, x: 0, distance: 58, collected: false },
    { id: 8, x: 0, distance: 68, collected: false },
    { id: 9, x: -0.8, distance: 76, collected: false },
    { id: 10, x: 0.8, distance: 82, collected: false },
    { id: 11, x: 0, distance: 86, collected: false },
    { id: 12, x: 0, distance: 94, collected: false },
  ]);

  // Patrolling Medieval Knight Guard
  const [guard, setGuard] = useState<GuardState>({
    distance: 48,
    lane: 0.2,
    alert: false,
    speed: 6,
  });

  const treasuresFoundCount = chests.filter((c) => c.unlocked).length;
  const currentSpeedValue = SPEED_UPGRADES.find((s) => s.level === speedLevel)?.speed || 16;

  // Persist coins & speed
  useEffect(() => {
    localStorage.setItem('vtgh_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('vtgh_speed_level', speedLevel.toString());
  }, [speedLevel]);

  // Reset when level changes
  useEffect(() => {
    handleResetLevel();
  }, [level.level]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetLevel = () => {
    sounds.playClick();
    setHealth(85);
    setPlayerDistance(18);
    setPlayerLane(0);
    setFacing('front');
    setIsJumping(false);
    setIsRunning(false);
    setAutoRun(false);
    setActiveChestRiddle(null);
    setSelectedRiddleOption(null);
    setRiddleFeedback(null);
    setIsRiddleCorrect(false);
    setChests([
      {
        id: 1,
        label: 'Old Miller’s Wooden Chest',
        distance: 30,
        lane: -0.9,
        unlocked: false,
        riddlePrompt: level.riddle?.prompt || 'What ancient tool did village builders use to find true north?',
        options: level.riddle?.options || ['Compass 🧭', 'Hammer 🔨', 'Lantern 🏮', 'Shovel ⛏️'],
        answer: level.riddle?.answer || 'Compass 🧭',
        explanation: level.riddle?.explanation || 'A magnetic compass guides travelers reliably!',
        rewardCoins: 35,
      },
      {
        id: 2,
        label: 'Cobblestone Fountain Vault',
        distance: 60,
        lane: 0.9,
        unlocked: false,
        riddlePrompt: 'Which friendly nocturnal animal keeps watch from the high village church spire?',
        options: ['Wise Owl 🦉', 'Farm Rooster 🐓', 'Canary Bird 🐦', 'Garden Mole 🦔'],
        answer: 'Wise Owl 🦉',
        explanation: 'The wise owl patrols the village rooftops in moonlight!',
        rewardCoins: 45,
      },
      {
        id: 3,
        label: 'Royal Watchtower Relic Box',
        distance: 88,
        lane: 0,
        unlocked: false,
        riddlePrompt: 'What shines brightest above the village at midnight when clouds part?',
        options: ['Full Moon 🌕', 'Street Campfire 🔥', 'Oil Lamp 🪔', 'Lightning Bug 🪲'],
        answer: 'Full Moon 🌕',
        explanation: 'The golden full moon illuminates every road in the kingdom!',
        rewardCoins: 60,
      },
    ]);
    setCoinItems((prev) => prev.map((c) => ({ ...c, collected: false })));
    setGuard({
      distance: 48,
      lane: 0.2,
      alert: false,
      speed: 6,
    });
    setCurrentView('game');
  };

  // Collision and guard alert check
  const checkCollisions = (newDist: number, newLane: number) => {
    // Check coin pickups
    setCoinItems((coinsList) =>
      coinsList.map((c) => {
        if (!c.collected && Math.abs(c.distance - newDist) < 6 && Math.abs(c.x - newLane) < 0.6) {
          sounds.playCoinCollect();
          setCoins((cnt) => cnt + 1);
          showToast('+1 🪙 Gold Coin Collected!');
          return { ...c, collected: true };
        }
        return c;
      })
    );

    // Guard interaction
    const guardDistDelta = Math.abs(guard.distance - newDist);
    if (guardDistDelta < 14) {
      if (!guard.alert) {
        sounds.playGuardAlert();
        setGuard((g) => ({ ...g, alert: true }));
        showToast('⚠️ VILLAGE GUARD ALERT! SPRINT PAST HIM!');
      }

      if (Math.abs(guard.lane - newLane) < 0.55 && !isJumping && guardDistDelta < 5) {
        sounds.playError();
        setHealth((h) => {
          const nextH = Math.max(10, h - 12);
          if (nextH <= 20) {
            showToast('💔 Low Health! Dodge left or right to escape!');
          }
          return nextH;
        });
      }
    } else if (newDist > guard.distance + 14 && guard.alert) {
      setGuard((g) => ({ ...g, alert: false }));
      sounds.playGemCollect();
      showToast('🛡️ Whew! You outran the Village Guard!');
    }
  };

  // 1. Move Front (Forward)
  const moveFront = (boost = 1) => {
    sounds.playTileMove();
    setFacing('front');
    setStepCycle((s) => (s + 1) % 4);
    const stepSize = (isRunning ? 7.5 : 4.5) * boost;
    setPlayerDistance((prev) => {
      const nextDist = Math.min(97, prev + stepSize);
      checkCollisions(nextDist, playerLane);
      return nextDist;
    });
  };

  // 2. Move Back (Backward)
  const moveBack = () => {
    sounds.playTileMove();
    setFacing('back');
    setStepCycle((s) => (s + 1) % 4);
    const stepSize = isRunning ? 6 : 3.5;
    setPlayerDistance((prev) => {
      const nextDist = Math.max(8, prev - stepSize);
      checkCollisions(nextDist, playerLane);
      return nextDist;
    });
  };

  // 3. Move Left
  const moveLeft = () => {
    sounds.playTileMove();
    setFacing('left');
    setStepCycle((s) => (s + 1) % 4);
    setPlayerLane((prev) => {
      const nextLane = Math.max(-1.1, prev - 0.45);
      checkCollisions(playerDistance, nextLane);
      return nextLane;
    });
  };

  // 4. Move Right
  const moveRight = () => {
    sounds.playTileMove();
    setFacing('right');
    setStepCycle((s) => (s + 1) % 4);
    setPlayerLane((prev) => {
      const nextLane = Math.min(1.1, prev + 0.45);
      checkCollisions(playerDistance, nextLane);
      return nextLane;
    });
  };

  // 5. Jump
  const jump = () => {
    if (isJumping) return;
    sounds.playSpeedBoost();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 550);
  };

  // 6. Run Sprint / Auto-Run
  const triggerRunSprint = () => {
    sounds.playSpeedBoost();
    setIsRunning(true);
    moveFront(1.9);
    setTimeout(() => setIsRunning(false), 850);
  };

  const toggleAutoRun = () => {
    sounds.playClick();
    setAutoRun((prev) => {
      const next = !prev;
      if (next) {
        setIsRunning(true);
        showToast('🏃 Running Mode Active! Steer with Left/Right!');
      } else {
        setIsRunning(false);
      }
      return next;
    });
  };

  // Auto-run continuous movement ticker
  useEffect(() => {
    if (!autoRun || activeChestRiddle || isSpeedShopOpen || currentView !== 'game') return;

    const timer = setInterval(() => {
      setPlayerDistance((prev) => {
        if (prev >= 96) {
          setAutoRun(false);
          setIsRunning(false);
          return prev;
        }
        const nextDist = Math.min(97, prev + 1.25);
        setStepCycle((s) => (s + 1) % 4);
        checkCollisions(nextDist, playerLane);
        return nextDist;
      });
    }, 110);

    return () => clearInterval(timer);
  }, [autoRun, playerLane, activeChestRiddle, isSpeedShopOpen, currentView, guard]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeChestRiddle || isSpeedShopOpen || currentView !== 'game') return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveFront();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveBack();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveRight();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        jump();
      } else if (e.key === 'Shift' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        triggerRunSprint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerDistance, playerLane, activeChestRiddle, isSpeedShopOpen, currentView, isRunning, guard]);

  // Chest Riddle Handlers
  const handleOpenChest = (chest: ChestItem) => {
    sounds.playClick();
    setActiveChestRiddle(chest);
    setSelectedRiddleOption(null);
    setRiddleFeedback(null);
    setIsRiddleCorrect(false);
  };

  const handleSelectChestOption = (option: string) => {
    if (!activeChestRiddle || isRiddleCorrect) return;

    setSelectedRiddleOption(option);
    sounds.playClick();

    if (option === activeChestRiddle.answer) {
      sounds.playGemCollect();
      setIsRiddleCorrect(true);
      setRiddleFeedback(`✨ Brilliant! ${activeChestRiddle.explanation}`);

      const updatedChests = chests.map((c) =>
        c.id === activeChestRiddle.id ? { ...c, unlocked: true } : c
      );
      setChests(updatedChests);
      setCoins((c) => c + activeChestRiddle.rewardCoins);
      showToast(`🎉 Chest Unlocked! +${activeChestRiddle.rewardCoins} 🪙 Coins!`);

      const totalUnlocked = updatedChests.filter((c) => c.unlocked).length;
      if (totalUnlocked === 3) {
        setTimeout(() => {
          handleAllTreasuresFound();
        }, 1300);
      }
    } else {
      sounds.playError();
      setRiddleFeedback('The chest lock rattled, but didn’t turn. Try another answer!');
    }
  };

  const handleAllTreasuresFound = () => {
    sounds.playLevelComplete();
    const stars = health >= 70 ? 3 : health >= 40 ? 2 : 1;
    onCompleteLevel(stars, coins * 10 + health * 5, level.rewardDiamonds);
    setCurrentView('victory');
  };

  const handleBuySpeedUpgrade = (tier: typeof SPEED_UPGRADES[0]) => {
    if (speedLevel >= tier.level) {
      showToast('Already unlocked this speed rank!');
      return;
    }
    if (coins < tier.cost) {
      sounds.playError();
      showToast(`Need ${tier.cost - coins} more coins to upgrade!`);
      return;
    }
    sounds.playGemCollect();
    setCoins((c) => c - tier.cost);
    setSpeedLevel(tier.level);
    showToast(`⚡ Upgraded to Speed Level ${tier.level} (Speed: ${tier.speed})!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans pb-8">
      
      {/* =========================================================================
          TOP BANNER: BRANDING AS SEEN IN REFERENCE IMAGE
          ========================================================================= */}
      <div className="w-full bg-[#030712] border-b border-amber-500/30 px-3 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md z-30">
        
        {/* GauravGo Branding Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 text-white font-black text-xl">
              G
            </div>
            <div className="leading-tight">
              <span className="font-fantasy text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 tracking-wider">
                GauravGo
              </span>
              <span className="block text-[10px] text-emerald-300 font-semibold tracking-widest uppercase">
                Creating Dreams
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Golden Carved Title Plaque with Crown */}
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400 fill-amber-400 filter drop-shadow-[0_1px_4px_rgba(251,191,36,0.8)]" />
            <span className="font-fantasy font-black text-sm text-yellow-300 tracking-wider uppercase">
              VILLAGE TREASURE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase shadow">
              GUARD HUNT
            </span>
          </div>
        </div>

        {/* Sub-tagline pills & Screen switchers */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-amber-400 font-extrabold">CLEAN</span> • 
            <span className="text-cyan-400 font-extrabold">MODERN</span> • 
            <span className="text-emerald-400 font-extrabold">RESPONSIVE</span> • 
            <span className="text-purple-400 font-extrabold">GAME READY</span>
          </div>
          
          <div className="h-4 w-px bg-slate-800 hidden lg:block" />

          {/* Intro Screen button */}
          <button
            onClick={() => setCurrentView('intro')}
            className={`py-1 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              currentView === 'intro'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            Intro
          </button>

          {/* Game View button */}
          <button
            onClick={() => setCurrentView('game')}
            className={`py-1 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              currentView === 'game'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            Play Game
          </button>

          {/* Hub back button */}
          <button
            onClick={() => { sounds.playClick(); onBackToHub(); }}
            className="py-1 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Worlds Map</span>
          </button>

          {/* Next Level button if at least 1 treasure found */}
          {treasuresFoundCount > 0 && level.level < 150 && (
            <button
              onClick={() => { sounds.playClick(); onNextLevel(); }}
              className="py-1 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <span>Next Level ({level.level + 1})</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border-2 border-amber-400 text-amber-300 px-5 py-2.5 rounded-full shadow-2xl shadow-amber-500/20 text-xs font-bold animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          PANEL 1: INTRO SCREEN (Matching top-left panel of reference screenshot)
          ========================================================================= */}
      {currentView === 'intro' && (
        <div className="max-w-4xl mx-auto my-4 px-3 w-full animate-fade-in flex-1 flex flex-col justify-center">
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-center">
            
            {/* Visual 3D Game Village Backdrop Illustration */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 500">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#skyGrad)" />
                {/* Distant cartoon mountains */}
                <polygon points="0,350 150,120 320,350" fill="#334155" />
                <polygon points="250,350 480,90 700,350" fill="#1e293b" />
                <polygon points="620,350 800,160 800,350" fill="#334155" />
                {/* Green rolling hills */}
                <ellipse cx="200" cy="400" rx="350" ry="120" fill="#15803d" />
                <ellipse cx="650" cy="420" rx="400" ry="140" fill="#16a34a" />
                {/* Cartoon cottages */}
                <polygon points="120,280 180,240 240,280" fill="#ea580c" />
                <rect x="140" y="280" width="80" height="60" fill="#fef08a" />
                <polygon points="560,290 620,250 680,290" fill="#c2410c" />
                <rect x="580" y="290" width="80" height="50" fill="#fed7aa" />
              </svg>
            </div>

            {/* GauravGo Logo Tag */}
            <div className="relative inline-flex items-center gap-2 mb-3 bg-slate-900/90 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs">
                G
              </div>
              <span className="font-fantasy text-xs font-extrabold text-emerald-300">
                GauravGo Creating Dreams
              </span>
            </div>

            {/* Huge Wooden Plaque with Green Leaf Foliage Title */}
            <div className="relative max-w-lg mx-auto mb-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-800 via-amber-950 to-stone-900 border-4 border-amber-500/90 shadow-2xl shadow-amber-600/40">
              <div className="text-3xl -mt-9 mb-1 filter drop-shadow">🍃 👑 🍃</div>
              <h1 className="font-fantasy text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wider filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
                VILLAGE TREASURE
              </h1>
              <div className="inline-block mt-2 px-6 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white font-black text-sm sm:text-base tracking-widest uppercase shadow-md border border-cyan-400/40">
                GUARD HUNT
              </div>
              <p className="mt-2.5 text-xs sm:text-sm text-amber-200 font-bold tracking-wide">
                Hunt the Treasure. Outrun the Guards!
              </p>
            </div>

            {/* Loading Bar matching screenshot */}
            <div className="relative max-w-md mx-auto mb-5">
              <div className="flex justify-between items-center text-[11px] font-bold text-amber-300 mb-1">
                <span>LOADING THE VILLAGE...</span>
                <span className="font-mono-numbers">{introLoadingProgress}%</span>
              </div>
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-amber-500/60 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/60 transition-all duration-500"
                  style={{ width: `${introLoadingProgress}%` }}
                />
              </div>
            </div>

            {/* Tip Box matching screenshot */}
            <div className="relative max-w-md mx-auto mb-6 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3 text-left shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 text-lg">
                💡
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider">
                  TIP:
                </span>
                <span className="text-xs text-slate-200">
                  Search every corner of the village for hidden treasure. Watch out for patrolling guards!
                </span>
              </div>
            </div>

            {/* Big Orange Capsule "START HUNT >" Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentView('game');
              }}
              className="relative py-3.5 px-10 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base sm:text-lg tracking-wider shadow-2xl shadow-orange-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-2 mx-auto border-2 border-yellow-300"
            >
              <span>START HUNT</span>
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            <p className="mt-3 text-xs text-slate-400">
              Village Level {level.level} of 150 · {level.title}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          PANEL 2: 3D CARTOON GAMEPLAY SCREEN (Matching top-right panel of reference screenshot)
          ========================================================================= */}
      {currentView === 'game' && (
        <div className="max-w-5xl mx-auto px-2 sm:px-4 my-2 w-full flex-1 flex flex-col">
          
          {/* Main 3D Perspective Game Viewport Card */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 bg-[#0f172a] flex-1 min-h-[500px] sm:min-h-[560px] flex flex-col justify-between">
            
            {/* -------------------------------------------------------------
                100% 3D GAME THEME CARTOON VILLAGE GRAPHICS (NO REAL PHOTOS!)
                ------------------------------------------------------------- */}
            <div className="absolute inset-0 select-none overflow-hidden pointer-events-none">
              
              {/* Vibrant Summer Sky Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100" />

              {/* Cartoon Fluffy Clouds */}
              <div className="absolute top-4 left-10 w-28 h-10 bg-white/80 rounded-full blur-[1px]" />
              <div className="absolute top-8 left-48 w-36 h-12 bg-white/70 rounded-full blur-[1px]" />
              <div className="absolute top-6 right-20 w-44 h-14 bg-white/85 rounded-full blur-[1px]" />

              {/* 3D Distant Cartoon Mountain Peaks */}
              <svg className="absolute top-0 w-full h-48" preserveAspectRatio="none" viewBox="0 0 1000 300">
                {/* Back peaks */}
                <polygon points="0,300 160,50 340,300" fill="#64748b" opacity="0.9" />
                <polygon points="160,50 185,90 145,95" fill="#f8fafc" />

                <polygon points="280,300 480,30 680,300" fill="#475569" opacity="0.9" />
                <polygon points="480,30 515,80 455,85" fill="#f8fafc" />

                <polygon points="620,300 820,60 1000,300" fill="#64748b" opacity="0.9" />
                <polygon points="820,60 850,100 800,105" fill="#f8fafc" />

                {/* Rolling Green Cartoon Hills */}
                <path d="M 0 300 Q 250 180 500 240 Q 750 170 1000 280 L 1000 300 L 0 300 Z" fill="#15803d" />
                <path d="M 0 300 Q 200 210 400 250 Q 650 200 1000 260 L 1000 300 L 0 300 Z" fill="#22c55e" opacity="0.8" />
              </svg>

              {/* 3D Whimsical Fantasy Village Cottages on Left & Right */}
              <div className="absolute top-24 left-0 right-0 flex justify-between px-3 sm:px-8">
                
                {/* Left Village Cottages Cluster */}
                <div className="flex items-end gap-1 sm:gap-2">
                  {/* Cottage 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 sm:w-20 h-12 bg-gradient-to-b from-orange-600 to-amber-700 rounded-t-lg relative shadow-md">
                      <div className="w-3 h-5 bg-stone-700 absolute -top-4 right-2 rounded-t-sm" />
                      <div className="w-2.5 h-1.5 bg-white/70 absolute -top-6 right-2 rounded-full blur-[1px]" />
                    </div>
                    <div className="w-14 sm:w-18 h-12 bg-amber-100 border-2 border-stone-800 relative flex items-center justify-around px-1">
                      <div className="w-3 h-4 bg-yellow-300 rounded-sm border border-stone-800 shadow-sm shadow-yellow-300" />
                      <div className="w-3 h-5 bg-amber-900 rounded-t-md" />
                    </div>
                  </div>

                  {/* Windmill / Watchtower */}
                  <div className="flex flex-col items-center mb-1">
                    <div className="w-10 h-16 bg-stone-700 border border-stone-900 rounded-t-xl relative flex justify-center">
                      <div className="w-3 h-3 bg-yellow-300 rounded-full top-2 absolute shadow-md shadow-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Right Village Cottages Cluster */}
                <div className="flex items-end gap-1 sm:gap-2">
                  {/* Cottage 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 sm:w-20 h-12 bg-gradient-to-b from-red-600 to-orange-700 rounded-t-lg relative shadow-md">
                      <div className="w-3 h-5 bg-stone-700 absolute -top-4 left-2 rounded-t-sm" />
                    </div>
                    <div className="w-14 sm:w-18 h-12 bg-amber-100 border-2 border-stone-800 relative flex items-center justify-around px-1">
                      <div className="w-3 h-5 bg-amber-900 rounded-t-md" />
                      <div className="w-3 h-4 bg-yellow-300 rounded-sm border border-stone-800 shadow-sm shadow-yellow-300" />
                    </div>
                  </div>

                  {/* Village Chapel Spire */}
                  <div className="flex flex-col items-center mb-1">
                    <div className="w-8 h-20 bg-stone-600 border border-stone-800 rounded-t-2xl relative flex justify-center">
                      <div className="w-2 h-4 bg-yellow-300 top-4 absolute shadow-sm" />
                    </div>
                  </div>
                </div>

              </div>

              {/* 3D Perspective Village Road (Cobblestones & Split-rail Fences) */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600">
                {/* Lush Green Meadows on borders */}
                <polygon points="0,260 380,260 140,600 0,600" fill="#15803d" />
                <polygon points="620,260 1000,260 1000,600 860,600" fill="#15803d" />

                {/* Light Green Grass banks */}
                <polygon points="100,260 380,260 200,600 80,600" fill="#22c55e" opacity="0.4" />
                <polygon points="620,260 900,260 920,600 800,600" fill="#22c55e" opacity="0.4" />

                {/* Dirt & Cobblestone Winding Road */}
                <polygon points="380,260 620,260 840,600 160,600" fill="#b45309" />
                <polygon points="400,260 600,260 800,600 200,600" fill="#d97706" opacity="0.8" />
                <polygon points="430,260 570,260 740,600 260,600" fill="#f59e0b" opacity="0.6" />

                {/* Cobblestone texture rings */}
                <ellipse cx="500" cy="285" rx="55" ry="9" fill="#92400e" opacity="0.5" />
                <ellipse cx="490" cy="335" rx="100" ry="15" fill="#92400e" opacity="0.5" />
                <ellipse cx="510" cy="405" rx="160" ry="24" fill="#92400e" opacity="0.5" />
                <ellipse cx="500" cy="495" rx="230" ry="34" fill="#92400e" opacity="0.5" />
                <ellipse cx="500" cy="580" rx="310" ry="44" fill="#92400e" opacity="0.5" />

                {/* Split-Rail Wooden Fences on Left & Right */}
                <line x1="380" y1="260" x2="160" y2="600" stroke="#78350f" strokeWidth="8" />
                <line x1="390" y1="275" x2="170" y2="615" stroke="#92400e" strokeWidth="6" />

                <line x1="620" y1="260" x2="840" y2="600" stroke="#78350f" strokeWidth="8" />
                <line x1="610" y1="275" x2="830" y2="615" stroke="#92400e" strokeWidth="6" />

                {/* Wooden Fence Posts along road */}
                {[0.08, 0.28, 0.52, 0.76, 0.96].map((t, idx) => {
                  const lx = 380 + (160 - 380) * t;
                  const ly = 260 + (600 - 260) * t;
                  const rx = 620 + (840 - 620) * t;
                  const h = 20 + t * 45;
                  return (
                    <g key={idx}>
                      <line x1={lx} y1={ly - h} x2={lx} y2={ly} stroke="#451a03" strokeWidth={5 + t * 8} strokeLinecap="round" />
                      <line x1={rx} y1={ly - h} x2={rx} y2={ly} stroke="#451a03" strokeWidth={5 + t * 8} strokeLinecap="round" />
                    </g>
                  );
                })}
              </svg>

              {/* -------------------------------------------------------------
                  SPAWNED OBJECTS: SPINNING COINS, GUARD, 3 CHESTS
                  ------------------------------------------------------------- */}
              
              {/* Floating Glowing Golden Coins */}
              {coinItems.map((c) => {
                if (c.collected) return null;
                const progressFactor = c.distance / 100;
                const topPct = 48 + progressFactor * 42; // 48% to 90%
                const lateralOffset = c.x * (18 + progressFactor * 24);
                const scale = 0.6 + progressFactor * 0.7;

                return (
                  <div
                    key={c.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 animate-bounce pointer-events-none"
                    style={{
                      left: `calc(50% + ${lateralOffset}%)`,
                      top: `${topPct}%`,
                      transform: `scale(${scale})`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-yellow-200 shadow-xl shadow-yellow-400/80 flex items-center justify-center text-xs font-black text-amber-950">
                      🪙
                    </div>
                  </div>
                );
              })}

              {/* 3 Hidden Treasure Chests in the Village */}
              {chests.map((chest) => {
                const progressFactor = chest.distance / 100;
                const topPct = 50 + progressFactor * 36;
                const lateralOffset = chest.lane * (20 + progressFactor * 22);
                const isNearby = Math.abs(playerDistance - chest.distance) < 18;

                return (
                  <div
                    key={chest.id}
                    className="absolute z-15 -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
                    style={{
                      left: `calc(50% + ${lateralOffset}%)`,
                      top: `${topPct}%`,
                    }}
                    onClick={() => handleOpenChest(chest)}
                  >
                    <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                      chest.unlocked
                        ? 'scale-125 bg-amber-500/30 shadow-2xl shadow-amber-400/70 border-2 border-amber-400'
                        : isNearby
                        ? 'scale-115 bg-slate-900/95 border-2 border-amber-400 animate-pulse ring-4 ring-amber-400/40'
                        : 'scale-90 bg-slate-950/80 border border-slate-700/80'
                    }`}>
                      <div className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                        {chest.unlocked ? '✨ 📦' : '🔒 📦'}
                      </div>
                      
                      <span className={`block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 text-center whitespace-nowrap shadow-md ${
                        chest.unlocked
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-amber-300 border border-slate-700'
                      }`}>
                        Chest #{chest.id} {chest.unlocked ? '✓ Unlocked' : 'Tap to Open'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Patrolling Knight Guard with Red "!" Alert */}
              {(() => {
                const gProgress = guard.distance / 100;
                const topPct = 50 + gProgress * 38;
                const lateralOffset = guard.lane * 18;
                const scale = 0.7 + gProgress * 0.7;

                return (
                  <div
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
                    style={{
                      left: `calc(50% + ${lateralOffset}%)`,
                      top: `${topPct}%`,
                      transform: `scale(${scale})`,
                    }}
                  >
                    {guard.alert && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-sm w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xl shadow-red-500/80 animate-bounce">
                        !
                      </div>
                    )}

                    {/* Blocky Knight in Shining Armor */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-slate-300 to-slate-600 border-2 border-slate-200 relative shadow-md">
                        <div className="w-3 h-5 bg-blue-600 rounded-t-full absolute -top-3 left-2.5" />
                        <div className="w-4 h-1.5 bg-slate-950 absolute top-3 left-2 rounded-sm" />
                      </div>
                      <div className="w-12 h-10 bg-slate-700 border border-slate-500 rounded-lg relative flex items-center justify-between px-1 shadow-lg">
                        <div className="w-4 h-6 rounded-b-lg bg-red-700 border border-yellow-400 flex items-center justify-center text-[8px] text-yellow-300 font-bold">
                          🛡️
                        </div>
                        <div className="w-1 h-12 bg-amber-800 absolute right-0.5 -top-4 rounded-sm" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-5 bg-slate-800 rounded-b-md" />
                        <div className="w-3 h-5 bg-slate-800 rounded-b-md" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* -------------------------------------------------------------
                  THE 3D ROBLOX-STYLE BLOCKY ADVENTURER CHARACTER
                  ------------------------------------------------------------- */}
              {(() => {
                const pProgress = playerDistance / 100;
                const topPct = 52 + pProgress * 36;
                const lateralOffset = playerLane * (20 + pProgress * 24);
                const scale = 0.8 + pProgress * 0.7;
                const legSwing = stepCycle % 2 === 0 ? 6 : -6;
                const armSwing = stepCycle % 2 === 0 ? -6 : 6;

                return (
                  <div
                    className={`absolute z-25 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 pointer-events-none ${
                      isJumping ? '-translate-y-20 scale-110' : ''
                    } ${isRunning ? 'filter drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]' : ''}`}
                    style={{
                      left: `calc(50% + ${lateralOffset}%)`,
                      top: `${topPct}%`,
                      transform: `scale(${scale})`,
                    }}
                  >
                    {/* Shadow underneath blocky runner */}
                    <div className="w-16 h-4 bg-slate-950/70 rounded-full blur-sm mx-auto -mb-2" />

                    {/* Dust clouds while running */}
                    {isRunning && (
                      <div className="absolute -bottom-2 -left-3 text-sm animate-ping opacity-80">
                        💨
                      </div>
                    )}

                    {/* Blocky Roblox Adventurer Container with Facing Orientation */}
                    <div className={`flex flex-col items-center transition-transform ${
                      facing === 'left' ? '-scale-x-100' : ''
                    }`}>
                      
                      {/* Dark Spiky Blocky Hair */}
                      <div className="w-10 h-9 rounded-lg bg-stone-900 border-2 border-stone-800 relative shadow-md">
                        {/* Spiky hair tufts */}
                        <div className="w-3 h-2 bg-stone-800 rounded-t-sm absolute -top-1.5 left-1" />
                        <div className="w-4 h-2 bg-stone-800 rounded-t-sm absolute -top-1.5 left-4" />
                        {facing === 'front' ? (
                          <div className="w-7 h-2 bg-amber-200 rounded-b-sm mx-auto mt-6" />
                        ) : facing === 'back' ? (
                          <div className="w-8 h-4 bg-stone-800 rounded-md mx-auto mt-2" />
                        ) : (
                          <div className="w-2.5 h-4 bg-amber-200 rounded-r-sm absolute right-0 top-3" />
                        )}
                      </div>

                      {/* Blue Roblox Hoodie / Jacket with "G" Backpack */}
                      <div className="w-14 h-12 bg-gradient-to-b from-blue-600 to-indigo-800 rounded-md relative flex items-center justify-between px-1 shadow-lg border-2 border-blue-400">
                        {/* Left Blocky Arm */}
                        <div
                          className="w-3 h-9 bg-blue-600 border border-blue-400 rounded-sm -ml-3 transition-transform"
                          style={{
                            transform: `translateY(${armSwing}px)`,
                          }}
                        />

                        {/* Back View: Dark Backpack with Cyan/Teal "G" Logo */}
                        <div className="w-8 h-8 rounded-lg bg-stone-900 border-2 border-cyan-400 flex items-center justify-center text-xs font-black text-cyan-300 shadow-inner">
                          {facing === 'back' ? '🎒' : 'G'}
                        </div>

                        {/* Right Blocky Arm */}
                        <div
                          className="w-3 h-9 bg-blue-600 border border-blue-400 rounded-sm -mr-3 transition-transform"
                          style={{
                            transform: `translateY(${-armSwing}px)`,
                          }}
                        />
                      </div>

                      {/* Blocky Jeans & White-trimmed Sneakers */}
                      <div className="flex gap-2 mt-0.5">
                        <div
                          className="w-4 h-6 bg-slate-900 rounded-b-sm border-b-2 border-white shadow transition-transform"
                          style={{
                            transform: `translateY(${legSwing}px)`,
                          }}
                        />
                        <div
                          className="w-4 h-6 bg-slate-900 rounded-b-sm border-b-2 border-white shadow transition-transform"
                          style={{
                            transform: `translateY(${-legSwing}px)`,
                          }}
                        />
                      </div>

                    </div>
                  </div>
                );
              })()}

            </div>

            {/* -------------------------------------------------------------
                HUD OVERLAY (TOP-LEFT STATS CARD, TOP-RIGHT SPEED SHOP, MISSION)
                ------------------------------------------------------------- */}
            <div className="relative z-30 p-3 sm:p-5 flex flex-col justify-between pointer-events-none select-none">
              
              {/* Top Row Stats & Speed Shop */}
              <div className="flex items-start justify-between gap-3 pointer-events-auto">
                
                {/* TOP-LEFT STATS CARD MATCHING SCREENSHOT */}
                <div className="bg-[#0b1329]/95 border-2 border-amber-500/50 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-1 min-w-[170px] sm:min-w-[190px]">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <span>🪙</span> Coins:
                    </span>
                    <span className="font-mono-numbers font-black text-amber-300">
                      {coins}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <span>📦</span> Treasures:
                    </span>
                    <span className="font-mono-numbers font-black text-emerald-400">
                      {treasuresFoundCount} / 3
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <span>❤️</span> Health:
                    </span>
                    <span className="font-mono-numbers font-black text-red-400">
                      {health}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <span>⚡</span> Speed:
                    </span>
                    <span className="font-mono-numbers font-black text-cyan-300">
                      {currentSpeedValue}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm border-t border-slate-800 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <span>🏠</span> Speed Level:
                    </span>
                    <span className="font-mono-numbers font-black text-amber-400">
                      {speedLevel}
                    </span>
                  </div>
                </div>

                {/* TOP-RIGHT SPEED SHOP BUTTON MATCHING SCREENSHOT */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsSpeedShopOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/40 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-cyan-300"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="tracking-wider uppercase">⚡ SPEED SHOP</span>
                </button>
              </div>

              {/* Right Side Mission Badge matching screenshot */}
              <div className="self-end mt-2 bg-[#0b1329]/95 border-2 border-slate-700/80 rounded-2xl p-2.5 backdrop-blur-md shadow-xl flex items-center gap-2 pointer-events-auto">
                <span className="text-lg">⏱️</span>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Current Mission:
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    Find all 3 treasures! ({treasuresFoundCount}/3)
                  </span>
                </div>
              </div>

            </div>

            {/* -------------------------------------------------------------
                HUD BOTTOM ROW: HEALTH BAR (LEFT), 3 CHEST SLOTS (RIGHT), AND D-PAD
                ------------------------------------------------------------- */}
            <div className="relative z-30 p-3 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent">
              
              {/* Bottom-Left Health Capsule Bar matching screenshot */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2.5 bg-[#0b1329]/95 border-2 border-slate-800 rounded-full px-3.5 py-1.5 shadow-2xl">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-red-500/50">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div className="w-28 sm:w-36">
                    <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-red-500/60 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full shadow-lg shadow-red-500/50 transition-all duration-300"
                        style={{ width: `${health}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom-Right 3 Treasure Chest Slots matching screenshot */}
                <div className="flex items-center gap-2 bg-[#0b1329]/95 border-2 border-slate-800 rounded-2xl p-1.5 shadow-xl">
                  {chests.map((chest) => (
                    <button
                      key={chest.id}
                      onClick={() => handleOpenChest(chest)}
                      className={`relative w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all border-2 cursor-pointer ${
                        chest.unlocked
                          ? 'bg-amber-500/30 border-amber-400 shadow-md shadow-amber-400/50 scale-105'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                      title={chest.label}
                    >
                      <span className="text-lg">{chest.unlocked ? '💎' : '📦'}</span>
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow ${
                        chest.unlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {chest.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CENTER CONTROLS: 4-WAY D-PAD + RUN BUTTON */}
              <div className="flex items-center justify-center gap-4 w-full md:w-auto">
                
                {/* 4-Way Directional D-PAD */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl">
                  <div />
                  <button
                    onClick={() => moveFront()}
                    className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 text-slate-200 active:text-slate-950 border border-slate-600 flex flex-col items-center justify-center font-bold text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                    title="Move Front (W / Up)"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                    <span>FRONT</span>
                  </button>
                  <div />

                  <button
                    onClick={moveLeft}
                    className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 text-slate-200 active:text-slate-950 border border-slate-600 flex flex-col items-center justify-center font-bold text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                    title="Move Left (A / Left)"
                  >
                    <span>◀ LEFT</span>
                  </button>

                  <button
                    onClick={jump}
                    className="w-12 h-10 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-600 flex flex-col items-center justify-center font-black text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                    title="Jump (Space)"
                  >
                    <span>🦘 JUMP</span>
                  </button>

                  <button
                    onClick={moveRight}
                    className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 text-slate-200 active:text-slate-950 border border-slate-600 flex flex-col items-center justify-center font-bold text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                    title="Move Right (D / Right)"
                  >
                    <span>RIGHT ▶</span>
                  </button>

                  <div />
                  <button
                    onClick={moveBack}
                    className="w-12 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 text-slate-200 active:text-slate-950 border border-slate-600 flex flex-col items-center justify-center font-bold text-[10px] shadow cursor-pointer transition-transform active:scale-90"
                    title="Move Back (S / Down)"
                  >
                    <ArrowDown className="w-4 h-4 stroke-[3]" />
                    <span>BACK</span>
                  </button>
                  <div />
                </div>

                {/* SPRINT RUN & AUTO-RUN */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={triggerRunSprint}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-orange-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-yellow-300"
                    title="Sprint Forward (Shift / R)"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span className="tracking-wider uppercase">🏃 RUN!</span>
                  </button>

                  <button
                    onClick={toggleAutoRun}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      autoRun
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{autoRun ? '⚡ Auto-Running ON' : 'Auto-Run Mode'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Prompt banner to open near chest if within range */}
          {(() => {
            const nearbyChest = chests.find(
              (c) => !c.unlocked && Math.abs(c.distance - playerDistance) < 18
            );
            if (!nearbyChest) return null;

            return (
              <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/30 via-slate-900 to-amber-500/30 border border-amber-400 text-center flex items-center justify-between px-6 shadow-xl animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗝️</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-300">
                    You found: {nearbyChest.label}!
                  </span>
                </div>
                <button
                  onClick={() => handleOpenChest(nearbyChest)}
                  className="py-1.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md uppercase cursor-pointer"
                >
                  Crack Chest Lock ➔
                </button>
              </div>
            );
          })()}

        </div>
      )}

      {/* =========================================================================
          PANEL 3: VICTORY SCREEN (Matching bottom-right panel of reference screenshot)
          ========================================================================= */}
      {currentView === 'victory' && (
        <div className="max-w-3xl mx-auto my-6 px-4 w-full animate-scale-up">
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/30 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 p-6 sm:p-10 text-center">
            
            {/* Top Branding Logo */}
            <div className="inline-flex items-center gap-2 mb-4 bg-slate-900/90 border border-emerald-500/40 px-3.5 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs">
                G
              </div>
              <span className="font-fantasy text-xs font-extrabold text-emerald-300">
                GauravGo Creating Dreams
              </span>
            </div>

            {/* Massive Curved Wooden Gold Banner */}
            <div className="relative max-w-xl mx-auto mb-4 p-5 rounded-2xl bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 border-4 border-yellow-300 shadow-2xl shadow-amber-500/40">
              <Crown className="w-12 h-12 mx-auto -mt-11 mb-1 text-yellow-300 fill-amber-300 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]" />
              <h1 className="font-fantasy text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide uppercase filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                CONGRATULATIONS TREASURE HUNTER!
              </h1>
              <div className="inline-block mt-2 px-6 py-1 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-md border border-yellow-300/40">
                ALL 3 TREASURES DISCOVERED!
              </div>
            </div>

            {/* Performance Stats Card */}
            <div className="max-w-md mx-auto mb-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm sm:text-base border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2 text-slate-300 font-semibold">
                  <span className="text-xl">🪙</span> Total Coins Collected:
                </span>
                <span className="font-mono-numbers font-black text-amber-300 text-lg">
                  {coins}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2 text-slate-300 font-semibold">
                  <span className="text-xl">📦</span> Treasures Found:
                </span>
                <span className="font-mono-numbers font-black text-emerald-400 text-lg">
                  3 / 3 Complete
                </span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="flex items-center gap-2 text-slate-300 font-semibold">
                  <span className="text-xl">❤️</span> Hunter Health Left:
                </span>
                <span className="font-mono-numbers font-black text-red-400 text-lg">
                  {health}%
                </span>
              </div>
            </div>

            {/* Direct Action Buttons matching reference screenshot: REPLAY & RETURN TO VILLAGE */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
              <button
                onClick={handleResetLevel}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-700 to-slate-800 hover:from-blue-600 hover:to-slate-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg border border-blue-400/40 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 uppercase"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REPLAY</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentView('game');
                }}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-amber-500/40 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 uppercase"
              >
                <span>RETURN TO VILLAGE</span>
              </button>

              {level.level < 150 && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onNextLevel();
                  }}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <span>NEXT VILLAGE ({level.level + 1})</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          PANEL 4: SPEED SHOP UI MODAL (Matching bottom-left panel of reference screenshot)
          ========================================================================= */}
      {isSpeedShopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={() => setIsSpeedShopOpen(false)} />

          <div className="relative w-full max-w-2xl bg-[#09142b] border-2 border-cyan-500/70 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-500/30 z-10 animate-scale-up">
            
            {/* Header: Roblox character avatar in blue cap with chat bubble */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-cyan-900/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 border-2 border-cyan-300 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/40">
                  🧢
                </div>
                <div className="bg-blue-600/30 border border-blue-400/50 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold text-cyan-200">
                  Upgrade your speed and hunt faster!
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#0b1b3a] border border-amber-500/60 px-3.5 py-1.5 rounded-xl font-mono-numbers text-sm font-black text-amber-300">
                  <span>🪙</span>
                  <span>{coins}</span>
                </div>
                <button
                  onClick={() => setIsSpeedShopOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 5 Upgrade Cards in a row matching reference screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {SPEED_UPGRADES.map((tier) => {
                const isCurrent = speedLevel === tier.level;
                const isUnlocked = speedLevel >= tier.level;
                const canAfford = coins >= tier.cost;

                return (
                  <div
                    key={tier.level}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all min-h-[140px] ${
                      isCurrent
                        ? 'bg-blue-950/60 border-cyan-400 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                        : isUnlocked
                        ? 'bg-slate-900/60 border-slate-700 text-slate-400'
                        : 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-2">
                      <Zap className="w-5 h-5 fill-cyan-400" />
                    </div>

                    <div className="mb-2">
                      <span className="block font-black text-xs text-white uppercase">
                        {tier.label}
                      </span>
                      <span className="block text-[11px] text-cyan-300 font-bold font-mono-numbers">
                        Speed {tier.speed}
                      </span>
                    </div>

                    {tier.free ? (
                      <span className="w-full py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>FREE</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="w-full py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs shadow">
                        ACTIVE
                      </span>
                    ) : isUnlocked ? (
                      <span className="w-full py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">
                        OWNED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuySpeedUpgrade(tier)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 rounded-xl font-black text-xs transition-all shadow flex items-center justify-center gap-1 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <span>🪙</span>
                            <span>{tier.cost}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{tier.cost}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Status Bar matching screenshot */}
            <div className="bg-[#050c1c] border border-cyan-900/60 rounded-2xl p-3 flex items-center justify-around text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <span>🏠 Current Speed:</span>
                <strong className="text-cyan-300 font-mono-numbers text-sm">{currentSpeedValue}</strong>
              </span>
              <div className="w-px h-4 bg-slate-800" />
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <span>⬆️ Next Upgrade:</span>
                <strong className="text-amber-300 font-mono-numbers text-sm">
                  {speedLevel < 5 ? `${SPEED_UPGRADES[speedLevel]?.cost} coins` : 'MAX RANK'}
                </strong>
              </span>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          ACTIVE CHEST RIDDLE CHALLENGE MODAL WITH DIRECT NEXT LEVEL BUTTON
          ========================================================================= */}
      {activeChestRiddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={() => setActiveChestRiddle(null)} />

          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/20 z-10 animate-scale-up text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🗝️</span>
                <div>
                  <h3 className="font-fantasy text-lg font-bold text-amber-300">
                    {activeChestRiddle.label}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Solve the village riddle to unlock the treasure chest!
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveChestRiddle(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mb-4 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider mb-1">
                Village Riddle Lock
              </span>
              <p className="text-base sm:text-lg font-bold text-white">
                "{activeChestRiddle.riddlePrompt}"
              </p>
            </div>

            {/* Feedback Alert */}
            {riddleFeedback && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-semibold text-center border ${
                isRiddleCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}>
                {riddleFeedback}
              </div>
            )}

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {activeChestRiddle.options.map((opt, idx) => {
                const isSelected = selectedRiddleOption === opt;
                const isWinner = isRiddleCorrect && opt === activeChestRiddle.answer;

                return (
                  <button
                    key={idx}
                    disabled={isRiddleCorrect}
                    onClick={() => handleSelectChestOption(opt)}
                    className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isWinner
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                        : isSelected && !isRiddleCorrect
                        ? 'bg-red-500/20 border-red-500/50 text-red-200'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons once unlocked */}
            {isRiddleCorrect && (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveChestRiddle(null)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase cursor-pointer"
                >
                  Explore Village 🔍
                </button>

                {level.level < 150 ? (
                  <button
                    onClick={() => {
                      setActiveChestRiddle(null);
                      sounds.playClick();
                      onNextLevel();
                    }}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Next Level ({level.level + 1})</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveChestRiddle(null);
                      sounds.playClick();
                      onBackToHub();
                    }}
                    className="w-full sm:flex-1 py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
                  >
                    Return to World Map
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM KEY FEATURES BAR MATCHING REFERENCE SCREENSHOT
          ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 mt-4 w-full">
        <div className="bg-[#050c1c] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest">
            <span>KEY FEATURES</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🏠</span>
              <span>3D Village Exploration</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base">🪙</span>
              <span>Coin Collection & Rewards</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <span>Speed Upgrade System</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base">🛡️</span>
              <span>Guard Chase & Attack Mechanics</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base">📦</span>
              <span>3 Hidden Treasures</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base">👑</span>
              <span>Victory System</span>
            </div>
          </div>

        </div>

        {/* Footer Subtext with Roblox Mention */}
        <div className="flex items-center justify-between mt-2.5 px-2 text-[11px] text-slate-500 font-bold">
          <span>BUILT WITH PASSION · GAURAVGO — CREATING DREAMS</span>
          <span className="flex items-center gap-1">
            <span>ROBLOX-STYLE CASUAL VILLAGE ENGINE</span>
          </span>
        </div>
      </div>

    </div>
  );
};
