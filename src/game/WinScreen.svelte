<script lang="ts">
  import { winResult, difficulty, newPuzzle, goToDifficulty, exitToMenu, onWin } from './store';
  import { get } from 'svelte/store';

  $: result = $winResult;

  function formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function playAgain() {
    newPuzzle(get(difficulty));
  }

  function handleShare() {
    if (result) onWin(result);
  }
</script>

<div class="win-screen">
  <div class="confetti" aria-hidden="true">
    {#each Array.from({ length: 12 }) as _, i}
      <span class="piece p{i % 6}" style="left: {(i * 7 + 5)}%; animation-delay: {i * 0.15}s;"></span>
    {/each}
  </div>

  <div class="content">
    <h1 class="heading">Puzzle Complete!</h1>

    {#if result}
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Difficulty</span>
          <span class="stat-value diff-{result.difficulty}">{result.difficulty}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Time</span>
          <span class="stat-value">{formatTime(result.elapsedSeconds)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Words</span>
          <span class="stat-value">{result.wordsSolved} / {result.wordsPlaced}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Cells</span>
          <span class="stat-value">{result.totalCells}</span>
        </div>
      </div>
    {/if}

    <div class="actions">
      <button class="btn btn-primary" on:click={playAgain}>Play Again</button>
      <button class="btn btn-secondary" on:click={goToDifficulty}>Change Difficulty</button>
      <div class="share-wrap">
        <button class="btn btn-share" on:click={handleShare}>Share / Get Badge</button>
        <span class="stub-note">Badge sharing coming soon</span>
      </div>
      <button class="btn btn-ghost" on:click={exitToMenu}>Exit to Menu</button>
    </div>
  </div>
</div>

<style>
  .win-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-lg);
    position: relative;
    overflow: hidden;
  }

  .confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

  .piece {
    position: absolute;
    top: -20px;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    animation: fall 3s ease-in forwards;
  }

  .p0 { background: #3b82f6; }
  .p1 { background: #a855f7; }
  .p2 { background: #0ea5e9; }
  .p3 { background: #4ade80; }
  .p4 { background: #f97316; }
  .p5 { background: #ec4899; }

  @keyframes fall {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .piece { animation: none; display: none; }
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    z-index: 1;
    text-align: center;
  }

  .heading {
    font-size: clamp(2rem, 10vw, 3.5rem);
    font-weight: 900;
    color: var(--color-accent);
    margin: 0;
    text-shadow: 0 0 30px rgba(0, 120, 212, 0.5);
    letter-spacing: 0.05em;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    width: 100%;
    max-width: 320px;
  }

  .stat {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .stat-label { font-size: 0.7rem; color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.08em; }

  .stat-value { font-size: 1.2rem; font-weight: 700; color: var(--color-text); text-transform: capitalize; }

  .diff-easy   { color: #4ade80; }
  .diff-medium { color: var(--color-accent); }
  .diff-hard   { color: #f97316; }
  .diff-pro    { color: #a855f7; }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: 100%;
    max-width: 280px;
    align-items: center;
  }

  .btn {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.1s;
    border: none;
  }

  .btn:active { transform: scale(0.97); }
  .btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }

  .btn-primary { background: var(--color-accent); color: #fff; }
  .btn-primary:hover { background: var(--color-accent-hover); }

  .btn-secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }

  .share-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 4px; }

  .btn-share {
    width: 100%;
    background: linear-gradient(135deg, #a855f7, #3b82f6);
    color: #fff;
    opacity: 0.85;
  }

  .stub-note { font-size: 0.7rem; color: var(--color-muted); }

  .btn-ghost { background: transparent; color: var(--color-muted); font-weight: 400; }
  .btn-ghost:hover { color: var(--color-text); }
</style>
