<script lang="ts">
  import { Paint } from "@fartinmartin/canvas-paint";
  import { goto } from "$app/navigation";
  import { submitSection } from "./draw.remote";
  import Button from '$components/bits/button.svelte';

  type Section = "top" | "mid" | "bot";

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 250;
  const BG_COLOR = "white";

  let section = $state<Section | null>(null);
  let paintRoot = $state<HTMLElement | null>(null);
  let paint = $state<Paint | null>(null);

  let brushSize = $state(8);
  let brushColor = $state("#000000");
  let brushMode = $state<"draw" | "erase" | "fill">("draw");

  let submitting = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (!paintRoot || !section) return;

    const p = new Paint(paintRoot, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      bgColor: BG_COLOR,
      brush: { size: brushSize, color: brushColor },
    });

    paint = p;

    return () => {
      p.destroy();
      paint = null;
    };
  });

  $effect(() => {
    if (!paint) return;
    paint.brush.color = brushColor;
  });

  $effect(() => {
    if (!paint) return;
    paint.brush.size = brushSize;
  });

  $effect(() => {
    if (!paint) return;
    paint.brush.mode = brushMode;
  });

  async function submit() {
    if (!paint || !section) return;
    submitting = true;
    error = null;

    try {
      const drawing = paint.save();
      const { recordUri } = await submitSection({ drawing, section });
      goto(`/sections/${encodeURIComponent(recordUri)}`);
    } catch (e) {
      error = e instanceof Error ? e.message : "Something went wrong";
      submitting = false;
    }
  }
</script>

{#if !section}
  <main class="canvas picker">
    <h1>what are you drawing?</h1>
    <div class="cluster gap-md">
      {#each (["top", "mid", "bot"] as Section[]) as s (s)}
        <button
          class="section-choice"
          data-section={s}
          onclick={() => (section = s)}
        >
          <div class="section-preview" aria-hidden="true">
            <div class="preview-band" data-band={s}></div>
          </div>
          <span>{s}</span>
        </button>
      {/each}
    </div>
  </main>
{:else}
  <main class="canvas draw">
    <div class="canvas-wrap" bind:this={paintRoot}></div>

    <div class="cluster gap-xs toolbar">
      <div class="cluster gap-2xs tool-group">
        <Button
          size="sm"
          appearance={brushMode === "draw" ? undefined : "outlined"}
          onclick={() => (brushMode = "draw")}
        >pen</Button>
        <Button
          size="sm"
          appearance={brushMode === "erase" ? undefined : "outlined"}
          onclick={() => (brushMode = "erase")}
        >erase</Button>
        <Button
          size="sm"
          appearance={brushMode === "fill" ? undefined : "outlined"}
          onclick={() => (brushMode = "fill")}
        >fill</Button>
      </div>

      <div class="cluster gap-2xs tool-group">
        <label class="cluster gap-2xs tool-label">
          <span>size</span>
          <input type="range" min="2" max="64" bind:value={brushSize} />
        </label>
        <label class="cluster gap-2xs tool-label">
          <span>color</span>
          <input type="color" bind:value={brushColor} />
        </label>
      </div>

      <div class="cluster gap-2xs tool-group">
        <Button size="sm" appearance="ghost" onclick={() => paint?.undo()}>↩ undo</Button>
        <Button size="sm" appearance="ghost" onclick={() => paint?.redo()}>↪ redo</Button>
        <Button size="sm" appearance="ghost" onclick={() => paint?.clear()}>clear</Button>
      </div>

      <div class="tool-group actions">
        <Button size="sm" appearance="outlined" onclick={() => (section = null)}>← back</Button>
        <Button size="sm" disabled={submitting} onclick={submit}>
          {submitting ? "submitting…" : "submit"}
        </Button>
      </div>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}
  </main>
{/if}

<style>
  main {
    padding-block: var(--space-lg);
    padding-inline: var(--space-md);
  }

  /* --- Picker --- */
  .picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
  }

  .section-choice {
    all: unset;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    transition: border-color var(--transition-normal);
  }

  .section-choice:hover {
    border-color: var(--color-surface-border);
  }

  .section-preview {
    width: 80px;
    height: 120px;
    border: 1px solid var(--color-surface-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--color-surface-lowered);
    display: flex;
    flex-direction: column;
  }

  .preview-band[data-band="top"] {
    height: 40%;
    background: var(--color-neutral-fill-normal);
    border-bottom: 2px dashed var(--color-surface-border);
  }

  .preview-band[data-band="mid"] {
    margin-top: 30%;
    height: 40%;
    background: var(--color-neutral-fill-normal);
    border-top: 2px dashed var(--color-surface-border);
    border-bottom: 2px dashed var(--color-surface-border);
  }

  .preview-band[data-band="bot"] {
    margin-top: auto;
    height: 40%;
    background: var(--color-neutral-fill-normal);
    border-top: 2px dashed var(--color-surface-border);
  }

  /* --- Draw --- */
  .draw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }

  .canvas-wrap {
    width: 100%;
    border: 1px solid var(--color-surface-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    aspect-ratio: v-bind("CANVAS_WIDTH + ' / ' + CANVAS_HEIGHT");
  }

  .toolbar {
    width: 100%;
  }

  .tool-group {
    padding-inline-end: var(--space-xs);
    border-inline-end: 1px solid var(--color-surface-border);
  }

  .tool-group:last-child {
    border-inline-end: none;
    margin-inline-start: auto;
  }

  .tool-label {
    font-size: var(--text-sm);
  }

  .tool-label span {
    white-space: nowrap;
  }

  .error {
    color: var(--color-error-on-quiet);
    font-size: var(--text-sm);
  }
</style>
