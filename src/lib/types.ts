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
 * The generation algorithm (not yet implemented) produces this.
 */
export interface CrosswordGrid {
  rows: number;
  cols: number;
  words: GridWord[];
}
