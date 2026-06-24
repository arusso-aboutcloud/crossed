import type { ClueEntry, Difficulty, DifficultyConfig, PlacedWord, ClueLine, GeneratorResult } from './types';
import { mulberry32, shuffle } from './rng';

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { minDim:  9, maxDim: 11, targetWords:  8 },
  medium: { minDim: 11, maxDim: 13, targetWords: 12 },
  hard:   { minDim: 13, maxDim: 15, targetWords: 16 },
  pro:    { minDim: 15, maxDim: 17, targetWords: 20 },
};

const ATTEMPT_BUDGET = 4000;
type Dir = 'across' | 'down';

interface WorkingGrid {
  cells: string[][];
  size: number;
  placed: PlacedWord[];
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
  return {
    cells: g.cells.map((r) => [...r]),
    size: g.size,
    placed: g.placed.map((p) => ({ ...p })),
    occupants: g.occupants.map((r) => r.map((s) => new Set(s))),
  };
}

function scorePlacement(grid: WorkingGrid, word: string, row: number, col: number, dir: Dir): number {
  const len = word.length;
  const size = grid.size;
  const endRow = dir === 'down'   ? row + len - 1 : row;
  const endCol = dir === 'across' ? col + len - 1 : col;
  if (endRow >= size || endCol >= size || row < 0 || col < 0) return -1;
  if (dir === 'across' && col > 0 && grid.cells[row][col - 1] !== '') return -1;
  if (dir === 'down'   && row > 0 && grid.cells[row - 1][col] !== '') return -1;
  if (dir === 'across' && endCol < size - 1 && grid.cells[row][endCol + 1] !== '') return -1;
  if (dir === 'down'   && endRow < size - 1 && grid.cells[endRow + 1][col] !== '') return -1;
  let crossings = 0;
  for (let i = 0; i < len; i++) {
    const r = dir === 'down'   ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    const existing = grid.cells[r][c];
    if (existing !== '') {
      if (existing !== word[i]) return -1;
      crossings++;
    } else {
      if (dir === 'across') {
        if (r > 0 && grid.cells[r - 1][c] !== '') {
          const ok = [...grid.occupants[r - 1][c]].some((id) => {
            const pw = grid.placed.find((p) => p.entryId === id);
            return pw && pw.direction === 'down' && pw.col === c && pw.row <= r && pw.row + pw.answer.length > r;
          });
          if (!ok) return -1;
        }
        if (r < size - 1 && grid.cells[r + 1][c] !== '') {
          const ok = [...grid.occupants[r + 1][c]].some((id) => {
            const pw = grid.placed.find((p) => p.entryId === id);
            return pw && pw.direction === 'down' && pw.col === c && pw.row <= r && pw.row + pw.answer.length > r;
          });
          if (!ok) return -1;
        }
      } else {
        if (c > 0 && grid.cells[r][c - 1] !== '') {
          const ok = [...grid.occupants[r][c - 1]].some((id) => {
            const pw = grid.placed.find((p) => p.entryId === id);
            return pw && pw.direction === 'across' && pw.row === r && pw.col <= c && pw.col + pw.answer.length > c;
          });
          if (!ok) return -1;
        }
        if (c < size - 1 && grid.cells[r][c + 1] !== '') {
          const ok = [...grid.occupants[r][c + 1]].some((id) => {
            const pw = grid.placed.find((p) => p.entryId === id);
            return pw && pw.direction === 'across' && pw.row === r && pw.col <= c && pw.col + pw.answer.length > c;
          });
          if (!ok) return -1;
        }
      }
    }
  }
  if (grid.placed.length > 0 && crossings === 0) return -1;
  return crossings;
}

function commitWord(grid: WorkingGrid, entry: ClueEntry, row: number, col: number, dir: Dir, crossings: number): void {
  for (let i = 0; i < entry.answer.length; i++) {
    const r = dir === 'down'   ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    grid.cells[r][c] = entry.answer[i];
    grid.occupants[r][c].add(entry.id);
  }
  grid.placed.push({ entryId: entry.id, answer: entry.answer, direction: dir, row, col, crossings });
}

interface BBox { minR: number; maxR: number; minC: number; maxC: number; }

function boundingBox(placed: PlacedWord[]): BBox {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const p of placed) {
    const endR = p.direction === 'down'   ? p.row + p.answer.length - 1 : p.row;
    const endC = p.direction === 'across' ? p.col + p.answer.length - 1 : p.col;
    if (p.row < minR) minR = p.row;
    if (endR  > maxR) maxR = endR;
    if (p.col < minC) minC = p.col;
    if (endC  > maxC) maxC = endC;
  }
  return { minR, maxR, minC, maxC };
}

