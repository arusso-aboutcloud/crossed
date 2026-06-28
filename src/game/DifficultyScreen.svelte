<script lang="ts">
  import { DIFFICULTY_CONFIG } from '$lib/generator';
  import { newPuzzle, exitToMenu } from './store';
  import type { Difficulty } from '$lib/types';

  const tiers: { diff: Difficulty; label: string; desc: string; cls: string }[] = [
    { diff: 'easy',   label: 'Easy',   desc: 'Recognition and definitions',        cls: 'tier-easy' },
    { diff: 'medium', label: 'Medium', desc: 'Applied security knowledge',          cls: 'tier-medium' },
    { diff: 'hard',   label: 'Hard',   desc: 'Precise and acronym-driven',          cls: 'tier-hard' },
    { diff: 'pro',    label: 'Pro',    desc: 'Scenario-based edge knowledge',       cls: 'tier-pro' },
  ];
</script>

<div class="diff-screen">
  <div class="card">
    <h2 class="heading">Choose Difficulty</h2>

    <div class="tiers">
      {#each tiers as t}
        <button class="tier-card {t.cls}" on:click={() => newPuzzle(t.diff)}>
          <span class="tier-label">{t.label}</span>
          <span class="tier-desc">{t.desc}</span>
          <span class="tier-words">{DIFFICULTY_CONFIG[t.diff].targetWords} words</span>
        </button>
      {/each}
    </div>

    <button class="back-btn" on:click={() => exitToMenu()}>Back</button>
  </div>
</div>

<style>
  .diff-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: var(--space-lg);
    justify-content: center;
  }

  /* Mario-style card matching MenuScreen */
  .card {
    background: rgba(255,255,255,0.95);
    border: 4px solid #2c2c2c;
    border-radius: 12px;
    box-shadow: 6px 6px 0 #2c2c2c, 0 0 0 2px #ffd700;
    padding: 2.5rem;
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
  }

  .heading {
    font-family: var(--font-display);
    font-size: 0.8rem;
    color: #e52222;
    margin: 0;
    letter-spacing: 0.05em;
    text-shadow: 2px 2px 0 #8b0000;
  }

  .tiers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    width: 100%;
  }

  .tier-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-md) var(--space-md);
    border-radius: 8px;
    border: 3px solid #2c2c2c;
    background: #ffffff;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    gap: var(--space-xs);
    transition: transform 0.1s, box-shadow 0.1s;
    min-height: 100px;
    box-shadow: 3px 3px 0 #2c2c2c;
  }

  .tier-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #2c2c2c;
  }

  .tier-card:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }

  .tier-card:focus-visible {
    outline: 2px solid #ffd700;
    outline-offset: 3px;
  }

  .tier-label {
    font-family: var(--font-display);
    font-size: 0.5rem;
    font-weight: normal;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .tier-desc { font-size: 0.75rem; color: var(--color-muted); line-height: 1.3; font-family: var(--font-body); }

  .tier-words { font-size: 0.7rem; color: var(--color-muted); margin-top: auto; font-family: var(--font-body); }

  .tier-easy { border-color: #43b047; }
  .tier-easy .tier-label { color: #43b047; }
  .tier-easy:hover { box-shadow: 5px 5px 0 #43b047; border-color: #43b047; }

  .tier-medium { border-color: #5c94fc; }
  .tier-medium .tier-label { color: #5c94fc; }
  .tier-medium:hover { box-shadow: 5px 5px 0 #5c94fc; }

  .tier-hard { border-color: #f97316; }
  .tier-hard .tier-label { color: #f97316; }
  .tier-hard:hover { box-shadow: 5px 5px 0 #f97316; border-color: #f97316; }

  .tier-pro {
    border-color: #ffd700;
    background: linear-gradient(135deg, #ffffff 60%, rgba(255,215,0,0.12));
  }
  .tier-pro .tier-label { color: #c8a000; }
  .tier-pro:hover { box-shadow: 5px 5px 0 #c8a000; border-color: #ffd700; }

  .back-btn {
    background: #ffffff;
    color: #2c2c2c;
    border: 2px solid #2c2c2c;
    padding: var(--space-sm) var(--space-lg);
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--font-display);
    font-size: 0.45rem;
    box-shadow: 3px 3px 0 #2c2c2c;
    transition: transform 0.1s, box-shadow 0.1s;
    letter-spacing: 0.05em;
  }

  .back-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #2c2c2c;
  }

  .back-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }

  .back-btn:focus-visible { outline: 2px solid #ffd700; outline-offset: 3px; }
</style>
