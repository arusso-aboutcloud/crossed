// Formation definitions for the summer-reskin WebGL background.
// Each formation is a list of grid slots { col, row, color } on a local grid.
// The scheduler centers the grid in world space before assigning cube positions.
// No external assets - all geometry generated in code.
//
// SLOT BUDGET: every formation must stay at or below FORMATION_SLOT_BUDGET slots
// after deduplication. background.ts allocates COUNT=90 cubes; keeping formations
// well below COUNT leaves enough bystanders to hide cleanly during a shape display.
// The guard test (formations.test.ts) enforces this at CI time.
export const FORMATION_SLOT_BUDGET = 60;

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

// Formation 11: Pineapple - separate from tropical cluster, about 25 cubes.
// Yellow rectangular body with green crown leaves and brown texture spots.
const PINEAPPLE: Formation = {
  id: 'pineapple',
  slots: [
    // Green crown leaves fanning upward
    { col: 0, row: 0, color: '#16a34a' }, // left leaf base
    { col: 1, row: 0, color: '#16a34a' }, // center crown trunk
    { col: 2, row: 0, color: '#16a34a' }, // right leaf base
    { col: 0, row: -1, color: '#16a34a' }, // left leaf tip
    { col: 1, row: -1, color: '#16a34a' }, // center leaf
    { col: 2, row: -1, color: '#16a34a' }, // right leaf tip
    { col: 1, row: -2, color: '#16a34a' }, // top center leaf tip
    // Yellow body - 3 wide x 6 tall
    { col: 0, row: 1, color: '#fbbf24' },
    { col: 1, row: 1, color: '#fbbf24' },
    { col: 2, row: 1, color: '#fbbf24' },
    { col: 0, row: 2, color: '#fbbf24' },
    { col: 1, row: 2, color: '#fbbf24' },
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 0, row: 3, color: '#fbbf24' },
    { col: 1, row: 3, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 0, row: 4, color: '#fbbf24' },
    { col: 1, row: 4, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 0, row: 5, color: '#fbbf24' },
    { col: 1, row: 5, color: '#fbbf24' },
    { col: 2, row: 5, color: '#fbbf24' },
    { col: 0, row: 6, color: '#fbbf24' },
    { col: 1, row: 6, color: '#fbbf24' },
    { col: 2, row: 6, color: '#fbbf24' },
    // Brown texture diagonal spots on body
    { col: 1, row: 2, color: '#92400e' },
    { col: 0, row: 4, color: '#92400e' },
    { col: 2, row: 3, color: '#92400e' },
  ],
};

// Formation 12: Beach ball - circular with colored vertical stripes, about 29 cubes.
// 5 stripe colors: red, blue, yellow, green, white arranged in vertical columns.
const BEACH_BALL: Formation = {
  id: 'beach-ball',
  slots: [
    // Col -3: blue, 4 rows
    { col: 0, row: 2, color: '#3b82f6' },
    { col: 0, row: 3, color: '#3b82f6' },
    { col: 0, row: 4, color: '#3b82f6' },
    { col: 0, row: 5, color: '#3b82f6' },
    // Col -2: red, 5 rows
    { col: 1, row: 1, color: '#ef4444' },
    { col: 1, row: 2, color: '#ef4444' },
    { col: 1, row: 3, color: '#ef4444' },
    { col: 1, row: 4, color: '#ef4444' },
    { col: 1, row: 5, color: '#ef4444' },
    // Col -1: yellow, 6 rows
    { col: 2, row: 1, color: '#fbbf24' },
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 2, row: 5, color: '#fbbf24' },
    { col: 2, row: 6, color: '#fbbf24' },
    // Col 0 (center): green, 7 rows
    { col: 3, row: 0, color: '#22c55e' },
    { col: 3, row: 1, color: '#22c55e' },
    { col: 3, row: 2, color: '#22c55e' },
    { col: 3, row: 3, color: '#22c55e' },
    { col: 3, row: 4, color: '#22c55e' },
    { col: 3, row: 5, color: '#22c55e' },
    { col: 3, row: 6, color: '#22c55e' },
    // Col 1: white, 6 rows
    { col: 4, row: 1, color: '#ffffff' },
    { col: 4, row: 2, color: '#ffffff' },
    { col: 4, row: 3, color: '#ffffff' },
    { col: 4, row: 4, color: '#ffffff' },
    { col: 4, row: 5, color: '#ffffff' },
    { col: 4, row: 6, color: '#ffffff' },
    // Col 2: red, 5 rows
    { col: 5, row: 1, color: '#ef4444' },
    { col: 5, row: 2, color: '#ef4444' },
    { col: 5, row: 3, color: '#ef4444' },
    { col: 5, row: 4, color: '#ef4444' },
    { col: 5, row: 5, color: '#ef4444' },
    // Col 3: blue, 4 rows
    { col: 6, row: 2, color: '#3b82f6' },
    { col: 6, row: 3, color: '#3b82f6' },
    { col: 6, row: 4, color: '#3b82f6' },
    { col: 6, row: 5, color: '#3b82f6' },
  ],
};

