// Formation definitions for the summer-reskin WebGL background.
// Each formation is a list of grid slots { col, row, color } on a local grid.
// The scheduler centers the grid in world space before assigning cube positions.
// No external assets - all geometry generated in code.

export interface FormationSlot {
  col: number;
  row: number;
  color: string;
}

export interface Formation {
  id: string;
  slots: FormationSlot[];
}

// Formation 1: Microsoft four-color abstract homage.
// 2x2 arrangement of 2x2 blocks (total 4x4 grid = 16 cubes).
// Top-left red, top-right green, bottom-left blue, bottom-right yellow.
// This is an abstract, transient, rotating homage - not a frozen logo lockup.
// Cubes visibly rotate throughout the hold phase.
const FOUR_COLOR: Formation = {
  id: 'four-color',
  slots: [
    // Top-left 2x2 block - red
    { col: 0, row: 0, color: '#f25022' },
    { col: 1, row: 0, color: '#f25022' },
    { col: 0, row: 1, color: '#f25022' },
    { col: 1, row: 1, color: '#f25022' },
    // Top-right 2x2 block - green
    { col: 3, row: 0, color: '#7fba00' },
    { col: 4, row: 0, color: '#7fba00' },
    { col: 3, row: 1, color: '#7fba00' },
    { col: 4, row: 1, color: '#7fba00' },
    // Bottom-left 2x2 block - blue
    { col: 0, row: 3, color: '#00a4ef' },
    { col: 1, row: 3, color: '#00a4ef' },
    { col: 0, row: 4, color: '#00a4ef' },
    { col: 1, row: 4, color: '#00a4ef' },
    // Bottom-right 2x2 block - yellow
    { col: 3, row: 3, color: '#ffb900' },
    { col: 4, row: 3, color: '#ffb900' },
    { col: 3, row: 4, color: '#ffb900' },
    { col: 4, row: 4, color: '#ffb900' },
  ],
};

// Formation 2: Pixel sun.
// 3x3 bright center plus 8 ray tips at compass + diagonal positions 2 steps out.
// About 17 cubes total.
const SUN: Formation = {
  id: 'sun',
  slots: [
    // 3x3 center (bright yellow)
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 3, row: 2, color: '#fbbf24' },
    { col: 4, row: 2, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 3, row: 3, color: '#fbbf24' },
    { col: 4, row: 3, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 3, row: 4, color: '#fbbf24' },
    { col: 4, row: 4, color: '#fbbf24' },
    // 8 ray tips at compass + diagonal positions (lighter yellow)
    { col: 3, row: 0, color: '#fcd34d' }, // north
    { col: 3, row: 6, color: '#fcd34d' }, // south
    { col: 0, row: 3, color: '#fcd34d' }, // west
    { col: 6, row: 3, color: '#fcd34d' }, // east
    { col: 1, row: 1, color: '#fcd34d' }, // NW diagonal
    { col: 5, row: 1, color: '#fcd34d' }, // NE diagonal
    { col: 1, row: 5, color: '#fcd34d' }, // SW diagonal
    { col: 5, row: 5, color: '#fcd34d' }, // SE diagonal
  ],
};

// Formation 3: Cocktail / martini glass pixel outline in summer teal.
// V-shape top, stem, base. About 16 cubes.
const COCKTAIL: Formation = {
  id: 'cocktail',
  slots: [
    // Rim - top row
    { col: 0, row: 0, color: '#0d9488' },
    { col: 1, row: 0, color: '#0d9488' },
    { col: 2, row: 0, color: '#0d9488' },
    { col: 3, row: 0, color: '#0d9488' },
    { col: 4, row: 0, color: '#0d9488' },
    { col: 5, row: 0, color: '#0d9488' },
    // V sides converging inward
    { col: 1, row: 1, color: '#0d9488' },
    { col: 4, row: 1, color: '#0d9488' },
    { col: 2, row: 2, color: '#0d9488' },
    { col: 3, row: 2, color: '#0d9488' },
    // Stem
    { col: 2, row: 3, color: '#0d9488' },
    { col: 3, row: 3, color: '#0d9488' },
    { col: 2, row: 4, color: '#0d9488' },
    { col: 3, row: 4, color: '#0d9488' },
    // Base
    { col: 1, row: 5, color: '#0d9488' },
    { col: 2, row: 5, color: '#0d9488' },
    { col: 3, row: 5, color: '#0d9488' },
    { col: 4, row: 5, color: '#0d9488' },
  ],
};

