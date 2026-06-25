import type { Difficulty, WinResult } from '$lib/types';

// Badge output: 1200x630 (standard OG share dimensions).
// All rendering is client-side Canvas 2D -- no network calls, no external fonts.
// System font stack is guaranteed available on all targets.
export const BADGE_W = 1200;
export const BADGE_H = 630;

export interface TierSpec {
  material: string;
  rarityLabel: string;
  // background gradient stops
  bgA: string;
  bgB: string;
  // primary accent (frame, jewel, large text)
  accent: string;
  accentLight: string;
  accentDark: string;
  // text
  textPrimary: string;
  textMuted: string;
  // crossword motif cells
  cellWhite: string;
  cellBlack: string;
  cellText: string;
  // border line count (1=simple, 2=double, 3=triple, 4=elaborate)
  borderLines: number;
}

export const TIER_SPECS: Record<Difficulty, TierSpec> = {
  easy: {
    material: 'BRONZE',
    rarityLabel: 'COMPLETED',
    bgA: '#1a0e06',
    bgB: '#2d1a08',
    accent: '#cd7f32',
    accentLight: '#e8a063',
    accentDark: '#8b5522',
    textPrimary: '#f5e6d0',
    textMuted: '#a08060',
    cellWhite: 'rgba(245, 230, 208, 0.92)',
    cellBlack: 'rgba(50, 30, 10, 0.85)',
    cellText: '#5a3010',
    borderLines: 1,
  },
  medium: {
    material: 'SILVER',
    rarityLabel: 'ACCOMPLISHED',
    bgA: '#0c1220',
    bgB: '#182035',
    accent: '#b0bcc8',
    accentLight: '#d8e0e8',
    accentDark: '#607080',
    textPrimary: '#e8eaf0',
    textMuted: '#8090a0',
    cellWhite: 'rgba(216, 224, 232, 0.90)',
    cellBlack: 'rgba(12, 20, 40, 0.85)',
    cellText: '#304050',
    borderLines: 2,
  },
  hard: {
    material: 'GOLD',
    rarityLabel: 'MASTERED',
    bgA: '#1a1200',
    bgB: '#2a1e00',
    accent: '#ffd700',
    accentLight: '#ffe84d',
    accentDark: '#c8a000',
    textPrimary: '#fff8e0',
    textMuted: '#c0a030',
    cellWhite: 'rgba(255, 248, 224, 0.92)',
    cellBlack: 'rgba(40, 30, 0, 0.88)',
    cellText: '#604800',
    borderLines: 3,
  },
  pro: {
    material: 'PLATINUM',
    rarityLabel: 'LEGENDARY',
    bgA: '#06050f',
    bgB: '#0c0a22',
    accent: '#c8d4ff',
    accentLight: '#eaf0ff',
    accentDark: '#6070c0',
    textPrimary: '#f0f2ff',
    textMuted: '#7888bb',
    cellWhite: 'rgba(234, 240, 255, 0.90)',
    cellBlack: 'rgba(6, 5, 15, 0.88)',
    cellText: '#304080',
    borderLines: 4,
  },
};

export function getBadgeSpec(difficulty: Difficulty): TierSpec {
  return TIER_SPECS[difficulty];
}

export function formatBadgeTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatBadgeDate(now: Date = new Date()): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

// ---------- private draw helpers ----------

function fillRRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function strokeRRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, color: string, lw: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

function drawBackground(
  ctx: CanvasRenderingContext2D, spec: TierSpec, W: number, H: number
): void {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, spec.bgA);
  grad.addColorStop(1, spec.bgB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// Pro only: prismatic shimmer rays from top-right corner
function drawShimmer(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const cx = W * 0.82;
  const cy = H * 0.20;
  const rayCount = 12;
  const maxLen = Math.max(W, H) * 1.2;
  const colors = ['#c8d4ff', '#d4c8ff', '#c8e8ff', '#e0d0ff'];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const col = colors[i % colors.length];
    const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * maxLen, cy + Math.sin(angle) * maxLen);
    grad.addColorStop(0, col.replace(')', ', 0.06)').replace('rgb', 'rgba').replace('#', 'rgba(').split('').join(''));
    // simpler: just use rgba directly
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = col;
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxLen, cy + Math.sin(angle) * maxLen);
    ctx.stroke();
    ctx.restore();
  }
  // central glow
  const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
  radGrad.addColorStop(0, 'rgba(200, 212, 255, 0.12)');
  radGrad.addColorStop(1, 'rgba(200, 212, 255, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, W, H);
}

