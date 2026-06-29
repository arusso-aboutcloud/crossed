<script lang="ts">
  import { gamePhase } from './store';
  import MenuScreen from './MenuScreen.svelte';
  import DifficultyScreen from './DifficultyScreen.svelte';
  import BoardScreen from './BoardScreen.svelte';
  import PauseOverlay from './PauseOverlay.svelte';
  import WinScreen from './WinScreen.svelte';
  import RulesOverlay from './RulesOverlay.svelte';
  import { fade } from 'svelte/transition';

  let showRules = false;

  let reducedMotion = false;
  if (typeof window !== 'undefined') {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  $: screenDur = reducedMotion ? 0 : 220;
</script>

<div class="shell">
  {#if $gamePhase === 'menu'}
    <div class="screen-wrap" in:fade={{ duration: screenDur }}>
      <MenuScreen onRules={() => (showRules = true)} />
    </div>
  {:else if $gamePhase === 'difficulty'}
    <div class="screen-wrap" in:fade={{ duration: screenDur }}>
      <DifficultyScreen />
    </div>
  {:else if $gamePhase === 'playing' || $gamePhase === 'paused'}
    <div class="screen-wrap" in:fade={{ duration: screenDur }}>
      <BoardScreen onRules={() => (showRules = true)} />
    </div>
    {#if $gamePhase === 'paused'}
      <PauseOverlay onRules={() => (showRules = true)} />
    {/if}
  {:else if $gamePhase === 'win'}
    <div class="screen-wrap" in:fade={{ duration: screenDur }}>
      <WinScreen />
    </div>
  {/if}

  {#if showRules}
    <RulesOverlay onClose={() => (showRules = false)} />
  {/if}
</div>

<style>
  .shell {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  .screen-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 100vh;
  }
</style>
