# Difficulty System

## Generation pipeline

Each puzzle is produced by `generate(entries, difficulty, seed)` in `src/lib/generator.ts`.

1. **Seed** - caller supplies a 31-bit integer (random at game-start). `mulberry32(seed)` produces
   a deterministic PRNG used for every shuffle decision, so the same seed always produces the same
   grid.

2. **Word pool** - `getAllEntries()` returns all bank entries. The pool is shuffled with the PRNG.

3. **Greedy placement** (`greedyPlace`) - the first word is placed horizontally at the grid centre.
   Every subsequent word must share at least one letter with an already-placed word (i.e., all words
   must form a connected graph). Placement is scored by `scorePlacement` (crosses with existing
   words) and the highest-scoring candidate is chosen. The placer runs until the `targetWords` count
   is reached or the `ATTEMPT_BUDGET` (4000) is exhausted.

4. **Bounding-box remap** - the placed grid is trimmed to the tightest bounding box, so the puzzle
   occupies exactly `rows x cols` cells, both within the `[minDim, maxDim]` range.

5. **Clue numbering** - words are sorted top-left to bottom-right; each unique start cell gets the
   next sequential number.

6. **Clue assembly** - for each placed word the matching bank entry is looked up by `entryId`, and
   `entry.clues[difficulty]` is used as the clue text. This is the single source of clue hardness:
   the same answer can have four very different clue texts depending on difficulty.

7. **Output** - `GeneratorResult` with `cells`, `placed`, `clues.{across,down}`, grid dimensions,
   and the seed (stored for debugging).

---

## Per-difficulty parameters

| Difficulty | Grid size    | Target words | Clue style                              |
|------------|-------------|-------------|-----------------------------------------|
| easy       | 9-11 cells  | 8           | Recognition and definitions             |
| medium     | 11-13 cells | 12          | Applied security knowledge              |
| hard       | 13-15 cells | 16          | Precise, acronym-driven                 |
| pro        | 15-17 cells | 20          | Scenario-based, edge-knowledge          |

Grid dimension is chosen as `maxDim` (the upper bound) during placement, then trimmed to the
bounding box of placed words, so the final grid is usually smaller than `maxDim`.

---

## Clue-hardness contract

Each bank entry has four clue variants. Authors must follow this contract:

| Tier   | Clue style                                                                              |
|--------|----------------------------------------------------------------------------------------|
| easy   | Plain definition or recognition clue. A player who has heard the term should solve it.  |
| medium | Applied-knowledge clue. Requires knowing what the product/feature actually does.        |
| hard   | Precise or acronym-driven. Uses official terminology, exact acronym expansions, or      |
|        | requires distinguishing near-identical concepts.                                        |
| pro    | Scenario-based or edge-knowledge clue. Requires knowing a specific behaviour, limit,    |
|        | deprecated name, or interplay between two features.                                     |

---

## Variety model

The generator draws from the full bank on every run. Because the pool is shuffled with the seed
before placement, different seeds produce different subsets of words and different grid shapes.

A bank larger than the `targetWords` count is necessary for variety. With a 60-entry bank and a
target of 8 words (easy), there are many possible subsets, and repeated plays will rarely produce
the same puzzle.

---

## Single-word answer constraint

Every answer is a single contiguous uppercase A-Z string with no spaces or hyphens. Multi-word
product names are joined (e.g., CONDITIONALACCESS, SECURESCORE). This constraint is validated by
`validateBank()` in `src/lib/bank.ts`.

---

## Why the bank size matters

| Difficulty | Target words | Minimum distinct bank entries needed  |
|------------|-------------|--------------------------------------|
| easy       | 8           | ~15 (playable but low variety)       |
| medium     | 12          | ~20 for good connectivity            |
| hard       | 16          | ~30 to reliably reach target         |
| pro        | 20          | ~40 to reliably reach target         |

With the original 15-entry bank, hard and pro puzzles often placed fewer than `targetWords` words
(the generator ran out of compatible candidates before exhausting the budget). The expanded 60-entry
bank gives the greedy placer enough material to reach the target at every difficulty.