interface Candidate { entry: ClueEntry; row: number; col: number; dir: Dir; crossings: number; }

function findCandidates(grid: WorkingGrid, entry: ClueEntry, maxDim: number): Candidate[] {
  const word = entry.answer;
  const candidates: Candidate[] = [];
  for (const dir of ['across', 'down'] as Dir[]) {
    for (let wi = 0; wi < word.length; wi++) {
      for (let r = 0; r < grid.size; r++) {
        for (let c = 0; c < grid.size; c++) {
          if (grid.cells[r][c] !== word[wi]) continue;
          const row = dir === 'down'   ? r - wi : r;
          const col = dir === 'across' ? c - wi : c;
          const score = scorePlacement(grid, word, row, col, dir);
          if (score < 0) continue;
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

function greedyPlace(entries: ClueEntry[], config: DifficultyConfig, rng: () => number): { placed: PlacedWord[]; cells: string[][] } {
  const size = config.maxDim;
  const grid = makeGrid(size);
  let attempts = 0;
  const pool = shuffle([...entries], rng);
  const sorted = [...pool].sort((a, b) => b.answer.length - a.answer.length);
  const first = sorted[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.floor((size - first.answer.length) / 2);
  commitWord(grid, first, startRow, startCol, 'across', 0);
  const remaining = pool.filter((e) => e.id !== first.id);
  let bestGrid = cloneGrid(grid);
  for (const entry of remaining) {
    if (grid.placed.length >= config.targetWords) break;
    if (attempts >= ATTEMPT_BUDGET) break;
    const candidates = findCandidates(grid, entry, config.maxDim);
    attempts += candidates.length + 1;
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => {
      if (b.crossings !== a.crossings) return b.crossings - a.crossings;
      const bbA = boundingBox([...grid.placed, { entryId: entry.id, answer: entry.answer, direction: a.dir, row: a.row, col: a.col, crossings: a.crossings }]);
      const bbB = boundingBox([...grid.placed, { entryId: entry.id, answer: entry.answer, direction: b.dir, row: b.row, col: b.col, crossings: b.crossings }]);
      return (bbA.maxR - bbA.minR + 1) * (bbA.maxC - bbA.minC + 1) - (bbB.maxR - bbB.minR + 1) * (bbB.maxC - bbB.minC + 1);
    });
    const best = candidates[0];
    commitWord(grid, entry, best.row, best.col, best.dir, best.crossings);
    if (grid.placed.length > bestGrid.placed.length) bestGrid = cloneGrid(grid);
  }
  return { placed: bestGrid.placed, cells: bestGrid.cells };
}

export function generate(entries: ClueEntry[], difficulty: Difficulty, seed: number): GeneratorResult {
  const t0 = Date.now();
  const config = DIFFICULTY_CONFIG[difficulty];
  const rng = mulberry32(seed);
  const { placed } = greedyPlace(entries, config, rng);
  const bb = placed.length > 0 ? boundingBox(placed) : { minR: 0, maxR: 0, minC: 0, maxC: 0 };
  const rows = bb.maxR - bb.minR + 1;
  const cols = bb.maxC - bb.minC + 1;
  const remapped: PlacedWord[] = placed.map((p) => ({ ...p, row: p.row - bb.minR, col: p.col - bb.minC }));
  const cellMap: Record<string, string> = {};
  for (const p of remapped) {
    for (let i = 0; i < p.answer.length; i++) {
      const r = p.direction === 'down'   ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      cellMap[`${r},${c}`] = p.answer[i];
    }
  }
  const starts = new Map<string, number>();
  const starters = remapped.slice().sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
  let num = 1;
  for (const p of starters) {
    const key = `${p.row},${p.col}`;
    if (!starts.has(key)) starts.set(key, num++);
  }
  const entryMap = new Map(entries.map((e) => [e.id, e]));
  const across: ClueLine[] = [];
  const down: ClueLine[] = [];
  for (const p of starters) {
    const entry = entryMap.get(p.entryId);
    if (!entry) continue;
    const line: ClueLine = {
      number: starts.get(`${p.row},${p.col}`) ?? 0,
      direction: p.direction,
      clue: entry.clues[difficulty],
      answer: p.answer,
      entryId: p.entryId,
      row: p.row,
      col: p.col,
      length: p.answer.length,
    };
    if (p.direction === 'across') across.push(line); else down.push(line);
  }
  across.sort((a, b) => a.number - b.number);
  down.sort((a, b) => a.number - b.number);
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
      crossings: remapped.reduce((s, p) => s + p.crossings, 0),
      generationMs: Date.now() - t0,
    },
  };
}