// Formation 13: Flamingo - stylized pink pixel bird, about 22 cubes.
// Long neck, oval body, stick legs, orange beak, magenta wing accent.
const FLAMINGO: Formation = {
  id: 'flamingo',
  slots: [
    // Head (top)
    { col: 2, row: 0, color: '#ec4899' },
    { col: 3, row: 0, color: '#ec4899' },
    // Eye (small black dot)
    { col: 2, row: 0, color: '#1a1a1a' },
    // Beak - orange-red pointing left
    { col: 1, row: 0, color: '#f97316' },
    { col: 0, row: 1, color: '#f97316' },
    // Neck - S-curve upward
    { col: 3, row: 1, color: '#ec4899' },
    { col: 3, row: 2, color: '#ec4899' },
    { col: 4, row: 3, color: '#ec4899' },
    { col: 4, row: 4, color: '#ec4899' },
    // Body - oval 3x3
    { col: 3, row: 5, color: '#ec4899' },
    { col: 4, row: 5, color: '#ec4899' },
    { col: 5, row: 5, color: '#ec4899' },
    { col: 3, row: 6, color: '#ec4899' },
    { col: 4, row: 6, color: '#ec4899' },
    { col: 5, row: 6, color: '#ec4899' },
    { col: 3, row: 7, color: '#ec4899' },
    { col: 4, row: 7, color: '#ec4899' },
    // Wing accent - magenta highlight
    { col: 5, row: 6, color: '#d946ef' },
    { col: 6, row: 6, color: '#d946ef' },
    { col: 6, row: 5, color: '#d946ef' },
    // Legs - long and thin
    { col: 4, row: 8, color: '#ec4899' },
    { col: 5, row: 8, color: '#ec4899' },
    { col: 4, row: 9, color: '#ec4899' },
    { col: 5, row: 9, color: '#ec4899' },
    { col: 4, row: 10, color: '#ec4899' },
    { col: 6, row: 10, color: '#ec4899' },
    // Bent knee
    { col: 4, row: 11, color: '#ec4899' },
    { col: 3, row: 12, color: '#ec4899' },
  ],
};

// Formation 14: Rubber duck - classic yellow duck profile, about 20 cubes.
// Wide body, round head, orange beak, black eye, orange wing accent.
const RUBBER_DUCK: Formation = {
  id: 'rubber-duck',
  slots: [
    // Body - wide bottom tapering up
    { col: 0, row: 4, color: '#fbbf24' },
    { col: 1, row: 4, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 3, row: 4, color: '#fbbf24' },
    { col: 0, row: 3, color: '#fbbf24' },
    { col: 1, row: 3, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 3, row: 3, color: '#fbbf24' },
    { col: 1, row: 2, color: '#fbbf24' },
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 3, row: 2, color: '#fbbf24' },
    // Wing accent - orange tint on body side
    { col: 0, row: 3, color: '#fb923c' },
    { col: 0, row: 2, color: '#fb923c' },
    // Head - round on top-right
    { col: 2, row: 1, color: '#fbbf24' },
    { col: 3, row: 1, color: '#fbbf24' },
    { col: 4, row: 1, color: '#fbbf24' },
    { col: 1, row: 0, color: '#fbbf24' },
    { col: 2, row: 0, color: '#fbbf24' },
    { col: 3, row: 0, color: '#fbbf24' },
    { col: 4, row: 0, color: '#fbbf24' },
    { col: 2, row: -1, color: '#fbbf24' },
    { col: 3, row: -1, color: '#fbbf24' },
    { col: 4, row: -1, color: '#fbbf24' },
    // Beak - orange, protruding right
    { col: 5, row: 0, color: '#f97316' },
    { col: 6, row: 0, color: '#f97316' },
    // Eye - black
    { col: 3, row: -1, color: '#1a1a1a' },
  ],
};

// Formation 15: Improved waterwave - two dynamic sinusoidal wave crests, about 28 cubes.
// Wave 1 ocean blue, wave 2 light blue, with white foam at crest peaks.
const WATERWAVE: Formation = {
  id: 'waterwave',
  slots: (() => {
    const out: FormationSlot[] = [];
    // Wave 1: ocean blue sinusoidal
    for (let i = 0; i < 8; i++) {
      const row = Math.round(2.5 * Math.sin(i * 0.9));
      out.push({ col: i, row: row + 4, color: '#0891b2' });
      // Foam at wave crest (local minima / maxima)
      if (i > 0 && i < 7) {
        const prev = Math.round(2.5 * Math.sin((i - 1) * 0.9));
        const next = Math.round(2.5 * Math.sin((i + 1) * 0.9));
        if (row <= prev && row <= next) {
          out.push({ col: i, row: row + 3, color: '#ffffff' });
        }
      }
    }
    // Wave 2: light blue, offset phase
    for (let i = 0; i < 8; i++) {
      const row = Math.round(2.5 * Math.sin(i * 0.9 + 1.5)) + 3;
      out.push({ col: i, row: row + 7, color: '#7dd3fc' });
    }
    return out;
  })(),
};

