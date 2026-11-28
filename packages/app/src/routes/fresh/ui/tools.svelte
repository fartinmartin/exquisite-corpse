<script lang="ts">
  import { MediaQuery } from "svelte/reactivity";
  import { drawState } from "#lib/draw/state.svelte.ts";
  import Arrow from "./arrow.svelte";
  import Circled from "./circled.svelte";
  import { hand } from "./hand.svelte.ts";

  type Mode = "draw" | "erase" | "fill";

  type Props = {
    /** Shortcuts only fire while true. */
    enabled?: boolean;
    /** Pressing Enter (when something is drawn). */
    ondone?: () => void;
  };

  let { enabled = true, ondone }: Props = $props();

  const MODES: { value: Mode; key: string }[] = [
    { value: "draw", key: "d" },
    { value: "erase", key: "e" },
    { value: "fill", key: "f" },
  ];

  let colorInput = $state<HTMLInputElement>();

  /*
   * Touch screens get bigger targets. Phones (touch + narrow) get a dock
   * instead: a bar fixed to the bottom of the screen, in thumb reach, with
   * only what you reach for while drawing (undo, tool, colour, done). The
   * colour opens a sheet with the palette, size, redo and clear (clear one
   * step away on purpose). The grip tucks the bar away for more room.
   */
  const coarse = new MediaQuery("(pointer: coarse)");
  const narrow = new MediaQuery("(max-width: 719px)");
  // a phone on its side: short and wide. The dock becomes a rail down one side.
  const short = new MediaQuery("(max-height: 500px) and (orientation: landscape)");
  const rail = $derived(coarse.current && short.current);
  const dock = $derived(coarse.current && (narrow.current || short.current));

  $effect(() => hand.load());

  let sheetOpen = $state(false);
  let tucked = $state(false);
  let dockElement = $state<HTMLElement>();

  // Starting to draw (or tapping anywhere else) closes the sheet.
  function pointerdown(event: PointerEvent) {
    if (sheetOpen && dockElement && !dockElement.contains(event.target as Node)) sheetOpen = false;
  }

  // Small hand-drawn ring around the active tool, a little different per word.
  const RINGS: Record<Mode, string> = {
    draw: "48% 52% 45% 55% / 55% 45% 58% 42%",
    erase: "55% 45% 52% 48% / 45% 58% 42% 55%",
    fill: "45% 55% 48% 52% / 58% 42% 55% 45%",
  };

  function keydown(event: KeyboardEvent) {
    if (!enabled || event.metaKey || event.ctrlKey || event.altKey) return;
    if ((event.target as HTMLElement)?.tagName === "INPUT") return;

    const digit = Number(event.key);
    if (Number.isInteger(digit) && digit > 0 && drawState.colors[digit - 1]) {
      drawState.color = drawState.colors[digit - 1];
      return;
    }

    const keys: Record<string, () => void> = {
      KeyD: () => (drawState.mode = "draw"),
      KeyE: () => (drawState.mode = "erase"),
      KeyF: () => (drawState.mode = "fill"),
      BracketLeft: () => (drawState.size -= 1),
      BracketRight: () => (drawState.size += 1),
      KeyZ: () => drawState.undo(),
      KeyX: () => drawState.redo(),
      KeyC: () => drawState.clear(),
      Enter: () => !drawState.empty && ondone?.(),
    };
    keys[event.code]?.();
  }
</script>

<svelte:window onkeydown={keydown} onpointerdown={pointerdown} />

