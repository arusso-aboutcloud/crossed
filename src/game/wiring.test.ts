/**
 * Integration-level wiring tests: verify that generate() -> store -> UI data
 * path produces non-empty clue lists and correct clue text for all difficulties.
 * These tests cover the class of bug where clue data exists but is not wired
 * to the component (e.g., empty clue arrays, mismatched difficulty key).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { generate } from '$lib/generator';
import { getAllEntries } from '$lib/bank';
import {
  newPuzzle, puzzle, exitToMenu, checkWin, countWordsSolved,
} from './store';
import type { Difficulty, ClueLine } from '$lib/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
const TEST_SEEDS = [42, 0, 999, 12345, 2147483647];

describe('generate -> clue assembly wiring', () => {
  for (const diff of DIFFICULTIES) {
    describe(diff, () => {
      it('produces non-empty across AND down clue lists', () => {
        const entries = getAllEntries();
        let acrossFound = false;
        let downFound = false;
        for (const seed of TEST_SEEDS) {
          const result = generate(entries, diff, seed);
          if (result.clues.across.length > 0) acrossFound = true;
          if (result.clues.down.length > 0) downFound = true;
        }
        expect(acrossFound, `${diff}: expected at least one seed to produce across clues`).toBe(true);
        expect(downFound, `${diff}: expected at least one seed to produce down clues`).toBe(true);
      });

      it('every clue line has a non-empty clue string for this difficulty', () => {
        const entries = getAllEntries();
        for (const seed of [42, 999]) {
          const result = generate(entries, diff, seed);
          const allClues: ClueLine[] = [...result.clues.across, ...result.clues.down];
          expect(allClues.length, `${diff} seed=${seed}: no clue lines produced`).toBeGreaterThan(0);
          for (const cl of allClues) {
            expect(cl.clue.length, `${diff} seed=${seed}: empty clue string for ${cl.entryId}`).toBeGreaterThan(0);
          }
        }
      });

      it('every clue string matches the bank entry clues[difficulty]', () => {
        const entries = getAllEntries();
        const entryMap = new Map(entries.map((e) => [e.id, e]));
        const result = generate(entries, diff, 42);
        for (const cl of [...result.clues.across, ...result.clues.down]) {
          const entry = entryMap.get(cl.entryId);
          expect(entry, `no bank entry found for clue entryId="${cl.entryId}"`).toBeDefined();
          expect(cl.clue).toBe(entry!.clues[diff]);
        }
      });
    });
  }
});

describe('store -> puzzle wiring', () => {
  beforeEach(() => { exitToMenu(); });

  for (const diff of DIFFICULTIES) {
    it(`newPuzzle('${diff}') sets a puzzle with non-empty clue lists`, () => {
      newPuzzle(diff);
      const puz = get(puzzle);
      expect(puz, 'puzzle should be set after newPuzzle').not.toBeNull();
      expect(
        puz!.clues.across.length + puz!.clues.down.length,
        `${diff}: expected non-zero total clue lines`,
      ).toBeGreaterThan(0);
    });

    it(`newPuzzle('${diff}') puzzle cells match placed words`, () => {
      newPuzzle(diff);
      const puz = get(puzzle)!;
      for (const p of puz.placed) {
        for (let i = 0; i < p.answer.length; i++) {
          const r = p.direction === 'down' ? p.row + i : p.row;
          const c = p.direction === 'across' ? p.col + i : p.col;
          expect(puz.cells[`${r},${c}`]).toBe(p.answer[i]);
        }
      }
    });
  }
});

describe('board model: enterable cells and win detection', () => {
  beforeEach(() => { exitToMenu(); });

  it('after newPuzzle, each placed-word cell exists in puz.cells', () => {
    newPuzzle('easy');
    const puz = get(puzzle)!;
    const enterable = new Set(Object.keys(puz.cells));
    for (const p of puz.placed) {
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.direction === 'down' ? p.row + i : p.row;
        const c = p.direction === 'across' ? p.col + i : p.col;
        expect(enterable.has(`${r},${c}`), `cell ${r},${c} should be in cells map`).toBe(true);
      }
    }
  });

  it('checkWin returns true when entries match all cells', () => {
    newPuzzle('easy');
    const puz = get(puzzle)!;
    const correctEntries = { ...puz.cells };
    expect(checkWin(puz, correctEntries)).toBe(true);
  });

  it('checkWin returns false when one letter is wrong', () => {
    newPuzzle('easy');
    const puz = get(puzzle)!;
    const ents = { ...puz.cells };
    const firstKey = Object.keys(ents)[0];
    const correct = ents[firstKey];
    ents[firstKey] = correct === 'Z' ? 'A' : 'Z';
    expect(checkWin(puz, ents)).toBe(false);
  });

  it('countWordsSolved returns placed.length when all correct', () => {
    newPuzzle('easy');
    const puz = get(puzzle)!;
    const correct = { ...puz.cells };
    expect(countWordsSolved(puz, correct)).toBe(puz.placed.length);
  });

  it('countWordsSolved returns 0 when entries is empty', () => {
    newPuzzle('easy');
    const puz = get(puzzle)!;
    expect(countWordsSolved(puz, {})).toBe(0);
  });
});
