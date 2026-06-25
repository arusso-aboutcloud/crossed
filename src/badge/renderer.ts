import type { Difficulty, WinResult } from '$lib/types';

// Badge export: 630 x 840 (portrait, ~3:4).
// Square 800x800 is also commonly used but portrait better matches the
// shield-badge visual at social share sizes (Instagram, LinkedIn, Twitter).
export const BADGE_W = 630;
export const BADGE_H = 840;

export interface TierSpec {
  displayName: string;    // label shown below shield (pro -> 'EXPERT')
  tagline: string;
  shieldBg1: string;      // gradient top
  shieldBg2: string;      // gradient bottom
  shieldOutline: string;  // outer edge color
  shieldGlow: string;     // shadow blur color
  accentColor: string;
  iconColor: string;
  starColor: string;
  bannerBg: string;
  bannerText: string;
  labelColor: string;     // large text below shield
  textColor: string;      // smaller text below shield
  stars: number;
  borderLines: number;    // escalation gauge used by tests
}

export const TIER_SPECS: Record<Difficulty, TierSpec> = {
  easy: {
    displayName: 'EASY',
    tagline: 'Well done!',
    shieldBg1: '#082008',
    shieldBg2: '#14501a',
    shieldOutline: '#3ddf50',
    shieldGlow: '#22aa30',
    accentColor: '#3ddf50',
    iconColor: '#3ddf50',
    starColor: '#ffffff',
    bannerBg: '#edf5ee',
    bannerText: '#0a2a0c',
    labelColor: '#3ddf50',
    textColor: '#c8ecd0',
    stars: 1,
    borderLines: 1,
  },
  medium: {
    displayName: 'MEDIUM',
    tagline: 'Great job!',
    shieldBg1: '#04082a',
    shieldBg2: '#0a2068',
    shieldOutline: '#4a88ff',
    shieldGlow: '#2055cc',
    accentColor: '#4a88ff',
    iconColor: '#4a9fff',
    starColor: '#ffffff',
    bannerBg: '#eef1fa',
    bannerText: '#04082a',
    labelColor: '#4a88ff',
    textColor: '#c8d4f8',
    stars: 2,
    borderLines: 2,
  },
  hard: {
    displayName: 'HARD',
    tagline: 'Impressive!',
    shieldBg1: '#100620',
    shieldBg2: '#341060',
    shieldOutline: '#9944dd',
    shieldGlow: '#6622aa',
    accentColor: '#aa55ee',
    iconColor: '#bb66ff',
    starColor: '#ffffff',
    bannerBg: '#f2eefa',
    bannerText: '#100620',
    labelColor: '#aa55ee',
    textColor: '#e0c8f8',
    stars: 3,
    borderLines: 3,
  },
  pro: {
    displayName: 'EXPERT',
    tagline: 'Legendary!',
    shieldBg1: '#10080a',
    shieldBg2: '#3a2200',
    shieldOutline: '#ffd700',
    shieldGlow: '#bb8800',
    accentColor: '#ffd700',
    iconColor: '#ffd700',
    starColor: '#ffd700',
    bannerBg: '#fffbe0',
    bannerText: '#2a1400',
    labelColor: '#ffd700',
    textColor: '#fff0b0',
    stars: 4,
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

// ---------- geometry ----------

const SHIELD_CX_FRAC  = 0.5;
const SHIELD_TOP_FRAC = 0.025;
const SHIELD_W_FRAC   = 0.875;
const SHIELD_H_FRAC   = 0.640;  // tip at ~66% of canvas height

function shieldPath(
  ctx: CanvasRenderingContext2D,
  cx: number, top: number, w: number, h: number
): void {
  const r = w * 0.10;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, top);
  ctx.lineTo(cx + w / 2 - r, top);
  ctx.arcTo(cx + w / 2, top, cx + w / 2, top + r, r);
  ctx.bezierCurveTo(
    cx + w / 2, top + h * 0.52,
    cx + w * 0.28, top + h * 0.80,
    cx, top + h
  );
  ctx.bezierCurveTo(
    cx - w * 0.28, top + h * 0.80,
    cx - w / 2, top + h * 0.52,
    cx - w / 2, top + r
  );
  ctx.arcTo(cx - w / 2, top, cx - w / 2 + r, top, r);
  ctx.closePath();
}

// ---------- shield layers ----------

function drawShieldBackground(
  ctx: CanvasRenderingContext2D,
  spec: TierSpec,
  cx: number, top: number, w: number, h: number
): void {
  ctx.save();
  shieldPath(ctx, cx, top, w, h);
  ctx.clip();
  const grad = ctx.createLinearGradient(cx, top, cx, top + h);
  grad.addColorStop(0, spec.shieldBg1);
  grad.addColorStop(1, spec.shieldBg2);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - w / 2 - 2, top - 2, w + 4, h + 4);
  ctx.restore();
}

