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
    width: 100%;
    max-width: 100%;
    flex: 1;
    min-height: 0;
    height: 0; /* triggers proper flex sizing on mobile */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
    background: rgba(255,255,255,0.97);
    border: 3px solid #2c2c2c;
    border-radius: 8px;
    box-shadow: 4px 4px 0 #2c2c2c;
    padding: var(--space-sm);
  }

  @media (min-width: 720px) {
    .clue-panel {
      width: 280px;
      min-width: 240px;
      max-width: 320px;
      height: calc(100vh - 80px);
      max-height: calc(100vh - 80px);
    }
  }

  @media (max-width: 719px) {
    .clue-panel {
      max-height: 40vh;
    }
  }

  .tabs { display: flex; gap: 4px; margin-bottom: var(--space-sm); }

  .tab {
    flex: 1;
    padding: var(--space-xs) var(--space-sm);
    background: #5c94fc;
    color: #ffffff;
    border: 2px solid #2c2c2c;
    border-radius: 4px;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 0.4rem;
    font-weight: normal;
    transition: background 0.15s;
    letter-spacing: 0.05em;
  }

  .tab.active {
    background: #e52222;
    color: #ffffff;
  }

  .tab:focus-visible { outline: 2px solid #ffd700; outline-offset: 2px; }

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
    font-family: var(--font-body);
    font-size: 0.8rem;
    text-align: left;
    color: var(--color-text);
    line-height: 1.4;
    transition: background 0.1s;
  }

  .clue-item:hover { background: rgba(92,148,252,0.12); }

  .clue-item.active-clue {
    background: rgba(92,148,252,0.2);
    color: #2c2c2c;
    font-weight: 600;
  }

  .clue-item:focus-visible { outline: 2px solid #ffd700; outline-offset: 2px; }

  .clue-num {
    font-family: var(--font-display);
    font-size: 0.45rem;
    color: #e52222;
    font-weight: normal;
    flex-shrink: 0;
    min-width: 1.8rem;
    line-height: 1.8;
  }
</style>
