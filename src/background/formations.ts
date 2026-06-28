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

// Formation 1: Microsoft four-color logo homage.
// 4x4 grid: four 2x2 quadrants with a 1-col/row gap between them.
// Top-left red, top-right green, bottom-left blue, bottom-right yellow.
// 16 colored cubes in a recognizable MS logo formation.
const FOUR_COLOR: Formation = {
  id: 'four-color',
  slots: [
    // Top-left 2x2 block - red (#f25022)
    { col: 0, row: 0, color: '#f25022' },
    { col: 1, row: 0, color: '#f25022' },
    { col: 0, row: 1, color: '#f25022' },
    { col: 1, row: 1, color: '#f25022' },
    // Top-right 2x2 block - green (#7fba00)
    { col: 3, row: 0, color: '#7fba00' },
    { col: 4, row: 0, color: '#7fba00' },
    { col: 3, row: 1, color: '#7fba00' },
    { col: 4, row: 1, color: '#7fba00' },
    // Bottom-left 2x2 block - blue (#00a4ef)
    { col: 0, row: 3, color: '#00a4ef' },
    { col: 1, row: 3, color: '#00a4ef' },
    { col: 0, row: 4, color: '#00a4ef' },
    { col: 1, row: 4, color: '#00a4ef' },
    // Bottom-right 2x2 block - yellow (#ffb900)
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

// Formation 3: Toucan bird - pixel art, about 25 cubes.
// Dark body, large colorful beak, white eye, teal wing accent, light belly.
const TOUCAN: Formation = {
  id: 'toucan',
  slots: [
    // Body (dark navy/black) - roughly 4 wide x 6 tall
    { col: 3, row: 0, color: '#1a1a2e' },
    { col: 4, row: 0, color: '#1a1a2e' },
    { col: 2, row: 1, color: '#1a1a2e' },
    { col: 3, row: 1, color: '#1a1a2e' },
    { col: 4, row: 1, color: '#1a1a2e' },
    { col: 2, row: 2, color: '#1a1a2e' },
    { col: 3, row: 2, color: '#0d9488' }, // teal wing highlight
    { col: 4, row: 2, color: '#1a1a2e' },
    { col: 2, row: 3, color: '#1a1a2e' },
    { col: 3, row: 3, color: '#f0fdf4' }, // light belly
    { col: 4, row: 3, color: '#f0fdf4' }, // light belly
    { col: 2, row: 4, color: '#1a1a2e' },
    { col: 3, row: 4, color: '#1a1a2e' },
    { col: 4, row: 4, color: '#1a1a2e' },
    { col: 3, row: 5, color: '#1a1a2e' },
    { col: 4, row: 5, color: '#1a1a2e' },
    // Eye (white) - upper right of body
    { col: 5, row: 0, color: '#ffffff' },
    // Beak (orange-yellow) - large triangular pointing right
    { col: 5, row: 1, color: '#f97316' },
    { col: 6, row: 1, color: '#f97316' },
    { col: 7, row: 1, color: '#fb923c' },
    { col: 5, row: 2, color: '#f97316' },
    { col: 6, row: 2, color: '#fbbf24' },
    { col: 5, row: 3, color: '#f97316' },
    // Feet (dark)
    { col: 3, row: 6, color: '#1a1a2e' },
    { col: 5, row: 6, color: '#1a1a2e' },
  ],
};

// Formation 4: Tropical cocktail - about 18 cubes.
// V-shape glass with bright pink drink, yellow straw, orange garnish.
const COCKTAIL: Formation = {
  id: 'cocktail',
  slots: [
    // Rim top row
    { col: 0, row: 0, color: '#ec4899' },
    { col: 1, row: 0, color: '#ec4899' },
    { col: 2, row: 0, color: '#ec4899' },
    { col: 3, row: 0, color: '#ec4899' },
    { col: 4, row: 0, color: '#ec4899' },
    { col: 5, row: 0, color: '#ec4899' },
    // Fruit garnish on rim
    { col: 5, row: 0, color: '#f97316' },
    // V-shape sides with drink inside
    { col: 1, row: 1, color: '#ec4899' },
    { col: 2, row: 1, color: '#f472b6' }, // lighter pink inside
    { col: 3, row: 1, color: '#f472b6' },
    { col: 4, row: 1, color: '#ec4899' },
    { col: 2, row: 2, color: '#ec4899' },
    { col: 3, row: 2, color: '#ec4899' },
    // Straw (yellow vertical)
    { col: 3, row: 0, color: '#fde047' },
    { col: 3, row: 1, color: '#fde047' },
    // Stem
    { col: 2, row: 3, color: '#0d9488' },
    { col: 3, row: 3, color: '#0d9488' },
    // Base
    { col: 1, row: 4, color: '#0d9488' },
    { col: 2, row: 4, color: '#0d9488' },
    { col: 3, row: 4, color: '#0d9488' },
    { col: 4, row: 4, color: '#0d9488' },
  ],
};

// Formation 5: Watermelon slice - D-shape, about 25 cubes.
// Outer green rind, red flesh interior, black seeds.
const WATERMELON: Formation = {
  id: 'watermelon',
  slots: [
    // Top arc rind (green outer)
    { col: 2, row: 0, color: '#16a34a' },
    { col: 3, row: 0, color: '#16a34a' },
    { col: 4, row: 0, color: '#16a34a' },
    { col: 5, row: 0, color: '#16a34a' },
    { col: 1, row: 1, color: '#16a34a' },
    { col: 6, row: 1, color: '#16a34a' },
    { col: 0, row: 2, color: '#16a34a' },
    { col: 7, row: 2, color: '#16a34a' },
    { col: 0, row: 3, color: '#16a34a' },
    { col: 7, row: 3, color: '#16a34a' },
    // Red interior flesh
    { col: 2, row: 1, color: '#ef4444' },
    { col: 3, row: 1, color: '#ef4444' },
    { col: 4, row: 1, color: '#ef4444' },
    { col: 5, row: 1, color: '#ef4444' },
    { col: 1, row: 2, color: '#ef4444' },
    { col: 2, row: 2, color: '#ef4444' },
    { col: 4, row: 2, color: '#ef4444' },
    { col: 5, row: 2, color: '#ef4444' },
    { col: 6, row: 2, color: '#ef4444' },
    { col: 1, row: 3, color: '#ef4444' },
    { col: 3, row: 3, color: '#ef4444' },
    { col: 5, row: 3, color: '#ef4444' },
    { col: 6, row: 3, color: '#ef4444' },
    // Seeds (dark)
    { col: 3, row: 2, color: '#1a1a1a' },
    { col: 2, row: 3, color: '#1a1a1a' },
    { col: 4, row: 3, color: '#1a1a1a' },
    // Flat base (green rind)
    { col: 0, row: 4, color: '#16a34a' },
    { col: 1, row: 4, color: '#16a34a' },
    { col: 2, row: 4, color: '#16a34a' },
    { col: 3, row: 4, color: '#16a34a' },
    { col: 4, row: 4, color: '#16a34a' },
    { col: 5, row: 4, color: '#16a34a' },
    { col: 6, row: 4, color: '#16a34a' },
    { col: 7, row: 4, color: '#16a34a' },
  ],
};

// Formation 6: Tropical fruit cluster - pineapple + mango, about 20 cubes.
// Pineapple: yellow rectangular body with green crown on top.
// Mango: orange-yellow oval beside it.
const TROPICAL: Formation = {
  id: 'tropical',
  slots: [
    // Pineapple crown (green)
    { col: 1, row: 0, color: '#16a34a' },
    { col: 2, row: 0, color: '#16a34a' },
    { col: 0, row: 1, color: '#16a34a' },
    { col: 3, row: 1, color: '#16a34a' },
    // Pineapple body (golden yellow)
    { col: 0, row: 2, color: '#fbbf24' },
    { col: 1, row: 2, color: '#fbbf24' },
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 3, row: 2, color: '#fbbf24' },
    { col: 0, row: 3, color: '#f59e0b' },
    { col: 1, row: 3, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 3, row: 3, color: '#f59e0b' },
    { col: 0, row: 4, color: '#fbbf24' },
    { col: 1, row: 4, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 3, row: 4, color: '#fbbf24' },
    { col: 1, row: 5, color: '#fbbf24' },
    { col: 2, row: 5, color: '#fbbf24' },
    // Mango (orange-yellow oval beside pineapple)
    { col: 5, row: 1, color: '#fb923c' },
    { col: 6, row: 1, color: '#fb923c' },
    { col: 4, row: 2, color: '#fb923c' },
    { col: 5, row: 2, color: '#f97316' },
    { col: 6, row: 2, color: '#fb923c' },
    { col: 7, row: 2, color: '#fb923c' },
    { col: 5, row: 3, color: '#fb923c' },
    { col: 6, row: 3, color: '#fb923c' },
    // Mango leaf stem
    { col: 6, row: 0, color: '#16a34a' },
  ],
};

// Formation 7: Ocean waves - sinusoidal row of cubes in ocean blue and white.
// Two layers form a wave pattern across ~8 columns using offset rows.
const WAVES: Formation = {
  id: 'waves',
  slots: (() => {
    const out: FormationSlot[] = [];
    const baseRow = 4;
    const colors = ['#0891b2', '#0e7490', '#ffffff', '#67e8f9'];
    for (let col = 0; col < 8; col++) {
      const rowOffset = Math.round(2 * Math.sin(col * 0.8));
      out.push({ col, row: baseRow + rowOffset, color: '#0891b2' });
      out.push({ col, row: baseRow + rowOffset - 1, color: colors[col % colors.length] });
      if (col % 2 === 0) {
        out.push({ col, row: baseRow + rowOffset + 1, color: '#ffffff' });
      }
    }
    return out;
  })(),
};

// Formation 8: Pixel palm tree - brown trunk with green leaf crown.
// Trunk: 2 cols wide x 5 rows tall in brown. Crown: diagonal green leaves.
const PALM: Formation = {
  id: 'palm',
  slots: [
    // Trunk (brown)
    { col: 4, row: 4, color: '#92400e' },
    { col: 5, row: 4, color: '#92400e' },
    { col: 4, row: 5, color: '#92400e' },
    { col: 5, row: 5, color: '#92400e' },
    { col: 4, row: 6, color: '#92400e' },
    { col: 5, row: 6, color: '#92400e' },
    { col: 4, row: 7, color: '#78350f' },
    { col: 5, row: 7, color: '#78350f' },
    { col: 4, row: 8, color: '#78350f' },
    { col: 5, row: 8, color: '#78350f' },
    // Crown - left sweeping leaves
    { col: 0, row: 2, color: '#16a34a' },
    { col: 1, row: 2, color: '#16a34a' },
    { col: 1, row: 3, color: '#16a34a' },
    { col: 2, row: 3, color: '#22c55e' },
    // Crown - right sweeping leaves
    { col: 7, row: 2, color: '#16a34a' },
    { col: 8, row: 2, color: '#16a34a' },
    { col: 7, row: 3, color: '#16a34a' },
    { col: 6, row: 3, color: '#22c55e' },
    // Crown - top leaves
    { col: 3, row: 1, color: '#16a34a' },
    { col: 4, row: 1, color: '#22c55e' },
    { col: 5, row: 1, color: '#22c55e' },
    { col: 6, row: 1, color: '#16a34a' },
    { col: 4, row: 0, color: '#4ade80' },
    { col: 5, row: 0, color: '#4ade80' },
    // Coconuts
    { col: 3, row: 3, color: '#92400e' },
    { col: 6, row: 3, color: '#92400e' },
  ],
};

// Formation 9: Beach umbrella - inverted V canopy with colored stripes + pole.
// Canopy spans ~15 cubes in alternating red/yellow/blue stripes. Pole: 3 cubes.
const BEACH_UMBRELLA: Formation = {
  id: 'beach-umbrella',
  slots: [
    // Canopy top point
    { col: 5, row: 0, color: '#ef4444' },
    // Canopy row 1
    { col: 4, row: 1, color: '#fbbf24' },
    { col: 5, row: 1, color: '#ef4444' },
    { col: 6, row: 1, color: '#3b82f6' },
    // Canopy row 2
    { col: 3, row: 2, color: '#fbbf24' },
    { col: 4, row: 2, color: '#ef4444' },
    { col: 5, row: 2, color: '#fbbf24' },
    { col: 6, row: 2, color: '#ef4444' },
    { col: 7, row: 2, color: '#3b82f6' },
    // Canopy row 3 (widest)
    { col: 1, row: 3, color: '#3b82f6' },
    { col: 2, row: 3, color: '#ef4444' },
    { col: 3, row: 3, color: '#fbbf24' },
    { col: 4, row: 3, color: '#3b82f6' },
    { col: 5, row: 3, color: '#ef4444' },
    { col: 6, row: 3, color: '#fbbf24' },
    { col: 7, row: 3, color: '#3b82f6' },
    { col: 8, row: 3, color: '#ef4444' },
    { col: 9, row: 3, color: '#fbbf24' },
    // Pole (brown/tan)
    { col: 5, row: 4, color: '#92400e' },
    { col: 5, row: 5, color: '#92400e' },
    { col: 5, row: 6, color: '#78350f' },
  ],
};

// Formation 10: Starburst - central gold cube with rays extending 8 directions.
// Center cube with 2-3 cube rays at N/NE/E/SE/S/SW/W/NW angles.
const STARBURST: Formation = {
  id: 'starburst',
  slots: [
    // Center 2x2 core
    { col: 5, row: 5, color: '#fbbf24' },
    { col: 6, row: 5, color: '#fbbf24' },
    { col: 5, row: 6, color: '#fbbf24' },
    { col: 6, row: 6, color: '#fbbf24' },
    // North ray
    { col: 5, row: 3, color: '#fde68a' },
    { col: 5, row: 4, color: '#fbbf24' },
    { col: 6, row: 4, color: '#fbbf24' },
    { col: 6, row: 3, color: '#fde68a' },
    // South ray
    { col: 5, row: 7, color: '#fbbf24' },
    { col: 5, row: 8, color: '#fde68a' },
    { col: 6, row: 7, color: '#fbbf24' },
    { col: 6, row: 8, color: '#fde68a' },
    // West ray
    { col: 3, row: 5, color: '#fbbf24' },
    { col: 4, row: 5, color: '#fbbf24' },
    { col: 3, row: 6, color: '#fde68a' },
    { col: 4, row: 6, color: '#fbbf24' },
    // East ray
    { col: 7, row: 5, color: '#fbbf24' },
    { col: 8, row: 5, color: '#fde68a' },
    { col: 7, row: 6, color: '#fbbf24' },
    { col: 8, row: 6, color: '#fde68a' },
    // NW diagonal
    { col: 3, row: 3, color: '#fde68a' },
    { col: 4, row: 4, color: '#fbbf24' },
    // NE diagonal
    { col: 8, row: 3, color: '#fde68a' },
    { col: 7, row: 4, color: '#fbbf24' },
    // SW diagonal
    { col: 3, row: 8, color: '#fde68a' },
    { col: 4, row: 7, color: '#fbbf24' },
    // SE diagonal
    { col: 8, row: 8, color: '#fde68a' },
    { col: 7, row: 7, color: '#fbbf24' },
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
  { ...FOUR_COLOR,     slots: dedupeSlots(FOUR_COLOR.slots) },
  { ...SUN,            slots: dedupeSlots(SUN.slots) },
  { ...TOUCAN,         slots: dedupeSlots(TOUCAN.slots) },
  { ...COCKTAIL,       slots: dedupeSlots(COCKTAIL.slots) },
  { ...WATERMELON,     slots: dedupeSlots(WATERMELON.slots) },
  { ...TROPICAL,       slots: dedupeSlots(TROPICAL.slots) },
  { ...WAVES,          slots: dedupeSlots(WAVES.slots) },
  { ...PALM,           slots: dedupeSlots(PALM.slots) },
  { ...BEACH_UMBRELLA, slots: dedupeSlots(BEACH_UMBRELLA.slots) },
  { ...STARBURST,      slots: dedupeSlots(STARBURST.slots) },
];