// Formation 16: Improved cocktail glass - martini shape with straw and garnish, about 20 cubes.
// Wide rim, V-taper to stem, base. Pink drink, white glass, yellow straw, orange garnish.
const COCKTAIL_V2: Formation = {
  id: 'cocktail-v2',
  slots: [
    // Garnish - orange fruit slice sticking out top-left
    { col: 0, row: 0, color: '#fb923c' },
    // Straw - yellow sticking out top-right
    { col: 9, row: 0, color: '#fde047' },
    { col: 9, row: 1, color: '#fde047' },
    // Wide rim - 7 cubes pink drink
    { col: 2, row: 1, color: '#ec4899' },
    { col: 3, row: 1, color: '#ec4899' },
    { col: 4, row: 1, color: '#ec4899' },
    { col: 5, row: 1, color: '#ec4899' },
    { col: 6, row: 1, color: '#ec4899' },
    { col: 7, row: 1, color: '#ec4899' },
    { col: 8, row: 1, color: '#ec4899' },
    // V-taper row 1 - 5 cubes
    { col: 3, row: 2, color: '#ec4899' },
    { col: 4, row: 2, color: '#ec4899' },
    { col: 5, row: 2, color: '#ec4899' },
    { col: 6, row: 2, color: '#ec4899' },
    { col: 7, row: 2, color: '#ec4899' },
    // V-taper row 2 - 3 cubes
    { col: 4, row: 3, color: '#ec4899' },
    { col: 5, row: 3, color: '#ec4899' },
    { col: 6, row: 3, color: '#ec4899' },
    // Bottom of glass - 1 cube
    { col: 5, row: 4, color: '#ec4899' },
    // Stem - white/glass
    { col: 5, row: 5, color: '#f0f9ff' },
    { col: 5, row: 6, color: '#f0f9ff' },
    // Base - 5 cubes white/glass
    { col: 3, row: 7, color: '#f0f9ff' },
    { col: 4, row: 7, color: '#f0f9ff' },
    { col: 5, row: 7, color: '#f0f9ff' },
    { col: 6, row: 7, color: '#f0f9ff' },
    { col: 7, row: 7, color: '#f0f9ff' },
  ],
};

// Formation 17: Improved toucan - bigger and clearer, about 28 cubes.
// Black body, large orange beak, white belly, teal wing, red tail feathers.
const TOUCAN_V2: Formation = {
  id: 'toucan-v2',
  slots: [
    // Head above body
    { col: 0, row: 0, color: '#1a1a2e' },
    { col: 1, row: 0, color: '#1a1a2e' },
    { col: 2, row: 0, color: '#1a1a2e' },
    { col: 1, row: -1, color: '#1a1a2e' },
    // Eye detail
    { col: 2, row: -1, color: '#ffffff' },
    // Body - 4 wide x 5 tall
    { col: -1, row: 1, color: '#1a1a2e' },
    { col: 0, row: 1, color: '#1a1a2e' },
    { col: 1, row: 1, color: '#1a1a2e' },
    { col: 2, row: 1, color: '#1a1a2e' },
    { col: -1, row: 2, color: '#1a1a2e' },
    { col: 0, row: 2, color: '#1a1a2e' },
    { col: 1, row: 2, color: '#1a1a2e' },
    { col: 2, row: 2, color: '#1a1a2e' },
    { col: -1, row: 3, color: '#1a1a2e' },
    { col: 0, row: 3, color: '#1a1a2e' },
    { col: 1, row: 3, color: '#1a1a2e' },
    { col: 2, row: 3, color: '#1a1a2e' },
    { col: -1, row: 4, color: '#1a1a2e' },
    { col: 0, row: 4, color: '#1a1a2e' },
    { col: 1, row: 4, color: '#1a1a2e' },
    // White belly
    { col: 0, row: 2, color: '#f0fdf4' },
    { col: 0, row: 3, color: '#f0fdf4' },
    { col: 1, row: 3, color: '#f0fdf4' },
    // Large orange beak curving right
    { col: 3, row: 0, color: '#f97316' },
    { col: 4, row: 0, color: '#f97316' },
    { col: 5, row: 0, color: '#f97316' },
    { col: 4, row: 1, color: '#f97316' },
    { col: 5, row: 1, color: '#f97316' },
    { col: 4, row: 2, color: '#f97316' },
    // Yellow beak gradient accent
    { col: 3, row: 1, color: '#fbbf24' },
    // Teal wing highlight
    { col: -2, row: 2, color: '#0d9488' },
    { col: -2, row: 3, color: '#0d9488' },
    { col: -1, row: 3, color: '#0d9488' },
    // Red tail feathers
    { col: -1, row: 4, color: '#ef4444' },
    { col: -2, row: 5, color: '#ef4444' },
  ],
};

