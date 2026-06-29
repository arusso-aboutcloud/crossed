<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { bgEnabled, gamePhase } from '../game/store';
  import { createBackground, type BgController } from './background';

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let controller: BgController | null = null;
  let useFallback = false;
  let cleanupResize: (() => void) | null = null;

  $: if (controller) controller.setEnabled($bgEnabled);
  $: if (controller) controller.setPaused($gamePhase === 'win');

  // Dim the background during play so cubes do not compete with the grid.
  // Lighter overlay on menu/difficulty/win/paused phases so formations are visible.
  // Mario sky blue overlay preserves the palette during play.
  $: overlayOpacity = $gamePhase === 'playing' ? 0.52 : 0.20;

  onMount(() => {
    try {
      controller = createBackground(canvas);
    } catch {
      controller = null;
    }
    if (!controller) {
      useFallback = true;
      return;
    }
    function onResize() {
      if (controller && container) {
        controller.resize(container.clientWidth, container.clientHeight);
      }
    }
    window.addEventListener('resize', onResize);
    cleanupResize = () => window.removeEventListener('resize', onResize);
  });

  onDestroy(() => {
    cleanupResize?.();
    controller?.dispose();
  });
</script>

<div bind:this={container} class="bg-wrap" aria-hidden="true">
  {#if !useFallback}
    <canvas bind:this={canvas} class="bg-canvas"></canvas>
  {:else}
    <div class="bg-fallback"></div>
  {/if}
  <!-- Dim overlay: heavier during play, lighter on other screens; Mario sky blue tint.
       The radial gradient shades the edges slightly darker than the center, giving a
       natural focus vignette at zero GPU cost on all quality tiers. -->
  <div
    class="bg-dim"
    style="background: radial-gradient(ellipse at 50% 50%, rgba(92,148,252,{overlayOpacity * 0.75}) 0%, rgba(20,55,150,{Math.min(overlayOpacity + 0.18, 1)}) 100%);"
  ></div>
</div>

<style>
  .bg-wrap {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .bg-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .bg-fallback {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #5c94fc 0%, #3b7de8 60%, #43b047 100%);
  }

  .bg-dim {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
</style>
