<script lang="ts">
  import { onMount } from 'svelte';
  import { drawBadge, renderBadge, getBadgeSpec } from './renderer';
  import type { WinResult } from '$lib/types';
  import { SITE_URL } from '$lib/siteConfig';

  export let result: WinResult;
  export let onClose: () => void = () => {};
  export let isRepeat: boolean = false;

  let canvas: HTMLCanvasElement;
  let state: 'rendering' | 'ready' | 'sharing' | 'error' = 'rendering';
  let errorMsg = '';
  let copyLabel = 'Copy Link';
  let cachedBlob: Blob | null = null;

  const TIER_LABELS: Record<string, string> = {
    easy: 'COMPLETED',
    medium: 'ACCOMPLISHED',
    hard: 'MASTERED',
    pro: 'LEGENDARY',
  };

  onMount(() => {
    requestAnimationFrame(() => {
      try {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = 315;   // preview at half badge width (badge is 630x840)
        const H = 420;   // preview at half badge height
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);
        drawBadge(ctx, result, W, H);
        state = 'ready';
      } catch (err) {
        state = 'error';
        errorMsg = err instanceof Error ? err.message : 'Render failed';
      }
    });
  });

  async function getBlob(): Promise<Blob> {
    if (cachedBlob) return cachedBlob;
    const b = await renderBadge(result);
    cachedBlob = b;
    return b;
  }

  // Primary share path: native Web Share API (mobile/tablet).
  // The OS share sheet handles Instagram, LinkedIn, X, and saving natively.
  async function handleNativeShare() {
    state = 'sharing';
    try {
      const blob = await getBlob();
      const file = new File([blob], `crossed-${result.difficulty}.png`, { type: 'image/png' });
      const spec = getBadgeSpec(result.difficulty);
      const text = `I just earned the ${spec.displayName} badge on Crossed - Microsoft Cloud Security Crossword!`;
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Crossed', text, url: SITE_URL, files: [file] });
      } else {
        // Fallback on unsupported browsers: download the PNG.
        downloadBlob(blob);
      }
    } catch {
      // User cancelled share sheet or share is unavailable.
    } finally {
      state = 'ready';
    }
  }

  // LinkedIn share-offsite endpoint - shares the game URL.
  // The page Open Graph card provides the preview on LinkedIn's side.
  function handleLinkedIn() {
    const url = encodeURIComponent(SITE_URL);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer,width=600,height=500'
    );
  }

  // X tweet-intent endpoint - pre-fills short, friendly text.
  function handleX() {
    const spec = getBadgeSpec(result.difficulty);
    const text = encodeURIComponent(
      `I just earned the ${spec.displayName} badge on Crossed - Microsoft Cloud Security Crossword! Try it:`
    );
    const url = encodeURIComponent(SITE_URL);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer,width=600,height=500'
    );
  }

  // Bluesky compose-intent endpoint.
  function handleBluesky() {
    const spec = getBadgeSpec(result.difficulty);
    const text = encodeURIComponent(
      `I just earned the ${spec.displayName} badge on Crossed - Microsoft Cloud Security Crossword! Try it: ${SITE_URL}`
    );
    window.open(
      `https://bsky.app/intent/compose?text=${text}`,
      '_blank',
      'noopener,noreferrer,width=600,height=500'
    );
  }

  async function handleDownload() {
    try {
      const blob = await getBlob();
      downloadBlob(blob);
    } catch { /* ignore */ }
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crossed-${result.difficulty}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      copyLabel = 'Copied!';
    } catch {
      copyLabel = 'Copy failed';
    }
    setTimeout(() => (copyLabel = 'Copy Link'), 2000);
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Share your badge">
  <div class="panel">

    <div class="hdr">
      <h2 class="title">Your Badge</h2>
      <button class="close-btn" on:click={onClose} aria-label="Close">X</button>
    </div>

    {#if isRepeat}
      <div class="repeat-notice" role="status">
        You have already earned this badge - and it is still yours.
        Download, share, or keep playing; nothing is withheld.
      </div>
    {/if}

    <div class="preview-wrap">
      <!-- Canvas is always mounted; placeholder overlays it while rendering. -->
      <canvas bind:this={canvas} class="preview" aria-label="Badge preview"></canvas>
      {#if state === 'rendering'}
        <div class="placeholder" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          <span>Rendering badge...</span>
        </div>
      {:else if state === 'error'}
        <div class="placeholder err">Badge render failed: {errorMsg}</div>
      {/if}
    </div>

    <div class="tier-pip tier-{result.difficulty}" aria-label="Tier">
      {result.difficulty.toUpperCase()} - {TIER_LABELS[result.difficulty]}
    </div>

    <!-- Mobile / tablet: native OS share sheet (handles all platforms). -->
    <div class="actions">
      <button class="btn primary" disabled={state !== 'ready'} on:click={handleNativeShare}>
        {state === 'sharing' ? 'Sharing...' : 'Share Badge'}
      </button>
    </div>

    <!-- Desktop explicit platform buttons. -->
    <div class="social-row">
      <button
        class="btn social-btn li-btn"
        disabled={state !== 'ready'}
        on:click={handleLinkedIn}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <img src="/brand/linkedin.svg" alt="" aria-hidden="true" class="brand-icon" />
        LinkedIn
      </button>
      <button
        class="btn social-btn x-btn"
        disabled={state !== 'ready'}
        on:click={handleX}
        aria-label="Post on X"
        title="Post on X"
      >
        <img src="/brand/x.svg" alt="" aria-hidden="true" class="brand-icon icon-invert" />
        Post on X
      </button>
      <button
        class="btn social-btn bsky-btn"
        disabled={state !== 'ready'}
        on:click={handleBluesky}
        aria-label="Post on Bluesky"
        title="Post on Bluesky"
      >
        <img src="/brand/bluesky.svg" alt="" aria-hidden="true" class="brand-icon" />
        Bluesky
      </button>
    </div>

    <!-- Instagram: no web share intent exists; guide the user to the app. -->
    <p class="instagram-hint">
      Instagram: Download your badge and post the PNG from the Instagram app.
    </p>

    <!-- Utility actions. -->
    <div class="actions actions-util">
      <button class="btn secondary" disabled={state !== 'ready'} on:click={handleDownload}>
        Download PNG
      </button>
      <button class="btn ghost" disabled={state !== 'ready'} on:click={handleCopyLink}>
        {copyLabel}
      </button>
    </div>

    <p class="note">
      No data is sent to any server. Badge is generated locally in your browser.
      Sharing only opens the official platform page - no SDKs, no tracking.
    </p>

  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 70;
    padding: var(--space-md);
  }

  .panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: var(--space-lg);
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    max-height: 92vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .hdr { display: flex; align-items: center; justify-content: space-between; }

  .title { font-size: 1.1rem; color: var(--color-accent); margin: 0; letter-spacing: 0.05em; }

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

  .repeat-notice {
    background: rgba(0, 120, 212, 0.10);
    border: 1px solid rgba(0, 120, 212, 0.30);
    border-radius: 8px;
    padding: var(--space-sm) var(--space-md);
    font-size: 0.82rem;
    color: var(--color-text);
    line-height: 1.5;
    text-align: center;
  }

  .preview-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    background: #111;
    border-radius: 8px;
    overflow: hidden;
    min-height: 200px;
  }

  .preview {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 6px;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    background: #111;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  .placeholder.err { color: var(--color-wrong); }

  .spinner {
    display: block;
    width: 28px;
    height: 28px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }

  .tier-pip {
    text-align: center;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.15em;
  }

  .tier-easy   { color: #3ddf50; }
  .tier-medium { color: #4a88ff; }
  .tier-hard   { color: #aa55ee; }
  .tier-pro    { color: #ffd700; }

  .actions { display: flex; flex-direction: column; gap: var(--space-sm); }
  .actions-util { margin-top: 0; }

  .social-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-sm);
  }

  .btn {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    border: none;
    transition: transform 0.1s;
  }

  .btn:disabled { opacity: 0.5; cursor: default; }
  .btn:active:not(:disabled) { transform: scale(0.97); }
  .btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }

  .primary { background: var(--color-accent); color: #fff; }
  .primary:hover:not(:disabled) { background: var(--color-accent-hover); }

  .secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
  .secondary:hover:not(:disabled) { border-color: var(--color-accent); }

  .ghost { background: transparent; color: var(--color-muted); font-weight: 400; }
  .ghost:hover:not(:disabled) { color: var(--color-text); }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    font-size: 0.88rem;
  }

  .social-btn:hover:not(:disabled) { border-color: var(--color-accent); }

  .brand-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  /* X logo is black-on-transparent; invert to white for the dark UI. */
  .icon-invert { filter: invert(1); }

  .instagram-hint {
    font-size: 0.74rem;
    color: var(--color-muted);
    text-align: center;
    margin: 0;
    line-height: 1.45;
  }

  .note { font-size: 0.72rem; color: var(--color-muted); text-align: center; margin: 0; line-height: 1.4; }
</style>
