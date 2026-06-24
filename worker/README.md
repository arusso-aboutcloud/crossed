# crossed - OG Image Worker

This Cloudflare Worker will generate dynamic Open Graph preview images for
the crossed crossword game. When a winner shares their result, social
platforms (LinkedIn, X, Meta) fetch the OG image URL. The Worker responds
with a rendered PNG badge so the link unfurls with a rich card.

## Current status

This Worker is a stub. The fetch handler returns a plain-text placeholder
response. Image generation logic is not yet implemented.

## Future implementation notes

- Input: query parameters encoding the player's score, difficulty, and
  completed word count.
- Output: a PNG image generated server-side (e.g. via Canvas API in a
  Worker or a headless renderer).
- The Worker is deployed separately from the Cloudflare Pages site.

## Deployment

Deploy manually with Wrangler after filling in the placeholder values in
`wrangler.toml`:

```
npm install -g wrangler
wrangler deploy
```

Do not commit real account IDs or zone IDs. Set them in `wrangler.toml`
locally or via Wrangler secrets.
