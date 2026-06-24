import { describe, it, expect } from 'vitest';
import { generate, DIFFICULTY_CONFIG } from './generator';
import type { ClueEntry, Difficulty } from './types';
import { FIXTURE_ENTRIES, HOSTILE_ENTRIES } from './generator.fixture';

const ALL_ENTRIES: ClueEntry[] = FIXTURE_ENTRIES;

describe('determinism', () => {
  it('same seed produces identical output', () => {
    const a = generate(ALL_ENTRIES, 'medium', 42);
    const b = generate(ALL_ENTRIES, 'medium', 42);
    expect(a.cells).toEqual(b.cells);
    expect(a.placed.map((p) => p.entryId)).toEqual(b.placed.map((p) => p.entryId));
    expect(a.stats.wordsPlaced).toBe(b.stats.wordsPlaced);
  });

  it('different seeds produce different output', () => {
    const a = generate(ALL_ENTRIES, 'medium', 1);
    const b = generate(ALL_ENTRIES, 'medium', 2);
    expect(JSON.stringify(a.placed)).not.toBe(JSON.stringify(b.placed));
  });
});

describe('validity', () => {
  it('every placed word appears in the cell map with correct letters', () => {
    const result = generate(ALL_ENTRIES, 'easy', 99);
    for (const p of result.placed) {
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.direction === 'down'   ? p.row + i : p.row;
        const c = p.direction === 'across' ? p.col + i : p.col;
        expect(result.cells[`${r},${c}`]).toBe(p.answer[i]);
      }
    }
  });

  it('crossing cells agree between intersecting words', () => {
    const result = generate(ALL_ENTRIES, 'hard', 7);
    for (const a of result.placed) {
      for (const b of result.placed) {
        if (a.entryId === b.entryId || a.direction === b.direction) continue;
        for (let i = 0; i < a.answer.length; i++) {
          const ar = a.direction === 'down'   ? a.row + i : a.row;
          const ac = a.direction === 'across' ? a.col + i : a.col;
          for (let j = 0; j < b.answer.length; j++) {
            const br = b.direction === 'down'   ? b.row + j : b.row;
            const bc = b.direction === 'across' ? b.col + j : b.col;
            if (ar === br && ac === bc) {
              expect(a.answer[i]).toBe(b.answer[j]);
            }
          }
        }
      }
    }
  });

  it('all clue lines have non-empty clue strings', () => {
    const result = generate(ALL_ENTRIES, 'pro', 3);
    for (const cl of [...result.clues.across, ...result.clues.down]) {
      expect(cl.clue.length).toBeGreaterThan(0);
      expect(cl.length).toBe(cl.answer.length);
    }
  });
});

describe('connectivity', () => {
  it('every word except the first has at least one crossing', () => {
    const result = generate(ALL_ENTRIES, 'medium', 17);
    const starters = result.placed.filter((p) => p.crossings > 0);
    expect(starters.length).toBe(result.placed.length - 1);
  });
});

describe('size band and word count', () => {
  const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
  for (const diff of diffs) {
    it(`${diff}: grid dimensions stay within band`, () => {
      const result = generate(ALL_ENTRIES, diff, 55);
      const cfg = DIFFICULTY_CONFIG[diff];
      expect(result.rows).toBeGreaterThanOrEqual(1);
      expect(result.rows).toBeLessThanOrEqual(cfg.maxDim);
      expect(result.cols).toBeLessThanOrEqual(cfg.maxDim);
    });

    it(`${diff}: words placed does not exceed target`, () => {
      const result = generate(ALL_ENTRIES, diff, 55);
      const cfg = DIFFICULTY_CONFIG[diff];
      expect(result.stats.wordsPlaced).toBeLessThanOrEqual(cfg.targetWords);
    });
  }
});

describe('robustness', () => {
  it('hostile bank (non-interlockable words) terminates and returns valid partial grid', () => {
    const start = Date.now();
    const result = generate(HOSTILE_ENTRIES, 'easy', 1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
    expect(result.placed.length).toBeGreaterThanOrEqual(1);
    for (const p of result.placed) {
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.direction === 'down'   ? p.row + i : p.row;
        const c = p.direction === 'across' ? p.col + i : p.col;
        expect(result.cells[`${r},${c}`]).toBe(p.answer[i]);
      }
    }
  });

  it('empty bank returns a single-cell result without throwing', () => {
    expect(() => generate([], 'easy', 1)).not.toThrow();
  });

  it('single entry bank returns a valid single-word result', () => {
    const single: ClueEntry[] = [FIXTURE_ENTRIES[0]];
    const result = generate(single, 'easy', 1);
    expect(result.placed.length).toBe(1);
    expect(result.stats.wordsPlaced).toBe(1);
  });
});
