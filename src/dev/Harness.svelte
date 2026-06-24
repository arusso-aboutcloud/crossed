<script lang="ts">
  import { generate, DIFFICULTY_CONFIG } from '$lib/generator';
  import { getAllEntries } from '$lib/bank';
  import type { Difficulty, GeneratorResult, ClueLine } from '$lib/types';

  let difficulty: Difficulty = 'medium';
  let seedInput = '42';
  let result: GeneratorResult | null = null;
  let error = '';

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
  const entries = getAllEntries();

  function run() {
    error = '';
    try {
      const seed = parseInt(seedInput, 10);
      if (isNaN(seed)) { error = 'Seed must be an integer.'; return; }
      result = generate(entries, difficulty, seed);
    } catch (e) {
      error = String(e);
    }
  }

  function randomSeed() {
    seedInput = String(Math.floor(Math.random() * 2 ** 31));
    run();
  }

  run();

  function cellKey(r: number, c: number) { return `${r},${c}`; }

  function clueNum(r: number, c: number): number | null {
    if (!result) return null;
    const match = result.placed.find((p) => p.row === r && p.col === c);
    if (!match) return null;
    const all = result.placed.slice().sort((a, b) =>
      a.row !== b.row ? a.row - b.row : a.col - b.col
    );
    const seen = new Set<string>();
    let n = 1;
    for (const p of all) {
      const k = `${p.row},${p.col}`;
      if (!seen.has(k)) { seen.add(k); if (k === cellKey(r, c)) return n; n++; }
    }
    return null;
  }
</script>

<h1>crossed - generator dev harness</h1>

<div class="controls">
  <div class="control-group">
    <label>Difficulty</label>
    <div class="btn-row">
      {#each difficulties as d}
        <button class:active={difficulty === d} on:click={() => { difficulty = d; run(); }}>{d}</button>
      {/each}
    </div>
  </div>
  <div class="control-group">
    <label for="seed-input">Seed</label>
    <input id="seed-input" type="number" bind:value={seedInput} on:change={run} />
    <button on:click={randomSeed}>Random seed</button>
    <button on:click={run}>Regenerate</button>
  </div>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if result}
  <div class="stats">
    <span>Seed: <strong>{result.seed}</strong></span>
    <span>Dimensions: <strong>{result.rows} x {result.cols}</strong></span>
    <span>Words: <strong>{result.stats.wordsPlaced}</strong> / target {result.stats.targetWords}</span>
    <span>Crossings: <strong>{result.stats.crossings}</strong></span>
    <span>Time: <strong>{result.stats.generationMs}ms</strong></span>
    <span>Config: <strong>max {DIFFICULTY_CONFIG[difficulty].maxDim}</strong></span>
  </div>

  <div class="layout">
    <div class="grid-wrap">
      <table class="xw-grid">
        <tbody>
          {#each Array.from({ length: result.rows }, (_, r) => r) as r}
            <tr>
              {#each Array.from({ length: result.cols }, (_, c) => c) as c}
                {@const letter = result.cells[cellKey(r, c)]}
                {@const num = letter ? clueNum(r, c) : null}
                <td class:filled={!!letter} class:blocked={!letter}>
                  {#if letter}
                    {#if num}<span class="cn">{num}</span>{/if}
                    <span class="letter">{letter}</span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="clue-cols">
      <div class="clue-list">
        <h2>Across</h2>
        {#each result.clues.across as cl}
          <div class="clue-item">
            <span class="clue-num">{cl.number}.</span>
            <span class="clue-text">{cl.clue} ({cl.length})</span>
          </div>
        {/each}
      </div>
      <div class="clue-list">
        <h2>Down</h2>
        {#each result.clues.down as cl}
          <div class="clue-item">
            <span class="clue-num">{cl.number}.</span>
            <span class="clue-text">{cl.clue} ({cl.length})</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
  .control-group { display: flex; align-items: center; gap: 0.5rem; }
  label { color: var(--color-muted); font-size: 0.85rem; }
  .btn-row { display: flex; gap: 0.25rem; }
  button { padding: 0.25rem 0.75rem; border: 1px solid var(--color-border); border-radius: 4px;
    background: var(--color-surface); color: var(--color-text); cursor: pointer; font-size: 0.85rem; }
  button.active { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
  input[type=number] { width: 8rem; padding: 0.25rem 0.5rem; border: 1px solid var(--color-border);
    border-radius: 4px; background: var(--color-surface); color: var(--color-text); font-size: 0.85rem; }
  .stats { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;
    font-size: 0.8rem; color: var(--color-muted); }
  .stats strong { color: var(--color-text); }
  .error { color: var(--color-wrong); margin-bottom: 1rem; }
  .layout { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
  .grid-wrap { overflow: auto; }
  .xw-grid { border-collapse: collapse; }
  .xw-grid td { width: 2rem; height: 2rem; border: 1px solid var(--color-border);
    position: relative; text-align: center; font-size: 0.9rem; font-weight: 600; }
  .xw-grid td.filled { background: var(--color-surface); color: var(--color-text); }
  .xw-grid td.blocked { background: #111; border-color: #111; }
  .cn { position: absolute; top: 1px; left: 2px; font-size: 0.5rem;
    font-weight: 400; color: var(--color-muted); line-height: 1; }
  .letter { display: block; margin-top: 0.3rem; }
  .clue-cols { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .clue-list { min-width: 14rem; max-width: 22rem; }
  .clue-list h2 { font-size: 0.9rem; color: var(--color-accent); margin-bottom: 0.5rem; }
  .clue-item { display: flex; gap: 0.25rem; font-size: 0.8rem; margin-bottom: 0.3rem;
    line-height: 1.4; color: var(--color-text); }
  .clue-num { color: var(--color-muted); flex-shrink: 0; min-width: 1.5rem; }
</style>
