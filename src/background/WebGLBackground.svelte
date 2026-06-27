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
    background: linear-gradient(135deg, #fafaf7 0%, #e0f2fe 60%, #f0fdf4 100%);
  }
</style>
