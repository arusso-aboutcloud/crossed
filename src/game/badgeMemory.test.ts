import { describe, it, expect, beforeEach } from 'vitest';
import { createBadgeMemory } from './badgeMemory';
import type { SimpleStorage } from './badgeMemory';

// In-memory stub that mimics the localStorage API.
function makeMemoryStorage(): SimpleStorage {
  const store: Record<string, string> = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
  };
}

// Stub that always throws, simulating storage disabled (private mode, etc.).
function makeThrowingStorage(): SimpleStorage {
  return {
    getItem: () => { throw new Error('storage disabled'); },
    setItem: () => { throw new Error('storage disabled'); },
    removeItem: () => { throw new Error('storage disabled'); },
  };
}

describe('createBadgeMemory - basic behavior', () => {
  let storage: SimpleStorage;
  beforeEach(() => { storage = makeMemoryStorage(); });

  it('starts with no earned badges', () => {
    const mem = createBadgeMemory(storage);
    expect(mem.hasEarned('easy')).toBe(false);
    expect(mem.hasEarned('medium')).toBe(false);
    expect(mem.hasEarned('hard')).toBe(false);
    expect(mem.hasEarned('pro')).toBe(false);
  });

  it('returns earned after markEarned', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('easy');
    expect(mem.hasEarned('easy')).toBe(true);
  });

  it('does not affect other tiers when one is marked', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('medium');
    expect(mem.hasEarned('easy')).toBe(false);
    expect(mem.hasEarned('hard')).toBe(false);
    expect(mem.hasEarned('pro')).toBe(false);
  });

  it('can mark all four tiers independently', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('easy');
    mem.markEarned('medium');
    mem.markEarned('hard');
    mem.markEarned('pro');
    expect(mem.hasEarned('easy')).toBe(true);
    expect(mem.hasEarned('medium')).toBe(true);
    expect(mem.hasEarned('hard')).toBe(true);
    expect(mem.hasEarned('pro')).toBe(true);
  });

  it('stores an ISO date string on first earn', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('hard');
    const record = mem.getAll();
    expect(record.hard?.firstEarnedDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('does not overwrite firstEarnedDate on repeated markEarned', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('pro');
    const first = mem.getAll().pro?.firstEarnedDate;
    mem.markEarned('pro');
    const second = mem.getAll().pro?.firstEarnedDate;
    expect(first).toBe(second);
  });

  it('clearAll removes all earned badges', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('easy');
    mem.markEarned('hard');
    mem.clearAll();
    expect(mem.hasEarned('easy')).toBe(false);
    expect(mem.hasEarned('hard')).toBe(false);
  });

  it('getAll returns all earned entries', () => {
    const mem = createBadgeMemory(storage);
    mem.markEarned('easy');
    mem.markEarned('pro');
    const record = mem.getAll();
    expect(record.easy).toBeTruthy();
    expect(record.pro).toBeTruthy();
    expect(record.medium).toBeUndefined();
    expect(record.hard).toBeUndefined();
  });
});

describe('createBadgeMemory - repeat-win detection', () => {
  it('hasEarned is false before first mark and true after', () => {
    const storage = makeMemoryStorage();
    const mem = createBadgeMemory(storage);
    const wasEarned = mem.hasEarned('easy');
    mem.markEarned('easy');
    const nowEarned = mem.hasEarned('easy');
    expect(wasEarned).toBe(false);
    expect(nowEarned).toBe(true);
  });

  it('persists across separate BadgeMemory instances sharing the same storage', () => {
    const storage = makeMemoryStorage();
    const mem1 = createBadgeMemory(storage);
    mem1.markEarned('medium');
    const mem2 = createBadgeMemory(storage);
    expect(mem2.hasEarned('medium')).toBe(true);
  });
});

describe('createBadgeMemory - storage unavailable', () => {
  it('hasEarned returns false when storage throws', () => {
    const mem = createBadgeMemory(makeThrowingStorage());
    expect(mem.hasEarned('easy')).toBe(false);
  });

  it('markEarned does not throw when storage throws', () => {
    const mem = createBadgeMemory(makeThrowingStorage());
    expect(() => mem.markEarned('easy')).not.toThrow();
  });

  it('clearAll does not throw when storage throws', () => {
    const mem = createBadgeMemory(makeThrowingStorage());
    expect(() => mem.clearAll()).not.toThrow();
  });

  it('getAll returns empty record when storage throws', () => {
    const mem = createBadgeMemory(makeThrowingStorage());
    expect(mem.getAll()).toEqual({});
  });
});

describe('createBadgeMemory - corrupted storage', () => {
  it('handles non-JSON data gracefully', () => {
    const storage = makeMemoryStorage();
    storage.setItem('crossed_earned_badges', '{{not valid json}}');
    const mem = createBadgeMemory(storage);
    expect(mem.hasEarned('easy')).toBe(false);
    expect(() => mem.markEarned('easy')).not.toThrow();
  });
});
