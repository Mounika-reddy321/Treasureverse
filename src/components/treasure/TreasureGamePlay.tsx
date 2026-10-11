import React, { useState, useEffect } from 'react';
import { TreasureLevel, GameProgress } from '../../types/game';
import { TREASURE_WORLDS } from '../../data/treasureLevels';
import { sounds } from '../../utils/audio';
import { HintModal } from '../common/HintModal';
import { AIOracleModal } from '../common/AIOracleModal';
import { VictoryModal } from '../common/VictoryModal';
import {
  ArrowLeft,
  Sparkles,
  Key,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  Compass,
  Search,
  Pickaxe,
  Lightbulb,
  ChevronRight,
  BrainCircuit,
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

type ExplorerTool = 'inspect' | 'spyglass' | 'trowel';

export const TreasureGamePlay: React.FC<TreasureGamePlayProps> = ({
  level,
  progress,
  diamonds,
  onSpendDiamonds,
  onCompleteLevel,
  onBackToHub,
  onNextLevel,
}) => {
  const world = TREASURE_WORLDS.find((w) => w.id === level.worldId) || TREASURE_WORLDS[0];

  // Tool state
  const [selectedTool, setSelectedTool] = useState<ExplorerTool>('inspect');
  const [revealedClues, setRevealedClues] = useState<string[]>([]);
  const [digProgress, setDigProgress] = useState<number>(0); // 0 to 3 clicks to dig up key

  // Core gameplay state
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [hasReadClue, setHasReadClue] = useState<boolean>(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [chestOpened, setChestOpened] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);

  // Companion dialogue
  const [pipDialogue, setPipDialogue] = useState<string>(
    'Ahoy! Grab your explorer tools below! Use the Trowel to dig for the Golden Key, or the Spyglass to inspect the area.'
  );

  // Modals
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [victoryState, setVictoryState] = useState<{
    isOpen: boolean;
    stars: number;
    diamondsEarned: number;
    isFirstTime: boolean;
  }>({
    isOpen: false,
    stars: 3,
    diamondsEarned: 0,
    isFirstTime: false,
  });

  // CRITICAL FIX: Reset all state when level number changes (advancing to next level!)
  useEffect(() => {
    handleReset();
  }, [level.level]);

  const handleReset = () => {
    sounds.playClick();
    setSelectedTool('inspect');
    setRevealedClues([]);
    setDigProgress(0);
    setHasKey(false);
    setHasReadClue(false);
    setIsQuestionOpen(false);
    setSelectedAnswer(null);
    setFeedbackMessage(null);
    setIsCorrect(false);
    setChestOpened(false);
    setMovesCount(0);
    setPipDialogue(
      `Welcome to Quest ${level.level}: ${level.title}! Uncover the Golden Key, then open the Treasure Chest!`
    );
    setVictoryState({
      isOpen: false,
      stars: 3,
      diamondsEarned: 0,
      isFirstTime: false,
    });
  };

  // Tool: Dig action for the key
  const handleDigMound = () => {
    sounds.playTileMove();
    setMovesCount((m) => m + 1);

    if (selectedTool === 'trowel') {
      const nextDig = digProgress + 1;
      setDigProgress(nextDig);

      if (nextDig >= 2) {
        sounds.playGemCollect();
        setHasKey(true);
        setPipDialogue('Brilliant! You dug up the sparkling Golden Key! Now tap the Treasure Chest to unlock it.');
      } else {
        setPipDialogue('You brush away a layer of ancient earth... Something is gleaming underneath!');
      }
    } else {
      // Prompt user to use trowel or directly click
      const nextDig = digProgress + 1;
      setDigProgress(nextDig);
      if (nextDig >= 2) {
        sounds.playGemCollect();
        setHasKey(true);
        setPipDialogue('You found the Golden Key! Now tap the Treasure Chest to unlock it.');
      } else {
        setPipDialogue('Select the Archaeologist Trowel ⛏️ below to excavate the Golden Key faster!');
      }
    }
  };

  // Tool: Spyglass clue inspection
  const handleInspectClue = () => {
    sounds.playClick();
    setHasReadClue(true);
    if (!revealedClues.includes('riddle-clue')) {
      setRevealedClues((prev) => [...prev, 'riddle-clue']);
    }
    setPipDialogue(`Through the spyglass, ancient runes reveal: "${level.clues[0]}"`);
  };

  // Chest click
  const handleChestClick = () => {
    if (!hasKey) {
      sounds.playError();
      setPipDialogue('The chest has a heavy lock! Dig up the Golden Key 🗝️ first, then return here!');
      return;
    }

    sounds.playClick();
    setIsQuestionOpen(true);
    setPipDialogue('The golden lock hums! Answer the riddle to unlock the treasure vault.');
  };

  // Submit answer
  const handleSelectOption = (option: string) => {
    if (isCorrect || !level.riddle) return;

    setMovesCount((m) => m + 1);
    setSelectedAnswer(option);

    if (option === level.riddle.answer) {
      sounds.playGemCollect();
      setIsCorrect(true);
      setChestOpened(true);
      setFeedbackMessage(`Correct! ${level.riddle.explanation}`);
      setPipDialogue('Hooray! The chest springs open with sparkling diamonds! Quest completed!');

      // Complete level and award diamonds immediately
      const stars = 3;
      const { newlyCompleted, diamondsEarned } = onCompleteLevel(
        stars,
        1000 - movesCount * 20,
        level.rewardDiamonds
      );

      // Open victory celebration modal after 600ms
      setTimeout(() => {
        setVictoryState({
          isOpen: true,
          stars,
          diamondsEarned,
          isFirstTime: newlyCompleted,
        });
      }, 600);
    } else {
      sounds.playError();
      setFeedbackMessage(`Not quite! Hint: ${level.clues[0]}. Try another option!`);
      setPipDialogue('Not quite! The chest tumblers clicked back. Try another choice!');
    }
  };

  // Transition smoothly to next level
  const handleGoToNextLevel = () => {
    sounds.playClick();
    setIsQuestionOpen(false);
    setVictoryState((v) => ({ ...v, isOpen: false }));
    onNextLevel();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in select-none">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sounds.playClick(); onBackToHub(); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to World Map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                World {world.id}: {world.name} · Quest {level.level} of 150
              </span>
            </div>
            <h1 className="font-fantasy text-xl sm:text-2xl font-bold text-white tracking-wide">
              {level.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Reset Quest"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* AI Oracle & Explanation Modal */}
          <button
            onClick={() => { sounds.playClick(); setIsAIModalOpen(true); }}
            className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
            title="Open Gemini AI Oracle"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>AI Oracle</span>
          </button>

          {/* Oracle Hint */}
          <button
            onClick={() => { sounds.playClick(); setIsHintOpen(true); }}
            className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hint</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Discovery Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
        
        {/* Step 1: Golden Key */}
        <div
          onClick={handleDigMound}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
            hasKey
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900/80 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
            hasKey ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {hasKey ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold block">Step 1: Excavate Key</span>
            <span className="text-[11px] opacity-80">
              {hasKey ? 'Key collected! 🗝️' : `Dig mound (${digProgress}/2 cleared)`}
            </span>
          </div>
        </div>

        {/* Step 2: Treasure Chest */}
        <div
          onClick={handleChestClick}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
            chestOpened
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : hasKey
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/30 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
            chestOpened
              ? 'bg-emerald-500 text-slate-950'
              : hasKey
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {chestOpened ? <Unlock className="w-5 h-5" /> : hasKey ? <Key className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold block">Step 2: Inspect Chest</span>
            <span className="text-[11px] opacity-80">
              {chestOpened ? 'Vault opened! 💎' : hasKey ? 'Ready to open! Tap chest' : 'Locked (requires key)'}
            </span>
          </div>
        </div>

        {/* Step 3: Solve Question */}
        <div
          onClick={() => { if (hasKey) setIsQuestionOpen(true); }}
          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
            chestOpened
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : isQuestionOpen
              ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
            chestOpened ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
          }`}>
            {chestOpened ? '💎' : '3'}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold block">Step 3: Claim Diamonds</span>
            <span className="text-[11px] opacity-80">
              {chestOpened ? `+${level.rewardDiamonds} Diamonds earned!` : 'Answer simple question'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Explorer Tools Gear Bar (Makes the game much more interactive!) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 px-2">Explorer Gear:</span>
          
          <button
            onClick={() => { sounds.playClick(); setSelectedTool('inspect'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'inspect'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span>🖐️ Touch & Explore</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setSelectedTool('spyglass'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'spyglass'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Spyglass Clues</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setSelectedTool('trowel'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'trowel'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Pickaxe className="w-3.5 h-3.5" />
            <span>Archaeologist Trowel</span>
          </button>
        </div>

        {/* Companion Pip Speech */}
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span>🧭 Pip:</span>
          <span className="truncate max-w-[280px] sm:max-w-md text-slate-200 font-medium">{pipDialogue}</span>
        </div>
      </div>

      {/* 4. Interactive Atmospheric Scene Canvas */}
      <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl flex flex-col justify-between p-6">
        
        {/* Background gradient matching current world */}
        <div className={`absolute inset-0 bg-gradient-to-br ${world.themeColor} opacity-75`} />
        
        {/* Stars overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1.5px,transparent_1.5px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-bold text-white shadow-lg">
            <span>{world.icon}</span>
            <span>{world.name}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg">
            <span>💎 Reward: {level.rewardDiamonds} Diamonds</span>
          </div>
        </div>

        {/* Interactive Hotspot 1: Mound / Excavation for Golden Key */}
        {!hasKey ? (
          <button
            onClick={handleDigMound}
            className="absolute z-20 group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            style={{
              left: `${level.hotspots[0]?.x || 30}%`,
              top: `${level.hotspots[0]?.y || 45}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-16 h-16 rounded-2xl bg-amber-950/60 border-2 border-amber-500/70 shadow-2xl shadow-amber-500/40 flex items-center justify-center text-3xl group-hover:bg-amber-900/70 transition-colors animate-pulse">
              <span className="drop-shadow-lg">{digProgress === 0 ? '🪨' : '🗝️'}</span>
              
              {/* Excavation progress badge */}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                {digProgress}/2
              </span>
            </div>
            <span className="mt-1.5 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-md tracking-wide">
              {digProgress === 0 ? 'Tap to Dig Mound ⛏️' : 'Excavate Key! 🗝️'}
            </span>
          </button>
        ) : (
          <div
            className="absolute z-10 flex flex-col items-center opacity-70"
            style={{
              left: `${level.hotspots[0]?.x || 30}%`,
              top: `${level.hotspots[0]?.y || 45}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-2xl">✨</span>
            <span className="text-[10px] text-emerald-300 font-bold">Mound Cleared ✓</span>
          </div>
        )}

        {/* Interactive Hotspot 2: Ancient Clue Scroll / Inscription */}
        <button
          onClick={handleInspectClue}
          className="absolute z-20 group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            left: `${level.hotspots[2]?.x || 50}%`,
            top: `${level.hotspots[2]?.y || 30}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border-2 border-indigo-400/80 shadow-lg flex items-center justify-center text-2xl group-hover:bg-indigo-500/50 transition-colors">
            📜
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-indigo-400/60 text-indigo-300 font-semibold text-[10px]">
            {hasReadClue ? 'Clue Inspected ✓' : 'Spyglass Clue 🔍'}
          </span>
        </button>

        {/* Interactive Hotspot 3: The Gilded Treasure Chest */}
        <button
          onClick={handleChestClick}
          className={`absolute z-20 group flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
            hasKey && !chestOpened ? 'animate-bounce' : ''
          }`}
          style={{
            left: `${level.hotspots[1]?.x || 75}%`,
            top: `${level.hotspots[1]?.y || 60}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className={`relative w-20 h-20 rounded-3xl border-2 flex items-center justify-center text-4xl shadow-2xl transition-all ${
            chestOpened
              ? 'bg-emerald-500/30 border-emerald-400 shadow-emerald-500/50'
              : hasKey
              ? 'bg-amber-500/40 border-amber-300 shadow-amber-500/60 ring-4 ring-amber-400/50'
              : 'bg-slate-900/80 border-slate-700 shadow-black'
          }`}>
            <span className="drop-shadow-xl">{chestOpened ? '✨💎' : hasKey ? '📦' : '🔒'}</span>

            {hasKey && !chestOpened && (
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
                🗝️
              </span>
            )}
          </div>

          <span className={`mt-2 px-3 py-1 rounded-full font-bold text-xs shadow-md ${
            chestOpened
              ? 'bg-emerald-500 text-slate-950'
              : hasKey
              ? 'bg-amber-400 text-slate-950 animate-pulse'
              : 'bg-slate-900/90 border border-slate-700 text-slate-300'
          }`}>
            {chestOpened ? 'Vault Open! 💎' : hasKey ? 'Click to Unlock!' : 'Locked Chest 🔒'}
          </span>
        </button>

        {/* Bottom Status Banner */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
          <div className="flex items-center gap-2">
            <span>🎒 Equipment:</span>
            <span className={`px-2 py-0.5 rounded-md font-semibold ${hasKey ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-500'}`}>
              {hasKey ? '🗝️ Golden Key Ready' : 'Key Buried'}
            </span>
          </div>

          <span className="italic text-slate-400">
            {hasKey ? 'Insert key into chest to solve riddle!' : 'Excavate the mound with your trowel.'}
          </span>
        </div>

      </div>

      {/* 5. The Chest Riddle Question Modal */}
      {isQuestionOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗝️</span>
                <div>
                  <h3 className="font-fantasy text-lg sm:text-xl font-bold text-amber-300">
                    Vault Lock Riddle
                  </h3>
                  <span className="text-xs text-slate-400">
                    Quest {level.level} of 150 · Solve to claim diamonds
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsQuestionOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                title="Close dialog"
              >
                Close ✕
              </button>
            </div>

            {/* Question Prompt */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 text-center">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block mb-2">
                Ancient Guardian Question
              </span>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                "{level.riddle?.prompt}"
              </p>
            </div>

            {/* Feedback alert if any */}
            {feedbackMessage && (
              <div className={`p-3 rounded-2xl mb-4 text-xs font-semibold text-center border ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}>
                {feedbackMessage}
              </div>
            )}

            {/* If Solved: Prominent Next Level and World Map Buttons right here in the dialog! */}
            {isCorrect ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-4 text-center animate-fade-in">
                <div className="text-2xl mb-1">🎉 💎 🏆</div>
                <h4 className="font-fantasy text-lg font-bold text-amber-300 mb-1">
                  Quest {level.level} Completed!
                </h4>
                <p className="text-xs text-slate-300 mb-4">
                  The Treasure Chest unlocked and your diamonds are secured!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  {level.level < 150 ? (
                    <button
                      onClick={handleGoToNextLevel}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      <span>Next Level (Level {level.level + 1})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-full text-xs text-amber-300 font-bold py-2">
                      👑 All 150 Treasure Hunt Quests Cleared!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsQuestionOpen(false);
                      onBackToHub();
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-colors"
                  >
                    ⬅ Back to World Map
                  </button>
                </div>
              </div>
            ) : (
              /* 4 Large Choice Buttons when solving */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {level.riddle?.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected && !isCorrect
                          ? 'bg-red-500/20 border-red-500/50 text-red-200'
                          : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-amber-400/50 cursor-pointer'
                      }`}
                    >
                      <span>{option}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Oracle shortcut */}
            {!isCorrect && (
              <div className="text-center flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Ask Gemini AI Oracle for Clue</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Persistent Bottom Bar when Quest is cleared */}
      {chestOpened && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-r from-slate-900/95 via-slate-950/95 to-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/25 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏆</span>
              <div className="text-left">
                <h4 className="font-fantasy text-sm font-bold text-amber-300 leading-tight">
                  Quest {level.level} Cleared!
                </h4>
                <span className="text-[11px] text-slate-300">
                  Ready to continue your expedition!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  onBackToHub();
                }}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                ⬅ World Map
              </button>

              {level.level < 150 && (
                <button
                  onClick={handleGoToNextLevel}
                  className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Next Level ({level.level + 1})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Oracle Live Modal */}
      <AIOracleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentGame="Treasure Hunt"
        currentLevel={level.level}
      />

      {/* Progressive Hint Modal */}
      <HintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        gameType="treasure-hunt"
        levelNumber={level.level}
        title={level.title}
        story={level.story}
        objective={level.objective}
        defaultHint1={level.hint1}
        defaultHint2={level.hint2}
        defaultHint3={level.hint3}
        diamonds={diamonds}
        onSpendDiamonds={onSpendDiamonds}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={victoryState.isOpen}
        gameTitle="Treasure Hunt"
        levelNumber={level.level}
        stars={victoryState.stars}
        diamondsEarned={victoryState.diamondsEarned}
        isFirstTime={victoryState.isFirstTime}
        movesOrTimeText={`${movesCount} actions`}
        onReplay={handleReset}
        onNextLevel={handleGoToNextLevel}
        onBackToHub={onBackToHub}
        onClose={() => setVictoryState((v) => ({ ...v, isOpen: false }))}
        hasNextLevel={level.level < 150}
      />

    </div>
  );
};
