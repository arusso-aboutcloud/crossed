<script lang="ts">
  import { winResult, difficulty, newPuzzle, goToDifficulty, exitToMenu } from './store';
  import { get } from 'svelte/store';
  import BadgeShare from '../badge/BadgeShare.svelte';
  import { hasEarned, markEarned } from './badgeMemory';

  $: result = $winResult;

  let showBadge = false;
  let isRepeatWin = false;

  // On each new result: capture repeat state BEFORE marking, then mark.
  $: if (result) {
    isRepeatWin = hasEarned(result.difficulty);
    markEarned(result.difficulty);
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function playAgain() {
    newPuzzle(get(difficulty));
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
      <button class="btn btn-share" on:click={() => (showBadge = true)}>Share / Get Badge</button>
      <button class="btn btn-ghost" on:click={exitToMenu}>Exit to Menu</button>
    </div>
  </div>
</div>

{#if showBadge && result}
  <BadgeShare {result} isRepeat={isRepeatWin} onClose={() => (showBadge = false)} />
{/if}

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

  /* Mario palette confetti colors */
  .p0 { background: #5c94fc; }
  .p1 { background: #ffd700; }
  .p2 { background: #e52222; }
  .p3 { background: #43b047; }
  .p4 { background: #ffffff; }
  .p5 { background: #2c2c2c; }

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

  /* Mario-style win heading */
  .heading {
    font-family: var(--font-display);
    font-size: clamp(1rem, 6vw, 1.8rem);
    color: #ffd700;
    margin: 0;
    text-shadow:
      3px 3px 0 #c8a000,
      -1px -1px 0 #2c2c2c,
      1px -1px 0 #2c2c2c,
      -1px 1px 0 #2c2c2c;
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
    background: rgba(255,255,255,0.95);
    border: 3px solid #2c2c2c;
    border-radius: 8px;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    box-shadow: 3px 3px 0 #2c2c2c;
  }

  .stat-label {
    font-family: var(--font-display);
    font-size: 0.35rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: normal;
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: 0.65rem;
    color: var(--color-text);
    text-transform: capitalize;
    font-weight: normal;
  }

  .diff-easy   { color: #43b047; }
  .diff-medium { color: #5c94fc; }
  .diff-hard   { color: #f97316; }
  .diff-pro    { color: #ffd700; }

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
    border-radius: 6px;
    font-size: 0.7rem;
    font-family: var(--font-display);
    font-weight: normal;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    border: none;
    letter-spacing: 0.05em;
  }

  .btn:active { transform: translate(2px, 2px); }
  .btn:focus-visible { outline: 2px solid #ffd700; outline-offset: 3px; }

  .btn-primary {
    background: #e52222;
    color: #fff;
    border: 2px solid #8b0000;
    box-shadow: 4px 4px 0 #8b0000;
  }
  .btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #8b0000;
  }

  .btn-secondary {
    background: #ffffff;
    color: #2c2c2c;
    border: 2px solid #2c2c2c;
    box-shadow: 3px 3px 0 #2c2c2c;
  }
  .btn-secondary:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #2c2c2c;
  }

  .btn-share {
    background: #ffd700;
    color: #2c2c2c;
    border: 2px solid #c8a000;
    box-shadow: 3px 3px 0 #c8a000;
  }
  .btn-share:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #c8a000;
  }

  .btn-ghost {
    background: transparent;
    color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.3);
    font-size: 0.55rem;
    font-family: var(--font-body);
    box-shadow: none;
  }
  .btn-ghost:hover { color: #ffffff; border-color: rgba(255,255,255,0.6); }
</style>
