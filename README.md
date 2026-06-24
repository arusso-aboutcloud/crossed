# crossed

crossed is a browser-based crossword game about Microsoft Cloud security,
built for the aboutcloud.io community. A new puzzle is generated on every
load from a shipped clue bank, entirely in the browser - no server, no
sign-in, no tracking.

crossed is fully static and client-side. It is hosted on Cloudflare Pages
and runs at zero monthly cost within the Cloudflare free tier. There is no
backend, no database, and no Workers AI. The only server-side component is
an optional Cloudflare Worker that generates Open Graph preview images for
rich social sharing - that Worker is currently a stub and can be omitted.
For self-hosted deployments, serve the `dist/` output from any static web
server or reverse proxy (nginx, Caddy, Apache).

## Features

- Random crossword generated on every page load - no two puzzles are the same.
- Four difficulty levels: easy, medium, hard, and pro. Difficulty changes the
  clue text, not the concept pool - all topics appear at every level.
- Microsoft Cloud security topics: Microsoft Defender, Sentinel, Entra,
  Intune, Attack Surface Reduction, Defender for Cloud Apps, and general
  cloud security concepts.
- Current and legacy/memorabilia terminology - retired product names appear
  as clues alongside active ones.
- Shareable winner badge: a PNG generated client-side via Canvas that
  players can share or download. Web Share API is used where available.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Svelte 5 + TypeScript |
| Build tool | Vite 6 |
| Hosting | Cloudflare Pages (static output) |
| OG image (stub) | Cloudflare Worker (separate deploy) |

No server-side rendering. No database. No external API calls at runtime.

## Local development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Production build
npm run build

# Preview the production build locally
npm run preview
```

The dev server starts at `http://localhost:5173` by default.

## Deployment - Cloudflare Pages

Connect the repository to Cloudflare Pages and use these build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repository root) |
| Node.js version | 20 |

No environment variables are required for the static site itself.

### OG-image Worker (optional)

The Worker under `worker/` is currently a stub. It is deployed separately
from the Pages site. Before deploying, open `worker/wrangler.toml` and
replace the placeholder values:

- `PLACEHOLDER_ACCOUNT_ID` - your Cloudflare account ID (found in the
  dashboard under Workers & Pages > Overview).
- `PLACEHOLDER_DOMAIN` and `PLACEHOLDER_ZONE_ID` - your custom domain and
  zone ID if you want the Worker on a custom route. Remove the `[triggers]`
  routes block to use the default `workers.dev` subdomain instead.

Deploy with:

```bash
cd worker
npm install
npx wrangler deploy
```

Do not commit real account IDs or zone IDs to the repository.

## Clue bank

The clue bank lives in `src/data/bank.json` and is typed by `src/lib/types.ts`.

### Schema

Each entry has:

- `id` - stable lowercase hyphenated slug. Never change after creation.
- `answer` - uppercase A-Z only, no spaces. Used in the grid.
- `display` - human-readable label for the results screen.
- `topic` - one of: `defender`, `defender-cloud-apps`, `entra`, `intune`,
  `asr`, `sentinel`, `general`.
- `era` - `current` for active products/features, `legacy` for retired or
  renamed terminology.
- `clues` - four strings, one per difficulty: `easy`, `medium`, `hard`, `pro`.

### Difficulty intent

| Level | Intent |
|---|---|
| easy | Plain recognition or definition |
| medium | Applied or functional description |
| hard | Precise, indirect, or acronym-driven |
| pro | Cryptic, scenario-based, or deep edge knowledge |

### All-topics rule

Every topic must appear at every difficulty level. Difficulty selects the
clue string - it never restricts the concept pool. Do not add entries that
only work for one difficulty.

### Adding entries

1. Add an object to the `entries` array in `bank.json` following the schema.
2. Assign a unique `id` slug.
3. Write all four clue strings.
4. Run `npm run build` to confirm the TypeScript types still pass.

## Licensing

- Code (everything except `src/data/bank.json`): MIT License. See `LICENSE`.
- Clue bank and content (`src/data/bank.json`): CC-BY-4.0. See `LICENSE-CONTENT`.
