# Architecture

## Why fully static and client-side

crossed has no backend. The crossword generation algorithm runs entirely in
the browser on each page load against `src/data/bank.json`, a JSON file
shipped with the static build. This eliminates infrastructure cost, removes
any availability dependency on a server, and keeps the deployment surface
to a single Cloudflare Pages site.

Random generation works without a backend because the full concept pool is
shipped to the client. The algorithm selects a subset of entries, fits them
into a grid, and assigns clue numbers - all in JavaScript, all local to the
browser session. No state is persisted between sessions. No two loads produce
the same puzzle because randomness is seeded at load time.

The crossword generation algorithm itself is not implemented in this scaffold.
It is a defined follow-up task.

## Clue bank model

The bank is a flat JSON array of entries. Each entry represents one concept:

- One `answer` word (uppercase A-Z, no spaces).
- One `display` label for the results screen.
- One `topic` tag from the canonical set.
- One `era` flag: `current` for active products and features, `legacy` for
  retired or renamed terminology. Legacy entries serve the memorabilia angle
  of the game - players who remember BPOS or ADFS get a nostalgic clue.
- Four `clues` strings, one per difficulty level.

The bank is typed end-to-end: `src/lib/types.ts` defines `ClueEntry` and
`ClueBank`, and `src/lib/bank.ts` exports typed accessors and a `validateBank`
function that checks structural invariants at development time.

## Difficulty model

Difficulty is a clue-selection mechanism, not a filter on the concept pool.

When a player chooses a difficulty level, the game reads `entry.clues[level]`
for every word placed in the grid. The answer never changes. The grid
structure never changes. Only the clue text changes. This means:

- All topics appear at all difficulty levels.
- A player switching from easy to pro sees the same grid with harder clues.
- The bank author must write all four clue variants for every entry.

## Badge and sharing model

When a player completes a puzzle, the app generates a PNG badge using the
browser Canvas API. The badge encodes the player's score, difficulty, and
completed word count. No server call is made.

The player can share via two paths:

1. Web Share API (available on mobile and modern desktop browsers): invokes
   the native share sheet with the PNG as an attachment.
2. Download fallback: a direct `<a download>` link to the Canvas blob URL.

For rich link previews on social platforms (LinkedIn, X, Meta), a separate
Cloudflare Worker generates a dynamic Open Graph image from query parameters
encoding the same badge data. Social crawlers fetch this image URL, not the
Canvas-generated one, because crawlers do not execute JavaScript. The Worker
is the only server-side component in the architecture.

The Worker is currently a stub returning a 501 response. Dynamic OG image
generation is a defined follow-up task.

## Hosting

crossed is hosted on Cloudflare Pages. The build output (`dist/`) is a
completely static directory - HTML, JS, CSS, and JSON. Cloudflare Pages
serves it from its global CDN with no origin server.

This fits within the Cloudflare free tier: Pages sites have no monthly cost
for static hosting within the standard request and bandwidth limits.

An optional self-hosted path exists: serve the same `dist/` directory from
any static web server or reverse proxy (nginx, Caddy, Apache) without any
Cloudflare dependency. The OG Worker would require a separate deployment in
that case (any Worker-compatible runtime or a small server-side renderer).

## What is intentionally not present in this scaffold

The following are defined scaffolding boundaries, not missing pieces:

- **Crossword generation algorithm** - the logic that selects entries from
  the bank, fits words into a grid, resolves intersections, and assigns
  clue numbers. This is the primary follow-up implementation task.
- **Game UI and interaction** - the rendered grid, letter input, keyboard
  handling, timer, hint system, and results screen. Blocked on the generator.
- **Badge rendering logic** - the Canvas drawing code that produces the
  winner PNG. Depends on the final results screen design.
- **OG image Worker logic** - the server-side image renderer inside
  `worker/src/index.ts`. Currently returns a 501 stub.

These items are scaffolded structurally (types, file locations, stub handlers)
but not functionally implemented.
