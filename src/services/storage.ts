import {
  GameId,
  GameProgress,
  PlayerProfile,
  WalletTransaction,
  Achievement,
  DailyChallenge,
} from '../types/game';

const STORAGE_KEYS = {
  PROFILE: 'treasureverse_profile_v1',
  PROGRESS: 'treasureverse_progress_v1',
  TRANSACTIONS: 'treasureverse_transactions_v1',
  ACHIEVEMENTS: 'treasureverse_achievements_v1',
  DAILY: 'treasureverse_daily_v1',
  SETTINGS: 'treasureverse_settings_v1',
};

const INITIAL_PROFILE: PlayerProfile = {
  id: 'adventurer-1',
  username: 'ShadowSeeker',
  avatar: '🧭',
  level: 1,
  xp: 0,
  diamonds: 100, // Welcome bonus!
  unlockedAvatars: ['🧭', '⚔️', '🔮', '👑', '🏹', '💎'],
  unlockedFrames: ['default', 'bronze'],
  activeFrame: 'default',
  createdAt: new Date().toISOString(),
  playTimeMinutes: 12,
};

const INITIAL_PROGRESS: Record<GameId, GameProgress> = {
  'treasure-hunt': {
    completedLevels: [],
    unlockedLevel: 1,
    stars: {},
    bestScores: {},
    lastPlayedLevel: 1,
  },
  'art-puzzles': {
    completedLevels: [],
    unlockedLevel: 1,
    stars: {},
    bestScores: {},
    lastPlayedLevel: 1,
  },
  'arrow-puzzles': {
    completedLevels: [],
    unlockedLevel: 1,
    stars: {},
    bestScores: {},
    lastPlayedLevel: 1,
  },
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_treasure',
    title: 'First Treasure',
    description: 'Complete your first Treasure Hunt quest',
    icon: '🏆',
    rewardDiamonds: 25,
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: 'treasure_explorer',
    title: 'Treasure Explorer',
    description: 'Complete 10 levels in Treasure Hunt',
    icon: '🗺️',
    rewardDiamonds: 50,
    progress: 0,
    target: 10,
    unlocked: false,
  },
  {
    id: 'art_restorer',
    title: 'Art Restorer',
    description: 'Complete 5 Art Puzzle masterpieces',
    icon: '🎨',
    rewardDiamonds: 30,
    progress: 0,
    target: 5,
    unlocked: false,
  },
  {
    id: 'pattern_expert',
    title: 'Pattern Expert',
    description: 'Complete 20 Art Puzzles',
    icon: '✨',
    rewardDiamonds: 75,
    progress: 0,
    target: 20,
    unlocked: false,
  },
  {
    id: 'arrow_master',
    title: 'Arrow Master',
    description: 'Solve 10 Arrow Puzzles with maximum efficiency',
    icon: '🎯',
    rewardDiamonds: 40,
    progress: 0,
    target: 10,
    unlocked: false,
  },
  {
    id: 'path_legend',
    title: 'Grand Navigator',
    description: 'Solve 25 Arrow Puzzles without failure',
    icon: '🧭',
    rewardDiamonds: 80,
    progress: 0,
    target: 25,
    unlocked: false,
  },
  {
    id: 'diamond_collector',
    title: 'Diamond Collector',
    description: 'Accumulate a balance of 300 Diamonds',
    icon: '💎',
    rewardDiamonds: 50,
    progress: 100,
    target: 300,
    unlocked: false,
  },
  {
    id: 'riddle_master',
    title: 'Riddle Master',
    description: 'Solve 5 Guardian Riddles correctly',
    icon: '📜',
    rewardDiamonds: 45,
    progress: 0,
    target: 5,
    unlocked: false,
  },
  {
    id: 'world_conqueror',
    title: 'World Conqueror',
    description: 'Clear an entire world (10 levels) in Treasure Hunt',
    icon: '🌍',
    rewardDiamonds: 100,
    progress: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: 'triple_master',
    title: 'Triple Game Master',
    description: 'Complete at least 5 levels in all three game modes',
    icon: '👑',
    rewardDiamonds: 150,
    progress: 0,
    target: 15,
    unlocked: false,
  },
];

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  animationsEnabled: boolean;
  highContrast: boolean;
}

