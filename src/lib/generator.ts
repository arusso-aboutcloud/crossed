import type {
  ClueEntry,
  Difficulty,
  DifficultyConfig,
  PlacedWord,
  ClueLine,
  GeneratorResult,
} from './types';
import { mulberry32, shuffle } from './rng';

// ---------------------------------------------------------------------------
// Tunables - one place to adjust size bands and word-count targets
// ---------------------------------------------------------------------------
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { minDim:  9, maxDim: 11, targetWords:  8 },
  medium: { minDim: 11, maxDim: 13, targetWords: 12 },
  hard:   { minDim: 13, maxDim: 15, targetWords: 16 },
  pro:    { minDim: 15, maxDim: 17, targetWords: 20 },
};

/** Maximum total placement attempts across the whole generation run. */
const ATTEMPT_BUDGET = 4000;

// ---------------------------------------------------------------------------
// Internal grid representation
// ---------------------------------------------------------------------------

type Dir = 'across' | 'down';

interface WorkingGrid {
  /** cells[row][col] = letter or '' */
  cells: string[][];
  size: number;
  placed: PlacedWord[];
  /** Track which word ids occupy each cell for crossing detection */
  occupants: Set<string>[][];
}

function makeGrid(size: number): WorkingGrid {
  const cells: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const occupants: Set<string>[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => new Set<string>())
  );
  return { cells, size, placed: [], occupants };
}

function cloneGrid(g: WorkingGrid): WorkingGrid {
  const cells = g.cells.map((row) => [...row]);
  const occupants: Set<string>[][] = g.occupants.map((row) =>
    row.map((s) => new Set(s))
  );
  return { cells, size: g.size, placed: g.placed.map((p) => ({ ...p })), occupants };
}

// ---------------------------------------------------------------------------
// Placement validation
// ---------------------------------------------------------------------------

/**
 * Returns the number of valid crossings if the word can be placed, or -1 if invalid.
 * A placement is invalid when:
 *  - it goes out of bounds
 *  - a cell is occupied by a different letter
 *  - the word runs parallel to and immediately adjacent to another word
 *    (which would create an unintended letter run)
 *  - the word extends into or beyond another word in the same direction
 *  - a cell before the start or after the end of the word is already occupied
 */
function scorePlacement(
  grid: WorkingGrid,
  word: string,
  row: number,
  col: number,
  dir: Dir
): number {
  const len = word.length;
  const size = grid.size;

  // Check bounds
  const endRow = dir === 'down' ? row + len - 1 : row;
  const endCol = dir === 'across' ? col + len - 1 : col;
  if (endRow >= size || endCol >= size || row < 0 || col < 0) return -1;

  // Cell before start must be empty (no extension)
  if (dir === 'across' && col > 0 && grid.cells[row][col - 1] !== '') return -1;
  if (dir === 'down'   && row > 0 && grid.cells[row - 1][col] !== '') return -1;

  // Cell after end must be empty (no extension)
  if (dir === 'across' && endCol < size - 1 && grid.cells[row][endCol + 1] !== '') return -1;
  if (dir === 'down'   && endRow < size - 1 && grid.cells[endRow + 1][col] !== '') return -1;

  let crossings = 0;

  for (let i = 0; i < len; i++) {
    const r = dir === 'down'   ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    const existing = grid.cells[r][c];

    if (existing !== '') {
      if (existing !== word[i]) return -1; // letter conflict
      crossings++;
    } else {
      // Cell is empty - check for parallel adjacency (would create side-by-side words)
      if (dir === 'across') {
        // Check cells directly above and below
        if (r > 0        && grid.cells[r - 1][c] !== '') {
          // Only allowed if there is a placed word crossing here in the down direction
          // i.e. the neighbour above is part of a down word that passes through (r,c)
          // We approximate: if the neighbour cell does not belong to a down word
          // that crosses our path, reject.
          const hasDownCrosser = grid.occupants[r - 1][c].size > 0 &&
            [...grid.occupants[r - 1][c]].some((id) => {
              const pw = grid.placed.find((p) => p.entryId === id);
              return pw && pw.direction === 'down' &&
                pw.col === c && pw.row <= r && pw.row + pw.answer.length > r;
            });
          if (!hasDownCrosser) return -1;
        }
        if (r < size - 1 && grid.cells[r + 1][c] !== '') {
          const hasDownCrosser = grid.occupants[r + 1][c].size > 0 &&
            [...grid.occupants[r + 1][c]].some((id) => {
              const pw = grid.placed.find((p) => p.entryId === id);
              return pw && pw.direction === 'down' &&
                pw.col === c && pw.row <= r && pw.row + pw.answer.length > r;
            });
          if (!hasDownCrosser) return -1;
        }
      } else {
        // down direction - check left and right
        if (c > 0        && grid.cells[r][c - 1] !== '') {
          const hasAcrossCrosser = grid.occupants[r][c - 1].size > 0 &&
            [...grid.occupants[r][c - 1]].some((id) => {
              const pw = grid.placed.find((p) => p.entryId === id);
              return pw && pw.direction === 'across' &&
                pw.row === r && pw.col <= c && pw.col + pw.answer.length > c;
            });
          if (!hasAcrossCrosser) return -1;
        }
        if (c < size - 1 && grid.cells[r][c + 1] !== '') {
          const hasAcrossCrosser = grid.occupants[r][c + 1].size > 0 &&
            [...grid.occupants[r][c + 1]].some((id) => {
              const pw = grid.placed.find((p) => p.entryId === id);
              return pw && pw.direction === 'across' &&
                pw.row === r && pw.col <= c && pw.col + pw.answer.length > c;
            });
          if (!hasAcrossCrosser) return -1;
        }
      }
    }
  }

  // Must cross at least one existing letter (except for the very first word)
  if (grid.placed.length > 0 && crossings === 0) return -1;

  return crossings;
}

