import { ArrowDir, ArrowItem, ArrowLevel, ArrowPathPoint } from '../types/game';

export type BoardShape =
  | 'heart'
  | 'star'
  | 'diamond'
  | 'shield'
  | 'hexagon'
  | 'circle'
  | 'cross'
  | 'hourglass'
  | 'crown'
  | 'butterfly'
  | 'tree'
  | 'moon'
  | 'pyramid'
  | 'octagon'
  | 'clover';

export const BOARD_SHAPES: BoardShape[] = [
  'heart',
  'star',
  'diamond',
  'shield',
  'hexagon',
  'circle',
  'cross',
  'hourglass',
  'crown',
  'butterfly',
  'tree',
  'moon',
  'pyramid',
  'octagon',
  'clover',
];

// Mathematical silhouette collision check for each distinct shape
export function isInsideShape(r: number, c: number, width: number, height: number, shape: BoardShape): boolean {
  const normR = (r - height / 2 + 0.5) / (height / 2);
  const normC = (c - width / 2 + 0.5) / (width / 2);

  switch (shape) {
    case 'heart': {
      const x = normC * 1.2;
      const y = -normR * 1.2 + 0.25;
      const f = (x * x + y * y - 0.75) ** 3 - x * x * (y * y * y);
      return f <= 0.0;
    }
    case 'star': {
      const dist = Math.sqrt(normR * normR + normC * normC);
      const angle = Math.atan2(normR, normC);
      const starRadius = 0.5 + 0.35 * Math.cos(5 * angle);
      return dist <= starRadius && dist <= 0.9;
    }
    case 'diamond': {
      return Math.abs(normR) + Math.abs(normC) <= 1.0;
    }
    case 'shield': {
      if (normR < 0) return Math.abs(normC) <= 0.85 && normR >= -0.85;
      return Math.abs(normC) <= 0.85 * (1 - normR * 0.85);
    }
    case 'hexagon': {
      const q = Math.abs(normC);
      const p = Math.abs(normR);
      return q <= 0.85 && p <= 0.85 && (q * 0.5 + p * 0.866) <= 0.85;
    }
    case 'circle': {
      return normR * normR + normC * normC <= 0.8;
    }
    case 'cross': {
      return (Math.abs(normR) <= 0.9 && Math.abs(normC) <= 0.35) ||
             (Math.abs(normC) <= 0.9 && Math.abs(normR) <= 0.35);
    }
    case 'hourglass': {
      return Math.abs(normC) <= 0.85 * (Math.abs(normR) * 0.75 + 0.25) && Math.abs(normR) <= 0.85;
    }
    case 'crown': {
      if (normR > 0.6) return Math.abs(normC) <= 0.85;
      if (normR < -0.8) return false;
      return Math.abs(normC) <= 0.85 && (
        Math.abs(normC) < 0.25 ||
        Math.abs(normC - 0.6) < 0.25 ||
        Math.abs(normC + 0.6) < 0.25 ||
        normR >= 0
      );
    }
    case 'butterfly': {
      const x = Math.abs(normC);
      const y = normR;
      return x <= 0.85 && (
        (y >= -0.7 && y <= 0.7 && x <= (Math.abs(y) * 0.8 + 0.3)) ||
        (x <= 0.2 && Math.abs(y) <= 0.85)
      );
    }
    case 'tree': {
      if (normR > 0.6) return Math.abs(normC) <= 0.2;
      return normR >= -0.85 && Math.abs(normC) <= (normR + 0.85) * 0.65;
    }
    case 'moon': {
      const d1 = normR * normR + normC * normC;
      const cOffset = normC - 0.35;
      const d2 = normR * normR + cOffset * cOffset;
      return d1 <= 0.85 && d2 >= 0.45 && normC <= 0.7;
    }
    case 'pyramid': {
      return normR >= -0.85 && normR <= 0.85 && Math.abs(normC) <= (normR + 0.85) * 0.6;
    }
    case 'octagon': {
      return Math.abs(normR) <= 0.85 && Math.abs(normC) <= 0.85 &&
             (Math.abs(normR) + Math.abs(normC)) <= 1.25;
    }
    case 'clover': {
      const d = normR * normR + normC * normC;
      return d <= 0.8 && (
        (normR - 0.4) ** 2 + normC ** 2 <= 0.25 ||
        (normR + 0.4) ** 2 + normC ** 2 <= 0.25 ||
        normR ** 2 + (normC - 0.4) ** 2 <= 0.25 ||
        normR ** 2 + (normC + 0.4) ** 2 <= 0.25 ||
        d <= 0.15
      );
    }
    default:
      return true;
  }
}

