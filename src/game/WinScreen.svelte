<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { winResult, difficulty, newPuzzle, goToDifficulty, exitToMenu } from './store';
  import { get } from 'svelte/store';
  import BadgeShare from '../badge/BadgeShare.svelte';
  import { hasEarned, markEarned } from './badgeMemory';

  $: result = $winResult;

  let showBadge = false;
  let isRepeatWin = false;
  let confettiCanvas: HTMLCanvasElement | undefined;
  let stopConfetti: (() => void) | null = null;

  // On each new result: capture repeat state BEFORE marking, then mark.
  $: if (result) {
    isRepeatWin = hasEarned(result.difficulty);
    markEarned(result.difficulty);
    if (!isRepeatWin) {
      try { (window as any).umami?.track('badge_earned', { difficulty: result.difficulty }); } catch (_) { /* ignore */ }
    }
  }

  // Mario palette confetti colors.
  const CONFETTI_COLORS = [
    '#5c94fc', '#ffd700', '#e52222', '#43b047',
    '#ec4899', '#fbbf24', '#f97316', '#7dd3fc', '#ffffff',
  ];

  function launchConfetti(cvs: HTMLCanvasElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

    const ctxOrNull = cvs.getContext('2d');
    if (!ctxOrNull) return () => {};
    // Assign to a definitely-typed const so TypeScript does not lose the
    // non-null narrowing inside the draw/spawnBurst closure below.
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const W = cvs.offsetWidth || 400;
    const H = cvs.offsetHeight || 600;
    cvs.width = W;
    cvs.height = H;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      angle: number; aVel: number;
      color: string;
      w: number; h: number;
      life: number; maxLife: number;
    }

    // Two bursts: an initial volley, then a second wave 300 ms later.
    const N = 70;
    const particles: Particle[] = [];

    function spawnBurst(delay: number, count: number, spread: number) {
      setTimeout(() => {
        for (let k = 0; k < count; k++) {
          const a = (Math.PI * 2 * k) / count + (Math.random() - 0.5) * spread;
          const speed = 4 + Math.random() * 6;
          particles.push({
            x: W * 0.5 + (Math.random() - 0.5) * 40,
            y: H * 0.28,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed - 3.5,
            angle: Math.random() * Math.PI * 2,
            aVel: (Math.random() - 0.5) * 0.25,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            w: 7 + Math.random() * 7,
            h: 4 + Math.random() * 5,
            life: 0,
            maxLife: 90 + Math.floor(Math.random() * 50),
          });
        }
      }, delay);
    }

    spawnBurst(0, N, 1.2);
    spawnBurst(320, Math.floor(N * 0.5), 2.0);

    const GRAVITY = 0.13;
    let raf = 0;
    let done = false;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of particles) {
        p.life++;
        if (p.life >= p.maxLife) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.vx *= 0.992;
        p.angle += p.aVel;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (alive > 0 && !done) raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      done = true;
      cancelAnimationFrame(raf);
    };
  }

  onMount(() => {
    if (confettiCanvas) {
      stopConfetti = launchConfetti(confettiCanvas);
    }
  });

  onDestroy(() => {
    stopConfetti?.();
  });

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
  <canvas bind:this={confettiCanvas} class="confetti-canvas" aria-hidden="true"></canvas>

  <div class="content">
    <h1 class="heading">Puzzle Complete!</h1>
    <h2 class="awesome-text">You are awesome!</h2>

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

  .confetti-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
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

  .awesome-text {
    font-family: var(--font-display);
    font-size: clamp(0.65rem, 3vw, 1.0rem);
    color: #ffd700;
    text-shadow: 2px 2px 0 #b45309, -1px -1px 0 #92400e;
    text-align: center;
    margin: 0;
    animation: awesome-pulse 1.5s ease-in-out infinite;
  }

  @keyframes awesome-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.06); opacity: 0.88; }
  }

  @media (prefers-reduced-motion: reduce) {
    .awesome-text { animation: none; }
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
    border: 2px solid #ffd700;
    border-radius: 8px;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    box-shadow: 0 0 10px rgba(255,215,0,0.35), 3px 3px 0 #b45309;
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