function commitWord(
  grid: WorkingGrid,
  entry: ClueEntry,
  row: number,
  col: number,
  dir: Dir,
  crossings: number
): void {
  const word = entry.answer;
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'down'   ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    grid.cells[r][c] = word[i];
    grid.occupants[r][c].add(entry.id);
  }
  grid.placed.push({ entryId: entry.id, answer: word, direction: dir, row, col, crossings });
}

// ---------------------------------------------------------------------------
// Bounding box
// ---------------------------------------------------------------------------

interface BBox { minR: number; maxR: number; minC: number; maxC: number; }

function boundingBox(placed: PlacedWord[]): BBox {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const p of placed) {
    const endR = p.direction === 'down'   ? p.row + p.answer.length - 1 : p.row;
    const endC = p.direction === 'across' ? p.col + p.answer.length - 1 : p.col;
    if (p.row  < minR) minR = p.row;
    if (endR   > maxR) maxR = endR;
    if (p.col  < minC) minC = p.col;
    if (endC   > maxC) maxC = endC;
  }
  return { minR, maxR, minC, maxC };
}

// ---------------------------------------------------------------------------
// Candidate generation
// ---------------------------------------------------------------------------

interface Candidate {
  entry: ClueEntry;
  row: number;
  col: number;
  dir: Dir;
  crossings: number;
}

