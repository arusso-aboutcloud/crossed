import { writable, get } from 'svelte/store';
import type { Difficulty, GeneratorResult, WinResult, GamePhase } from '$lib/types';
import { getAllEntries } from '$lib/bank';
import { generate } from '$lib/generator';

export type { GamePhase };
export type ActiveDir = 'across' | 'down';

export const gamePhase = writable<GamePhase>('menu');
export const difficulty = writable<Difficulty>('medium');
export const puzzle = writable<GeneratorResult | null>(null);
export const entries = writable<Record<string, string>>({});
export const focusKey = writable<string>('');
export const activeDir = writable<ActiveDir>('across');
export const elapsedSeconds = writable<number>(0);
export const soundEnabled = writable<boolean>(true);
export const bgEnabled = writable<boolean>(true);
export const winResult = writable<WinResult | null>(null);

let _timerInterval: ReturnType<typeof setInterval> | null = null;
let _startTime: number | null = null;

export function checkWin(puz: GeneratorResult, ents: Record<string, string>): boolean {
  return Object.entries(puz.cells).every(([k, v]) => ents[k] === v);
}

export function countWordsSolved(puz: GeneratorResult, ents: Record<string, string>): number {
  return puz.placed.filter((p) => {
    for (let i = 0; i < p.answer.length; i++) {
      const r = p.direction === 'down' ? p.row + i : p.row;
      const c = p.direction === 'across' ? p.col + i : p.col;
      if (ents[`${r},${c}`] !== p.answer[i]) return false;
    }
    return true;
  }).length;
}

export function newPuzzle(diff: Difficulty): void {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const result = generate(getAllEntries(), diff, seed);
  difficulty.set(diff);
  puzzle.set(result);
  entries.set({});
  focusKey.set('');
  activeDir.set('across');
  winResult.set(null);
  _startTime = Date.now();
  elapsedSeconds.set(0);
  if (_timerInterval) clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    if (_startTime !== null) {
      elapsedSeconds.set(Math.floor((Date.now() - _startTime) / 1000));
    }
  }, 1000);
  gamePhase.set('playing');
  if (get(soundEnabled)) {
    try {
      const snd = new Audio('/sounds/xp-startup.mp3');
      snd.volume = 0.7;
      snd.play().catch(() => {/* browser may block if no prior interaction */});
    } catch (_) {/* SSR or unsupported - ignore */}
  }
}

export function pauseGame(): void {
  gamePhase.set('paused');
}

export function resumeGame(): void {
  gamePhase.set('playing');
}

export function exitToMenu(): void {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  _startTime = null;
  gamePhase.set('menu');
  puzzle.set(null);
  entries.set({});
  focusKey.set('');
  winResult.set(null);
}

export function goToDifficulty(): void {
  gamePhase.set('difficulty');
}

export function triggerWin(result: WinResult): void {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  winResult.set(result);
  gamePhase.set('win');
}

// Placeholder - the badge task will replace this implementation
export function onWin(result: WinResult): void {
  console.log('onWin placeholder called', result);
}
