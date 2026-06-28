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

    <!-- Badge counter: social proof -->
    <div class="badge-counter" aria-label="Community badge count">
      <span class="badge-count-num">73+</span>
      <span class="badge-count-label">players have already earned a badge</span>
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

  /* ---- Badge counter ---- */
  .badge-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    background: linear-gradient(135deg, #fef9c3, #fef3c7);
    border: 2px solid #fbbf24;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .badge-count-num {
    font-family: var(--font-display);
    font-size: clamp(1rem, 4vw, 1.4rem);
    color: #b45309;
    text-shadow: 1px 1px 0 #78350f;
    line-height: 1;
  }

  .badge-count-label {
    font-size: 0.7rem;
    color: #92400e;
    font-family: var(--font-body);
    letter-spacing: 0.04em;
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
    margin-bottom: var(--space-md);
  }
  .ms-logo {
    width: 240px;
    max-width: 90%;
    height: auto;
    border-radius: 8px;
  }
</style>
