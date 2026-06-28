# Architecture

## Overview

CROSSEC is a fully static, client-side web application. Every crossword is
generated live in the browser from a shipped clue bank with no server
involvement. There is no backend, no database, and no runtime API calls.

---

## Hosting stack

```
GitHub repo (main)
       |
       | push / PR merge
       v
GitHub Actions (deploy.yml)
       |
       | npx wrangler pages deploy dist/
       v
Cloudflare Pages (global CDN, 100+ PoPs)
       |
       | HTTPS / edge cache
       v
Visitor browser
```

The entire `dist/` output is a static directory: HTML, JS bundles, CSS,
fonts, SVGs, badge images, and a JSON clue bank. Cloudflare Pages serves it
from the CDN edge with no origin server.

The site fits within the Cloudflare free tier (static hosting is free).

---

## Browser runtime

```
App entry (src/main.ts)
  |
  +-- App.svelte (root, phase-aware shell)
        |
        +-- GameShell.svelte (phase router: menu / difficulty / playing / paused / win)
              |
              +-- MenuScreen.svelte       (start / badge progress / links)
              +-- DifficultyScreen.svelte (difficulty picker)
              +-- BoardScreen.svelte      (active crossword + clue list)
              |     +-- CrosswordBoard.svelte (grid cells, keyboard/touch input)
              |     +-- ClueList.svelte       (across/down clue panels)
              |     +-- PauseOverlay.svelte
              +-- WinScreen.svelte        (confetti, badge, share)
              +-- RulesOverlay.svelte     (how to play modal)
        |
        +-- WebGLBackground.svelte (Three.js canvas, z-index 0)
```

State is managed via Svelte writable stores in `src/game/store.ts`. There is
no global state library; stores are imported directly by components that need
them.

---

## Crossword generation

`src/lib/generator.ts` runs entirely in the browser at game-start:

1. **Seed** - a 31-bit integer from `Math.random()`. The Mulberry32 PRNG
   (`src/lib/rng.ts`) makes the entire sequence deterministic from the seed.

2. **Word pool** - `getAllEntries()` returns all bank entries. The pool is
   PRNG-shuffled.

3. **Greedy placement** - the first word is placed at the grid centre.
   Every subsequent word must share at least one letter with an already-placed
   word (all placed words form a connected graph). The placer scores each
   candidate by letter-crossing count and picks the best fit. It runs until
   `targetWords` is reached or the 4000-attempt budget is exhausted.

4. **Bounding-box trim** - the grid is trimmed to the tightest bounding box
   so `rows x cols` is the true puzzle footprint.

5. **Clue numbering** - words sorted top-left to bottom-right; each unique
   start cell gets the next sequential clue number.

6. **Clue text** - `entry.clues[difficulty]` is read for each placed word.
   Difficulty selects the clue string; the answer and grid are identical
   across all difficulty levels.

See [difficulty.md](difficulty.md) for per-difficulty parameters and the
clue-hardness contract.

---

## Badge and sharing

When a puzzle is won the app:

1. Records the win in `localStorage` under the key `crossed_earned_badges`
   (a `Partial<Record<Difficulty, EarnedEntry>>` object). Keyed by
   difficulty so each level can only be earned once; replays update the
   time if faster.

2. Renders a badge PNG via the Canvas API in `src/badge/renderer.ts`.

3. Offers sharing via the Web Share API (mobile / modern desktop) with a
   fallback download link.

The optional Cloudflare Worker in `worker/` generates a static Open Graph
image URL for rich social previews when a badge link is shared. The Worker
is currently a stub (returns 501). OG image generation is a follow-up task.

---

## Analytics

Umami (self-hosted at `analytics.aboutcloud.io`) fires a `badge_earned`
event when a player earns a badge for the first time. No cookies. No PII.
No third-party domains receive data.

---

## Self-hosting

Serve the `dist/` directory from any static web server or CDN:

```bash
npm run build
# then serve dist/ with nginx, Caddy, Apache, or any static host
```

No environment variables are required for the static site. The optional
OG Worker requires a separate Cloudflare account.

---

## What is intentionally not present

- **Dynamic OG image rendering** - the Worker stub at `worker/src/index.ts`
  returns 501. Full image generation is a follow-up task.
- **Server-side rendering** - the app is fully client-rendered.
- **User accounts / server-side persistence** - badges live in localStorage.
- **Backend API** - there is none. All logic runs in the browser.
