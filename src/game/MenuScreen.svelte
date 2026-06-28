<script lang="ts">
  import { onMount } from 'svelte';
  import { soundEnabled, goToDifficulty } from './store';
  import { clearProgress, hasEarned } from './badgeMemory';

  export let onRules: () => void = () => {};

  let resetDone = false;

  function handleReset() {
    clearProgress();
    resetDone = true;
    setTimeout(() => (resetDone = false), 2500);
  }

  const TIERS: Array<'easy' | 'medium' | 'hard' | 'pro'> = ['easy', 'medium', 'hard', 'pro'];
  let earnedSet = new Set<string>();

  onMount(() => {
    earnedSet = new Set(TIERS.filter(t => hasEarned(t)));
  });

  $: earnedCount = earnedSet.size;
</script>

<div class="menu">
  <div class="card">

    <!-- Hero section -->
    <div class="brand">
      <div class="ms-logo-wrap">
        <img src="/ms-security-pixel.svg" alt="Microsoft Security" class="ms-logo" width="240" height="75" />
      </div>
      <div class="title-wrap">
        <h1 class="title">CROSSEC</h1>
      </div>
      <p class="subtitle">The Ultimate Security Challenge</p>
      <p class="tagline">Microsoft Cloud Security | aboutcloud.io</p>
    </div>

    <!-- Achievement board - personal progress HUD -->
    <div class="achievement-board" role="region" aria-label="Your badge progress">
      <div class="ab-header">
        <span class="ab-title">BADGE BOARD</span>
        <span class="ab-score">{earnedCount}/4</span>
      </div>
      <div class="ab-badges">
        {#each TIERS as tier}
          <div class="ab-badge" class:earned={earnedSet.has(tier)} title="{tier}">
            <img
              src="/badges/badge-{tier}.svg"
              alt="{tier} badge"
              class="ab-img"
              width="64"
              height="64"
            />
            <span class="ab-tier">{earnedSet.has(tier) ? tier : '???'}</span>
          </div>
        {/each}
      </div>
      <div class="ab-footer">
        <span class="ab-global">0 badge holders worldwide - be the first!</span>
      </div>
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
      <div class="footer-links">
        <a href="https://blog.aboutcloud.io" target="_blank" rel="noopener noreferrer" class="footer-link">
          blog.aboutcloud.io
        </a>
        <span class="footer-sep" aria-hidden="true">|</span>
        <a href="https://github.com/arusso-aboutcloud/crossed" target="_blank" rel="noopener noreferrer" class="footer-link gh-link" aria-label="GitHub repository">
          <svg class="gh-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
      <button class="reset-link" on:click={handleReset} aria-live="polite">
        {resetDone ? 'Progress cleared.' : 'Reset my local progress'}
      </button>
    </div>

  </div>
</div>

<style>
  .menu {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    padding: 0.5rem;
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
  }

  /* Mario-style menu card - thick outline + gold glow */
  .card {
    background: rgba(255,255,255,0.95);
    border: 4px solid #2c2c2c;
    border-radius: 12px;
    box-shadow: 6px 6px 0 #2c2c2c, 0 0 0 2px #ffd700;
    padding: 1.2rem 1.5rem;
    max-width: 440px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
  }

  @media (max-height: 680px) {
    .card { padding: 0.7rem 1.2rem; gap: 0.4rem; }
    .ms-logo { width: 140px; }
    .ab-img { width: 48px; height: 48px; }
    .achievement-board { padding: 0.5rem; }
  }

  /* ---- Brand / Hero ---- */
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  /* Retro arcade title panel */
  .title-wrap {
    background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
    border: 3px solid #ffd700;
    border-radius: 8px;
    padding: 0.5rem 1.6rem 0.6rem;
    box-shadow:
      0 0 24px rgba(255,215,0,0.35),
      inset 0 0 20px rgba(0,0,0,0.6),
      4px 4px 0 #78350f;
    position: relative;
    overflow: hidden;
  }

  /* Scanline overlay inside title panel */
  .title-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0,0,0,0.18) 3px,
      rgba(0,0,0,0.18) 4px
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Retro arcade pixel font title - gold gradient */
  .title {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 6vw, 2.2rem);
    background: linear-gradient(180deg, #fff9c4 0%, #ffd700 45%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter:
      drop-shadow(3px 3px 0 #92400e)
      drop-shadow(0 0 10px rgba(255,215,0,0.5));
    margin: 0;
    letter-spacing: 0.08em;
    position: relative;
    z-index: 1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .title {
      animation: mario-bounce 2s ease-in-out infinite;
    }
  }

  .subtitle {
    font-size: clamp(0.75rem, 2.5vw, 0.95rem);
    color: var(--color-text);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
    opacity: 0.85;
    font-family: var(--font-body);
  }

  .tagline {
    font-size: 0.75rem;
    color: var(--color-muted);
    margin: 0;
    font-family: var(--font-body);
  }

  /* ---- Play button - Mario style ---- */
  .play-btn {
    font-family: var(--font-display);
    font-size: 0.65rem;
    background: #e52222;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 0.7rem 2rem;
    box-shadow: 4px 4px 0 #8b0000;
    letter-spacing: 0.05em;
    transition: transform 0.1s, box-shadow 0.1s;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
  }

  .play-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #8b0000;
  }

  .play-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #8b0000;
  }

  .play-btn:focus-visible {
    outline: 2px solid #ffd700;
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
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: var(--font-body);
    transition: transform 0.1s, box-shadow 0.15s;
    letter-spacing: 0.05em;
  }

  .btn:active { transform: scale(0.97); }

  .btn:focus-visible {
    outline: 2px solid #ffd700;
    outline-offset: 3px;
  }

  .btn-secondary {
    background: #5c94fc;
    color: #ffffff;
    border: 2px solid #2c2c2c;
    box-shadow: 3px 3px 0 #2c2c2c;
  }

  .btn-secondary:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #2c2c2c;
  }

  .btn-icon {
    background: transparent;
    color: var(--color-muted);
    font-size: 0.8rem;
    padding: var(--space-xs) var(--space-md);
    border: 1px solid rgba(44,44,44,0.3);
    border-radius: 6px;
  }

  .btn-icon:hover { color: var(--color-text); border-color: #2c2c2c; }

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
    font-family: var(--font-body);
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.7;
  }

  .reset-link:hover { opacity: 1; color: var(--color-text); }
  .reset-link:focus-visible { outline: 2px solid #ffd700; outline-offset: 3px; border-radius: 2px; }

  /* ---- Achievement board ---- */
  .achievement-board {
    width: 100%;
    background: linear-gradient(135deg, #1e3a5f 0%, #162d4a 100%);
    border: 2px solid #ffd700;
    border-radius: 8px;
    padding: 0.7rem 1rem;
    box-sizing: border-box;
    box-shadow: inset 0 0 20px rgba(255,215,0,0.10), 3px 3px 0 #0a1628;
  }

  .ab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .ab-title {
    font-family: var(--font-display);
    font-size: 0.55rem;
    color: #ffd700;
    letter-spacing: 0.12em;
    text-shadow: 0 0 8px rgba(255,215,0,0.6);
  }

  .ab-score {
    font-family: var(--font-display);
    font-size: 0.65rem;
    background: #ffd700;
    color: #1a1a2e;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-weight: bold;
  }

  .ab-badges {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    flex-wrap: nowrap;
  }

  .ab-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .ab-img {
    width: 56px;
    height: 56px;
    display: block;
    border-radius: 4px;
    transition: filter 0.3s;
    filter: grayscale(0.8) brightness(0.65);
  }

  .ab-badge.earned .ab-img {
    filter: none;
    box-shadow: 0 0 10px rgba(255,215,0,0.5);
  }

  .ab-tier {
    font-family: var(--font-display);
    font-size: 0.42rem;
    color: #7ea8cc;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ab-badge.earned .ab-tier {
    color: #ffd700;
  }

  .ab-footer {
    margin-top: 0.5rem;
    text-align: center;
  }

  .ab-global {
    font-size: 0.65rem;
    color: #7ea8cc;
    font-family: var(--font-body);
    font-style: italic;
  }

  /* ---- Footer links ---- */
  .footer-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-sep {
    color: var(--color-muted);
    font-size: 0.7rem;
    opacity: 0.5;
  }

  .footer-link {
    color: #0891b2;
    font-size: 0.75rem;
    font-family: var(--font-body);
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.85;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .footer-link:hover { opacity: 1; color: #0369a1; }
  .footer-link:focus-visible { outline: 2px solid #ffd700; outline-offset: 3px; border-radius: 2px; }

  .gh-icon {
    width: 14px;
    height: 14px;
    fill: currentColor;
    flex-shrink: 0;
  }

  .ms-logo-wrap {
    display: flex;
    justify-content: center;
  }
  .ms-logo {
    width: 180px;
    max-width: 80%;
    height: auto;
    border-radius: 8px;
  }
</style>
