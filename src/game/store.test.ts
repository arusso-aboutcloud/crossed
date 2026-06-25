import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  gamePhase, puzzle, entries, winResult,
  checkWin, countWordsSolved, newPuzzle, exitToMenu, triggerWin
} from './store';
import type { GeneratorResult, WinResult } from '$lib/types';
import { generate } from '$lib/generator';
import { FIXTURE_ENTRIES } from '$lib/generator.fixture';

function makePuzzle(): GeneratorResult {
  return generate(FIXTURE_ENTRIES, 'easy', 42);
}

describe('checkWin', () => {
  it('returns true when all cells correct', () => {
    const puz = makePuzzle();
    expect(checkWin(puz, { ...puz.cells })).toBe(true);
  });

  it('returns false when a cell is wrong', () => {
    const puz = makePuzzle();
    const ents = { ...puz.cells };
    const firstKey = Object.keys(puz.cells)[0];
    ents[firstKey] = 'Z';
    expect(checkWin(puz, ents)).toBe(false);
  });

  it('returns false when a cell is missing', () => {
    const puz = makePuzzle();
    const ents: Record<string, string> = {};
    expect(checkWin(puz, ents)).toBe(false);
  });
});

describe('countWordsSolved', () => {
  it('returns 0 when no entries', () => {
    const puz = makePuzzle();
    expect(countWordsSolved(puz, {})).toBe(0);
  });

  it('returns total placed when all correct', () => {
    const puz = makePuzzle();
    expect(countWordsSolved(puz, { ...puz.cells })).toBe(puz.placed.length);
  });
});

describe('state transitions', () => {
  beforeEach(() => {
    exitToMenu();
  });

  it('newPuzzle sets phase to playing', () => {
    newPuzzle('easy');
    expect(get(gamePhase)).toBe('playing');
  });

  it('newPuzzle sets a non-null puzzle', () => {
    newPuzzle('easy');
    expect(get(puzzle)).not.toBeNull();
  });

  it('exitToMenu sets phase to menu', () => {
    newPuzzle('easy');
    exitToMenu();
    expect(get(gamePhase)).toBe('menu');
  });

  it('exitToMenu clears puzzle', () => {
    newPuzzle('easy');
    exitToMenu();
    expect(get(puzzle)).toBeNull();
  });

  it('triggerWin sets phase to win', () => {
    newPuzzle('easy');
    const result: WinResult = {
      difficulty: 'easy', elapsedSeconds: 60,
      wordsPlaced: 5, wordsSolved: 5, totalCells: 20, seed: 42
    };
    triggerWin(result);
    expect(get(gamePhase)).toBe('win');
  });

  it('triggerWin sets winResult', () => {
    newPuzzle('easy');
    const result: WinResult = {
      difficulty: 'easy', elapsedSeconds: 60,
      wordsPlaced: 5, wordsSolved: 5, totalCells: 20, seed: 42
    };
    triggerWin(result);
    expect(get(winResult)).toEqual(result);
  });
});
