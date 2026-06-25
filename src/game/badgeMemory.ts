import type { Difficulty } from '$lib/types';

const STORAGE_KEY = 'crossed_earned_badges';

export interface EarnedEntry {
  firstEarnedDate: string;  // ISO 8601 date string
}

export type EarnedRecord = Partial<Record<Difficulty, EarnedEntry>>;

// Minimal interface so the real localStorage and a test stub are interchangeable.
export interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface BadgeMemory {
  getAll(): EarnedRecord;
  hasEarned(difficulty: Difficulty): boolean;
  markEarned(difficulty: Difficulty): void;
  clearAll(): void;
}

// Factory - takes injectable storage for testability.
export function createBadgeMemory(storage: SimpleStorage): BadgeMemory {
  function load(): EarnedRecord {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as EarnedRecord;
    } catch {
      return {};
    }
  }

  function save(record: EarnedRecord): void {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Storage quota exceeded or disabled - degrade silently.
    }
  }

  return {
    getAll(): EarnedRecord {
      return load();
    },

    hasEarned(difficulty: Difficulty): boolean {
      return !!load()[difficulty];
    },

    markEarned(difficulty: Difficulty): void {
      const record = load();
      if (!record[difficulty]) {
        record[difficulty] = { firstEarnedDate: new Date().toISOString() };
        save(record);
      }
    },

    clearAll(): void {
      try {
        storage.removeItem(STORAGE_KEY);
      } catch {
        // Degrade silently.
      }
    },
  };
}

// ---------- module-level helpers that use the real window.localStorage ----------
// Each wraps in try/catch so a storage failure (private mode, etc.) degrades
// silently to treating every win as new.

function getLiveMemory(): BadgeMemory | null {
  try {
    return createBadgeMemory(localStorage);
  } catch {
    return null;
  }
}

export function hasEarned(difficulty: Difficulty): boolean {
  return getLiveMemory()?.hasEarned(difficulty) ?? false;
}

export function markEarned(difficulty: Difficulty): void {
  getLiveMemory()?.markEarned(difficulty);
}

export function clearProgress(): void {
  getLiveMemory()?.clearAll();
}