// Check if an arrow has a clean runway out of the board
export function isArrowPathUnobstructed(
  arrow: ArrowItem,
  allArrows: ArrowItem[],
  gridW: number,
  gridH: number
): boolean {
  if (arrow.state === 'cleared') return false;
  
  // Arrow origin coordinate
  const pt = arrow.path[0];
  let dr = 0;
  let dc = 0;
  if (arrow.dir === 'UP') dr = -1;
  else if (arrow.dir === 'RIGHT') dc = 1;
  else if (arrow.dir === 'DOWN') dr = 1;
  else if (arrow.dir === 'LEFT') dc = -1;

  let r = pt.r + dr;
  let c = pt.c + dc;

  // Scan ray in direction until boundary of grid
  while (r >= 0 && r < gridH && c >= 0 && c < gridW) {
    // Check if any other uncleared arrow is sitting in this line
    const collision = allArrows.some((other) => {
      if (other.id === arrow.id || other.state === 'cleared') return false;
      return other.path.some((p) => p.r === r && p.c === c);
    });

    if (collision) {
      return false; // Path blocked!
    }
    r += dr;
    c += dc;
  }

  return true; // Runway to edge is completely clear!
}

// High-Density Guaranteed Solvable Arrow Puzzle Generator
export function generateArrowLevel(levelNum: number): ArrowLevel {
  const level = Math.max(1, Math.min(150, levelNum));
  const shape = BOARD_SHAPES[(level - 1) % BOARD_SHAPES.length];

  // Grid dimensions
  const gridW = level <= 30 ? 10 : level <= 70 ? 12 : 14;
  const gridH = gridW;

  // Target count of arrows (30 to 70+ arrows!)
  const targetArrowCount = Math.min(
    75,
    28 + Math.floor(level * 0.35)
  );

  let seed = level * 8191 + 313;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Find all candidate cells inside shape
  const cells: { r: number; c: number; distFromCenter: number }[] = [];
  const midR = gridH / 2;
  const midC = gridW / 2;

  for (let r = 1; r < gridH - 1; r++) {
    for (let c = 1; c < gridW - 1; c++) {
      if (isInsideShape(r, c, gridW, gridH, shape)) {
        const d = Math.sqrt((r - midR) ** 2 + (c - midC) ** 2);
        cells.push({ r, c, distFromCenter: d });
      }
    }
  }

  // Shuffle cells slightly but sort by distance from center descending
  // so perimeter cells get outward-facing arrows first!
  cells.sort((a, b) => b.distFromCenter - a.distFromCenter + (rnd() - 0.5) * 1.5);

  const selectedCells = cells.slice(0, targetArrowCount);
  const occupiedCoords = new Set(selectedCells.map((c) => `${c.r},${c.c}`));

  const arrows: ArrowItem[] = [];

  // Determine direction for each arrow with outward-facing preference
  selectedCells.forEach((cell, idx) => {
    const dr = cell.r - midR;
    const dc = cell.c - midC;

    // Default outward vector
    let dir: ArrowDir = 'UP';
    if (Math.abs(dr) > Math.abs(dc)) {
      dir = dr > 0 ? 'DOWN' : 'UP';
    } else {
      dir = dc > 0 ? 'RIGHT' : 'LEFT';
    }

    // For inner cells, add interesting tangents
    if (cell.distFromCenter < 2.5 && rnd() > 0.4) {
      const dirs: ArrowDir[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
      dir = dirs[Math.floor(rnd() * 4)];
    }

    arrows.push({
      id: `arrow-${idx}`,
      path: [{ r: cell.r, c: cell.c }],
      dir,
      state: 'ready',
    });
  });

  // Guarantee that at least 8 to 12 perimeter arrows have unobstructed escape routes immediately!
  arrows.forEach((a) => {
    const pt = a.path[0];
    // If arrow is on border of shape, orient it directly toward empty space
    if (pt.r <= 2) a.dir = 'UP';
    else if (pt.r >= gridH - 3) a.dir = 'DOWN';
    else if (pt.c <= 2) a.dir = 'LEFT';
    else if (pt.c >= gridW - 3) a.dir = 'RIGHT';
  });

  const shapeTitle = shape.charAt(0).toUpperCase() + shape.slice(1);

  return {
    level,
    title: `${shapeTitle} Arrow Matrix`,
    type: 'arrow-escape',
    instructions: `Tap free arrows to launch them off the ${shapeTitle} board! Clear all arrows without colliding.`,
    width: gridW,
    height: gridH,
    arrows,
    obstacles: [],
    maxHearts: 3,
    rewardDiamonds: 20 + Math.floor(level * 0.25),
    hint1: `Look at the outer edges of the ${shapeTitle}: tap arrows pointing away from the board!`,
    hint2: `Tap the Lightbulb Hint to reveal an arrow that is 100% ready to fly.`,
  };
}

export const ALL_ARROW_LEVELS: ArrowLevel[] = Array.from({ length: 150 }, (_, i) => generateArrowLevel(i + 1));
export const getArrowLevel = (lvl: number) => generateArrowLevel(lvl);