// Formation 4: Watermelon slice.
// D-shape: curved green rind on top, red interior, a few black seeds.
// About 20 cubes.
const WATERMELON: Formation = {
  id: 'watermelon',
  slots: [
    // Top arc rind (green)
    { col: 2, row: 0, color: '#16a34a' },
    { col: 3, row: 0, color: '#16a34a' },
    { col: 4, row: 0, color: '#16a34a' },
    { col: 1, row: 1, color: '#16a34a' },
    { col: 5, row: 1, color: '#16a34a' },
    { col: 0, row: 2, color: '#16a34a' },
    { col: 6, row: 2, color: '#16a34a' },
    // Red interior
    { col: 2, row: 1, color: '#ef4444' },
    { col: 3, row: 1, color: '#ef4444' },
    { col: 4, row: 1, color: '#ef4444' },
    { col: 1, row: 2, color: '#ef4444' },
    { col: 2, row: 2, color: '#ef4444' },
    { col: 3, row: 2, color: '#ef4444' },
    { col: 4, row: 2, color: '#ef4444' },
    { col: 5, row: 2, color: '#ef4444' },
    // Flat base (green)
    { col: 0, row: 3, color: '#16a34a' },
    { col: 1, row: 3, color: '#16a34a' },
    { col: 2, row: 3, color: '#16a34a' },
    { col: 3, row: 3, color: '#16a34a' },
    { col: 4, row: 3, color: '#16a34a' },
    { col: 5, row: 3, color: '#16a34a' },
    { col: 6, row: 3, color: '#16a34a' },
    // Seeds (dark)
    { col: 2, row: 2, color: '#1a1a1a' }, // overrides red at that slot - seed
    { col: 4, row: 2, color: '#1a1a1a' }, // overrides red at that slot - seed
    { col: 3, row: 1, color: '#1a1a1a' }, // overrides red at that slot - seed
  ],
};

// Formation 5: Lemon.
// Oval/rounded yellow shape with a small green stem.
// About 15 cubes.
const LEMON: Formation = {
  id: 'lemon',
  slots: [
    // Green stem
    { col: 3, row: 0, color: '#86efac' },
    // Top arc
    { col: 2, row: 1, color: '#fde047' },
    { col: 3, row: 1, color: '#fde047' },
    { col: 4, row: 1, color: '#fde047' },
    // Middle body
    { col: 1, row: 2, color: '#fde047' },
    { col: 2, row: 2, color: '#fde047' },
    { col: 3, row: 2, color: '#fde047' },
    { col: 4, row: 2, color: '#fde047' },
    { col: 5, row: 2, color: '#fde047' },
    { col: 1, row: 3, color: '#fde047' },
    { col: 2, row: 3, color: '#fde047' },
    { col: 3, row: 3, color: '#fde047' },
    { col: 4, row: 3, color: '#fde047' },
    { col: 5, row: 3, color: '#fde047' },
    // Bottom arc
    { col: 2, row: 4, color: '#fde047' },
    { col: 3, row: 4, color: '#fde047' },
    { col: 4, row: 4, color: '#fde047' },
    // Tip nub (pointed lemon end)
    { col: 5, row: 4, color: '#fde047' },
  ],
};

// Deduplicate slots: if two entries share the same col/row, the later one wins.
function dedupeSlots(slots: FormationSlot[]): FormationSlot[] {
  const map = new Map<string, FormationSlot>();
  for (const s of slots) {
    map.set(`${s.col},${s.row}`, s);
  }
  return Array.from(map.values());
}

export const FORMATIONS: Formation[] = [
  { ...FOUR_COLOR, slots: dedupeSlots(FOUR_COLOR.slots) },
  { ...SUN,        slots: dedupeSlots(SUN.slots) },
  { ...COCKTAIL,   slots: dedupeSlots(COCKTAIL.slots) },
  { ...WATERMELON, slots: dedupeSlots(WATERMELON.slots) },
  { ...LEMON,      slots: dedupeSlots(LEMON.slots) },
];