function findCandidates(
  grid: WorkingGrid,
  entry: ClueEntry,
  maxDim: number
): Candidate[] {
  const word = entry.answer;
  const candidates: Candidate[] = [];
  const dirs: Dir[] = ['across', 'down'];

  for (const dir of dirs) {
    for (let wi = 0; wi < word.length; wi++) {
      // Find all cells that already have word[wi] and try to intersect there
      for (let r = 0; r < grid.size; r++) {
        for (let c = 0; c < grid.size; c++) {
          if (grid.cells[r][c] !== word[wi]) continue;
          const row = dir === 'down'   ? r - wi : r;
          const col = dir === 'across' ? c - wi : c;
          const score = scorePlacement(grid, word, row, col, dir);
          if (score < 0) continue;
          // Check bounding box stays within maxDim after placement
          const testPlaced = [...grid.placed, { entryId: entry.id, answer: word, direction: dir, row, col, crossings: score }];
          const bb = boundingBox(testPlaced);
          if ((bb.maxR - bb.minR + 1) > maxDim || (bb.maxC - bb.minC + 1) > maxDim) continue;
          candidates.push({ entry, row, col, dir, crossings: score });
        }
      }
    }
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// Core greedy placer
// ---------------------------------------------------------------------------

function greedyPlace(
  entries: ClueEntry[],
  config: DifficultyConfig,
  rng: () => number
): { placed: PlacedWord[]; cells: string[][] } {
  const size = config.maxDim;
  const grid = makeGrid(size);
  let attempts = 0;

  // Shuffle entries so the order is seed-dependent
  const pool = shuffle([...entries], rng);

  // Place the first (longest) word horizontally in the centre
  const sorted = [...pool].sort((a, b) => b.answer.length - a.answer.length);
  const first = sorted[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.floor((size - first.answer.length) / 2);
  commitWord(grid, first, startRow, startCol, 'across', 0);

  // Remove first word from pool
  const remaining = pool.filter((e) => e.entryId !== first.id);

  // Track best partial grid in case we exhaust budget
  let bestGrid = cloneGrid(grid);

  for (const entry of remaining) {
    if (grid.placed.length >= config.targetWords) break;
    if (attempts >= ATTEMPT_BUDGET) break;

    const candidates = findCandidates(grid, entry, config.maxDim);
    attempts += candidates.length + 1;

    if (candidates.length === 0) continue;

    // Score: prefer more crossings; break ties by compact bounding box
    candidates.sort((a, b) => {
      if (b.crossings !== a.crossings) return b.crossings - a.crossings;
      const bbA = boundingBox([...grid.placed, { ...a, entryId: entry.id, answer: entry.answer }]);
      const bbB = boundingBox([...grid.placed, { ...b, entryId: entry.id, answer: entry.answer }]);
      const areaA = (bbA.maxR - bbA.minR + 1) * (bbA.maxC - bbA.minC + 1);
      const areaB = (bbB.maxR - bbB.minR + 1) * (bbB.maxC - bbB.minC + 1);
      return areaA - areaB;
    });

    const best = candidates[0];
    commitWord(grid, entry, best.row, best.col, best.dir, best.crossings);

    if (grid.placed.length > bestGrid.placed.length) {
      bestGrid = cloneGrid(grid);
    }
  }

  return { placed: bestGrid.placed, cells: bestGrid.cells };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a crossword layout.
 *
 * @param entries  - Full clue bank entries (all topics, all eras).
 * @param difficulty - Controls grid size band and word-count target.
 * @param seed     - Integer seed for deterministic output.
 * @returns        GeneratorResult with grid, placed words, and clue lists.
 */
export function generate(
  entries: ClueEntry[],
  difficulty: Difficulty,
  seed: number
): GeneratorResult {
  const t0 = Date.now();
  const config = DIFFICULTY_CONFIG[difficulty];
  const rng = mulberry32(seed);

  const { placed, cells } = greedyPlace(entries, config, rng);

  // Crop to bounding box
  const bb = placed.length > 0
    ? boundingBox(placed)
    : { minR: 0, maxR: 0, minC: 0, maxC: 0 };

  const rows = bb.maxR - bb.minR + 1;
  const cols = bb.maxC - bb.minC + 1;

  // Remap coordinates relative to bounding box top-left
  const remapped: PlacedWord[] = placed.map((p) => ({
    ...p,
    row: p.row - bb.minR,
    col: p.col - bb.minC,
  }));

  // Build sparse cell map
  const cellMap: Record<string, string> = {};
  for (const p of remapped) {
    for (let i = 0; i < p.answer.length; i++) {
      const r = p.direction === 'down'   ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      cellMap[`${r},${c}`] = p.answer[i];
    }
  }

  // Assign clue numbers: top-to-bottom, left-to-right
  const starts = new Map<string, number>();
  const starters = remapped
    .slice()
    .sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
  let num = 1;
  for (const p of starters) {
    const key = `${p.row},${p.col}`;
    if (!starts.has(key)) {
      starts.set(key, num++);
    }
  }

  // Build clue lines
  const entryMap = new Map(entries.map((e) => [e.id, e]));
  const across: ClueLine[] = [];
  const down: ClueLine[] = [];

  for (const p of starters) {
    const entry = entryMap.get(p.entryId);
    if (!entry) continue;
    const clueNum = starts.get(`${p.row},${p.col}`) ?? 0;
    const line: ClueLine = {
      number: clueNum,
      direction: p.direction,
      clue: entry.clues[difficulty],
      answer: p.answer,
      entryId: p.entryId,
      row: p.row,
      col: p.col,
      length: p.answer.length,
    };
    if (p.direction === 'across') across.push(line);
    else down.push(line);
  }

  across.sort((a, b) => a.number - b.number);
  down.sort((a, b) => a.number - b.number);

  const totalCrossings = remapped.reduce((s, p) => s + p.crossings, 0);

  return {
    seed,
    difficulty,
    rows,
    cols,
    cells: cellMap,
    placed: remapped,
    clues: { across, down },
    stats: {
      wordsPlaced: remapped.length,
      targetWords: config.targetWords,
      crossings: totalCrossings,
      generationMs: Date.now() - t0,
    },
  };
}
