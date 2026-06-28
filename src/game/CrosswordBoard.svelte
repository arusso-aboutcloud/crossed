<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {
    puzzle, entries, focusKey, activeDir, difficulty, elapsedSeconds,
    checkWin, countWordsSolved, triggerWin
  } from './store';
  import type { PlacedWord } from '$lib/types';

  let boardEl: HTMLElement;
  let hiddenInput: HTMLInputElement;

  let viewportW = 375; // SSR safe default
  let viewportH = 667;
  let cellSize = 32;

  $: puz = $puzzle;
  $: ents = $entries;
  $: fKey = $focusKey;
  $: aDir = $activeDir;

  $: activeWord = puz ? getActiveWord(puz.placed, fKey, aDir) : null;

  $: cols = puz ? puz.cols : 13;
  $: rows = puz ? puz.rows : 13;
  $: isMobile = viewportW < 720;
  $: {
    // Minimal horizontal margin so grid uses as much width as possible on mobile.
    // Vertical: reserve top-bar (~56px) + clue panel (~38% of viewport height).
    const hPad = isMobile ? 8 : 48;
    const vPad = isMobile ? 56 + Math.floor(viewportH * 0.38) : 120;
    const maxW = Math.floor((viewportW - hPad) / cols);
    const maxH = Math.floor((viewportH - vPad) / rows);
    // Allow up to 34px on mobile (was 30) for larger phones.
    cellSize = Math.max(18, Math.min(isMobile ? 34 : 38, maxW, maxH));
  }

  function getActiveWord(placed: PlacedWord[], fk: string, dir: 'across' | 'down'): PlacedWord | null {
    if (!fk) return null;
    const [fr, fc] = fk.split(',').map(Number);
    let found = placed.find((p) => {
      if (p.direction !== dir) return false;
      for (let i = 0; i < p.answer.length; i++) {
        const r = p.direction === 'down' ? p.row + i : p.row;
        const c = p.direction === 'across' ? p.col + i : p.col;
        if (r === fr && c === fc) return true;
      }
      return false;
    });
    if (!found) {
      const opp = dir === 'across' ? 'down' : 'across';
      found = placed.find((p) => {
        if (p.direction !== opp) return false;
        for (let i = 0; i < p.answer.length; i++) {
          const r = p.direction === 'down' ? p.row + i : p.row;
          const c = p.direction === 'across' ? p.col + i : p.col;
          if (r === fr && c === fc) return true;
        }
        return false;
      });
    }
    return found || null;
  }

  function isActiveCell(r: number, c: number): boolean {
    if (!activeWord) return false;
    const w = activeWord;
    for (let i = 0; i < w.answer.length; i++) {
      const wr = w.direction === 'down' ? w.row + i : w.row;
      const wc = w.direction === 'across' ? w.col + i : w.col;
      if (wr === r && wc === c) return true;
    }
    return false;
  }

  function getClueNum(r: number, c: number): number | null {
    if (!puz) return null;
    const starters = puz.placed.slice().sort((a, b) =>
      a.row !== b.row ? a.row - b.row : a.col - b.col
    );
    const seen = new Map<string, number>();
    let n = 1;
    for (const p of starters) {
      const k = `${p.row},${p.col}`;
      if (!seen.has(k)) seen.set(k, n++);
    }
    return seen.get(`${r},${c}`) ?? null;
  }

  function cellClick(r: number, c: number) {
    if (!puz || !puz.cells[`${r},${c}`]) return;
    const newKey = `${r},${c}`;
    if (fKey === newKey) {
      const hasAcross = puz.placed.some(p =>
        p.direction === 'across' && p.row === r && p.col <= c && p.col + p.answer.length > c
      );
      const hasDown = puz.placed.some(p =>
        p.direction === 'down' && p.col === c && p.row <= r && p.row + p.answer.length > r
      );
      if (hasAcross && hasDown) activeDir.update(d => d === 'across' ? 'down' : 'across');
    } else {
      focusKey.set(newKey);
      const hasAcross = puz.placed.some(p =>
        p.direction === 'across' && p.row === r && p.col <= c && p.col + p.answer.length > c
      );
      activeDir.set(hasAcross ? 'across' : 'down');
    }
    hiddenInput?.focus();
  }

  function advanceFocus() {
    if (!puz) return;
    const fk = get(focusKey);
    if (!fk) return;
    const [fr, fc] = fk.split(',').map(Number);
    const dir = get(activeDir);
    if (dir === 'across') {
      const nc = fc + 1;
      if (nc < puz.cols && puz.cells[`${fr},${nc}`]) { focusKey.set(`${fr},${nc}`); return; }
    } else {
      const nr = fr + 1;
      if (nr < puz.rows && puz.cells[`${nr},${fc}`]) { focusKey.set(`${nr},${fc}`); return; }
    }
    jumpToNextWord();
  }

  function retreatFocus() {
    if (!puz) return;
    const fk = get(focusKey);
    if (!fk) return;
    const [fr, fc] = fk.split(',').map(Number);
    const dir = get(activeDir);
    if (dir === 'across') {
      const pc = fc - 1;
      if (pc >= 0 && puz.cells[`${fr},${pc}`]) focusKey.set(`${fr},${pc}`);
    } else {
      const pr = fr - 1;
      if (pr >= 0 && puz.cells[`${pr},${fc}`]) focusKey.set(`${pr},${fc}`);
    }
  }

  function jumpToNextWord() {
    if (!puz) return;
    const allWords = [...puz.clues.across, ...puz.clues.down].sort((a, b) =>
      a.number !== b.number ? a.number - b.number : (a.direction === 'across' ? -1 : 1)
    );
    if (allWords.length === 0) return;
    if (!activeWord) {
      focusKey.set(`${allWords[0].row},${allWords[0].col}`);
      activeDir.set(allWords[0].direction);
      return;
    }
    const idx = allWords.findIndex(w =>
      w.entryId === activeWord!.entryId && w.direction === activeWord!.direction
    );
    const next = allWords[(idx + 1) % allWords.length];
    focusKey.set(`${next.row},${next.col}`);
    activeDir.set(next.direction);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!puz) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      const fk = get(focusKey);
      if (!fk) return;
      const cur = get(entries);
      if (cur[fk]) {
        entries.update(v => { const n = { ...v }; delete n[fk]; return n; });
      } else {
        retreatFocus();
        const nk = get(focusKey);
        entries.update(v => { const n = { ...v }; delete n[nk]; return n; });
      }
      return;
    }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); activeDir.set('across'); retreatFocus(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); activeDir.set('across'); advanceFocus(); return; }
    if (e.key === 'ArrowUp')    { e.preventDefault(); activeDir.set('down');   retreatFocus(); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); activeDir.set('down');   advanceFocus(); return; }
    if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); jumpToNextWord(); return; }
  }

  function handleInput(e: Event) {
    const fk = get(focusKey);
    if (!puz || !fk) return;
    const inp = e.target as HTMLInputElement;
    const raw = inp.value.toUpperCase().replace(/[^A-Z]/g, '');
    inp.value = '';
    if (!raw) return;
    const letter = raw[raw.length - 1];
    const prev = get(entries);
    const next = { ...prev, [fk]: letter };
    entries.set(next);
    advanceFocus();
    if (checkWin(puz, next)) {
      const solved = countWordsSolved(puz, next);
      triggerWin({
        difficulty: get(difficulty),
        elapsedSeconds: get(elapsedSeconds),
        wordsPlaced: puz.placed.length,
        wordsSolved: solved,
        totalCells: Object.keys(puz.cells).length,
        seed: puz.seed,
      });
    }
  }

  onMount(() => {
    viewportW = window.innerWidth;
    viewportH = window.innerHeight;
    const handleResize = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

{#if puz}
  <div class="board-wrap" style="color-scheme: light only; filter: brightness(100%); -webkit-filter: brightness(100%);">
    <input
      bind:this={hiddenInput}
      class="hidden-inp"
      type="text"
      inputmode="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="characters"
      spellcheck="false"
      aria-label="Letter input"
      on:keydown={handleKeyDown}
      on:input={handleInput}
    />

    <div
      bind:this={boardEl}
      class="board"
      style="--rows: {puz.rows}; --cols: {puz.cols}; --cell-size: {cellSize}px; grid-template-columns: repeat({puz.cols}, {cellSize}px); grid-template-rows: repeat({puz.rows}, {cellSize}px);"
    >
      {#each Array.from({ length: puz.rows }, (_, r) => r) as r}
        {#each Array.from({ length: puz.cols }, (_, c) => c) as c}
          {@const key = `${r},${c}`}
          {@const isEnterable = !!puz.cells[key]}
          {@const isFocused = fKey === key}
          {@const isActive = isActiveCell(r, c)}
          {@const letter = ents[key] ?? ''}
          {@const isCorrect = !!letter && letter === puz.cells[key]}
          {@const cn = isEnterable ? getClueNum(r, c) : null}
          <div
            class="cell"
            class:enterable={isEnterable}
            class:filled={!isEnterable}
            class:focused={isFocused}
            class:active-word={isActive && !isFocused}
            class:correct={isCorrect}
            style="color-scheme: light;"
            on:click={() => cellClick(r, c)}
            on:keydown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') cellClick(r, c); }}
            role={isEnterable ? 'button' : 'presentation'}
            tabindex={isEnterable ? 0 : -1}
            aria-label={isEnterable ? `Cell ${r + 1},${c + 1}` : undefined}
          >
            {#if isEnterable}
              {#if cn}<span class="num">{cn}</span>{/if}
              <span class="ltr">{letter}</span>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  </div>
{/if}

<style>
  .board-wrap {
    width: max-content;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    color-scheme: light only;
    background: #ffffff !important;
    border-radius: 8px;
    position: relative;
    z-index: 1;
    box-shadow: 4px 4px 0 #2c2c2c, 0 0 0 3px #ffd700;
    /*
     * FORCE-DARK FIX: Chrome on Android applies dark-mode inversion at the GPU
     * compositing layer AFTER CSS is computed, so !important alone fails.
     * Adding a filter forces a new compositing layer; Chrome's force-dark
     * algorithm explicitly skips elements that carry a non-identity filter.
     * brightness(1) is a no-op visually but opts the entire board out of inversion.
     */
    -webkit-filter: brightness(100%);
    filter: brightness(100%);
  }

  .hidden-inp {
    position: fixed;
    top: -200px;
    left: -200px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    border: none;
  }

  .board {
    display: grid;
    gap: 0;
    margin: 0 auto;
    border: 2px solid #2c2c2c;
    border-radius: 4px;
    overflow: hidden;
  }

  .cell {
    width: var(--cell-size);
    height: var(--cell-size);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    border: 2px solid #2c2c2c !important;
    /* Explicit white - !important defeats Android OS force-dark mode */
    background: #ffffff !important;
    color: #1a1a1a !important;
    box-sizing: border-box;
    box-shadow: inset -2px -2px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.5);
    color-scheme: light only;
  }

  .cell.filled {
    /* Explicit dark for blocked cells - !important needed for same reason */
    background: #2c2c2c !important;
    box-shadow: inset -2px -2px 0 rgba(0,0,0,0.5);
    cursor: default;
  }

  .cell.enterable {
    background: #ffffff !important;
    cursor: pointer;
  }

  .cell.active-word {
    background: #b3d9ff !important;
    box-shadow: inset -2px -2px 0 rgba(0,100,180,0.2), inset 2px 2px 0 rgba(255,255,255,0.6);
  }

  .cell.focused {
    background: #ffd700 !important;
    box-shadow: inset -2px -2px 0 rgba(180,140,0,0.5), inset 2px 2px 0 rgba(255,255,200,0.8);
    z-index: 2;
  }

  .cell.correct {
    background: rgba(67, 176, 71, 0.35) !important;
  }

  .cell:focus-visible { outline: 2px solid #e52222; outline-offset: -2px; }

  .num {
    position: absolute;
    top: 1px;
    left: 2px;
    font-size: calc(max(9px, var(--cell-size) * 0.28));
    font-weight: 700;
    color: #1a1a1a !important;
    pointer-events: none;
    line-height: 1;
  }

  .ltr {
    font-family: 'Arial Black', Arial, sans-serif;
    font-weight: 900;
    font-size: calc(var(--cell-size) * 0.55);
    color: #1a1a1a !important;
    text-transform: uppercase;
    line-height: 1;
  }
</style>
