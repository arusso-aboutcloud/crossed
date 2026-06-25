<script lang="ts">
  import { soundEnabled, resumeGame, newPuzzle, exitToMenu, difficulty } from './store';
  import { get } from 'svelte/store';

  export let onRules: () => void = () => {};

  let confirmNew = false;
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Game paused">
  <div class="panel">
    <h2 class="heading">Paused</h2>

    {#if confirmNew}
      <p class="confirm-msg">Start a new puzzle? Progress will be lost.</p>
      <div class="actions">
        <button class="btn btn-danger" on:click={() => { confirmNew = false; newPuzzle(get(difficulty)); }}>
          New Puzzle
        </button>
        <button class="btn btn-ghost" on:click={() => (confirmNew = false)}>Cancel</button>
      </div>
    {:else}
      <div class="actions">
        <button class="btn btn-primary" on:click={resumeGame}>Resume</button>
        <button class="btn btn-secondary" on:click={() => (confirmNew = true)}>New Puzzle</button>
        <button class="btn btn-secondary" on:click={onRules}>How to Play</button>
        <button class="btn btn-ghost" on:click={() => soundEnabled.update(v => !v)}>
          Sound: {$soundEnabled ? 'On' : 'Off'}
        </button>
        <button class="btn btn-ghost" on:click={exitToMenu}>Exit to Menu</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(4px);
  }

  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    width: 90%;
    max-width: 320px;
    align-items: center;
  }

  .heading { font-size: 1.6rem; color: var(--color-text); margin: 0; letter-spacing: 0.05em; }

  .confirm-msg { color: var(--color-text); margin: 0; text-align: center; font-size: 0.9rem; }

  .actions { display: flex; flex-direction: column; gap: var(--space-sm); width: 100%; }

  .btn {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.1s;
    letter-spacing: 0.03em;
  }

  .btn:active { transform: scale(0.97); }
  .btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }

  .btn-primary { background: var(--color-accent); color: #fff; border: none; }
  .btn-primary:hover { background: var(--color-accent-hover); }

  .btn-secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
  .btn-secondary:hover { border-color: var(--color-accent); }

  .btn-ghost { background: transparent; color: var(--color-muted); border: none; font-weight: 400; }
  .btn-ghost:hover { color: var(--color-text); }

  .btn-danger { background: var(--color-wrong); color: #fff; border: none; }
</style>
