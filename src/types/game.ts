export type GameId = 'treasure-hunt' | 'art-puzzles' | 'arrow-puzzles';

export type NavSection =
  | 'home'
  | 'treasure-hunt'
  | 'art-puzzles'
  | 'arrow-puzzles'
  | 'daily'
  | 'shop'
  | 'achievements'
  | 'profile'
  | 'settings';

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  diamonds: number;
  unlockedAvatars: string[];
  unlockedFrames: string[];
  activeFrame: string;
  createdAt: string;
  playTimeMinutes: number;
}

export interface GameProgress {
  completedLevels: number[];
  unlockedLevel: number;
  stars: Record<number, number>; // levelNumber -> 1..3
  bestScores: Record<number, number>;
  lastPlayedLevel: number;
}

export interface WalletTransaction {
  id: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  reason: string;
  gameId?: GameId;
  levelNumber?: number;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardDiamonds: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  gameId: GameId;
  title: string;
  description: string;
  targetLevel: number;
  rewardDiamonds: number;
  completed: boolean;
  claimed: boolean;
}

// ================= TREASURE HUNT TYPES =================
export interface TreasureWorld {
  id: number;
  name: string;
  levelRange: [number, number];
  themeColor: string;
  accentColor: string;
  lore: string;
  icon: string;
}

export type TreasurePuzzleType =
  | 'ancient-cipher'
  | 'runic-switch'
  | 'guardian-riddle'
  | 'compass-path'
  | 'gem-resonance'
  | 'hidden-relic';

export interface TreasureHotspot {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'key' | 'chest' | 'rune' | 'clue' | 'switch' | 'altar';
  icon: string;
  discovered: boolean;
  dialogue?: string;
}

export interface TreasureLevel {
  level: number;
  worldId: number;
  title: string;
  story: string;
  objective: string;
  puzzleType: TreasurePuzzleType;
  clues: string[];
  hotspots: TreasureHotspot[];
  riddle?: {
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  };
  cipher?: {
    encoded: string;
    decoded: string;
    keyMap: Record<string, string>;
  };
  switches?: {
    sequence: number[];
    labels: string[];
  };
  rewardDiamonds: number;
  hint1: string;
  hint2: string;
  hint3: string;
}

// ================= ART PUZZLES TYPES =================
export type ArtPuzzleType =
  | 'picture-tile'
  | 'mosaic'
  | 'art-restoration'
  | 'pattern-completion'
  | 'color-arrangement'
  | 'silhouette-matching'
  | 'shape-assembly'
  | 'symmetry';

export interface ArtLevel {
  level: number;
  title: string;
  type: ArtPuzzleType;
  instructions: string;
  gridSize?: number; // e.g. 3 for 3x3, 4 for 4x4
  palette?: string[]; // hex colors for mosaic/color
  targetMatrix?: (number | string)[][];
  pieces?: {
    id: string;
    content: string;
    correctSlot: number;
    color?: string;
    shape?: string;
  }[];
  paletteNames?: string[];
  rewardDiamonds: number;
  optimalMoves: number;
  hint1: string;
  hint2: string;
}

// ================= ARROW PUZZLES TYPES =================
export type ArrowPuzzleType =
  | 'arrow-escape'
  | 'path-finder'
  | 'direction-match'
  | 'arrow-maze'
  | 'blocked-arrows'
  | 'sequence-challenge'
  | 'switch-gate'
  | 'limited-moves';

export type ArrowDir = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export interface ArrowPathPoint {
  r: number;
  c: number;
}

export interface ArrowItem {
  id: string;
  // An arrow can be a single cell or a winding snake path with segments
  path: ArrowPathPoint[];
  dir: ArrowDir; // direction of the head (the last point in path)
  state?: 'ready' | 'moving' | 'cleared' | 'blocked';
  color?: string;
  order?: number;
  targetDir?: ArrowDir;
}

export interface ArrowObstacle {
  r: number;
  c: number;
  type: 'wall' | 'switch' | 'lock' | 'goal';
  active?: boolean;
}

export interface ArrowLevel {
  level: number;
  title: string;
  type: ArrowPuzzleType;
  instructions: string;
  width: number;
  height: number;
  arrows: ArrowItem[];
  obstacles: ArrowObstacle[];
  maxMoves?: number;
  maxHearts?: number;
  rewardDiamonds: number;
  hint1: string;
  hint2: string;
}
