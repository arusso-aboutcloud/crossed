import type { ClueEntry, PlacedWord } from './types';

type Dir = 'across' | 'down';

export interface WorkingGrid {
  cells: string[][];
  size: number;
  placed: PlacedWord[];
  occupants: Set<string>[][];
}

export function makeGrid(size: number): WorkingGrid {
  const cells: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const occupants: Set<string>[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => new Set<string>())
  );
  return { cells, size, placed: [], occupants };
}

export function cloneGrid(g: WorkingGrid): WorkingGrid {
  return {
    cells: g.cells.map((r) => [...r]),
    size: g.size,
    placed: g.placed.map((p) => ({ ...p })),
    occupants: g.occupants.map((r) => r.map((s) => new Set(s))),
  };
}

export interface BBox { minR: number; maxR: number; minC: number; maxC: number; }

export function boundingBox(placed: PlacedWord[]): BBox {
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

export function scorePlacement(grid: WorkingGrid, word: string, row: number, col: number, dir: Dir): number {
  const len = word.length;
  const size = grid.size;
  const endRow = dir === 'down'   ? row + len - 1 : row;
  const endCol = dir === 'across' ? col + len - 1 : col;
  if (endRow >= size || endCol >= size || row < 0 || col < 0) return -1;
  if (dir === 'across' && col > 0        && grid.cells[row][col - 1]    !== '') return -1;
  if (dir === 'down'   && row > 0        && grid.cells[row - 1][col]    !== '') return -1;
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
      if (!checkParallel(grid, r, c, dir, size)) return -1;
    }
  }
  if (grid.placed.length > 0 && crossings === 0) return -1;
  return crossings;
}

function checkParallel(grid: WorkingGrid, r: number, c: number, dir: Dir, size: number): boolean {
  const perpDir: Dir = dir === 'across' ? 'down' : 'across';
  const neighbors: [number, number][] = dir === 'across'
    ? [[r - 1, c], [r + 1, c]]
    : [[r, c - 1], [r, c + 1]];
  for (const [nr, nc] of neighbors) {
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    if (grid.cells[nr][nc] === '') continue;
    const hasCrosser = [...grid.occupants[nr][nc]].some((id) => {
      const pw = grid.placed.find((p) => p.entryId === id);
      if (!pw || pw.direction !== perpDir) return false;
      if (perpDir === 'down')   return pw.col === c && pw.row <= r && pw.row + pw.answer.length > r;
      return pw.row === r && pw.col <= c && pw.col + pw.answer.length > c;
    });
    if (!hasCrosser) return false;
  }
  return true;
}

export function commitWord(grid: WorkingGrid, entry: ClueEntry, row: number, col: number, dir: Dir, crossings: number): void {
  for (let i = 0; i < entry.answer.length; i++) {
    const r = dir === 'down'   ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    grid.cells[r][c] = entry.answer[i];
    grid.occupants[r][c].add(entry.id);
  }
  grid.placed.push({ entryId: entry.id, answer: entry.answer, direction: dir, row, col, crossings });
}

export interface Candidate { entry: ClueEntry; row: number; col: number; dir: Dir; crossings: number; }

export function findCandidates(grid: WorkingGrid, entry: ClueEntry, maxDim: number): Candidate[] {
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
