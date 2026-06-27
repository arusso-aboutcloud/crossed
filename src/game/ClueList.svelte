<script lang="ts">
  import { puzzle, focusKey, activeDir } from './store';
  import type { ClueLine } from '$lib/types';

  $: puz = $puzzle;
  $: fKey = $focusKey;
  $: aDir = $activeDir;

  function isActiveClue(cl: ClueLine): boolean {
    if (!puz || !fKey) return false;
    if (cl.direction !== aDir) return false;
    const [fr, fc] = fKey.split(',').map(Number);
    for (let i = 0; i < cl.length; i++) {
      const r = cl.direction === 'down' ? cl.row + i : cl.row;
      const c = cl.direction === 'across' ? cl.col + i : cl.col;
      if (r === fr && c === fc) return true;
    }
    return false;
  }

  function selectClue(cl: ClueLine) {
    focusKey.set(`${cl.row},${cl.col}`);
    activeDir.set(cl.direction);
  }

  let showAcross = true;
</script>

{#if puz}
  <div class="clue-panel">
    <div class="tabs">
      <button class="tab" class:active={showAcross} on:click={() => (showAcross = true)}>Across</button>
      <button class="tab" class:active={!showAcross} on:click={() => (showAcross = false)}>Down</button>
    </div>

    <div class="clue-list">
      {#each showAcross ? puz.clues.across : puz.clues.down as cl (cl.entryId + cl.direction)}
        <button
          class="clue-item"
          class:active-clue={isActiveClue(cl)}
          on:click={() => selectClue(cl)}
        >
          <span class="clue-num">{cl.number}.</span>
          <span class="clue-text">{cl.clue} ({cl.length})</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .clue-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    /*
     * height (not max-height) gives the column flex a definite size, allowing
     * .clue-list { flex: 1 } to fill the remainder and overflow-y: auto to
     * actually scroll. max-height alone does not create a definite flex axis
     * size, so flex:1 children collapse and the scroll never activates.
     */
    height: 40vh;
    overflow: hidden;
  }

  @media (min-width: 720px) {
    /* In the grid layout, let height be determined by content up to the viewport. */
    .clue-panel {
      height: auto;
      max-height: calc(100vh - 64px);
      max-width: 320px;
    }
  }

  .tabs { display: flex; gap: 2px; margin-bottom: var(--space-sm); }

  .tab {
    flex: 1;
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-muted);
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab.active { color: var(--color-accent); border-color: var(--color-accent); }
  .tab:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

  .clue-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .clue-item {
    display: flex;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
    text-align: left;
    color: var(--color-text);
    line-height: 1.4;
    transition: background 0.1s;
  }

  .clue-item:hover { background: rgba(14,165,233,0.08); }

  .clue-item.active-clue {
    background: rgba(14, 165, 233, 0.15);
    color: var(--color-accent);
  }

  .clue-item:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

  .clue-num { color: var(--color-muted); flex-shrink: 0; min-width: 1.8rem; font-weight: 600; }
</style>
