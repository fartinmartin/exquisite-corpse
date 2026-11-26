<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import { drawState } from "$lib/draw/state.svelte";
  import { drawReplay, drawStatic } from "$lib/render";
  import Panel from "./panel.svelte";

  type Mode = "draw" | "display" | "pixelate";

  type Props = {
    id?: string;
    mode: Mode;
    drawing?: DrawingData;
    meta?: { title: string; artist: string; href?: string };
    duration?: number;
  };

  let { id, mode, drawing, meta, duration = 500 }: Props = $props();

  let root = $state<HTMLElement>();
  let canvas = $state<HTMLCanvasElement>();

  $effect(() => {
    const currentMode = mode;
    const data = drawing;
    const host = root;

    if (currentMode === "draw") {
      if (!host) return;

      let cancelled = false;
      let cleanup = () => {};

      (async () => {
        // canvas-paint touches `document` at import time — browser only.
        const { Paint } = await import("@fartinmartin/canvas-paint");
        if (cancelled || !host) return;

        const paint = new Paint(host, {
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
        const fit = () => void paint.resize({ target: host } as unknown as ResizeObserverEntry);
        fit();
        const resizeObserver = new ResizeObserver(fit);
        resizeObserver.observe(host);

        drawState.attach(paint);
        const sync = () => drawState.refresh();
        paint.events.on("end", sync);
        paint.events.on("drawn", sync);
        paint.events.on("start", sync);

        cleanup = () => {
          resizeObserver.disconnect();
          drawState.attach(null);
          paint.destroy();
          paint.removeListeners();
        };
      })();

      return () => {
        cancelled = true;
        cleanup();
      };
    }

    const target = canvas;
    if (!target || !data) return;

    let animating = true;

    const render = () => {
      if (animating && currentMode === "display") {
        void drawReplay(target, data, { duration }).finally(() => (animating = false));
      } else {
        void drawStatic(target, data, { pixelate: currentMode === "pixelate" });
      }
    };

    const observer = new ResizeObserver(() => {
      if (!animating) render();
    });
    observer.observe(target);
    render();

    return () => observer.disconnect();
  });

  // keep the brush in sync with the toolbar
  $effect(() => {
    const paint = drawState.paint;
    if (!paint) return;
    paint.brush.size = drawState.size * 2;
    paint.brush.color = drawState.color;
    paint.brush.mode = drawState.mode;
  });
</script>

<Panel {id} color="blue" noPadding>
  <div class="canvas-wrap">
    {#if mode === "draw"}
      <div class="paint-host" bind:this={root}></div>
    {:else}
      <canvas bind:this={canvas}></canvas>
    {/if}

    {#if meta}
      <div class="drawing-meta" class:disabled={!meta.href}>
        <div class="info">
          {#if meta.href}
            <a href={meta.href}>{meta.title}</a>
          {:else}
            <span>{meta.title}</span>
          {/if}
          <span>by</span>
          {#if meta.artist.startsWith("@")}
            <a
              href={`https://www.instagram.com/${meta.artist.slice(1)}/`}
              target="_blank"
              rel="noopener noreferrer">{meta.artist}</a
            >
          {:else}
            <span>{meta.artist}</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Panel>

<style lang="scss">
  .canvas-wrap {
    position: relative;
    overflow: hidden;

    width: 100%;
    height: 0;
    padding-top: calc(100% / 3);
  }

  .paint-host,
  canvas {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  .drawing-meta {
    display: none;
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* http://www.patternify.com/ */
    background: transparent
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
      repeat;

    .info {
      text-align: center;
      background: var(--white);
      padding: 1rem;
      min-width: 33%;
      border: 2px solid var(--orange);
    }

    &.disabled {
      display: grid;
      place-items: center;

      .info {
        display: none;
      }

      &:hover .info {
        display: block;
      }
    }
  }

  .canvas-wrap:hover .drawing-meta {
    display: grid;
    place-items: center;
  }

  .drawing-meta a {
    text-decoration: underline;

    &:hover {
      color: var(--blue);
    }
  }
</style>
