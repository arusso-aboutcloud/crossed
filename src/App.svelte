<script lang="ts">
  import type { Difficulty } from '$lib/types';

  let selectedDifficulty: Difficulty = 'medium';

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'pro'];
</script>

<header class="app-header">
  <div class="brand">
    <span class="brand-title">Crossed</span>
    <span class="brand-sub">Microsoft Cloud Security</span>
  </div>
</header>

<main class="app-main">
  <section class="difficulty-bar" aria-label="Difficulty selector">
    {#each difficulties as level}
      <button
        class="diff-btn"
        class:active={selectedDifficulty === level}
        on:click={() => (selectedDifficulty = level)}
        aria-pressed={selectedDifficulty === level}
      >
        {level}
      </button>
    {/each}
  </section>

  <section class="grid-area" aria-label="Crossword grid placeholder">
    <p class="placeholder-notice">
      Crossword grid loads here. Generation algorithm not yet implemented.
    </p>
  </section>
</main>

<footer class="app-footer">
  <span>aboutcloud.io &mdash; CC-BY-4.0 content, MIT code</span>
</footer>

<style>
  .app-header {
    display: flex;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .brand {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent);
    letter-spacing: 0.05em;
  }

  .brand-sub {
    font-size: 0.75rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-lg);
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  .difficulty-bar {
    display: flex;
    gap: var(--space-sm);
  }

  .diff-btn {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    text-transform: capitalize;
    font-size: 0.875rem;
    transition: background 0.15s, border-color 0.15s;
  }

  .diff-btn.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;
  }

  .grid-area {
    min-height: 400px;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-notice {
    color: var(--color-muted);
    font-style: italic;
  }

  .app-footer {
    text-align: center;
    padding: var(--space-md);
    font-size: 0.75rem;
    color: var(--color-muted);
    border-top: 1px solid var(--color-border);
  }
</style>
