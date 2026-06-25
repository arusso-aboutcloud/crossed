// Generates public/og-default.png - a static default Open Graph preview image.
// Pure Node.js, no npm dependencies. Uses zlib (built-in) for PNG compression.
// Run: node scripts/gen-og.mjs
// This script is also called via "npm run gen-og" before deployment if the image
// needs to be regenerated.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/og-default.png');

const W = 1200;
const H = 630;

// RGBA pixel buffer
const px = new Uint8ClampedArray(W * H * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
}

function fillRect(x, y, w, h, r, g, b, a = 255) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) setPixel(x + dx, y + dy, r, g, b, a);
}

function strokeRect(x, y, w, h, r, g, b, lw = 1) {
  for (let t = 0; t < lw; t++) {
    fillRect(x + t, y + t, w - 2 * t, lw - t, r, g, b);               // top
    fillRect(x + t, y + h - lw + t, w - 2 * t, lw - t, r, g, b);     // bottom
    fillRect(x + t, y + t, lw - t, h - 2 * t, r, g, b);               // left
    fillRect(x + w - lw + t, y + t, lw - t, h - 2 * t, r, g, b);     // right
  }
}

function blendPixel(x, y, r, g, b, alpha) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  const a = alpha / 255;
  px[i]     = Math.round(px[i]     * (1 - a) + r * a);
  px[i + 1] = Math.round(px[i + 1] * (1 - a) + g * a);
  px[i + 2] = Math.round(px[i + 2] * (1 - a) + b * a);
  px[i + 3] = 255;
}

function hLine(x, y, w, r, g, b) { fillRect(x, y, w, 1, r, g, b); }
function vLine(x, y, h, r, g, b) { fillRect(x, y, 1, h, r, g, b); }

// --- Background: dark #0f1117 ---
fillRect(0, 0, W, H, 15, 17, 23);

// Subtle left gradient panel - slightly lighter
for (let x = 0; x < 620; x++) {
  const alpha = Math.round(20 * (1 - x / 620));
  for (let y = 0; y < H; y++) blendPixel(x, y, 30, 40, 80, alpha);
}

// Blue accent top bar (4px)
fillRect(0, 0, W, 4, 0, 120, 212);
// Blue accent bottom bar (4px)
fillRect(0, H - 4, W, 4, 0, 120, 212);

// Outer border (single line, accent blue)
strokeRect(16, 16, W - 32, H - 32, 0, 78, 140, 2);

// Divider: vertical line at x=660
vLine(660, 60, H - 120, 30, 55, 90);

// ---  Crossword block motif (right panel centered) ---
// CROSSED vertical (col 2), CLOUD horizontal (row 2)
const CELL = 44;
const GAP = 3;
const COLS = 5;
const ROWS = 7;
const MOTIF_CX = 880;
const MOTIF_CY = 315;
const TOTW = COLS * (CELL + GAP) - GAP;
const TOTH = ROWS * (CELL + GAP) - GAP;
const MX = MOTIF_CX - Math.floor(TOTW / 2);
const MY = MOTIF_CY - Math.floor(TOTH / 2);
const DOWN_WORD = 'CROSSED';
const ACROSS_WORD = 'CLOUD';
const ACROSS_ROW = 2;
const DOWN_COL = 2;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const isAcross = row === ACROSS_ROW && col < ACROSS_WORD.length;
    const isDown = col === DOWN_COL && row < DOWN_WORD.length;
    const isWhite = isAcross || isDown;
    const cx = MX + col * (CELL + GAP);
    const cy = MY + row * (CELL + GAP);
    if (isWhite) {
      fillRect(cx, cy, CELL, CELL, 220, 230, 245);
      // Small border
      strokeRect(cx, cy, CELL, CELL, 0, 100, 180);
    } else {
      fillRect(cx, cy, CELL, CELL, 10, 14, 22);
      strokeRect(cx, cy, CELL, CELL, 25, 30, 45);
    }
  }
}

// ---  Left panel: "CROSSED" as large block letters (pixel art 5x7) ---
// We skip text rendering (no font access in pure Node) and draw thick lines instead.
// Render a stylized "C+" shape using rectangles to suggest the brand.

// Top horizontal brand line
fillRect(80, 100, 280, 8, 0, 120, 212);
// Second line below (thinner)
fillRect(80, 114, 200, 3, 0, 90, 160);

// Large "X" mark - abstract logo element (abstract homage, not a trademark)
// Four colored squares arranged in a 2x2 with gap (abstract motif)
const SQSZ = 70;
const SQG = 10;
const SQX = 80;
const SQY = 160;
// Top-left: blue
fillRect(SQX, SQY, SQSZ, SQSZ, 0, 120, 212);
// Top-right: sky blue
fillRect(SQX + SQSZ + SQG, SQY, SQSZ, SQSZ, 14, 165, 233);
// Bottom-left: deep blue
fillRect(SQX, SQY + SQSZ + SQG, SQSZ, SQSZ, 29, 78, 216);
// Bottom-right: teal
fillRect(SQX + SQSZ + SQG, SQY + SQSZ + SQG, SQSZ, SQSZ, 15, 118, 110);

// "CROSSED" label - series of horizontal bars representing a logotype placeholder
const BAR_X = 80;
const BAR_Y = 330;
const BAR_H = 14;
const bars = [280, 240, 260, 200, 250, 220, 270];
for (let i = 0; i < bars.length; i++) {
  const alpha = Math.round(180 - i * 10);
  for (let x = BAR_X; x < BAR_X + bars[i]; x++) {
    blendPixel(x, BAR_Y + i * (BAR_H + 4), 0, 120, 212, alpha);
  }
}

// "aboutcloud.io" label area - thin lines
for (let i = 0; i < 2; i++) {
  hLine(BAR_X, BAR_Y + bars.length * (BAR_H + 4) + 12 + i * 8, 140, 60, 80, 120);
}

// Stats block - dotted lines to suggest stats text
const STAT_Y = 490;
fillRect(80, STAT_Y, 460, 2, 0, 78, 140);  // separator
// Three stat columns
for (let col = 0; col < 3; col++) {
  const sx = 80 + col * 160;
  hLine(sx, STAT_Y + 16, 50, 100, 130, 180);   // label
  hLine(sx, STAT_Y + 32, 80, 200, 220, 240);    // value
}

// Bottom URL hint
hLine(80, H - 70, 120, 60, 80, 130);
hLine(80, H - 58, 90, 40, 60, 100);

// --- PNG encode ---
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// IHDR (RGB, no alpha for OG compatibility)
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // RGB
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

// Scanlines (filter byte 0 = None, then RGB triples)
const rows = [];
for (let y = 0; y < H; y++) {
  const row = Buffer.alloc(1 + W * 3);
  row[0] = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    row[1 + x * 3]     = px[i];
    row[1 + x * 3 + 1] = px[i + 1];
    row[1 + x * 3 + 2] = px[i + 2];
  }
  rows.push(row);
}
const rawData = Buffer.concat(rows);
const compressed = deflateSync(rawData, { level: 6 });

const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([PNG_SIG, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);

writeFileSync(OUT, png);
console.log(`Generated ${OUT} (${png.length} bytes)`);