{#snippet palette(big: boolean)}
  {#each drawState.colors as colour, index (colour)}
    <button
      class="dot"
      class:big
      style:--c={colour}
      aria-pressed={drawState.color === colour}
      aria-label={`colour ${index + 1}`}
      data-key={!big && index < 9 ? String(index + 1) : undefined}
      onclick={() => (drawState.color = colour)}
    ></button>
  {/each}
  {#if !big}{@render addColour("+")}{/if}
{/snippet}

{#snippet addColour(label: string)}
  <button class="word add" aria-label="add a colour" onclick={() => colorInput?.click()}>{label}</button>
  <input
    type="color"
    class="hidden-input"
    bind:this={colorInput}
    onchange={(event) => drawState.addColor(event.currentTarget.value)}
    tabindex="-1"
  />
{/snippet}

{#snippet sizeControl()}
  <span class="preview" aria-hidden="true">
    <span style:--s="{drawState.size * 2.2}px" style:--c={drawState.mode === "erase" ? "transparent" : drawState.color}></span>
  </span>
  <input
    type="range"
    min="1"
    max="10"
    step="1"
    aria-label="brush size"
    value={drawState.size}
    oninput={(event) => (drawState.size = Number(event.currentTarget.value))}
  />
{/snippet}

{#snippet modes()}
  {#each MODES as mode (mode.value)}
    <button
      class="word"
      aria-pressed={drawState.mode === mode.value}
      data-key={dock ? undefined : mode.key}
      style:--ring={RINGS[mode.value]}
      onclick={() => (drawState.mode = mode.value)}>{mode.value}</button
    >
  {/each}
{/snippet}

{#if dock}
  <!-- phones: the dock -->
  <div
    class="dock"
    data-rail={rail || undefined}
    data-hand={hand.side}
    data-tucked={tucked || undefined}
    bind:this={dockElement}
    role="toolbar"
    aria-label="drawing tools"
    aria-orientation={rail ? "vertical" : "horizontal"}
  >
    <button class="grip" aria-label={tucked ? "show the tools" : "tuck the tools away"} aria-expanded={!tucked} onclick={() => ((tucked = !tucked), (sheetOpen = false))}>
      <span aria-hidden="true"></span>
    </button>

    {#if sheetOpen && !tucked}
      <div class="panel" role="group" aria-label="colour and size">
        <div class="panel-row colours">{@render palette(true)}</div>
        <label class="panel-row size">{@render sizeControl()}</label>
        <div class="panel-row">
          {@render addColour("+ colour")}
          <button class="word" onclick={() => drawState.redo()} disabled={!drawState.canRedo}>redo</button>
          <button class="word" onclick={() => drawState.clear()} disabled={drawState.empty}>clear</button>
          {#if rail}
            <button class="word" onclick={() => hand.swap()}>⇆ {hand.side === "right" ? "left" : "right"} side</button>
          {/if}
        </div>
      </div>
    {/if}

    <div class="bar">
      <button class="word" onclick={() => drawState.undo()} disabled={!drawState.canUndo}>undo</button>
      <span class="modes">{@render modes()}</span>
      <button
        class="swatch"
        style:--c={drawState.mode === "erase" ? "#fff" : drawState.color}
        aria-label="colour and size"
        aria-expanded={sheetOpen}
        onclick={() => (sheetOpen = !sheetOpen)}
      ><span style:--s="{Math.max(8, drawState.size * 2.6)}px"></span></button>
      <button class="circled done" disabled={drawState.empty} onclick={() => ondone?.()}>done <Arrow /><Circled snug /></button>
    </div>
  </div>
{:else}

<!--
  The drawing tools, as one quiet line: tool words (the active one circled in
  pencil), the current colour as a bigger swatch with the rest beside it, one
  size control that previews the brush, and undo/redo/clear. Shortcut keys
  show as tiny hints on hover. On phones it's a single row you can scroll.
-->
<div class="tools" class:touchy={coarse.current} role="toolbar" aria-label="drawing tools">
  <span class="group">{@render modes()}</span>

  <span class="group colours" role="group" aria-label="colour">
    <span class="current" style:--c={drawState.color} aria-hidden="true"></span>
    {@render palette(false)}
  </span>

  <label class="group size" data-key="[ ]">{@render sizeControl()}</label>

  <span class="group">
    <button class="word" data-key="z" onclick={() => drawState.undo()} disabled={!drawState.canUndo}>undo</button>
    <button class="word" data-key="x" onclick={() => drawState.redo()} disabled={!drawState.canRedo}>redo</button>
    <button class="word" data-key="c" onclick={() => drawState.clear()} disabled={drawState.empty}>clear</button>
  </span>
</div>
{/if}

<style>
  .tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 14px 30px;
  }

  .group {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex: none;
  }

  /* ---- words ---- */
  .word {
    position: relative;
    padding: 2px 4px;
    font-family: var(--mono);
    font-size: 0.875rem;
    color: var(--ink-soft);
  }

  .word:not(:disabled):hover {
    color: var(--ink);
  }

  .word:disabled {
    opacity: 0.35;
  }

  .word[aria-pressed="true"] {
    color: var(--ink);
  }

  /* pencil ring around the active tool */
  .word[aria-pressed="true"]::before {
    content: "";
    position: absolute;
    inset: -3px -6px;
    border: 1.5px solid var(--ink);
    border-radius: var(--ring);
    rotate: -3deg;
    pointer-events: none;
    animation: ring 260ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @keyframes ring {
    from {
      scale: 0.85;
      opacity: 0;
    }
  }

  /* ---- shortcut hints ---- */
  @media (hover: hover) {
    [data-key]::after {
      content: attr(data-key);
      position: absolute;
      left: 50%;
      bottom: calc(100% + 6px);
      translate: -50% 2px;
      padding: 0 4px;
      font-family: var(--mono);
      font-size: 0.625rem;
      line-height: 1.5;
      color: var(--ink-soft);
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--sky-line);
      border-radius: 3px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 120ms ease,
        translate 120ms ease;
    }

    [data-key]:hover::after {
      opacity: 1;
      translate: -50% 0;
      transition-delay: 400ms;
    }
  }

  /* ---- colours ---- */
  .colours {
    gap: 7px;
  }

  .current {
    width: 28px;
    height: 28px;
    margin-right: 4px;
    border-radius: 50%;
    background: var(--c);
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3.5px var(--ink);
    transition: background-color 150ms ease;
  }

  .dot {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 0 1px rgba(35, 31, 32, 0.15);
    transition: scale 120ms;
  }

  .dot[aria-pressed="true"] {
    box-shadow:
      0 0 0 2px var(--sky),
      0 0 0 3.5px var(--ink);
  }

  .dot:not([aria-pressed="true"]):hover {
    scale: 1.2;
  }

  .add {
    padding: 0 2px;
  }

  .hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  /* ---- size ---- */
  .size {
    position: relative;
    gap: 8px;
  }

  .preview {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
  }

  .preview span {
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 0 1px var(--ink);
    transition:
      width 100ms ease,
      height 100ms ease;
  }

  input[type="range"] {
    width: 90px;
    height: 20px;
    background: transparent;
    appearance: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    height: 2px;
    background: var(--ink-soft);
    border-radius: 1px;
  }

  input[type="range"]::-moz-range-track {
    height: 2px;
    background: var(--ink-soft);
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    margin-top: -5px;
    border-radius: 50%;
    background: #fff;
    border: 1.5px solid var(--ink);
  }

  input[type="range"]::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #fff;
    border: 1.5px solid var(--ink);
  }

  input[type="range"]:focus-visible {
    outline: 2px dashed var(--blue);
    outline-offset: 4px;
  }

  /* ---- touch screens: 44px targets ---- */
  .touchy .word {
    min-height: 44px;
    padding: 10px 8px;
  }

  .touchy .dot {
    width: 26px;
    height: 26px;
  }

  /* a 44px tap area around each colour, without making the dots big */
  .touchy .dot::before,
  .dock .dot::before {
    content: "";
    position: absolute;
    inset: 50% auto auto 50%;
    width: 44px;
    height: 44px;
    translate: -50% -50%;
  }

  /* the pencil ring hugs the word, not the 44px button around it */
  .touchy .word[aria-pressed="true"]::before,
  .bar .word[aria-pressed="true"]::before {
    inset: 8px -1px;
  }

  .touchy .colours {
    gap: 12px;
  }

  .touchy .current {
    width: 36px;
    height: 36px;
  }

  .touchy input[type="range"],
  .dock input[type="range"] {
    height: 44px;
  }

  .touchy input[type="range"]::-webkit-slider-thumb,
  .dock input[type="range"]::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
    margin-top: -11px;
  }

  .touchy input[type="range"]::-moz-range-thumb,
  .dock input[type="range"]::-moz-range-thumb {
    width: 22px;
    height: 22px;
  }

  /* ---- phones: the dock ---- */
  .dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    padding: 0 10px env(safe-area-inset-bottom);
    background: color-mix(in srgb, var(--sky) 94%, transparent);
    border-top: 1px solid var(--sky-line);
    backdrop-filter: blur(6px);
    transition: translate 260ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* tucked: only the grip peeks out */
  .dock[data-tucked] {
    translate: 0 calc(100% - 24px);
  }

  .grip {
    display: grid;
    place-items: center;
    width: 100%;
    height: 24px;
  }

  .grip span {
    width: 40px;
    height: 5px;
    border-radius: 3px;
    background: var(--sky-line);
  }

  .grip:focus-visible span {
    outline: 2px dashed var(--blue);
    outline-offset: 3px;
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0;
    min-height: 52px;
    padding-bottom: 6px;
  }

  .bar .word {
    min-height: 44px;
    min-width: 40px;
    padding: 10px 5px;
  }

  .modes {
    display: flex;
    gap: 4px;
  }

  .swatch {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex: none;
  }

  /* the current colour, sized like the brush */
  .swatch span {
    width: max(26px, var(--s));
    height: max(26px, var(--s));
    border-radius: 50%;
    background: var(--c);
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3.5px var(--ink);
  }

  .swatch[aria-expanded="true"] span {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 3.5px var(--blue);
  }

  /* natural height, so the loop hugs the word; the tap area is widened instead */
  .done {
    position: relative;
    /* room for its loop */
    margin-inline: 8px 10px;
    font-weight: 600;
    white-space: nowrap;
  }

  .done::after {
    content: "";
    position: absolute;
    inset: -12px -8px;
  }

  /* the smallest phones: no room for the arrow beside the tools */
  @media (max-width: 359px) {
    .dock:not([data-rail]) .done :global(.arrow) {
      display: none;
    }
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 4px 10px;
    border-bottom: 1px dashed var(--sky-line);
    margin-bottom: 4px;
    animation: panel-in 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      translate: 0 8px;
    }
  }

  .panel-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .panel-row.size input[type="range"] {
    flex: 1;
  }

  .dot.big {
    width: 30px;
    height: 30px;
  }

  .panel-row.colours {
    gap: 9px;
  }

  .panel .word {
    min-width: 44px;
    min-height: 44px;
  }

  /* ---- phones on their side: the dock as a rail down one edge ---- */
  .dock[data-rail] {
    top: 0;
    bottom: 0;
    left: auto;
    right: 0;
    display: flex;
    flex-direction: row;
    padding: 0 env(safe-area-inset-right) 0 0;
    border-top: none;
    border-left: 1px solid var(--sky-line);
  }

  .dock[data-rail][data-hand="left"] {
    left: 0;
    right: auto;
    flex-direction: row-reverse;
    padding: 0 0 0 env(safe-area-inset-left);
    border-left: none;
    border-right: 1px solid var(--sky-line);
  }

  .dock[data-rail][data-tucked] {
    translate: calc(100% - 24px) 0;
  }

  .dock[data-rail][data-hand="left"][data-tucked] {
    translate: calc(-100% + 24px) 0;
  }

  .dock[data-rail] .grip {
    width: 24px;
    height: 100%;
  }

  .dock[data-rail] .grip span {
    width: 5px;
    height: 40px;
  }

  .dock[data-rail] .bar {
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 60px;
    min-height: 0;
    padding: 10px 4px;
  }

  .dock[data-rail] .modes {
    flex-direction: column;
    gap: 0;
  }

  .dock[data-rail] .done {
    margin: 0 0 8px;
  }

  /* the rail is too narrow for the word, the arrow and a loop round both */
  .dock[data-rail] .done :global(.arrow) {
    display: none;
  }

  /* the colour sheet opens beside the rail */
  .dock[data-rail] .panel {
    position: absolute;
    top: 50%;
    right: calc(100% + 8px);
    translate: 0 -50%;
    width: min(320px, 60vw);
    margin: 0;
    padding: 12px;
    background: color-mix(in srgb, var(--sky) 96%, transparent);
    border: 1px solid var(--sky-line);
    border-radius: 10px;
  }

  .dock[data-rail][data-hand="left"] .panel {
    right: auto;
    left: calc(100% + 8px);
  }

  /* ---- narrow windows with a mouse: one row, scroll sideways, pinned to the bottom ---- */
  @media (max-width: 719px) {
    .tools {
      position: sticky;
      bottom: 0;
      z-index: 5;
      flex-wrap: nowrap;
      justify-content: flex-start;
      gap: 22px;
      width: calc(100% + 40px);
      margin-inline: -20px;
      padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
      overflow-x: auto;
      scrollbar-width: none;
      background: color-mix(in srgb, var(--sky) 92%, transparent);
      border-top: 1px solid var(--sky-line);
    }

    .tools::-webkit-scrollbar {
      display: none;
    }
  }
</style>