function drawShieldOutline(
  ctx: CanvasRenderingContext2D,
  spec: TierSpec,
  cx: number, top: number, w: number, h: number
): void {
  // Glow pass
  ctx.save();
  ctx.shadowColor = spec.shieldGlow;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = spec.shieldOutline;
  ctx.lineWidth = 6;
  shieldPath(ctx, cx, top, w, h);
  ctx.stroke();
  ctx.restore();
  // Crisp outer line
  ctx.save();
  ctx.strokeStyle = spec.shieldOutline;
  ctx.lineWidth = 4;
  shieldPath(ctx, cx, top, w, h);
  ctx.stroke();
  ctx.restore();
  // Pro: second inner accent ring
  if (spec.borderLines >= 4) {
    ctx.save();
    ctx.strokeStyle = spec.accentColor + 'aa';
    ctx.lineWidth = 1.5;
    shieldPath(ctx, cx, top + 8, w - 16, h - 14);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- 4-square abstract motif ----------
// Colors are inspired by (but not identical to) the official Microsoft brand
// palette. This is an abstract homage per the trademark-caution guidelines.
const FOUR_COLORS = ['#e8302a', '#7ab232', '#00a3d4', '#ffb520'] as const;

function drawFourSquare(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number
): void {
  const sq = (size - 5) / 2;
  const g = 5;
  const positions: [number, number, string][] = [
    [cx - sq - g / 2, cy - sq - g / 2, FOUR_COLORS[0]],
    [cx + g / 2,       cy - sq - g / 2, FOUR_COLORS[1]],
    [cx - sq - g / 2, cy + g / 2,       FOUR_COLORS[2]],
    [cx + g / 2,       cy + g / 2,       FOUR_COLORS[3]],
  ];
  for (const [x, y, color] of positions) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, sq, sq);
  }
}

// ---------- banner ribbon ----------

function drawBanner(
  ctx: CanvasRenderingContext2D,
  spec: TierSpec,
  cx: number, y: number, w: number, h: number
): void {
  // Main ribbon
  ctx.fillStyle = spec.bannerBg;
  ctx.fillRect(cx - w / 2, y, w, h);
  // Top/bottom accent lines
  ctx.fillStyle = spec.shieldOutline;
  ctx.fillRect(cx - w / 2, y, w, 2);
  ctx.fillRect(cx - w / 2, y + h - 2, w, 2);
  // Text
  ctx.save();
  ctx.fillStyle = spec.bannerText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const sz1 = Math.floor(h * 0.30);
  const sz2 = Math.floor(h * 0.37);
  ctx.font = `800 ${sz1}px system-ui, -apple-system, Arial, sans-serif`;
  ctx.letterSpacing = '0.06em';
  ctx.fillText('CROSSED', cx, y + h * 0.33);
  ctx.font = `700 ${sz2}px system-ui, -apple-system, Arial, sans-serif`;
  ctx.fillText('CLOUD SECURITY', cx, y + h * 0.72);
  ctx.letterSpacing = '0';
  ctx.restore();
}

// ---------- icons ----------

function drawPuzzleIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
): void {
  const s = size * 0.40;
  const tabR = size * 0.13;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  // top edge with bump up
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx - tabR, cy - s);
  ctx.arc(cx, cy - s, tabR, Math.PI, 0);
  ctx.lineTo(cx + s, cy - s);
  // right edge with bump right
  ctx.lineTo(cx + s, cy - tabR);
  ctx.arc(cx + s, cy, tabR, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(cx + s, cy + s);
  // bottom edge with notch (concave up)
  ctx.lineTo(cx + tabR, cy + s);
  ctx.arc(cx, cy + s, tabR, 0, Math.PI, true);
  ctx.lineTo(cx - s, cy + s);
  // left edge with notch (concave right)
  ctx.lineTo(cx - s, cy + tabR);
  ctx.arc(cx - s, cy, tabR, Math.PI / 2, -Math.PI / 2, true);
  ctx.closePath();
  ctx.stroke();
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.14;
  ctx.fill();
  ctx.restore();
}

function drawShieldCheckIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
): void {
  const sw = size * 0.80;
  const sh = size * 0.88;
  const st = cy - sh / 2;
  const r = sw * 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.065;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - sw / 2 + r, st);
  ctx.lineTo(cx + sw / 2 - r, st);
  ctx.arcTo(cx + sw / 2, st, cx + sw / 2, st + r, r);
  ctx.bezierCurveTo(cx + sw / 2, st + sh * 0.52, cx + sw * 0.26, st + sh * 0.80, cx, st + sh);
  ctx.bezierCurveTo(cx - sw * 0.26, st + sh * 0.80, cx - sw / 2, st + sh * 0.52, cx - sw / 2, st + r);
  ctx.arcTo(cx - sw / 2, st, cx - sw / 2 + r, st, r);
  ctx.closePath();
  ctx.stroke();
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.restore();
  // checkmark
  const ck = size * 0.28;
  const ckCX = cx;
  const ckCY = cy + size * 0.05;
  ctx.beginPath();
  ctx.moveTo(ckCX - ck, ckCY);
  ctx.lineTo(ckCX - ck * 0.1, ckCY + ck * 0.9);
  ctx.lineTo(ckCX + ck, ckCY - ck * 0.8);
  ctx.stroke();
}

function drawPadlockIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
): void {
  const bw = size * 0.62;
  const bh = size * 0.52;
  const bx = cx - bw / 2;
  const by = cy - bh * 0.05;
  const sw = bw * 0.50;
  const sh = bh * 0.72;
  const sy = by - sh;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.065;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // shackle
  ctx.beginPath();
  ctx.moveTo(cx - sw / 2, by);
  ctx.lineTo(cx - sw / 2, sy + sh / 2);
  ctx.arc(cx, sy + sh / 2, sw / 2, Math.PI, 0);
  ctx.lineTo(cx + sw / 2, by);
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bw * 0.10);
  ctx.stroke();
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 0.14; ctx.fill(); ctx.restore();
  // keyhole
  const kr = bh * 0.18;
  const kcx = cx;
  const kcy = by + bh * 0.38;
  ctx.beginPath();
  ctx.arc(kcx, kcy, kr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kcx, kcy + kr);
  ctx.lineTo(kcx, kcy + kr * 1.8);
  ctx.stroke();
}

function drawTrophyIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
): void {
  const cw = size * 0.64;
  const ch = size * 0.50;
  const ct = cy - size * 0.32;
  const stH = size * 0.16;
  const stW = size * 0.14;
  const baseW = size * 0.48;
  const baseH = size * 0.09;
  const baseY = cy + size * 0.34;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.055;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Cup
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, ct);
  ctx.lineTo(cx + cw / 2, ct);
  ctx.bezierCurveTo(cx + cw / 2, ct + ch * 0.82, cx + cw * 0.18, ct + ch, cx, ct + ch);
  ctx.bezierCurveTo(cx - cw * 0.18, ct + ch, cx - cw / 2, ct + ch * 0.82, cx - cw / 2, ct);
  ctx.closePath();
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.14; ctx.fill(); ctx.restore();

  // Handles
  const hr = cw * 0.20;
  const hcy = ct + ch * 0.30;
  ctx.beginPath();
  ctx.arc(cx + cw / 2 + hr, hcy, hr, -Math.PI * 0.75, Math.PI * 0.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - cw / 2 - hr, hcy, hr, Math.PI * 0.25, Math.PI * 1.75);
  ctx.stroke();

  // Stem
  ctx.beginPath();
  ctx.moveTo(cx - stW / 2, ct + ch);
  ctx.lineTo(cx - stW / 2, baseY);
  ctx.lineTo(cx + stW / 2, baseY);
  ctx.lineTo(cx + stW / 2, ct + ch);
  ctx.stroke();

  // Base
  ctx.beginPath();
  ctx.roundRect(cx - baseW / 2, baseY, baseW, baseH, 4);
  ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fill(); ctx.restore();

  // 4-square inside cup (abstract homage, small)
  const sq = size * 0.085;
  const qg = size * 0.018;
  const qtw = sq * 2 + qg;
  const qth = sq * 2 + qg;
  const qx = cx - qtw / 2;
  const qy = ct + ch * 0.16;
  const qcolors = [FOUR_COLORS[0], FOUR_COLORS[1], FOUR_COLORS[2], FOUR_COLORS[3]];
  ctx.save();
  ctx.globalAlpha = 0.88;
  const qpos: [number, number, string][] = [
    [qx, qy, qcolors[0]], [qx + sq + qg, qy, qcolors[1]],
    [qx, qy + sq + qg, qcolors[2]], [qx + sq + qg, qy + sq + qg, qcolors[3]],
  ];
  for (const [px, py, pc] of qpos) { ctx.fillStyle = pc; ctx.fillRect(px, py, sq, sq); }
  ctx.restore();

  // Laurel wreath
  const leafCount = 5;
  const wreathR = cw * 0.56;
  const wreathCY = ct + ch * 0.55;
  for (const side of [-1, 1]) {
    for (let i = 0; i < leafCount; i++) {
      const angle = Math.PI * (side === -1 ? 0.62 : 0.38) +
        (i / (leafCount - 1)) * Math.PI * 0.68 * side;
      const lx = cx + Math.cos(angle) * wreathR;
      const ly = wreathCY + Math.sin(angle) * wreathR * 0.55;
      const la = angle + Math.PI / 2;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(la);
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.030;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.048, size * 0.11, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.20;
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  difficulty: Difficulty,
  cx: number, cy: number,
  size: number, color: string
): void {
  ctx.save();
  if (difficulty === 'pro' || difficulty === 'hard') {
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
  }
  switch (difficulty) {
    case 'easy':   drawPuzzleIcon(ctx, cx, cy, size, color); break;
    case 'medium': drawShieldCheckIcon(ctx, cx, cy, size, color); break;
    case 'hard':   drawPadlockIcon(ctx, cx, cy, size, color); break;
    case 'pro':    drawTrophyIcon(ctx, cx, cy, size, color); break;
  }
  ctx.restore();
}

// ---------- stars ----------

function drawStars(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  count: number, color: string, totalWidth: number
): void {
  const starR = totalWidth * 0.038;
  const gap = starR * 2.6;
  const startX = cx - ((count - 1) * gap) / 2;

  // Pill background
  const pillW = count * gap + starR * 2.2;
  const pillH = starR * 3.2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, pillH / 2);
  ctx.fill();

  // Stars
  ctx.fillStyle = color;
  const outerR = starR;
  const innerR = starR * 0.43;
  const pts = 5;
  for (let i = 0; i < count; i++) {
    const sx = startX + i * gap;
    ctx.beginPath();
    for (let j = 0; j < pts * 2; j++) {
      const angle = (j * Math.PI) / pts - Math.PI / 2;
      const r = j % 2 === 0 ? outerR : innerR;
      const x = sx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ---------- text below shield ----------

function drawBadgeText(
  ctx: CanvasRenderingContext2D,
  result: WinResult,
  spec: TierSpec,
  W: number,
  H: number,
  shieldBottom: number
): void {
  const lineGap = 8;
  let y = shieldBottom + 28;

  // Difficulty name + flanking lines
  ctx.save();
  ctx.fillStyle = spec.labelColor;
  ctx.font = `900 50px system-ui, -apple-system, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '0.10em';
  if (spec.borderLines >= 3) { ctx.shadowColor = spec.labelColor; ctx.shadowBlur = 14; }
  ctx.fillText(spec.displayName, W / 2, y + 25);
  ctx.restore();

  // Decorative lines
  ctx.strokeStyle = spec.labelColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  const lineY = y + 25;
  ctx.beginPath(); ctx.moveTo(30, lineY); ctx.lineTo(W / 2 - 95, lineY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 95, lineY); ctx.lineTo(W - 30, lineY); ctx.stroke();
  ctx.globalAlpha = 1;

  y += 62 + lineGap;

  // Tagline
  ctx.fillStyle = spec.textColor;
  ctx.font = `700 24px system-ui, -apple-system, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(spec.tagline, W / 2, y);

  y += 34 + lineGap;

  // Stats
  const timeStr = formatBadgeTime(result.elapsedSeconds);
  const wordsStr = `${result.wordsSolved}/${result.wordsPlaced} words`;
  ctx.fillStyle = spec.textColor;
  ctx.globalAlpha = 0.78;
  ctx.font = `400 19px system-ui, -apple-system, Arial, sans-serif`;
  ctx.fillText(`${timeStr}  -  ${wordsStr}`, W / 2, y);
  ctx.globalAlpha = 1;

  y += 28;

  ctx.globalAlpha = 0.58;
  ctx.font = `400 17px system-ui, -apple-system, Arial, sans-serif`;
  ctx.fillText(formatBadgeDate(), W / 2, y);
  ctx.globalAlpha = 1;
}

// ---------- main entry points ----------

export function drawBadge(
  ctx: CanvasRenderingContext2D,
  result: WinResult,
  W: number = BADGE_W,
  H: number = BADGE_H
): void {
  const spec = getBadgeSpec(result.difficulty);

  // Shield geometry (scaled to canvas size)
  const cx = W * SHIELD_CX_FRAC;
  const shieldW = W * SHIELD_W_FRAC;
  const shieldH = H * SHIELD_H_FRAC;
  const shieldTop = H * SHIELD_TOP_FRAC;
  const shieldBottom = shieldTop + shieldH;

  // Canvas background
  ctx.fillStyle = '#090b14';
  ctx.fillRect(0, 0, W, H);

  // Shield
  drawShieldBackground(ctx, spec, cx, shieldTop, shieldW, shieldH);
  drawShieldOutline(ctx, spec, cx, shieldTop, shieldW, shieldH);

  // Clip zone for internal shield elements
  const innerMargin = 10;

  // 4-square logo
  const logoSize = shieldW * 0.200;
  const logoCY = shieldTop + shieldH * 0.135;
  drawFourSquare(ctx, cx, logoCY, logoSize);

  // Banner ribbon
  const bannerW = shieldW - innerMargin * 2;
  const bannerH = shieldH * 0.125;
  const bannerY = shieldTop + shieldH * 0.265;
  drawBanner(ctx, spec, cx, bannerY, bannerW, bannerH);

  // Central icon
  const iconCX = cx;
  const iconCY = shieldTop + shieldH * 0.605;
  const iconSize = shieldH * 0.265;
  drawIcon(ctx, result.difficulty, iconCX, iconCY, iconSize, spec.iconColor);

  // Stars
  const starCY = shieldTop + shieldH * 0.880;
  drawStars(ctx, cx, starCY, spec.stars, spec.starColor, shieldW * 0.60);

  // Text below shield
  drawBadgeText(ctx, result, spec, W, H, shieldBottom);
}

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
