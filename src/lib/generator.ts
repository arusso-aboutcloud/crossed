import type { ClueEntry, Difficulty, DifficultyConfig, PlacedWord, ClueLine, GeneratorResult } from './types';
import { mulberry32, shuffle } from './rng';
import { makeGrid, cloneGrid, boundingBox, commitWord, findCandidates } from './grid';

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { minDim: 10, maxDim: 13, targetWords: 10 },
  medium: { minDim: 12, maxDim: 15, targetWords: 14 },
  hard:   { minDim: 14, maxDim: 17, targetWords: 18 },
  pro:    { minDim: 16, maxDim: 19, targetWords: 22 },
};

const ATTEMPT_BUDGET = 4000;

function greedyPlace(
  entries: ClueEntry[],
  config: DifficultyConfig,
  rng: () => number
): { placed: PlacedWord[] } {
  if (entries.length === 0) return { placed: [] };

  const size = config.maxDim;
  const grid = makeGrid(size);
  let attempts = 0;

  const pool = shuffle([...entries], rng);

  // First word must fit within the grid horizontally - filter by length first
  const fits = [...pool]
    .filter((e) => e.answer.length <= size)
    .sort((a, b) => b.answer.length - a.answer.length);

  if (fits.length === 0) return { placed: [] };

  const first = fits[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.floor((size - first.answer.length) / 2);
  commitWord(grid, first, startRow, startCol, 'across', 0);

  const remaining = pool.filter((e) => e.id !== first.id);
  let bestGrid = cloneGrid(grid);

  for (const entry of remaining) {
    if (grid.placed.length >= config.targetWords) break;
    if (attempts >= ATTEMPT_BUDGET) break;
    // Skip words that cannot possibly fit in the grid
    if (entry.answer.length > size) continue;
    const candidates = findCandidates(grid, entry, config.maxDim);
    attempts += candidates.length + 1;
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => {
      if (b.crossings !== a.crossings) return b.crossings - a.crossings;
      const bbA = boundingBox([...grid.placed, { entryId: entry.id, answer: entry.answer, direction: a.dir, row: a.row, col: a.col, crossings: a.crossings }]);
      const bbB = boundingBox([...grid.placed, { entryId: entry.id, answer: entry.answer, direction: b.dir, row: b.row, col: b.col, crossings: b.crossings }]);
      return (bbA.maxR - bbA.minR + 1) * (bbA.maxC - bbA.minC + 1)
           - (bbB.maxR - bbB.minR + 1) * (bbB.maxC - bbB.minC + 1);
    });
    const best = candidates[0];
    commitWord(grid, entry, best.row, best.col, best.dir, best.crossings);
    if (grid.placed.length > bestGrid.placed.length) bestGrid = cloneGrid(grid);
  }

  return { placed: bestGrid.placed };
}

export function generate(
  entries: ClueEntry[],
  difficulty: Difficulty,
  seed: number
): GeneratorResult {
  const t0 = Date.now();
  const config = DIFFICULTY_CONFIG[difficulty];
  const rng = mulberry32(seed);
  const { placed } = greedyPlace(entries, config, rng);
  const bb = placed.length > 0 ? boundingBox(placed) : { minR: 0, maxR: 0, minC: 0, maxC: 0 };
  const rows = placed.length > 0 ? bb.maxR - bb.minR + 1 : 0;
  const cols = placed.length > 0 ? bb.maxC - bb.minC + 1 : 0;
  const remapped: PlacedWord[] = placed.map((p) => ({
    ...p, row: p.row - bb.minR, col: p.col - bb.minC,
  }));
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
