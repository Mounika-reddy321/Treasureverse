import React, { useState, useEffect } from 'react';
import { ArrowItem, ArrowLevel, GameProgress } from '../../types/game';
import { isArrowPathUnobstructed } from '../../data/arrowLevels';
import { sounds } from '../../utils/audio';
import { VictoryModal } from '../common/VictoryModal';
import { AIOracleModal } from '../common/AIOracleModal';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  Heart,
  Undo2,
  BrainCircuit,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ArrowGamePlayProps {
  level: ArrowLevel;
  progress: GameProgress;
  diamonds: number;
  onSpendDiamonds: (amount: number, reason: string) => boolean;
  onCompleteLevel: (stars: number, score: number, baseReward: number) => { newlyCompleted: boolean; diamondsEarned: number };
  onBackToHub: () => void;
  onNextLevel: () => void;
}

export const ArrowGamePlay: React.FC<ArrowGamePlayProps> = ({
  level,
  progress,
  diamonds,
  onSpendDiamonds,
  onCompleteLevel,
  onBackToHub,
  onNextLevel,
}) => {
  const [arrows, setArrows] = useState<ArrowItem[]>([]);
  const [hearts, setHearts] = useState<number>(3);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [flyingArrowIds, setFlyingArrowIds] = useState<Set<string>>(new Set());
  const [highlightedArrowId, setHighlightedArrowId] = useState<string | null>(null);
  const [hintStock, setHintStock] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [blockedToast, setBlockedToast] = useState<string | null>(null);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);

  // Victory modal
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

  // Undo history
  const [history, setHistory] = useState<ArrowItem[][]>([]);

  useEffect(() => {
    initLevel();
  }, [level.level]);

  const initLevel = () => {
    const cloned = level.arrows.map((a) => ({ ...a, state: 'ready' as const }));
    setArrows(cloned);
    setHearts(3);
    setBlockedArrowId(null);
    setFlyingArrowIds(new Set());
    setHighlightedArrowId(null);
    setIsGameOver(false);
    setIsLevelCleared(false);
    setBlockedToast(null);
    setHistory([]);
    setVictoryState({
      isOpen: false,
      stars: 3,
      diamondsEarned: 0,
      isFirstTime: false,
    });
  };

  const remainingArrows = arrows.filter((a) => a.state !== 'cleared').length;

  const handleArrowTap = (arrow: ArrowItem) => {
    if (arrow.state === 'cleared' || flyingArrowIds.has(arrow.id) || isGameOver) return;

    // Check if runway is clear
    const free = isArrowPathUnobstructed(arrow, arrows, level.width, level.height);

    if (free) {
      if (highlightedArrowId === arrow.id) {
        setHighlightedArrowId(null);
      }
      setBlockedToast(null);

      // Record history
      setHistory((prev) => [...prev, arrows.map((a) => ({ ...a }))]);

      // Sound effect
      sounds.playArrowShoot();

      // Trigger physical launch animation!
      setFlyingArrowIds((prev) => new Set([...prev, arrow.id]));

      // After 350ms flight animation completes, mark cleared
      setTimeout(() => {
        setFlyingArrowIds((prev) => {
          const next = new Set(prev);
          next.delete(arrow.id);
          return next;
        });

        const updated = arrows.map((a) =>
          a.id === arrow.id ? { ...a, state: 'cleared' as const } : a
        );
        setArrows(updated);

        // Check victory
        const stillActive = updated.filter((a) => a.state !== 'cleared');
        if (stillActive.length === 0) {
          handleVictory();
        }
      }, 350);
    } else {
      // Collision / Blocked!
      sounds.playArrowBlocked();
      setBlockedArrowId(arrow.id);
      setBlockedToast(`⚠️ That arrow is blocked in the ${arrow.dir.toLowerCase()} direction! Try a perimeter arrow.`);
      setTimeout(() => setBlockedArrowId(null), 500);

      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const handleVictory = () => {
    sounds.playLevelComplete();
    setIsLevelCleared(true);
    const stars = hearts === 3 ? 3 : hearts === 2 ? 2 : 1;
    const { newlyCompleted, diamondsEarned } = onCompleteLevel(
      stars,
      800 + hearts * 100,
      level.rewardDiamonds
    );

    setTimeout(() => {
      setVictoryState({
        isOpen: true,
        stars,
        diamondsEarned,
        isFirstTime: newlyCompleted,
      });
    }, 400);
  };

  // Lightbulb Hint handler
  const handleUseHint = () => {
    sounds.playClick();
    const freeArrow = arrows.find(
      (a) => a.state !== 'cleared' && !flyingArrowIds.has(a.id) && isArrowPathUnobstructed(a, arrows, level.width, level.height)
    );

    if (freeArrow) {
      sounds.playHint();
      setHighlightedArrowId(freeArrow.id);
      setHintStock((h) => Math.max(0, h - 1));
      setBlockedToast(`💡 Hint: The glowing gold arrow is ready to fly!`);
      setTimeout(() => setHighlightedArrowId(null), 4000);
    } else {
      setBlockedToast(`All perimeter arrows are being checked... Look along the outer boundary!`);
    }
  };

  // Undo move
  const handleUndo = () => {
    if (history.length === 0) return;
    sounds.playClick();
    const previous = history[history.length - 1];
    setArrows(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  // Revive with diamonds
  const handleRevive = () => {
    if (diamonds < 20) return;
    const success = onSpendDiamonds(20, 'Revive Lives in Arrow Puzzle');
    if (success) {
      sounds.playGemCollect();
      setHearts(3);
      setIsGameOver(false);
    }
  };

  const cellSize = 36;
  const padding = 24;
  const svgW = level.width * cellSize + padding * 2;
  const svgH = level.height * cellSize + padding * 2;

  return (
    <div className="max-w-md mx-auto px-4 py-3 min-h-[92vh] flex flex-col justify-between bg-slate-950 text-slate-100 select-none animate-fade-in">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <button
          onClick={() => { sounds.playClick(); onBackToHub(); }}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Arrow Puzzle · Level {level.level}
          </span>
          <span className="text-[11px] font-semibold text-slate-300">
            {level.title}
          </span>
        </div>

        {/* Lives (3 Hearts) */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((h) => (
            <Heart
              key={h}
              className={`w-5 h-5 transition-all ${
                h <= hearts
                  ? 'text-red-500 fill-red-500 scale-100'
                  : 'text-slate-700 fill-slate-800 scale-90'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Shape Silhouette Badge & Controls */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold">
            Shape: {level.title.split(' ')[0]}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Remaining: <strong className="text-white">{remainingArrows}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Oracle Shortcut */}
          <button
            onClick={() => { sounds.playClick(); setIsAIModalOpen(true); }}
            className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:text-white transition-colors"
            title="Ask AI Oracle for Pathfinding"
          >
            <BrainCircuit className="w-4 h-4" />
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
            title="Undo last move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={initLevel}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Blocked / Feedback Alert Toast */}
      {blockedToast && (
        <div className="bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs px-3 py-1.5 rounded-xl text-center mb-1 animate-fade-in">
          {blockedToast}
        </div>
      )}

      {/* 3. Interactive Arrow Board with Physical Flight Animations */}
      <div className="relative my-auto flex items-center justify-center bg-slate-900/90 rounded-3xl border-2 border-slate-800 shadow-2xl p-2 overflow-hidden min-h-[460px]">
        
        {/* Subtle shape outline background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto max-h-[540px] overflow-visible"
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            <marker
              id="arrowhead-white"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ffffff" />
            </marker>

            <marker
              id="arrowhead-gold"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>

            <marker
              id="arrowhead-red"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Render each arrow with flight transform styles */}
          {arrows.map((arrow) => {
            if (arrow.state === 'cleared') return null;

            const isFlying = flyingArrowIds.has(arrow.id);
            const isBlocked = blockedArrowId === arrow.id;
            const isHighlighted = highlightedArrowId === arrow.id;

            const pt = arrow.path[0];
            const centerX = padding + pt.c * cellSize + cellSize / 2;
            const centerY = padding + pt.r * cellSize + cellSize / 2;

            // Arrow line vector
            let startX = centerX;
            let startY = centerY;
            let endX = centerX;
            let endY = centerY;
            const stemLen = 14;

            if (arrow.dir === 'UP') {
              startY += stemLen / 2;
              endY -= stemLen / 2;
            } else if (arrow.dir === 'DOWN') {
              startY -= stemLen / 2;
              endY += stemLen / 2;
            } else if (arrow.dir === 'LEFT') {
              startX += stemLen / 2;
              endX -= stemLen / 2;
            } else if (arrow.dir === 'RIGHT') {
              startX -= stemLen / 2;
              endX += stemLen / 2;
            }

            // Flight animation offset
            let flightTransform = '';
            if (isFlying) {
              if (arrow.dir === 'UP') flightTransform = 'translate(0px, -900px)';
              else if (arrow.dir === 'DOWN') flightTransform = 'translate(0px, 900px)';
              else if (arrow.dir === 'LEFT') flightTransform = 'translate(-900px, 0px)';
              else if (arrow.dir === 'RIGHT') flightTransform = 'translate(900px, 0px)';
            } else if (isBlocked) {
              if (arrow.dir === 'UP') flightTransform = 'translate(0px, -6px)';
              else if (arrow.dir === 'DOWN') flightTransform = 'translate(0px, 6px)';
              else if (arrow.dir === 'LEFT') flightTransform = 'translate(-6px, 0px)';
              else if (arrow.dir === 'RIGHT') flightTransform = 'translate(6px, 0px)';
            }

            const marker = isBlocked
              ? 'url(#arrowhead-red)'
              : isHighlighted
              ? 'url(#arrowhead-gold)'
              : 'url(#arrowhead-white)';

            const strokeColor = isBlocked
              ? '#ef4444'
              : isHighlighted
              ? '#f59e0b'
              : '#ffffff';

            return (
              <g
                key={arrow.id}
                onClick={() => handleArrowTap(arrow)}
                style={{
                  transform: flightTransform,
                  transition: isFlying
                    ? 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.35s ease-out'
                    : 'transform 0.15s ease-out',
                  opacity: isFlying ? 0 : 1,
                  cursor: isFlying ? 'default' : 'pointer',
                }}
                className="group"
              >
                {/* Thick circular hit target for reliable taps */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Subtle cell backing indicator */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="13"
                  fill={isHighlighted ? '#f59e0b20' : '#1e293b50'}
                  stroke={isHighlighted ? '#f59e0b80' : '#334155'}
                  strokeWidth="1.2"
                  className="transition-colors group-hover:fill-slate-700"
                />

                {/* Arrow stem line with directional arrowhead */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? '3.5' : '2.8'}
                  strokeLinecap="round"
                  markerEnd={marker}
                />
              </g>
            );
          })}
        </svg>

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center text-3xl mb-3 shadow-inner">
              💔
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Out of Lives!</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Collided with blocked arrows 3 times. Revive with 3 hearts to continue, or restart the level!
            </p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={handleRevive}
                disabled={diamonds < 20}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <span>Revive 3 Lives (20 💎)</span>
              </button>

              <button
                onClick={initLevel}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Restart Level
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Bottom Controls */}
      <div className="flex items-center justify-center pb-4 pt-2">
        <button
          onClick={handleUseHint}
          className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          title="Lightbulb Hint: Highlights a free arrow"
          aria-label="Hint"
        >
          <div className="w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-amber-950/60 transition-colors">
            <Lightbulb className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>

          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900 shadow-md font-mono-numbers">
            {hintStock}
          </span>
        </button>
      </div>

      {/* Persistent Bottom Bar when Shape is Cleared */}
      {isLevelCleared && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/25 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎯</span>
              <div className="text-left">
                <h4 className="font-fantasy text-sm font-bold text-amber-300 leading-tight">
                  Pattern {level.level} Cleared!
                </h4>
                <span className="text-[11px] text-slate-300">
                  All arrows safely escaped · Ready for next pattern!
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
                ⬅ All Arrow Levels
              </button>

              {level.level < 150 && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setVictoryState((v) => ({ ...v, isOpen: false }));
                    onNextLevel();
                  }}
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

      {/* AI Oracle Modal */}
      <AIOracleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentGame="Arrow Puzzles"
        currentLevel={level.level}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={victoryState.isOpen}
        gameTitle="Arrow Puzzles"
        levelNumber={level.level}
        stars={victoryState.stars}
        diamondsEarned={victoryState.diamondsEarned}
        isFirstTime={victoryState.isFirstTime}
        movesOrTimeText={`${level.arrows.length - remainingArrows} moves`}
        onReplay={initLevel}
        onNextLevel={() => {
          setVictoryState((v) => ({ ...v, isOpen: false }));
          onNextLevel();
        }}
        onBackToHub={onBackToHub}
        onClose={() => setVictoryState((v) => ({ ...v, isOpen: false }))}
        hasNextLevel={level.level < 150}
      />

    </div>
  );
};
