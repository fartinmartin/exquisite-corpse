<script lang="ts">
  import { drawState } from "#lib/draw/state.svelte.ts";

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

<svelte:window onkeydown={keydown} />

<!--
  The drawing tools, as one quiet line: tool words (the active one circled in
  pencil), the current colour as a bigger swatch with the rest beside it, one
  size control that previews the brush, and undo/redo/clear. Shortcut keys
  show as tiny hints on hover. On phones it's a single row you can scroll.
-->
<div class="tools" role="toolbar" aria-label="drawing tools">
  <span class="group">
    {#each MODES as mode (mode.value)}
      <button
        class="word"
        aria-pressed={drawState.mode === mode.value}
        data-key={mode.key}
        style:--ring={RINGS[mode.value]}
        onclick={() => (drawState.mode = mode.value)}>{mode.value}</button
      >
    {/each}
  </span>

  <span class="group colours" role="group" aria-label="colour">
    <span class="current" style:--c={drawState.color} aria-hidden="true"></span>
    {#each drawState.colors as colour, index (colour)}
      <button
        class="dot"
        style:--c={colour}
        aria-pressed={drawState.color === colour}
        aria-label={`colour ${index + 1}`}
        data-key={index < 9 ? String(index + 1) : undefined}
        onclick={() => (drawState.color = colour)}
      ></button>
    {/each}
    <button class="word add" aria-label="add a colour" onclick={() => colorInput?.click()}>+</button>
    <input
      type="color"
      class="hidden-input"
      bind:this={colorInput}
      onchange={(event) => drawState.addColor(event.currentTarget.value)}
      tabindex="-1"
    />
  </span>

  <label class="group size" data-key="[ ]">
    <span class="preview" aria-hidden="true">
      <span style:--s="{drawState.size * 2.2}px" style:--c={drawState.mode === "erase" ? "transparent" : drawState.color}
      ></span>
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
  </label>

  <span class="group">
    <button class="word" data-key="z" onclick={() => drawState.undo()} disabled={!drawState.canUndo}>undo</button>
    <button class="word" data-key="x" onclick={() => drawState.redo()} disabled={!drawState.canRedo}>redo</button>
    <button class="word" data-key="c" onclick={() => drawState.clear()} disabled={drawState.empty}>clear</button>
  </span>
</div>

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

  /* ---- phones: one row, scroll sideways, pinned to the bottom ---- */
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