// Formation 18: Improved sun - bigger with 5x5 core, orange halo, 16 ray tips, about 45 cubes.
// Bright gold center, orange halo ring, yellow ray tips at 8 compass + 8 diagonal directions.
const SUN_V2: Formation = {
  id: 'sun-v2',
  slots: [
    // 5x5 gold center
    { col: 0, row: 0, color: '#fbbf24' },
    { col: 1, row: 0, color: '#fbbf24' },
    { col: 2, row: 0, color: '#fbbf24' },
    { col: 3, row: 0, color: '#fbbf24' },
    { col: 4, row: 0, color: '#fbbf24' },
    { col: 0, row: 1, color: '#fbbf24' },
    { col: 1, row: 1, color: '#fbbf24' },
    { col: 2, row: 1, color: '#fbbf24' },
    { col: 3, row: 1, color: '#fbbf24' },
    { col: 4, row: 1, color: '#fbbf24' },
    { col: 0, row: 2, color: '#fbbf24' },
    { col: 1, row: 2, color: '#fbbf24' },
    { col: 2, row: 2, color: '#fbbf24' },
    { col: 3, row: 2, color: '#fbbf24' },
    { col: 4, row: 2, color: '#fbbf24' },
    { col: 0, row: 3, color: '#fbbf24' },
    { col: 1, row: 3, color: '#fbbf24' },
    { col: 2, row: 3, color: '#fbbf24' },
    { col: 3, row: 3, color: '#fbbf24' },
    { col: 4, row: 3, color: '#fbbf24' },
    { col: 0, row: 4, color: '#fbbf24' },
    { col: 1, row: 4, color: '#fbbf24' },
    { col: 2, row: 4, color: '#fbbf24' },
    { col: 3, row: 4, color: '#fbbf24' },
    { col: 4, row: 4, color: '#fbbf24' },
    // Orange halo ring at distance 2 (compass directions only, corners filled)
    { col: -1, row: 1, color: '#fb923c' },
    { col: -1, row: 2, color: '#fb923c' },
    { col: -1, row: 3, color: '#fb923c' },
    { col: 5, row: 1, color: '#fb923c' },
    { col: 5, row: 2, color: '#fb923c' },
    { col: 5, row: 3, color: '#fb923c' },
    { col: 1, row: -1, color: '#fb923c' },
    { col: 2, row: -1, color: '#fb923c' },
    { col: 3, row: -1, color: '#fb923c' },
    { col: 1, row: 5, color: '#fb923c' },
    { col: 2, row: 5, color: '#fb923c' },
    { col: 3, row: 5, color: '#fb923c' },
    // Yellow ray tips at 8 compass directions
    { col: 2, row: -3, color: '#fde047' }, // north
    { col: 2, row: 7, color: '#fde047' },  // south
    { col: -3, row: 2, color: '#fde047' }, // west
    { col: 7, row: 2, color: '#fde047' },  // east
    // Yellow ray tips at 8 diagonal directions
    { col: -2, row: -2, color: '#fde047' }, // NW
    { col: 6, row: -2, color: '#fde047' },  // NE
    { col: -2, row: 6, color: '#fde047' },  // SW
    { col: 6, row: 6, color: '#fde047' },   // SE
    // Extra diagonal ray segments
    { col: -1, row: -1, color: '#fb923c' }, // NW inner
    { col: 5, row: -1, color: '#fb923c' },  // NE inner
    { col: -1, row: 5, color: '#fb923c' },  // SW inner
    { col: 5, row: 5, color: '#fb923c' },   // SE inner
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
  { ...PINEAPPLE,      slots: dedupeSlots(PINEAPPLE.slots) },
  { ...BEACH_BALL,     slots: dedupeSlots(BEACH_BALL.slots) },
  { ...FLAMINGO,       slots: dedupeSlots(FLAMINGO.slots) },
  { ...RUBBER_DUCK,    slots: dedupeSlots(RUBBER_DUCK.slots) },
  { ...WATERWAVE,      slots: dedupeSlots(WATERWAVE.slots) },
  { ...COCKTAIL_V2,    slots: dedupeSlots(COCKTAIL_V2.slots) },
  { ...TOUCAN_V2,      slots: dedupeSlots(TOUCAN_V2.slots) },
  { ...SUN_V2,         slots: dedupeSlots(SUN_V2.slots) },
];
