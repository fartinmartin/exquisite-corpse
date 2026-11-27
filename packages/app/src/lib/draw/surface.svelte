<script lang="ts">
  import { drawState } from "./state.svelte.ts";

  type Props = {
    /** Ignore pointer input (while signing or after saving). */
    locked?: boolean;
  };

  let { locked = false }: Props = $props();

  let host = $state<HTMLElement>();

  $effect(() => {
    const target = host;
    if (!target) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      // canvas-paint touches `document` at import time — browser only.
      const { Paint } = await import("@fartinmartin/canvas-paint");
      if (cancelled) return;

      const paint = new Paint(target, {
        width: 1080,
        height: 360,
        bgColor: "#ffffff",
        debounce: 100,
        ui: { show: false },
        grid: { show: false },
        brush: {
          size: drawState.size * 2,
          color: drawState.color,
          mode: drawState.mode,
        },
      });

      // Paint measures its own canvas before CSS applies, so fit it explicitly.
      const fit = () => void paint.resize({ target } as unknown as ResizeObserverEntry);
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(target);

      drawState.attach(paint);
      const sync = () => drawState.refresh();
      paint.events.on("end", sync);
      paint.events.on("drawn", sync);
      paint.events.on("start", sync);

      cleanup = () => {
        observer.disconnect();
        drawState.attach(null);
        paint.destroy();
        paint.removeListeners();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  });

  // keep the brush in sync with the tools
  $effect(() => {
    const paint = drawState.paint;
    if (!paint) return;
    paint.brush.size = drawState.size * 2;
    paint.brush.color = drawState.color;
    paint.brush.mode = drawState.mode;
  });
</script>

<!-- The live third. Just paper — the tools live elsewhere. -->
<div class="surface" data-locked={locked || undefined} data-empty={drawState.empty || undefined}>
  <div class="host" bind:this={host}></div>
  <p class="hint" aria-hidden="true">draw here</p>
</div>

<style>
  .surface {
    position: relative;
    aspect-ratio: 3 / 1;
    background: var(--paper);
    touch-action: none;
  }

  .host {
    position: absolute;
    inset: 0;
  }

  .host :global(canvas) {
    display: block;
  }

  .surface[data-locked] .host {
    pointer-events: none;
  }

  .hint {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--crease);
    font-size: clamp(1rem, 3vw, 1.75rem);
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms var(--ease-out);
  }

  .surface[data-empty]:not([data-locked]) .hint {
    opacity: 1;
  }
</style>
