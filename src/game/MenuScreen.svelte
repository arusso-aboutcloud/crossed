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
      <div class="ms-logo-wrap">
        <img src="/ms-security-pixel.svg" alt="Microsoft Security" class="ms-logo" width="240" height="75" />
      </div>
      <h1 class="title">CROSSEC</h1>
      <p class="subtitle">The Ultimate Security Challenge</p>
      <p class="tagline">Microsoft Cloud Security | aboutcloud.io</p>
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
      <a href="https://blog.aboutcloud.io" target="_blank" rel="noopener noreferrer" class="blog-link">
        blog.aboutcloud.io
      </a>
      <button class="reset-link" on:click={handleReset} aria-live="polite">
        {resetDone ? 'Progress cleared.' : 'Reset my local progress'}
      </button>
    </div>

  </div>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    padding: 1rem;
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
    padding: 2.5rem;
    max-width: 460px;
    max-height: calc(100svh - 2rem);
    overflow-y: auto;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    /* Thin styled scrollbar for overflow content */
    scrollbar-width: thin;
    scrollbar-color: #2c2c2c transparent;
  }

  .card::-webkit-scrollbar {
    width: 4px;
  }
  .card::-webkit-scrollbar-track {
    background: transparent;
  }
  .card::-webkit-scrollbar-thumb {
    background: #2c2c2c;
    border-radius: 2px;
  }

  @media (max-height: 700px) {
    .card {
      padding: 1.2rem;
      gap: var(--space-md);
    }
    .badge-preview img {
      width: 56px;
      height: 56px;
    }
    .title {
      font-size: clamp(1rem, 5vw, 1.8rem);
    }
    .ms-logo {
      width: 180px;
    }
  }

  /* ---- Brand / Hero ---- */
  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  /* Mario-style pixel font title */
  .title {
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 6vw, 2.2rem);
    color: #e52222;
    text-shadow:
      3px 3px 0 #8b0000,
      -1px -1px 0 #2c2c2c,
      1px -1px 0 #2c2c2c,
      -1px 1px 0 #2c2c2c;
    margin: 0;
    letter-spacing: 0.05em;
    -webkit-text-fill-color: unset;
    background: none;
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
    font-size: 0.55rem;
    color: var(--color-muted);
    text-transform: uppercase;
    letter-spacing: 0.10em;
    font-family: var(--font-display);
  }

  .badge-caption {
    font-size: 0.75rem;
    color: var(--color-muted);
    font-style: italic;
    margin: 0;
    font-family: var(--font-body);
  }

  /* ---- Play button - Mario style ---- */
  .play-btn {
    font-family: var(--font-display);
    font-size: 0.7rem;
    background: #e52222;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 1rem 2rem;
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
    padding: var(--space-sm) var(--space-lg);
    border-radius: 8px;
    font-size: 0.75rem;
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

  .blog-link {
    color: #0891b2;
    font-size: 0.75rem;
    font-family: var(--font-body);
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.85;
  }
  .blog-link:hover { opacity: 1; color: #0369a1; }
  .blog-link:focus-visible { outline: 2px solid #ffd700; outline-offset: 3px; border-radius: 2px; }

  .ms-logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-md);
  }
  .ms-logo {
    width: 240px;
    max-width: 90%;
    height: auto;
    border-radius: 8px;
  }
</style>
