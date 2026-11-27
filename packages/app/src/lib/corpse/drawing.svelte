<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import { blit, renderDrawing, replay as replayDrawing } from "#lib/render.ts";

  type Props = {
    drawing: DrawingData;
    /** Replay the strokes once on mount instead of drawing the final image. */
    replay?: boolean;
    duration?: number;
    label?: string;
  };

  let { drawing, replay = false, duration = 600, label }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();

  $effect(() => {
    const target = canvas;
    const data = drawing;
    if (!target || !data) return;

    const controller = new AbortController();
    /** The fully rendered drawing, kept so resizes are a cheap re-blit. */
    let source: HTMLCanvasElement | null = null;

    const ready = replay
      ? replayDrawing(target, data, { duration, signal: controller.signal })
      : renderDrawing(data).then((rendered) => {
          if (!controller.signal.aborted) blit(target, rendered);
          return rendered;
        });

    void ready.then((rendered) => {
      if (!controller.signal.aborted) source = rendered;
    });

    // Re-blit at the new size so it stays crisp on resize.
    const observer = new ResizeObserver(() => {
      if (source) blit(target, source);
    });
    observer.observe(target);

    return () => {
      controller.abort();
      observer.disconnect();
    };
  });
</script>

<canvas bind:this={canvas} aria-label={label} role={label ? "img" : undefined}></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 1;
    background: var(--paper);
  }
</style>
