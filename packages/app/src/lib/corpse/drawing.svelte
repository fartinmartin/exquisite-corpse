<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import { blit, renderDrawing, replay as replayDrawing } from "#lib/render.ts";

  type Props = {
    drawing: DrawingData;
    /** Replay the strokes once on mount instead of drawing the final image. */
    replay?: boolean;
    /**
     * Playback on demand: each time this changes (to anything but 0), the
     * drawing blanks and redraws itself stroke by stroke after `delay`.
     */
    replayKey?: number;
    /** Wait this long (ms) before a replay starts; the canvas stays blank meanwhile. */
    delay?: number;
    duration?: number;
    label?: string;
  };

  let { drawing, replay = false, replayKey = 0, delay = 0, duration = 600, label }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();

  $effect(() => {
    const target = canvas;
    const data = drawing;
    if (!target || !data) return;

    const controller = new AbortController();
    const playing = replay || replayKey !== 0;
    /** The fully rendered drawing, kept so resizes are a cheap re-blit. */
    let source: HTMLCanvasElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const ready: Promise<HTMLCanvasElement | null> = playing
      ? (async () => {
          // blank straight away, so every third of a creature waits its turn empty
          const blank = await renderDrawing({ ...data, paths: [] });
          if (controller.signal.aborted) return null;
          blit(target, blank);
          await new Promise<void>((resolve) => (timer = setTimeout(resolve, delay)));
          if (controller.signal.aborted) return null;
          return replayDrawing(target, data, { duration, signal: controller.signal });
        })()
      : renderDrawing(data).then((rendered) => {
          if (!controller.signal.aborted) blit(target, rendered);
          return rendered;
        });

    void ready.then((rendered) => {
      if (!controller.signal.aborted && rendered) source = rendered;
    });

    // Re-blit at the new size so it stays crisp on resize.
    const observer = new ResizeObserver(() => {
      if (source) blit(target, source);
    });
    observer.observe(target);

    return () => {
      controller.abort();
      clearTimeout(timer);
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