function drawBorder(
  ctx: CanvasRenderingContext2D, spec: TierSpec, W: number, H: number
): void {
  const pad = 16;
  const r = 18;
  const lines = spec.borderLines;

  if (lines >= 1) strokeRRect(ctx, pad, pad, W - pad * 2, H - pad * 2, r, spec.accent, 2);
  if (lines >= 2) strokeRRect(ctx, pad + 6, pad + 6, W - (pad + 6) * 2, H - (pad + 6) * 2, r - 4, spec.accentDark, 1);
  if (lines >= 3) {
    // hard: gold glow effect on the outer border
    ctx.save();
    ctx.shadowColor = spec.accent;
    ctx.shadowBlur = 18;
    strokeRRect(ctx, pad, pad, W - pad * 2, H - pad * 2, r, spec.accent, 2);
    ctx.restore();
    strokeRRect(ctx, pad + 12, pad + 12, W - (pad + 12) * 2, H - (pad + 12) * 2, r - 6, spec.accentLight, 0.8);
  }
  if (lines >= 4) {
    // pro: extra inner line + corner decorations
    strokeRRect(ctx, pad + 18, pad + 18, W - (pad + 18) * 2, H - (pad + 18) * 2, r - 8, spec.accentDark, 1);
    // Corner L-brackets
    const off = pad + 2;
    const arm = 36;
    ctx.strokeStyle = spec.accentLight;
    ctx.lineWidth = 2;
    const corners = [
      [off, off, 1, 1],
      [W - off, off, -1, 1],
      [W - off, H - off, -1, -1],
      [off, H - off, 1, -1],
    ] as [number, number, number, number][];
    for (const [cx, cy, sx, sy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * arm, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + sy * arm);
      ctx.stroke();
    }
  }
}

