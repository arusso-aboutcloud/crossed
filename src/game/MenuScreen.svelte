<script lang="ts">
  import { soundEnabled, goToDifficulty } from './store';
  import { clearProgress } from './badgeMemory';

  export let onRules: () => void = () => {};

  let resetDone = false;

  function handleReset() {
    clearProgress();
    resetDone = true;
    setTimeout(() => (resetDone = false), 2500);
  }
</script>

<div class="menu">
  <div class="brand">
    <h1 class="title">CROSSED</h1>
    <p class="subtitle">Microsoft Cloud Security</p>
    <p class="tagline">aboutcloud.io</p>
  </div>

  <div class="actions">
    <button class="btn btn-primary" on:click={goToDifficulty}>Play</button>
    <button class="btn btn-secondary" on:click={onRules}>How to Play</button>
    <button class="btn btn-icon" on:click={() => soundEnabled.update(v => !v)}
      aria-label={$soundEnabled ? 'Mute sound' : 'Enable sound'}>
      {$soundEnabled ? 'Sound: On' : 'Sound: Off'}
    </button>
  </div>

  <button class="reset-link" on:click={handleReset} aria-live="polite">
    {resetDone ? 'Progress cleared.' : 'Reset my local progress'}
  </button>

  <p class="legal">MIT code - CC-BY-4.0 content</p>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: var(--space-xl);
    padding: var(--space-lg);
    text-align: center;
  }

  .brand { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }

  .title {
    font-size: clamp(3rem, 15vw, 6rem);
    font-weight: 900;
    letter-spacing: 0.15em;
    color: var(--color-accent);
    text-shadow: 0 0 40px rgba(0, 120, 212, 0.6);
    margin: 0;
  }

  .subtitle {
    font-size: clamp(0.9rem, 3vw, 1.2rem);
    color: var(--color-text);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0;
  }

  .tagline { font-size: 0.75rem; color: var(--color-muted); margin: 0; }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    width: 100%;
    max-width: 280px;
  }

  .btn {
    padding: var(--space-md) var(--space-lg);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: transform 0.1s, box-shadow 0.15s;
    letter-spacing: 0.05em;
  }

  .btn:active { transform: scale(0.97); }

  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  .btn-primary {
    background: var(--color-accent);
    color: #fff;
    box-shadow: 0 4px 20px rgba(0, 120, 212, 0.4);
    font-size: 1.1rem;
    padding: var(--space-md) var(--space-xl);
  }

  .btn-primary:hover { background: var(--color-accent-hover); box-shadow: 0 6px 28px rgba(0, 120, 212, 0.5); }

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

  .btn-icon {
    background: transparent;
    color: var(--color-muted);
    font-size: 0.85rem;
    padding: var(--space-sm) var(--space-md);
  }

  .btn-icon:hover { color: var(--color-text); }

  .reset-link {
    background: transparent;
    border: none;
    color: var(--color-muted);
    font-size: 0.7rem;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.7;
  }

  .reset-link:hover { opacity: 1; color: var(--color-text); }
  .reset-link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 2px; }

  .legal { font-size: 0.7rem; color: var(--color-muted); margin-top: auto; }
</style>
