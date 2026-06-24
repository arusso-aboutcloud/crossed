import type { ClueBank, ClueEntry, Difficulty } from './types';
import rawBank from '../data/bank.json';

const bank = rawBank as ClueBank;

/** Return all entries from the loaded bank. */
export function getAllEntries(): ClueEntry[] {
  return bank.entries;
}

/** Return entries filtered by topic tag. */
export function getEntriesByTopic(topic: string): ClueEntry[] {
  return bank.entries.filter((e) => e.topic === topic);
}

/** Return only current-era entries. */
export function getCurrentEntries(): ClueEntry[] {
  return bank.entries.filter((e) => e.era === 'current');
}

/** Return only legacy-era entries. */
export function getLegacyEntries(): ClueEntry[] {
  return bank.entries.filter((e) => e.era === 'legacy');
}

/**
 * Extract the clue string for a given entry and difficulty.
 * The answer word never changes across difficulties - only the clue string does.
 */
export function getClue(entry: ClueEntry, difficulty: Difficulty): string {
  return entry.clues[difficulty];
}

/**
 * Validate that every entry in the bank meets the structural contract.
 * Throws if any entry is malformed. Call during dev to catch authoring errors.
 */
export function validateBank(): void {
  const errors: string[] = [];

  for (const entry of bank.entries) {
    if (!entry.id || !/^[a-z0-9-]+$/.test(entry.id)) {
      errors.push(`${entry.id}: id must be lowercase ASCII hyphenated slug`);
    }
    if (!entry.answer || !/^[A-Z]+$/.test(entry.answer)) {
      errors.push(`${entry.id}: answer must be uppercase A-Z only, got "${entry.answer}"`);
    }
    const levels: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
    for (const level of levels) {
      if (!entry.clues[level] || entry.clues[level].trim() === '') {
        errors.push(`${entry.id}: missing clue for difficulty "${level}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error('Clue bank validation failed:\n' + errors.join('\n'));
  }
}
