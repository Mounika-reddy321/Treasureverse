import { ArtLevel } from '../types/game';

export interface RealPhotoScene {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
  fallbackGradient: string;
}

// 15 Curated High-Definition Real Photographic Scenes across the globe
export const REAL_PHOTO_SCENES: RealPhotoScene[] = [
  {
    id: 'swiss-alps-lake',
    title: 'Alpine Lake & Wildflower Valley',
    location: 'Zermatt, Switzerland',
    category: 'Mountain Landscapes',
    description: 'Crystal-clear alpine lake reflecting snow-covered peaks surrounded by purple wildflowers.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-sky-500 via-emerald-600 to-slate-800',
  },
  {
    id: 'redwood-sunbeams',
    title: 'Golden Redwood Forest Sunlight',
    location: 'California, USA',
    category: 'Ancient Forests',
    description: 'Towering ancient redwoods with radiant sunbeams streaming through morning mist.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-600 via-emerald-800 to-stone-900',
  },
  {
    id: 'kyoto-sakura-pagoda',
    title: 'Kyoto Pagoda & Cherry Blossoms',
    location: 'Kyoto, Japan',
    category: 'Cultural Wonders',
    description: 'Historic wooden pagoda framed by pastel pink sakura blossoms in peak spring bloom.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-pink-400 via-rose-500 to-indigo-900',
  },
  {
    id: 'maldives-coral-reef',
    title: 'Turquoise Coral Lagoon & Palms',
    location: 'Baa Atoll, Maldives',
    category: 'Tropical Paradise',
    description: 'Pristine white sand beaches and luminous turquoise coral reefs stretching to the horizon.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-cyan-400 via-teal-500 to-blue-900',
  },
  {
    id: 'norway-aurora-fjord',
    title: 'Aurora Borealis over Snowy Fjords',
    location: 'Tromsø, Norway',
    category: 'Night Sky Wonders',
    description: 'Vibrant emerald green northern lights dancing across starlit skies above arctic fjords.',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-emerald-400 via-teal-900 to-slate-950',
  },
  {
    id: 'venice-grand-canal',
    title: 'Venice Grand Canal at Sunset',
    location: 'Venice, Italy',
    category: 'Historic Architecture',
    description: 'Golden hour twilight reflecting on the Grand Canal with traditional wooden gondolas.',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-500 via-orange-600 to-indigo-950',
  },
  {
    id: 'golden-retriever-meadow',
    title: 'Playful Pup in Summer Meadow',
    location: 'Cotswolds, UK',
    category: 'Wildlife & Pets',
    description: 'A happy golden retriever enjoying sunshine in a bright dandelion and poppy meadow.',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-yellow-400 via-amber-500 to-emerald-800',
  },
  {
    id: 'cappadocia-balloons',
    title: 'Hot Air Balloons over Fairy Chimneys',
    location: 'Cappadocia, Turkey',
    category: 'Scenic Wonders',
    description: 'Dozens of colorful hot air balloons floating over surreal rock valleys at sunrise.',
    imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-orange-400 via-rose-500 to-amber-900',
  },
  {
    id: 'space-nebula-galaxy',
    title: 'Deep Cosmic Nebula & Star Clusters',
    location: 'Deep Space (Hubble)',
    category: 'Cosmic Wonders',
    description: 'Glowing clouds of interstellar gas and vibrant newborn stars across deep space.',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-purple-500 via-indigo-900 to-slate-950',
  },
  {
    id: 'santorini-blue-domes',
    title: 'Santorini Blue Domes & Aegean Sea',
    location: 'Oia, Greece',
    category: 'Island Architecture',
    description: 'Iconic whitewashed cliffside buildings and azure blue domed churches overlooking the sea.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-blue-400 via-sky-600 to-slate-900',
  },
  {
    id: 'cozy-autumn-cabin',
    title: 'Autumn Cabin in Golden Pines',
    location: 'Banff, Canada',
    category: 'Rustic Escapes',
    description: 'A warm log cabin with glowing windows nestled among fiery orange and red autumn woods.',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-600 via-orange-700 to-stone-900',
  },
  {
    id: 'rome-colosseum-dusk',
    title: 'Ancient Colosseum at Twilight',
    location: 'Rome, Italy',
    category: 'Ancient Wonders',
    description: 'The monumental stone arches of the Roman Colosseum illuminated against an evening sky.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-700 via-stone-800 to-slate-950',
  },
  {
    id: 'yosemite-falls',
    title: 'Yosemite Valley & Granite Cliffs',
    location: 'California, USA',
    category: 'National Parks',
    description: 'Majestic sheer granite peaks, evergreen pine valleys, and a thundering waterfall.',
    imageUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-sky-600 via-emerald-700 to-stone-900',
  },
  {
    id: 'lavender-provence',
    title: 'Purple Lavender Fields of Provence',
    location: 'Valensole, France',
    category: 'Botanical Landscapes',
    description: 'Rolling rows of fragrant purple lavender stretching to an old stone farmhouse at dusk.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-purple-500 via-violet-700 to-amber-900',
  },
  {
    id: 'hawaii-sunset-beach',
    title: 'Sunset Surf & Silhouetted Palms',
    location: 'Maui, Hawaii',
    category: 'Ocean Coasts',
    description: 'Golden sun setting into gentle ocean breakers with tall palm trees silhouetted in the breeze.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-orange-500 via-rose-600 to-indigo-950',
  },
];

export function getArtLevel(lvl: number): ArtLevel {
  const levelNum = Math.max(1, Math.min(150, lvl));
  const scene = REAL_PHOTO_SCENES[(levelNum - 1) % REAL_PHOTO_SCENES.length];

  // Grid dimensions:
  // Levels 1-30: 3x3 (9 tiles) for an approachable, fun start
  // Levels 31-80: 4x4 (16 tiles) for intermediate challenge
  // Levels 81-150: 5x5 (25 tiles) for master challenge
  const gridSize = levelNum <= 30 ? 3 : levelNum <= 80 ? 4 : 5;
  const totalTiles = gridSize * gridSize;

  return {
    level: levelNum,
    title: scene.title,
    type: 'picture-tile',
    instructions: `Tap two photograph tiles to swap them until this real photo of ${scene.location} is fully restored!`,
    gridSize,
    palette: ['#38bdf8', '#f59e0b', '#10b981', '#ec4899'],
    rewardDiamonds: 15 + Math.floor(levelNum * 0.25),
    optimalMoves: totalTiles + 5,
    hint1: `Find tiles containing sky or water and move them into the top rows.`,
    hint2: `Check the Reference Photo preview to see where the focal point belongs.`,
  };
}

export const ALL_ART_LEVELS: ArtLevel[] = Array.from({ length: 150 }, (_, i) => getArtLevel(i + 1));
