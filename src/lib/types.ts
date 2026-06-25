/**
 * Difficulty levels available in the game.
 *
 * Clue intent per level:
 *   easy   - plain recognition or definition.
 *   medium - applied or functional description.
 *   hard   - precise, indirect, or acronym-driven.
 *   pro    - cryptic, scenario-based, or deep edge knowledge.
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'pro';

/**
 * Era tag on a clue entry.
 *   current - active, shipping product or feature.
 *   legacy  - retired, renamed, or memorabilia terminology.
 */
export type Era = 'current' | 'legacy';

/**
 * Canonical topic tags. Every entry must use exactly one of these.
 */
export type Topic =
  | 'defender'
  | 'defender-cloud-apps'
  | 'entra'
  | 'intune'
  | 'asr'
  | 'sentinel'
  | 'general';

/**
 * A single crossword concept with one answer word and one clue per difficulty.
 * All four clue variants are required - difficulty selects the clue string,
 * never the concept pool.
 */
export interface ClueEntry {
  /** Stable slug: lowercase, ASCII, hyphenated. Never changes after creation. */
  id: string;
  /** Answer used in the grid. Uppercase A-Z only, no spaces, no hyphens. */
  answer: string;
  /** Human-readable label shown on the results screen. ASCII only. */
  display: string;
  /** Topic tag from the canonical list. */
  topic: Topic;
  /** Era of the concept. */
  era: Era;
  /** One clue string per difficulty level. ASCII only, crossword-clue length. */
  clues: {
    easy: string;
    medium: string;
    hard: string;
    pro: string;
  };
}

/**
 * Root shape of bank.json.
 */
export interface ClueBank {
  /** Canonical topic tag list - must match the Topic union above. */
  topics: Topic[];
  entries: ClueEntry[];
}

/**
 * A placed word in the crossword grid.
 */
export interface GridWord {
  id: string;
  answer: string;
  clue: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  number: number;
}

/**
 * Full grid model passed to the game renderer.
 */
export interface CrosswordGrid {
  rows: number;
  cols: number;
  words: GridWord[];
}

// ---------------------------------------------------------------------------
// Generator types
// ---------------------------------------------------------------------------

/** One cell in the working grid. */
export interface Cell {
  letter: string;
  /** word ids that pass through this cell */
  wordIds: string[];
}

/** A word candidate before it is committed to the grid. */
export interface PlacedWord {
  entryId: string;
  answer: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  /** number of letters shared with already-placed words at placement time */
  crossings: number;
}

/** Per-difficulty size and word-count tunables. */
export interface DifficultyConfig {
  minDim: number;
  maxDim: number;
  targetWords: number;
}

/** Assembled clue item returned in the result. */
export interface ClueLine {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  entryId: string;
  row: number;
  col: number;
  length: number;
}

/** Full result returned by the generator. */
export interface GeneratorResult {
  seed: number;
  difficulty: Difficulty;
  rows: number;
  cols: number;
  /** Sparse map: key is "row,col", value is the letter. */
  cells: Record<string, string>;
  placed: PlacedWord[];
  clues: {
    across: ClueLine[];
    down: ClueLine[];
  };
  stats: {
    wordsPlaced: number;
    targetWords: number;
    crossings: number;
    generationMs: number;
  };
}

export type GamePhase = 'menu' | 'difficulty' | 'playing' | 'paused' | 'win';

// Shape consumed by the badge task. Field names are stable.
export interface WinResult {
  difficulty: Difficulty;
  elapsedSeconds: number;
  wordsPlaced: number;
  wordsSolved: number;
  totalCells: number;
  seed: number;
}