// Crossword motif: "CROSSED" down, "CLOUD" across, drawn in right area
// This is an abstract homage to the crossword theme, not a trademark element.
function drawCrosswordMotif(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cellSize: number,
  spec: TierSpec,
  alpha: number
): void {
  const GAP = 3;
  const COLS = 5;
  const ROWS = 7;

  // Layout: "CLOUD" across row 2 (cols 0-4), "CROSSED" down col 2 (rows 0-6)
  const ACROSS_WORD = 'CLOUD';
  const DOWN_WORD = 'CROSSED';
  const ACROSS_ROW = 2;
  const DOWN_COL = 2;

  const totalW = COLS * (cellSize + GAP) - GAP;
  const totalH = ROWS * (cellSize + GAP) - GAP;
  const startX = cx - totalW / 2;
  const startY = cy - totalH / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isAcross = r === ACROSS_ROW && c < ACROSS_WORD.length;
      const isDown = c === DOWN_COL && r < DOWN_WORD.length;
      const isWhite = isAcross || isDown;

      const x = startX + c * (cellSize + GAP);
      const y = startY + r * (cellSize + GAP);

      if (isWhite) {
        ctx.fillStyle = spec.cellWhite;
        ctx.fillRect(x, y, cellSize, cellSize);

        let letter = '';
        if (isDown) letter = DOWN_WORD[r];
        else if (isAcross) letter = ACROSS_WORD[c];

        if (letter) {
          ctx.fillStyle = spec.cellText;
          ctx.font = `bold ${Math.floor(cellSize * 0.6)}px system-ui, Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2 + 1);
        }
      } else {
        ctx.fillStyle = spec.cellBlack;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  ctx.restore();
}

// ---------- per-difficulty jewel shapes ----------

function drawCircleJewel(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, spec: TierSpec
): void {
  // outer ring
  const outerGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  outerGrad.addColorStop(0, spec.accentLight);
  outerGrad.addColorStop(0.6, spec.accent);
  outerGrad.addColorStop(1, spec.accentDark);
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // inner circle
  const innerGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r * 0.7);
  innerGrad.addColorStop(0, spec.accentLight);
  innerGrad.addColorStop(1, spec.accent);
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiamondJewel(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, spec: TierSpec
): void {
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, spec.accentLight);
  grad.addColorStop(0.5, spec.accent);
  grad.addColorStop(1, spec.accentDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.75, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.75, cy);
  ctx.closePath();
  ctx.fill();
  // inner highlight
  ctx.fillStyle = spec.accentLight;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.5);
  ctx.lineTo(cx + r * 0.35, cy);
  ctx.lineTo(cx, cy + r * 0.5);
  ctx.lineTo(cx - r * 0.35, cy);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawStarJewel(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, spec: TierSpec
): void {
  const points = 6;
  const inner = r * 0.42;

  const grad = ctx.createRadialGradient(cx, cy - r * 0.3, inner * 0.2, cx, cy, r);
  grad.addColorStop(0, spec.accentLight);
  grad.addColorStop(0.5, spec.accent);
  grad.addColorStop(1, spec.accentDark);

  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // center glow
  ctx.save();
  ctx.shadowColor = spec.accent;
  ctx.shadowBlur = 24;
  ctx.fillStyle = spec.accentLight;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOctagonJewel(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, spec: TierSpec
): void {
  function octPath(radius: number) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // outer ring in accent
  const outerGrad = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
  outerGrad.addColorStop(0, spec.accentLight);
  outerGrad.addColorStop(0.55, spec.accent);
  outerGrad.addColorStop(1, spec.accentDark);
  ctx.fillStyle = outerGrad;
  octPath(r);
  ctx.fill();

  // inner cutout
  const innerGrad = ctx.createLinearGradient(cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6);
  innerGrad.addColorStop(0, '#1a1840');
  innerGrad.addColorStop(1, '#0c0a22');
  ctx.fillStyle = innerGrad;
  octPath(r * 0.62);
  ctx.fill();

  // gem highlights - prismatic effect
  const prismColors = ['rgba(200,210,255,0.55)', 'rgba(180,220,255,0.45)', 'rgba(220,200,255,0.45)'];
  for (let i = 0; i < prismColors.length; i++) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = prismColors[i];
    ctx.beginPath();
    const angle = (i / prismColors.length) * Math.PI * 2 - Math.PI * 0.6;
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * 0.58, angle, angle + Math.PI * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ring outline
  ctx.strokeStyle = spec.accentLight;
  ctx.lineWidth = 1.5;
  octPath(r * 0.62);
  ctx.stroke();

  // center dot
  ctx.save();
  ctx.shadowColor = spec.accent;
  ctx.shadowBlur = 20;
  ctx.fillStyle = spec.accentLight;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawJewel(
  ctx: CanvasRenderingContext2D,
  difficulty: Difficulty,
  cx: number, cy: number, r: number,
  spec: TierSpec
): void {
  ctx.save();
  if (spec.borderLines >= 3) {
    ctx.shadowColor = spec.accent;
    ctx.shadowBlur = 30;
  }
  switch (difficulty) {
    case 'easy':   drawCircleJewel(ctx, cx, cy, r, spec); break;
    case 'medium': drawDiamondJewel(ctx, cx, cy, r, spec); break;
    case 'hard':   drawStarJewel(ctx, cx, cy, r, spec); break;
    case 'pro':    drawOctagonJewel(ctx, cx, cy, r, spec); break;
  }
  ctx.restore();
}

// ---------- text layers ----------

function sans(size: number, weight: string = 'bold'): string {
  return `${weight} ${size}px system-ui, -apple-system, Arial, sans-serif`;
}

function drawWordmark(
  ctx: CanvasRenderingContext2D, spec: TierSpec, W: number, H: number
): void {
  const x = 72;
  const y = 90;

  ctx.save();
  if (spec.borderLines >= 3) {
    ctx.shadowColor = spec.accent;
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = spec.accent;
  ctx.font = sans(62);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0.15em';
  ctx.fillText('CROSSED', x, y);
  ctx.restore();

  ctx.fillStyle = spec.textMuted;
  ctx.font = `400 22px system-ui, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('aboutcloud.io', x + 2, y + 34);
}

function drawMaterialBlock(
  ctx: CanvasRenderingContext2D, spec: TierSpec, W: number, H: number
): void {
  const x = 72;

  // Material name (large)
  ctx.save();
  if (spec.borderLines >= 3) {
    ctx.shadowColor = spec.accent;
    ctx.shadowBlur = 28;
  }
  ctx.fillStyle = spec.accent;
  ctx.font = sans(130);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(spec.material, x, H * 0.58);
  ctx.restore();

  // Difficulty sub-label
  ctx.fillStyle = spec.textMuted;
  ctx.font = `600 26px system-ui, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0.2em';
  ctx.fillText(spec.rarityLabel, x + 2, H * 0.58 + 44);
  ctx.letterSpacing = '0';
}

function drawStats(
  ctx: CanvasRenderingContext2D, result: WinResult, spec: TierSpec, W: number, H: number
): void {
  const x = 72;
  const baseY = H * 0.78;
  const lineH = 38;

  const items = [
    { label: 'Time', value: formatBadgeTime(result.elapsedSeconds) },
    { label: 'Words', value: `${result.wordsSolved} / ${result.wordsPlaced}` },
    { label: 'Cells', value: `${result.totalCells}` },
  ];

  // Separator line
  ctx.strokeStyle = spec.accentDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, baseY - 28);
  ctx.lineTo(x + 460, baseY - 28);
  ctx.stroke();

  // Stats row
  let curX = x;
  for (const item of items) {
    ctx.fillStyle = spec.textMuted;
    ctx.font = `400 17px system-ui, Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(item.label.toUpperCase(), curX, baseY);

    ctx.fillStyle = spec.textPrimary;
    ctx.font = sans(28);
    ctx.fillText(item.value, curX, baseY + lineH);

    curX += 170;
  }

  // Date
  ctx.fillStyle = spec.textMuted;
  ctx.font = `400 18px system-ui, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(formatBadgeDate(), x, baseY + lineH * 2 + 14);
}

function drawDifficultyPip(
  ctx: CanvasRenderingContext2D, difficulty: Difficulty, spec: TierSpec, W: number, H: number
): void {
  // Small difficulty label in top-right of left panel
  const label = difficulty.toUpperCase();
  const x = W * 0.56;
  const y = 70;

  // Pill background
  ctx.font = `700 20px system-ui, Arial, sans-serif`;
  const tw = ctx.measureText(label).width;
  const pw = tw + 28;
  const ph = 34;

  fillRRect(ctx, x - pw / 2, y - ph / 2, pw, ph, 6, spec.accentDark + '55');
  strokeRRect(ctx, x - pw / 2, y - ph / 2, pw, ph, 6, spec.accentDark, 1);

  ctx.fillStyle = spec.accentLight;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
}

// ---------- main export ----------

export function drawBadge(
  ctx: CanvasRenderingContext2D,
  result: WinResult,
  W: number = BADGE_W,
  H: number = BADGE_H
): void {
  const spec = getBadgeSpec(result.difficulty);
  const jewel = { cx: W * 0.83, cy: H * 0.42, r: H * 0.17 };
  const motif = { cx: W * 0.74, cy: H * 0.50, cell: Math.floor(H * 0.072) };

  drawBackground(ctx, spec, W, H);

  if (result.difficulty === 'pro') drawShimmer(ctx, W, H);

  // Divider line between left content and right decor area
  ctx.strokeStyle = spec.accentDark;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(W * 0.60, H * 0.12);
  ctx.lineTo(W * 0.60, H * 0.88);
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawCrosswordMotif(ctx, motif.cx, motif.cy, motif.cell, spec, 0.62);
  drawJewel(ctx, result.difficulty, jewel.cx, jewel.cy, jewel.r, spec);
  drawBorder(ctx, spec, W, H);
  drawWordmark(ctx, spec, W, H);
  drawMaterialBlock(ctx, spec, W, H);
  drawStats(ctx, result, spec, W, H);
  drawDifficultyPip(ctx, result.difficulty, spec, W, H);
}

// Render a badge PNG blob at the full 1200x630 share resolution.
export async function renderBadge(result: WinResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = BADGE_W;
  canvas.height = BADGE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  drawBadge(ctx, result);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      'image/png'
    );
  });
}
