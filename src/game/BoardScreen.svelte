<script lang="ts">
  import { puzzle, elapsedSeconds, difficulty, pauseGame, newPuzzle } from './store';
  import CrosswordBoard from './CrosswordBoard.svelte';
  import ClueList from './ClueList.svelte';

  export let onRules: () => void = () => {};

  let confirmNew = false;

  function formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }
</script>

<div class="board-screen">
  <header class="top-bar">
    <span class="diff-label">{$difficulty}</span>
    <span class="timer">{formatTime($elapsedSeconds)}</span>
    <div class="top-actions">
      <button class="bar-btn" on:click={pauseGame}>Pause</button>
      <button class="bar-btn" on:click={() => (confirmNew = true)}>New</button>
    </div>
  </header>

  {#if $puzzle}
    <div class="play-area">
      <div class="play-area-inner">
        <CrosswordBoard />
        <ClueList />
      </div>
    </div>
  {/if}
</div>

{#if confirmNew}
  <div class="confirm-backdrop" role="dialog" aria-modal="true" aria-label="Confirm new puzzle">
    <div class="confirm-box">
      <p>Start a new puzzle? Current progress will be lost.</p>
      <div class="confirm-actions">
        <button class="btn-confirm-yes" on:click={() => { confirmNew = false; newPuzzle($difficulty); }}>New Puzzle</button>
        <button class="btn-confirm-no" on:click={() => (confirmNew = false)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .board-screen { display: flex; flex-direction: column; min-height: 100vh; }

  .top-bar {
    display: flex;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    gap: var(--space-md);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .diff-label {
    font-weight: 700;
    color: var(--color-accent);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .timer {
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--color-text);
    margin: 0 auto;
    letter-spacing: 0.1em;
  }

  .top-actions { display: flex; gap: var(--space-sm); }

  .bar-btn {
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
    transition: border-color 0.15s;
  }

  .bar-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .bar-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

  .play-area {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex: 1;
    padding: var(--space-md);
    gap: var(--space-md);
    flex-direction: column;
  }

  .play-area-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: 100%;
  }

  @media (min-width: 720px) {
    /*
     * Center the board+clue pair horizontally. The inner grid sizes board to
     * its natural (content) width and clue panel to a bounded column beside it.
     * max-content on play-area-inner prevents it from stretching to full width.
     */
    .play-area {
      flex-direction: row;
    }

    .play-area-inner {
      display: grid;
      grid-template-columns: max-content minmax(240px, 320px);
      align-items: start;
      gap: var(--space-md);
      width: max-content;
    }
  }

  .confirm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .confirm-box {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: var(--space-xl);
    max-width: 320px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    text-align: center;
  }

  .confirm-box p { color: var(--color-text); margin: 0; }

  .confirm-actions { display: flex; gap: var(--space-md); justify-content: center; }

  .btn-confirm-yes {
    background: var(--color-wrong);
    color: #fff;
    border: none;
    padding: var(--space-sm) var(--space-md);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
  }

  .btn-confirm-no {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: var(--space-sm) var(--space-md);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
  }
</style>
