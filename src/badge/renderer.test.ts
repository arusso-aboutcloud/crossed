import { describe, it, expect } from 'vitest';
import {
  getBadgeSpec, TIER_SPECS, formatBadgeTime, formatBadgeDate,
  BADGE_W, BADGE_H,
} from './renderer';
import type { Difficulty } from '$lib/types';

describe('getBadgeSpec', () => {
  it('easy maps to green/completed tier', () => {
    const s = getBadgeSpec('easy');
    expect(s.displayName).toBe('EASY');
    expect(s.stars).toBe(1);
  });

  it('medium maps to blue/accomplished tier', () => {
    const s = getBadgeSpec('medium');
    expect(s.displayName).toBe('MEDIUM');
    expect(s.stars).toBe(2);
  });

  it('hard maps to purple/mastered tier', () => {
    const s = getBadgeSpec('hard');
    expect(s.displayName).toBe('HARD');
    expect(s.stars).toBe(3);
  });

  it('pro maps to gold/legendary tier labeled EXPERT', () => {
    const s = getBadgeSpec('pro');
    expect(s.displayName).toBe('EXPERT');
    expect(s.stars).toBe(4);
  });

  it('star count strictly escalates with difficulty', () => {
    const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
    const counts = diffs.map((d) => getBadgeSpec(d).stars);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThan(counts[i - 1]);
    }
  });

  it('border complexity escalates with difficulty', () => {
    expect(getBadgeSpec('easy').borderLines).toBeLessThan(getBadgeSpec('medium').borderLines);
    expect(getBadgeSpec('medium').borderLines).toBeLessThan(getBadgeSpec('hard').borderLines);
    expect(getBadgeSpec('hard').borderLines).toBeLessThan(getBadgeSpec('pro').borderLines);
  });
});

describe('TIER_SPECS', () => {
  const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];

  it('all specs have non-empty accent color', () => {
    for (const d of diffs) expect(TIER_SPECS[d].accentColor).toBeTruthy();
  });

  it('all specs have distinct accent colors', () => {
    const accents = diffs.map((d) => TIER_SPECS[d].accentColor);
    expect(new Set(accents).size).toBe(4);
  });

  it('all specs have distinct shield background pairs', () => {
    const bgs = diffs.map((d) => TIER_SPECS[d].shieldBg1 + TIER_SPECS[d].shieldBg2);
    expect(new Set(bgs).size).toBe(4);
  });

  it('all display names are unique', () => {
    const names = diffs.map((d) => TIER_SPECS[d].displayName);
    expect(new Set(names).size).toBe(4);
  });

  it('all taglines are unique', () => {
    const tags = diffs.map((d) => TIER_SPECS[d].tagline);
    expect(new Set(tags).size).toBe(4);
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
    const d = new Date(2026, 5, 25);
    expect(formatBadgeDate(d)).toBe('Jun 25, 2026');
  });

  it('formats January correctly', () => {
    const d = new Date(2026, 0, 1);
    expect(formatBadgeDate(d)).toBe('Jan 1, 2026');
  });

  it('formats December correctly', () => {
    const d = new Date(2025, 11, 31);
    expect(formatBadgeDate(d)).toBe('Dec 31, 2025');
  });

  it('includes the year', () => {
    expect(formatBadgeDate(new Date())).toMatch(/\d{4}/);
  });
});

describe('badge dimensions', () => {
  it('width is 630 (portrait badge)', () => {
    expect(BADGE_W).toBe(630);
  });

  it('height is 840 (3:4 aspect)', () => {
    expect(BADGE_H).toBe(840);
  });
});
