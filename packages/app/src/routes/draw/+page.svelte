<script lang="ts">
  import { Paint } from "@fartinmartin/canvas-paint";
  import { goto } from "$app/navigation";
  import { submitSection } from "./draw.remote";

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
  <main class="picker">
    <h1>What are you drawing?</h1>
    <div class="section-choices">
      {#each ["top", "mid", "bot"] as s (s)}
        <button
          class="section-choice"
          data-section={s}
          onclick={() => (section = s as Section)}
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
  <main class="draw">
    <div class="canvas-wrap" bind:this={paintRoot}></div>

    <div class="toolbar">
      <div class="tool-group">
        <button
          class="tool-btn"
          data-active={brushMode === "draw"}
          onclick={() => (brushMode = "draw")}
          title="Pen"
        >Pen</button>
        <button
          class="tool-btn"
          data-active={brushMode === "erase"}
          onclick={() => (brushMode = "erase")}
          title="Eraser"
        >Erase</button>
        <button
          class="tool-btn"
          data-active={brushMode === "fill"}
          onclick={() => (brushMode = "fill")}
          title="Fill"
        >Fill</button>
      </div>

      <div class="tool-group">
        <label class="tool-label">
          <span>Size</span>
          <input type="range" min="2" max="64" bind:value={brushSize} />
        </label>
        <label class="tool-label">
          <span>Color</span>
          <input type="color" bind:value={brushColor} />
        </label>
      </div>

      <div class="tool-group">
        <button class="tool-btn" onclick={() => paint?.undo()} title="Undo">↩ Undo</button>
        <button class="tool-btn" onclick={() => paint?.redo()} title="Redo">↪ Redo</button>
        <button class="tool-btn" onclick={() => paint?.clear()} title="Clear">Clear</button>
      </div>

      <div class="tool-group actions">
        <button class="tool-btn back" onclick={() => (section = null)}>← Back</button>
        <button class="tool-btn submit" onclick={submit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}
  </main>
{/if}

<style>
  /* --- Picker --- */
  .picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .section-choices {
    display: flex;
    gap: 1rem;
  }

  .section-choice {
    all: unset;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    border: 2px solid transparent;
    border-radius: 0.5rem;
    padding: 0.75rem;
    transition: border-color 0.15s;
  }

  .section-choice:hover {
    border-color: currentColor;
  }

  .section-preview {
    width: 80px;
    height: 120px;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
  }

  .preview-band[data-band="top"] {
    height: 40%;
    background: #e0e0e0;
    border-bottom: 2px dashed #bbb;
  }

  .preview-band[data-band="mid"] {
    margin-top: 30%;
    height: 40%;
    background: #e0e0e0;
    border-top: 2px dashed #bbb;
    border-bottom: 2px dashed #bbb;
  }

  .preview-band[data-band="bot"] {
    margin-top: auto;
    height: 40%;
    background: #e0e0e0;
    border-top: 2px dashed #bbb;
  }

  .section-choice span {
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  /* --- Draw --- */
  .draw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  .canvas-wrap {
    width: 100%;
    max-width: 600px;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    overflow: hidden;
    aspect-ratio: v-bind("CANVAS_WIDTH + ' / ' + CANVAS_HEIGHT");
  }

  .toolbar {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .tool-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-right: 1px solid #e0e0e0;
  }

  .tool-group:last-child {
    border-right: none;
    margin-left: auto;
  }

  .tool-btn {
    cursor: pointer;
    padding: 0.3rem 0.6rem;
    font: inherit;
    font-size: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background: white;
    transition: background 0.1s, border-color 0.1s;
  }

  .tool-btn:hover:not(:disabled) {
    background: #f0f0f0;
  }

  .tool-btn[data-active="true"] {
    background: #000;
    color: #fff;
    border-color: #000;
  }

  .tool-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tool-btn.submit {
    background: #000;
    color: #fff;
    border-color: #000;
    font-weight: 600;
  }

  .tool-btn.submit:hover:not(:disabled) {
    background: #333;
  }

  .tool-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
  }

  .tool-label span {
    white-space: nowrap;
  }

  .error {
    color: red;
    font-size: 0.875rem;
  }
</style>
