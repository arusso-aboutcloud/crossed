import { describe, it, expect } from 'vitest';
import {
  getBadgeSpec, TIER_SPECS, formatBadgeTime, formatBadgeDate,
  BADGE_W, BADGE_H,
} from './renderer';
import type { Difficulty } from '$lib/types';

describe('getBadgeSpec', () => {
  it('returns the bronze spec for easy', () => {
    expect(getBadgeSpec('easy').material).toBe('BRONZE');
  });

  it('returns the silver spec for medium', () => {
    expect(getBadgeSpec('medium').material).toBe('SILVER');
  });

  it('returns the gold spec for hard', () => {
    expect(getBadgeSpec('hard').material).toBe('GOLD');
  });

  it('returns the platinum spec for pro', () => {
    expect(getBadgeSpec('pro').material).toBe('PLATINUM');
  });

  it('returns correct rarity label for each difficulty', () => {
    expect(getBadgeSpec('easy').rarityLabel).toBe('COMPLETED');
    expect(getBadgeSpec('medium').rarityLabel).toBe('ACCOMPLISHED');
    expect(getBadgeSpec('hard').rarityLabel).toBe('MASTERED');
    expect(getBadgeSpec('pro').rarityLabel).toBe('LEGENDARY');
  });

  it('each spec has a distinct material name', () => {
    const materials = (['easy', 'medium', 'hard', 'pro'] as Difficulty[]).map(
      (d) => getBadgeSpec(d).material
    );
    const unique = new Set(materials);
    expect(unique.size).toBe(4);
  });

  it('border complexity escalates with difficulty', () => {
    expect(getBadgeSpec('easy').borderLines).toBeLessThan(getBadgeSpec('medium').borderLines);
    expect(getBadgeSpec('medium').borderLines).toBeLessThan(getBadgeSpec('hard').borderLines);
    expect(getBadgeSpec('hard').borderLines).toBeLessThan(getBadgeSpec('pro').borderLines);
  });
});

describe('TIER_SPECS constant', () => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];

  it('all specs have non-empty accent color', () => {
    for (const d of difficulties) {
      expect(TIER_SPECS[d].accent).toBeTruthy();
    }
  });

  it('all specs have distinct accent colors', () => {
    const accents = difficulties.map((d) => TIER_SPECS[d].accent);
    expect(new Set(accents).size).toBe(4);
  });

  it('all specs have distinct background pairs', () => {
    const bgs = difficulties.map((d) => TIER_SPECS[d].bgA + TIER_SPECS[d].bgB);
    expect(new Set(bgs).size).toBe(4);
  });
});

describe('formatBadgeTime', () => {
  it('formats zero as 00:00', () => {
    expect(formatBadgeTime(0)).toBe('00:00');
  });

  it('formats 90 seconds as 01:30', () => {
    expect(formatBadgeTime(90)).toBe('01:30');
  });

  it('pads single-digit minutes and seconds', () => {
    expect(formatBadgeTime(65)).toBe('01:05');
  });

  it('handles large values', () => {
    expect(formatBadgeTime(3661)).toBe('61:01');
  });
});

describe('formatBadgeDate', () => {
  it('formats a known date correctly', () => {
    const d = new Date(2026, 5, 25); // June 25, 2026
    expect(formatBadgeDate(d)).toBe('Jun 25, 2026');
  });

  it('formats January', () => {
    const d = new Date(2026, 0, 1);
    expect(formatBadgeDate(d)).toBe('Jan 1, 2026');
  });

  it('formats December', () => {
    const d = new Date(2025, 11, 31);
    expect(formatBadgeDate(d)).toBe('Dec 31, 2025');
  });

  it('returns a string containing the year', () => {
    const result = formatBadgeDate(new Date());
    expect(result).toMatch(/\d{4}/);
  });
});

describe('badge dimensions', () => {
  it('has OG-standard width', () => {
    expect(BADGE_W).toBe(1200);
  });

  it('has OG-standard height', () => {
    expect(BADGE_H).toBe(630);
  });
});
