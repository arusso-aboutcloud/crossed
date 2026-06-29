import { describe, it, expect } from 'vitest';
import { FORMATIONS, FORMATION_SLOT_BUDGET } from './formations';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

describe('FORMATIONS - invariants', () => {
  it('exports at least one formation', () => {
    expect(FORMATIONS.length).toBeGreaterThan(0);
  });

  for (const f of FORMATIONS) {
    describe(`formation "${f.id}"`, () => {
      it('has a non-empty id', () => {
        expect(f.id).toBeTruthy();
        expect(typeof f.id).toBe('string');
      });

      it('has at least one slot', () => {
        expect(f.slots.length).toBeGreaterThan(0);
      });

      it(`stays within FORMATION_SLOT_BUDGET (${FORMATION_SLOT_BUDGET})`, () => {
        expect(f.slots.length).toBeLessThanOrEqual(FORMATION_SLOT_BUDGET);
      });

      it('has no duplicate (col, row) pairs after deduplication', () => {
        const seen = new Set<string>();
        for (const s of f.slots) {
          const key = `${s.col},${s.row}`;
          expect(seen.has(key), `duplicate slot ${key} in "${f.id}"`).toBe(false);
          seen.add(key);
        }
      });

      it('every slot has a valid 6-digit hex color', () => {
        for (const s of f.slots) {
          expect(HEX_RE.test(s.color), `"${s.color}" is not a valid hex color in "${f.id}"`).toBe(true);
        }
      });

      it('every slot has numeric col and row', () => {
        for (const s of f.slots) {
          expect(typeof s.col).toBe('number');
          expect(typeof s.row).toBe('number');
          expect(Number.isFinite(s.col)).toBe(true);
          expect(Number.isFinite(s.row)).toBe(true);
        }
      });
    });
  }
});

describe('FORMATION_SLOT_BUDGET', () => {
  it('is a positive integer below the WebGL cube pool COUNT (90)', () => {
    expect(FORMATION_SLOT_BUDGET).toBeGreaterThan(0);
    expect(FORMATION_SLOT_BUDGET).toBeLessThan(90);
    expect(Number.isInteger(FORMATION_SLOT_BUDGET)).toBe(true);
  });
});
