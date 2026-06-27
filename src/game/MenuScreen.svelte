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
  <div class="card">

    <!-- Hero section -->
    <div class="brand">
      <div class="hero-accents" aria-hidden="true">
        <span class="accent-icon">&#9728;</span>
        <span class="accent-icon accent-right">&#127768;</span>
      </div>
      <h1 class="title">CROSSEC</h1>
      <p class="subtitle">The Ultimate Summer Security Challenge</p>
      <p class="tagline">Microsoft Cloud Security - Summer Edition | aboutcloud.io</p>
    </div>

    <!-- Badge showcase -->
    <div class="badge-showcase">
      <div class="badge-row">
        {#each ['easy','medium','hard','pro'] as tier}
          <div class="badge-preview">
            <img src="/badges/badge-{tier}.svg" alt="{tier} badge" width="80" height="80" />
            <span class="badge-label">{tier}</span>
          </div>
        {/each}
      </div>
      <p class="badge-caption">Earn a badge for completing each difficulty</p>
    </div>

    <!-- Primary CTA -->
    <button class="play-btn" on:click={goToDifficulty}>Play</button>

    <!-- Secondary actions -->
    <div class="actions">
      <button class="btn btn-secondary" on:click={onRules}>How to Play</button>
      <button class="btn btn-icon" on:click={() => soundEnabled.update(v => !v)}
        aria-label={$soundEnabled ? 'Mute sound' : 'Enable sound'}>
        {$soundEnabled ? 'Sound: On' : 'Sound: Off'}
      </button>
    </div>

    <!-- Footer row -->
    <div class="footer-row">
      <button class="reset-link" on:click={handleReset} aria-live="polite">
        {resetDone ? 'Progress cleared.' : 'Reset my local progress'}
      </button>
      <p class="legal">MIT code - CC-BY-4.0 content</p>
    </div>

  </div>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-lg);
    text-align: center;
  }

  /* Frosted card surface for legibility over the WebGL background */
  .card {
    background: rgba(250, 250, 247, 0.93);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    border: 1px solid rgba(229, 224, 216, 0.7);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }

  /* ---- Brand / Hero ---- */
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    position: relative;
  }

  .hero-accents {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    padding: 0 0.5rem;
  }

  .accent-icon {
    font-size: 1.5rem;
    opacity: 0.45;
    line-height: 1;
  }

  /* Shimmer animation - disabled under prefers-reduced-motion */
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .title {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 900;
    letter-spacing: 0.12em;
    background: linear-gradient(
      135deg,
      #0ea5e9 0%,
      #f59e0b 50%,
      #ef4444 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .title {
      animation: none;
      background: none;
      -webkit-text-fill-color: var(--color-text);
      color: var(--color-text);
    }
  }

  .subtitle {
    font-size: clamp(0.85rem, 2.5vw, 1.05rem);
    color: var(--color-text);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
    opacity: 0.85;
  }

  .tagline {
    font-size: 0.75rem;
    color: var(--color-muted);
    margin: 0;
  }

  /* ---- Badge showcase ---- */
  .badge-showcase {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
  }

  .badge-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .badge-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .badge-preview img {
    width: 80px;
    height: 80px;
    display: block;
  }

  @media (max-width: 400px) {
    .badge-preview img {
      width: 56px;
      height: 56px;
    }
  }

  .badge-label {
    font-size: 0.65rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.10em;
    font-weight: 600;
  }

  .badge-caption {
    font-size: 0.75rem;
    color: var(--color-muted);
    font-style: italic;
    margin: 0;
  }

  /* ---- Play button ---- */
  .play-btn {
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0.9rem 2.5rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    letter-spacing: 0.05em;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(14, 165, 233, 0.35);
    transition: transform 0.15s, box-shadow 0.15s;
    width: 100%;
    max-width: 280px;
  }

  .play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(14, 165, 233, 0.45);
    background: var(--color-accent-hover);
  }

  .play-btn:active {
    transform: scale(0.97);
  }

  .play-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  /* ---- Secondary actions ---- */
  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: 100%;
    max-width: 280px;
  }

  .btn {
    padding: var(--space-sm) var(--space-lg);
    border-radius: 8px;
    font-size: 0.95rem;
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

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .btn-icon {
    background: transparent;
    color: var(--color-muted);
    font-size: 0.85rem;
    padding: var(--space-xs) var(--space-md);
  }

  .btn-icon:hover { color: var(--color-text); }

  /* ---- Footer row ---- */
  .footer-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

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

  .legal { font-size: 0.7rem; color: var(--color-muted); margin: 0; }
</style>
