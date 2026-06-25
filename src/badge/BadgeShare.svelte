<script lang="ts">
  import { onMount } from 'svelte';
  import { drawBadge, renderBadge } from './renderer';
  import type { WinResult } from '$lib/types';

  export let result: WinResult;
  export let onClose: () => void = () => {};

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
        const W = 600;
        const H = 315;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = '600px';
        canvas.style.height = '315px';
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

  async function handleShare() {
    state = 'sharing';
    try {
      const blob = await getBlob();
      const file = new File([blob], `crossed-${result.difficulty}.png`, { type: 'image/png' });
      const text = `I just completed the Crossed Microsoft Cloud Security crossword on ${result.difficulty.toUpperCase()} difficulty! Try it at aboutcloud.io`;
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Crossed', text, files: [file] });
      } else {
        downloadBlob(blob);
      }
    } catch {
      // user cancelled or share unsupported
    } finally {
      state = 'ready';
    }
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
      await navigator.clipboard.writeText(window.location.origin);
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

    <div class="preview-wrap">
      <!-- Canvas is always mounted; placeholder overlays it while rendering -->
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

    <div class="actions">
      <button class="btn primary" disabled={state !== 'ready'} on:click={handleShare}>
        {state === 'sharing' ? 'Sharing...' : 'Share Badge'}
      </button>
      <button class="btn secondary" disabled={state !== 'ready'} on:click={handleDownload}>
        Download PNG
      </button>
      <button class="btn ghost" disabled={state !== 'ready'} on:click={handleCopyLink}>
        {copyLabel}
      </button>
    </div>

    <p class="note">
      No data is sent to any server. Badge is generated locally in your browser.
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

  .preview-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1200 / 630;
    background: #111;
    border-radius: 8px;
    overflow: hidden;
  }

  .preview {
    display: block;
    width: 100%;
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

  .tier-easy   { color: #cd7f32; }
  .tier-medium { color: #b0bcc8; }
  .tier-hard   { color: #ffd700; }
  .tier-pro    { color: #c8d4ff; }

  .actions { display: flex; flex-direction: column; gap: var(--space-sm); }

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

  .note { font-size: 0.72rem; color: var(--color-muted); text-align: center; margin: 0; line-height: 1.4; }
</style>
