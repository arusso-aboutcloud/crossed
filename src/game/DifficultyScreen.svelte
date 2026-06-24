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

<style>
  .diff-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: var(--space-lg);
    gap: var(--space-lg);
    justify-content: center;
  }

  .heading {
    font-size: 1.4rem;
    color: var(--color-text);
    margin: 0;
    letter-spacing: 0.05em;
  }

  .tiers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    width: 100%;
    max-width: 480px;
  }

  .tier-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-md) var(--space-md);
    border-radius: 12px;
    border: 2px solid var(--color-border);
    background: var(--color-surface);
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    gap: var(--space-xs);
    transition: transform 0.1s, box-shadow 0.15s, border-color 0.15s;
    min-height: 100px;
  }

  .tier-card:active { transform: scale(0.97); }

  .tier-card:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  .tier-label {
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .tier-desc { font-size: 0.75rem; color: var(--color-muted); line-height: 1.3; }

  .tier-words { font-size: 0.7rem; color: var(--color-muted); margin-top: auto; }

  .tier-easy { border-color: #4ade80; }
  .tier-easy .tier-label { color: #4ade80; }
  .tier-easy:hover { box-shadow: 0 0 16px rgba(74, 222, 128, 0.3); border-color: #86efac; }

  .tier-medium { border-color: var(--color-accent); }
  .tier-medium .tier-label { color: var(--color-accent); }
  .tier-medium:hover { box-shadow: 0 0 16px rgba(0, 120, 212, 0.3); }

  .tier-hard { border-color: #f97316; }
  .tier-hard .tier-label { color: #f97316; }
  .tier-hard:hover { box-shadow: 0 0 20px rgba(249, 115, 22, 0.35); border-color: #fb923c; }

  .tier-pro {
    border-color: #a855f7;
    background: linear-gradient(135deg, var(--color-surface) 60%, rgba(168, 85, 247, 0.08));
  }
  .tier-pro .tier-label { color: #a855f7; }
  .tier-pro:hover { box-shadow: 0 0 28px rgba(168, 85, 247, 0.45); border-color: #c084fc; }

  .back-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-muted);
    padding: var(--space-sm) var(--space-lg);
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    transition: color 0.15s, border-color 0.15s;
  }

  .back-btn:hover { color: var(--color-text); border-color: var(--color-text); }
  .back-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
</style>
