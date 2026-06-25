<script lang="ts">
  export let onClose: () => void = () => {};
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="How to play">
  <div class="panel">
    <div class="header">
      <h2>How to Play</h2>
      <button class="close-btn" on:click={onClose} aria-label="Close">X</button>
    </div>

    <div class="content">
      <section>
        <h3>The Crossword</h3>
        <p>Fill in the grid with Microsoft Cloud Security terms. Every puzzle is randomly generated from the full clue bank.</p>
      </section>

      <section>
        <h3>Selecting a Cell</h3>
        <p>Tap any white cell to focus it. Tap the same cell again to toggle between across and down. Type a letter to fill it in.</p>
      </section>

      <section>
        <h3>Difficulty Levels</h3>
        <ul>
          <li><strong>Easy</strong> - recognition and definitions</li>
          <li><strong>Medium</strong> - applied knowledge</li>
          <li><strong>Hard</strong> - acronym-driven, precise</li>
          <li><strong>Pro</strong> - scenario-based edge cases</li>
        </ul>
        <p>The same answer words appear at every level. Only the clue text changes.</p>
      </section>

      <section>
        <h3>Winning</h3>
        <p>Fill in every cell correctly to complete the puzzle. Your time is recorded.</p>
      </section>
    </div>

    <button class="close-full" on:click={onClose}>Got It</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 60;
  }

  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: var(--space-lg);
    width: 90%;
    max-width: 420px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 { margin: 0; font-size: 1.2rem; color: var(--color-accent); }

  .close-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-muted);
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8rem;
  }

  .close-btn:hover { color: var(--color-text); }
  .close-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

  .content { overflow-y: auto; -webkit-overflow-scrolling: touch; flex: 1; }

  section { margin-bottom: var(--space-md); }

  h3 {
    font-size: 0.9rem;
    color: var(--color-accent);
    margin: 0 0 var(--space-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  p { font-size: 0.85rem; color: var(--color-text); margin: 0; line-height: 1.5; }

  ul { font-size: 0.85rem; color: var(--color-text); margin: var(--space-xs) 0; padding-left: 1.2rem; line-height: 1.6; }

  strong { color: var(--color-accent); }

  .close-full {
    background: var(--color-accent);
    color: #fff;
    border: none;
    padding: var(--space-sm) var(--space-lg);
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    align-self: center;
  }

  .close-full:focus-visible { outline: 2px solid var(--color-accent-hover); outline-offset: 3px; }
</style>
