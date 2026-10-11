import React, { useState, useEffect } from 'react';
import { ArtLevel, GameProgress } from '../../types/game';
import { REAL_PHOTO_SCENES } from '../../data/artLevels';
import { sounds } from '../../utils/audio';
import { VictoryModal } from '../common/VictoryModal';
import { AIOracleModal } from '../common/AIOracleModal';
import {
  ArrowLeft,
  Lightbulb,
  Eye,
  RotateCcw,
  Sparkles,
  BrainCircuit,
  MapPin,
  X,
  Compass,
  ChevronRight,
} from 'lucide-react';

interface ArtGamePlayProps {
  level: ArtLevel;
  progress: GameProgress;
  diamonds: number;
  onSpendDiamonds: (amount: number, reason: string) => boolean;
  onCompleteLevel: (stars: number, score: number, baseReward: number) => { newlyCompleted: boolean; diamondsEarned: number };
  onBackToHub: () => void;
  onNextLevel: () => void;
}

export const ArtGamePlay: React.FC<ArtGamePlayProps> = ({
  level,
  progress,
  diamonds,
  onSpendDiamonds,
  onCompleteLevel,
  onBackToHub,
  onNextLevel,
}) => {
  const sceneIndex = (level.level - 1) % REAL_PHOTO_SCENES.length;
  const scene = REAL_PHOTO_SCENES[sceneIndex] || REAL_PHOTO_SCENES[0];
  const gridSize = level.gridSize || 3;
  const totalTiles = gridSize * gridSize;

  // Board state: array of original tile indices [0, 1, ..., totalTiles - 1]
  const [tiles, setTiles] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [hintStock, setHintStock] = useState<number>(10);
  const [isPeekOpen, setIsPeekOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isHowAIWorksOpen, setIsHowAIWorksOpen] = useState<boolean>(false);

  // AI Photo Lore state
  const [aiLore, setAiLore] = useState<{ lore: string; strategyTip: string } | null>(null);
  const [isLoadingLore, setIsLoadingLore] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);

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

  // Re-initialize when level number changes (advancing to next level!)
  useEffect(() => {
    initPuzzle();
  }, [level.level]);

  const initPuzzle = () => {
    setMovesCount(0);
    setSelectedTileIndex(null);
    setAiLore(null);
    setIsSolved(false);
    setVictoryState({
      isOpen: false,
      stars: 3,
      diamondsEarned: 0,
      isFirstTime: false,
    });

    // Shuffle tiles deterministically based on level number
    const initial = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = initial.length - 1; i > 0; i--) {
      const j = (i * 7 + level.level * 11) % (i + 1);
      [initial[i], initial[j]] = [initial[j], initial[i]];
    }
    // Make sure not already solved
    if (initial.every((v, i) => v === i)) {
      [initial[0], initial[1]] = [initial[1], initial[0]];
    }
    setTiles(initial);
  };

  // Fetch AI Art & Nature Lore from Gemini
  const handleFetchAiLore = async () => {
    if (aiLore) return;
    setIsLoadingLore(true);
    sounds.playClick();
    try {
      const res = await fetch('/api/gemini/art-lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scene.title,
          category: scene.category,
          location: scene.location,
        }),
      });
      const data = await res.json();
      setAiLore(data);
      sounds.playGemCollect();
    } catch {
      setAiLore({
        lore: `A stunning real-world view of ${scene.title} in ${scene.location}.`,
        strategyTip: 'Assemble the sky and high-contrast edges first!',
      });
    } finally {
      setIsLoadingLore(false);
    }
  };

  // Tile swap handler
  const handleTileClick = (index: number) => {
    sounds.playTileMove();

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else if (selectedTileIndex === index) {
      setSelectedTileIndex(null); // Deselect
    } else {
      // Swap tiles
      setMovesCount((m) => m + 1);
      const nextTiles = [...tiles];
      const temp = nextTiles[index];
      nextTiles[index] = nextTiles[selectedTileIndex];
      nextTiles[selectedTileIndex] = temp;
      setTiles(nextTiles);
      setSelectedTileIndex(null);

      // Check win condition
      const won = nextTiles.every((val, idx) => val === idx);
      if (won) {
        setIsSolved(true);
        sounds.playGemCollect();
        const stars = movesCount <= (level.optimalMoves || totalTiles + 5) ? 3 : 2;
        const { newlyCompleted, diamondsEarned } = onCompleteLevel(
          stars,
          1000 - movesCount * 15,
          level.rewardDiamonds
        );

        setTimeout(() => {
          setVictoryState({
            isOpen: true,
            stars,
            diamondsEarned,
            isFirstTime: newlyCompleted,
          });
        }, 500);
      }
    }
  };

  // Hint button: automatically places one misplaced tile into its correct spot
  const handleUseHint = () => {
    sounds.playClick();
    const misplacedIdx = tiles.findIndex((val, idx) => val !== idx);
    if (misplacedIdx === -1) return;

    const targetVal = misplacedIdx;
    const currentLocOfTarget = tiles.findIndex((val) => val === targetVal);

    if (currentLocOfTarget !== -1) {
      sounds.playHint();
      const nextTiles = [...tiles];
      [nextTiles[misplacedIdx], nextTiles[currentLocOfTarget]] = [
        nextTiles[currentLocOfTarget],
        nextTiles[misplacedIdx],
      ];
      setTiles(nextTiles);
      setHintStock((h) => Math.max(0, h - 1));

      // Check win condition
      if (nextTiles.every((val, idx) => val === idx)) {
        setIsSolved(true);
        sounds.playGemCollect();
        const stars = 3;
        const { newlyCompleted, diamondsEarned } = onCompleteLevel(
          stars,
          950,
          level.rewardDiamonds
        );
        setTimeout(() => {
          setVictoryState({
            isOpen: true,
            stars,
            diamondsEarned,
            isFirstTime: newlyCompleted,
          });
        }, 500);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3 min-h-[92vh] flex flex-col justify-between bg-stone-950 text-stone-100 select-none animate-fade-in">
      
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <button
          onClick={() => { sounds.playClick(); onBackToHub(); }}
          className="p-2 -ml-2 text-stone-400 hover:text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
            Real Photo Puzzle · Level {level.level}
          </span>
          <span className="text-[11px] text-stone-300 font-medium truncate max-w-[210px]">
            {scene.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Oracle shortcut */}
          <button
            onClick={() => { sounds.playClick(); setIsAIModalOpen(true); }}
            className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:text-white transition-colors"
            title="Open Gemini AI Oracle"
          >
            <BrainCircuit className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={initPuzzle}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
            title="Reset Puzzle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Photo Location & Target Reference Bar */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-semibold text-stone-300">{scene.location}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* How AI Works Info Button */}
          <button
            onClick={() => { sounds.playClick(); setIsHowAIWorksOpen(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
            title="Learn how AI works in Art Puzzles"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>How AI Works</span>
          </button>

          {/* Reference Pic Thumbnail Button */}
          <button
            onClick={() => { sounds.playClick(); setIsPeekOpen(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reference Photo</span>
          </button>
        </div>
      </div>

      {/* 3. Main Real Photo Jigsaw Board */}
      <div className="relative my-auto flex items-center justify-center py-2">
        
        {/* Real Photo Grid with Pixel-Perfect Slice Geometry */}
        <div
          className="w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-stone-800 shadow-2xl grid bg-stone-900 p-1 gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {tiles.map((tileVal, idx) => {
            const isSelected = selectedTileIndex === idx;

            // Calculate row and column of the original slice
            const origR = Math.floor(tileVal / gridSize);
            const origC = tileVal % gridSize;
            const bgPosX = (origC / (gridSize - 1)) * 100;
            const bgPosY = (origR / (gridSize - 1)) * 100;

            return (
              <div
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`relative w-full h-full cursor-pointer overflow-hidden rounded-md transition-all duration-150 ${
                  isSelected
                    ? 'ring-4 ring-amber-400 scale-[0.98] z-20 shadow-xl'
                    : 'hover:brightness-105 active:scale-95'
                }`}
              >
                {/* Real Photographic Slice */}
                <div
                  className="w-full h-full bg-cover select-none pointer-events-none"
                  style={{
                    backgroundImage: `url(${scene.imageUrl})`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                  }}
                />

                {/* Subtle piece divider */}
                <div className="absolute inset-0 border border-stone-950/40 pointer-events-none rounded-md" />
              </div>
            );
          })}
        </div>

        {/* Reference Photo Full Modal */}
        {isPeekOpen && (
          <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md rounded-2xl z-40 p-4 flex flex-col items-center justify-center animate-fade-in">
            <div className="flex items-center justify-between w-full max-w-xs mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Reference Photograph</span>
              </div>
              <button
                onClick={() => setIsPeekOpen(false)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Full Real Photo */}
            <div className="w-full max-w-xs aspect-[4/5] rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl relative">
              <img
                src={scene.imageUrl}
                alt={scene.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mt-2 text-[11px] text-stone-400 text-center max-w-xs">
              "{scene.description}" — {scene.location}
            </p>
          </div>
        )}

      </div>

      {/* 4. AI Art Lore & Bottom Hint Controls */}
      <div className="flex flex-col items-center gap-2 pb-3 pt-1">
        
        {/* Gemini AI Photo Lore Toggle */}
        <button
          onClick={handleFetchAiLore}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>{aiLore ? 'AI Lore Revealed' : 'Ask AI for Photo Lore & Strategy Tip'}</span>
        </button>

        {aiLore && (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-2.5 max-w-xs text-center text-[11px] text-slate-300 animate-fade-in shadow-md">
            <p className="mb-1 text-slate-200">{aiLore.lore}</p>
            <p className="text-amber-300 font-semibold">💡 Tip: {aiLore.strategyTip}</p>
          </div>
        )}

        {/* Circular Hint Lightbulb with badge count */}
        <button
          onClick={handleUseHint}
          className="relative w-16 h-16 rounded-full bg-stone-900 border-2 border-stone-700 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group cursor-pointer mt-1"
          title="Hint: Places one piece correctly"
          aria-label="Hint"
        >
          <div className="w-11 h-11 rounded-full bg-stone-950 flex items-center justify-center group-hover:bg-amber-950/60 transition-colors">
            <Lightbulb className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>

          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center border-2 border-stone-900 shadow-md font-mono-numbers">
            {hintStock}
          </span>
        </button>
      </div>

      {/* Persistent Bottom Bar when Art Piece is Solved */}
      {isSolved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-r from-slate-900/95 via-stone-950/95 to-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/25 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎨</span>
              <div className="text-left">
                <h4 className="font-fantasy text-sm font-bold text-amber-300 leading-tight">
                  Masterpiece {level.level} Restored!
                </h4>
                <span className="text-[11px] text-slate-300">
                  Artwork completed · Ready for the next canvas!
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
                ⬅ All Art Levels
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

      {/* AI Oracle Live Modal */}
      <AIOracleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentGame="Art Puzzles"
        currentLevel={level.level}
      />

      {/* How AI Works Educational Modal */}
      {isHowAIWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md animate-fade-in" onClick={() => setIsHowAIWorksOpen(false)} />

          <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-500/20 z-10 animate-scale-up text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-xl text-indigo-300">
                  🤖
                </div>
                <div>
                  <h3 className="font-fantasy text-lg font-bold text-white">
                    How AI Works in This Game
                  </h3>
                  <span className="text-xs text-indigo-300">
                    Powered by Google Gemini 2.5 Flash
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsHowAIWorksOpen(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">📸</span>
                  <h4 className="font-bold text-amber-300 text-sm">
                    1. Real-World Vision & Scene Understanding
                  </h4>
                </div>
                <p className="text-stone-300">
                  Gemini analyzes each real photograph (like the Swiss Alps, Kyoto Pagodas, or Venice Canals) to identify geographic coordinates, natural features, architectural landmarks, and time-of-day lighting.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🧩</span>
                  <h4 className="font-bold text-cyan-300 text-sm">
                    2. Dynamic Lore & Strategy Generation
                  </h4>
                </div>
                <p className="text-stone-300">
                  When you tap <strong>"Ask AI for Photo Lore"</strong>, Gemini produces contextual historical background and smart human-tailored solving advice (e.g. matching horizons, tree lines, or water reflections).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🧠</span>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    3. Real-Time Interactive AI Oracle
                  </h4>
                </div>
                <p className="text-stone-300">
                  Tap the <BrainCircuit className="w-3.5 h-3.5 inline text-indigo-400" /> icon anytime to query the AI Oracle directly for hints, strategies, and lore about any level across all games!
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHowAIWorksOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wide cursor-pointer shadow-lg"
            >
              Got it, Let's Play!
            </button>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={victoryState.isOpen}
        gameTitle="Art Puzzles"
        levelNumber={level.level}
        stars={victoryState.stars}
        diamondsEarned={victoryState.diamondsEarned}
        isFirstTime={victoryState.isFirstTime}
        movesOrTimeText={`${movesCount} swaps`}
        onReplay={initPuzzle}
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