const INITIAL_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.7,
  animationsEnabled: true,
  highContrast: false,
};

export class GameStorageService {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage set failed', err);
    }
  }

  static getProfile(): PlayerProfile {
    return this.get<PlayerProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  }

  static saveProfile(profile: PlayerProfile): void {
    this.set(STORAGE_KEYS.PROFILE, profile);
  }

  static getProgress(): Record<GameId, GameProgress> {
    const saved = this.get<Record<GameId, GameProgress>>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    // Ensure all 3 games exist in progress object
    return {
      'treasure-hunt': saved['treasure-hunt'] || INITIAL_PROGRESS['treasure-hunt'],
      'art-puzzles': saved['art-puzzles'] || INITIAL_PROGRESS['art-puzzles'],
      'arrow-puzzles': saved['arrow-puzzles'] || INITIAL_PROGRESS['arrow-puzzles'],
    };
  }

  static saveProgress(progress: Record<GameId, GameProgress>): void {
    this.set(STORAGE_KEYS.PROGRESS, progress);
  }

  static getTransactions(): WalletTransaction[] {
    return this.get<WalletTransaction[]>(STORAGE_KEYS.TRANSACTIONS, [
      {
        id: 'tx-init',
        type: 'EARN',
        amount: 100,
        reason: 'Welcome to TreasureVerse Starter Pack',
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  static addTransaction(tx: Omit<WalletTransaction, 'id' | 'timestamp'>): WalletTransaction {
    const list = this.getTransactions();
    const newTx: WalletTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newTx);
    this.set(STORAGE_KEYS.TRANSACTIONS, list.slice(0, 100)); // Keep last 100
    return newTx;
  }

  static addDiamonds(amount: number, reason: string, gameId?: GameId, levelNumber?: number): PlayerProfile {
    const profile = this.getProfile();
    profile.diamonds += amount;
    // Add XP as well
    profile.xp += Math.round(amount * 1.5);
    const requiredXp = profile.level * 100;
    if (profile.xp >= requiredXp) {
      profile.level += 1;
      profile.xp -= requiredXp;
    }
    this.saveProfile(profile);
    this.addTransaction({
      type: 'EARN',
      amount,
      reason,
      gameId,
      levelNumber,
    });
    this.checkAchievements();
    return profile;
  }

  static spendDiamonds(amount: number, reason: string, gameId?: GameId, levelNumber?: number): boolean {
    const profile = this.getProfile();
    if (profile.diamonds < amount) {
      return false;
    }
    profile.diamonds -= amount;
    this.saveProfile(profile);
    this.addTransaction({
      type: 'SPEND',
      amount,
      reason,
      gameId,
      levelNumber,
    });
    return true;
  }

  static getAchievements(): Achievement[] {
    return this.get<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  }

  static saveAchievements(achs: Achievement[]): void {
    this.set(STORAGE_KEYS.ACHIEVEMENTS, achs);
  }

  static checkAchievements(): Achievement[] {
    const achs = this.getAchievements();
    const progress = this.getProgress();
    const profile = this.getProfile();

    let updated = false;

    achs.forEach((ach) => {
      let currentVal = ach.progress;
      if (ach.id === 'first_treasure') {
        currentVal = progress['treasure-hunt'].completedLevels.length >= 1 ? 1 : 0;
      } else if (ach.id === 'treasure_explorer') {
        currentVal = progress['treasure-hunt'].completedLevels.length;
      } else if (ach.id === 'art_restorer') {
        currentVal = progress['art-puzzles'].completedLevels.length;
      } else if (ach.id === 'pattern_expert') {
        currentVal = progress['art-puzzles'].completedLevels.length;
      } else if (ach.id === 'arrow_master') {
        currentVal = progress['arrow-puzzles'].completedLevels.length;
      } else if (ach.id === 'path_legend') {
        currentVal = progress['arrow-puzzles'].completedLevels.length;
      } else if (ach.id === 'diamond_collector') {
        currentVal = profile.diamonds;
      } else if (ach.id === 'world_conqueror') {
        currentVal = progress['treasure-hunt'].completedLevels.length >= 10 ? 1 : 0;
      } else if (ach.id === 'triple_master') {
        const c1 = progress['treasure-hunt'].completedLevels.length;
        const c2 = progress['art-puzzles'].completedLevels.length;
        const c3 = progress['arrow-puzzles'].completedLevels.length;
        currentVal = Math.min(c1, 5) + Math.min(c2, 5) + Math.min(c3, 5);
      }

      ach.progress = currentVal;
      if (!ach.unlocked && ach.progress >= ach.target) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        updated = true;
        // Award achievement reward
        this.addDiamonds(ach.rewardDiamonds, `Achievement Unlocked: ${ach.title}`);
      }
    });

    if (updated) {
      this.saveAchievements(achs);
    }
    return achs;
  }

  static getDailyChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().slice(0, 10);
    const saved = this.get<DailyChallenge[]>(STORAGE_KEYS.DAILY, []);
    if (saved.length === 3 && saved[0].date === today) {
      return saved;
    }

    // Generate fresh today challenges
    const newDailies: DailyChallenge[] = [
      {
        id: `daily-th-${today}`,
        date: today,
        gameId: 'treasure-hunt',
        title: "Explorer's Quest",
        description: 'Solve the riddle of Level 5 in Treasure Hunt',
        targetLevel: 5,
        rewardDiamonds: 40,
        completed: false,
        claimed: false,
      },
      {
        id: `daily-art-${today}`,
        date: today,
        gameId: 'art-puzzles',
        title: 'Artisan Mosaic',
        description: 'Complete Mosaic Art Level 3 in under 20 moves',
        targetLevel: 3,
        rewardDiamonds: 40,
        completed: false,
        claimed: false,
      },
      {
        id: `daily-arrow-${today}`,
        date: today,
        gameId: 'arrow-puzzles',
        title: 'Wayfinder Flight',
        description: 'Clear Arrow Escape Level 4 without hitting walls',
        targetLevel: 4,
        rewardDiamonds: 50,
        completed: false,
        claimed: false,
      },
    ];
    this.set(STORAGE_KEYS.DAILY, newDailies);
    return newDailies;
  }

  static claimDailyChallenge(challengeId: string): boolean {
    const dailies = this.getDailyChallenges();
    const item = dailies.find((d) => d.id === challengeId);
    if (!item || !item.completed || item.claimed) return false;

    item.claimed = true;
    this.set(STORAGE_KEYS.DAILY, dailies);
    this.addDiamonds(item.rewardDiamonds, `Daily Challenge Claimed: ${item.title}`);
    return true;
  }

  static getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  static completeLevel(
    gameId: GameId,
    levelNumber: number,
    stars: number,
    score: number,
    baseReward: number
  ): { newlyCompleted: boolean; diamondsEarned: number } {
    const progress = this.getProgress();
    const gameProg = progress[gameId];

    const isFirstTime = !gameProg.completedLevels.includes(levelNumber);
    let diamondsAwarded = 0;

    if (isFirstTime) {
      gameProg.completedLevels.push(levelNumber);
      // Unlock next level if currently at maximum
      if (levelNumber >= gameProg.unlockedLevel && levelNumber < 150) {
        gameProg.unlockedLevel = levelNumber + 1;
      }
      // Calculate reward: base + 3-star bonus
      diamondsAwarded = baseReward + (stars === 3 ? 15 : stars === 2 ? 5 : 0);
      this.addDiamonds(diamondsAwarded, `Completed ${gameId} Level ${levelNumber}`, gameId, levelNumber);
    }

    // Update stars and scores
    gameProg.stars[levelNumber] = Math.max(gameProg.stars[levelNumber] || 0, stars);
    gameProg.bestScores[levelNumber] = Math.max(gameProg.bestScores[levelNumber] || 0, score);
    gameProg.lastPlayedLevel = levelNumber;

    progress[gameId] = gameProg;
    this.saveProgress(progress);

    // Check daily challenge match
    const dailies = this.getDailyChallenges();
    dailies.forEach((d) => {
      if (d.gameId === gameId && d.targetLevel === levelNumber) {
        d.completed = true;
      }
    });
    this.set(STORAGE_KEYS.DAILY, dailies);

    this.checkAchievements();

    return { newlyCompleted: isFirstTime, diamondsEarned: diamondsAwarded };
  }

  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.DAILY);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
