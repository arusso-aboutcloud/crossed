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
    <span class="timer">
      <span class="ms-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="0" y="0" width="7" height="7" fill="#f25022"/>
          <rect x="9" y="0" width="7" height="7" fill="#7fba00"/>
          <rect x="0" y="9" width="7" height="7" fill="#00a4ef"/>
          <rect x="9" y="9" width="7" height="7" fill="#ffb900"/>
        </svg>
      </span>
      {formatTime($elapsedSeconds)}
    </span>
    <div class="top-actions">
      <button class="bar-btn" on:click={pauseGame}>Pause</button>
      <button class="bar-btn" on:click={() => (confirmNew = true)}>New</button>
    </div>
  </header>

  {#if $puzzle}
    <div class="play-area">
      <CrosswordBoard />
      <ClueList />
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
  .board-screen { display: flex; flex-direction: column; min-height: 100vh; max-height: 100vh; overflow: hidden; }

  .top-bar {
    display: flex;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: #e52222;
    border-bottom: 3px solid #8b0000;
    color: #ffffff;
    box-shadow: 0 3px 0 rgba(0,0,0,0.3);
    gap: var(--space-md);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .diff-label {
    font-family: var(--font-display);
    font-size: clamp(0.5rem, 1.2vw, 0.75rem);
    color: #ffffff;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-shadow: 1px 1px 0 #8b0000;
    font-weight: normal;
    white-space: nowrap;
  }

  .timer {
    font-family: var(--font-display);
    font-size: clamp(0.7rem, 1.5vw, 1.0rem);
    color: #ffffff;
    margin: 0 auto;
    letter-spacing: 0.1em;
    text-shadow: 1px 1px 0 #8b0000;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .ms-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .top-actions { display: flex; gap: var(--space-sm); }

  .bar-btn {
    padding: var(--space-xs) var(--space-sm);
    background: #ffffff;
    color: #e52222;
    border: 2px solid #8b0000;
    font-family: var(--font-display);
    font-size: clamp(0.45rem, 1.1vw, 0.65rem);
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 2px 2px 0 #8b0000;
    transition: transform 0.1s, box-shadow 0.1s;
    letter-spacing: 0.05em;
    min-height: 36px;
    min-width: 48px;
  }

  .bar-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #8b0000;
  }

  .bar-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #8b0000;
  }

  .bar-btn:focus-visible { outline: 2px solid #ffd700; outline-offset: 2px; }

  .play-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: var(--space-sm);
    gap: var(--space-sm);
    position: relative;
    z-index: 1;
    width: 100%;
    box-sizing: border-box;
  }

  /* Tablet (600px+): board and clue panel side by side. */
  @media (min-width: 600px) {
    .play-area {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      padding: var(--space-md);
      gap: var(--space-md);
    }
  }

  /* Desktop (1024px+): a bit more breathing room. */
  @media (min-width: 1024px) {
    .play-area {
      padding: var(--space-lg);
      gap: var(--space-lg);
    }
  }

  /* Ultrawide (1600px+): cap content width and centre it so dead space is minimal. */
  @media (min-width: 1600px) {
    .play-area {
      max-width: 1600px;
      align-self: center;
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
    background: #ffffff;
    border: 4px solid #2c2c2c;
    border-radius: 12px;
    padding: var(--space-xl);
    max-width: 320px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    text-align: center;
    box-shadow: 6px 6px 0 #2c2c2c;
  }

  .confirm-box p { color: var(--color-text); margin: 0; font-family: var(--font-body); }

  .confirm-actions { display: flex; gap: var(--space-md); justify-content: center; }

  .btn-confirm-yes {
    background: #e52222;
    color: #fff;
    border: 2px solid #8b0000;
    padding: var(--space-sm) var(--space-md);
    border-radius: 6px;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 0.45rem;
    box-shadow: 3px 3px 0 #8b0000;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .btn-confirm-yes:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #8b0000;
  }

  .btn-confirm-no {
    background: #ffffff;
    color: #2c2c2c;
    border: 2px solid #2c2c2c;
    padding: var(--space-sm) var(--space-md);
    border-radius: 6px;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 0.45rem;
    box-shadow: 3px 3px 0 #2c2c2c;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .btn-confirm-no:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #2c2c2c;
  }
</style>
