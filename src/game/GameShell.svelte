<script lang="ts">
  import { gamePhase } from './store';
  import MenuScreen from './MenuScreen.svelte';
  import DifficultyScreen from './DifficultyScreen.svelte';
  import BoardScreen from './BoardScreen.svelte';
  import PauseOverlay from './PauseOverlay.svelte';
  import WinScreen from './WinScreen.svelte';
  import RulesOverlay from './RulesOverlay.svelte';

  let showRules = false;
</script>

<div class="shell">
  {#if $gamePhase === 'menu'}
    <MenuScreen onRules={() => (showRules = true)} />
  {:else if $gamePhase === 'difficulty'}
    <DifficultyScreen />
  {:else if $gamePhase === 'playing' || $gamePhase === 'paused'}
    <BoardScreen onRules={() => (showRules = true)} />
    {#if $gamePhase === 'paused'}
      <PauseOverlay onRules={() => (showRules = true)} />
    {/if}
  {:else if $gamePhase === 'win'}
    <WinScreen />
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
</style>
