import type { RenderData } from "@fartinmartin/canvas-paint/render";
import type { DrawingData } from "@ecc/lexicons";

// canvas-paint touches `document` at module scope, so it can only be imported
// in the browser.
async function canvasPaint() {
  return import("@fartinmartin/canvas-paint/render");
}

/** Display width of stored thumbnails: ~3× the 172px gallery cell. */
const THUMB_WIDTH = 540;

/** Width of downloaded images (matches the old full-size thumbs). */
const DOWNLOAD_WIDTH = 1080;

const THUMB_QUALITY = 0.85;

/** Lexicon paths keep cap/join/tolerance optional; canvas-paint always has them. */
export function asRenderData(drawing: DrawingData): RenderData {
  return drawing as unknown as RenderData;
}

/** Full drawing shape expected by `Paint.load()`. */
export function asLoadData(drawing: DrawingData) {
  return {
    width: drawing.width,
    height: drawing.height,
    paths: asRenderData(drawing).paths,
    bgColor: drawing.bgColor ?? "#ffffff",
    margin: drawing.margin ?? 0,
    version: drawing.version,
  };
}

function dpr(): number {
  return typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
}

/**
 * Sizes a display canvas to its CSS box at device resolution and paints it
 * white. The backing store is only reallocated when the size actually changes.
 */
function prepare(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const ratio = dpr();
  const backingWidth = Math.round(width * ratio);
  const backingHeight = Math.round(height * ratio);

  if (canvas.width !== backingWidth) canvas.width = backingWidth;
  if (canvas.height !== backingHeight) canvas.height = backingHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  return { ctx, width, height };
}

/** Renders a drawing at its own document size. */
export async function renderDrawing(drawing: DrawingData): Promise<HTMLCanvasElement> {
  const { render } = await canvasPaint();
  return render(asRenderData(drawing));
}

/**
 * Paints `paths` onto `target`, which already holds every earlier path of the
 * same drawing. This is what makes replay O(paths) instead of O(frames × paths).
 *
 * canvas-paint's public API only has `render()`, which starts by filling a fresh
 * canvas with the background. We hand it our canvas through `createCanvas` and
 * swallow that first `fillRect`, so every path is drawn by canvas-paint's own
 * code, in order, on one context, exactly as a full `render()` would.
 * TODO: replace with `drawPathToContext` once canvas-paint exports it.
 */
async function paintOnto(target: HTMLCanvasElement, drawing: DrawingData, paths: DrawingData["paths"]) {
  const { render } = await canvasPaint();
  const ctx = target.getContext("2d")!;
  let skippedBackground = false;

  const context = new Proxy(ctx, {
    get(object, key) {
      if (key === "fillRect" && !skippedBackground) {
        skippedBackground = true;
        return () => {};
      }
      const value = Reflect.get(object, key, object);
      return typeof value === "function" ? value.bind(object) : value;
    },
    set(object, key, value) {
      return Reflect.set(object, key, value, object);
    },
  });

  const canvas = { getContext: () => context } as unknown as HTMLCanvasElement;
  render(asRenderData({ ...drawing, paths }), { createCanvas: () => canvas });
}

/**
 * Draws a rendered drawing onto a display canvas. `pixelate` reproduces the
 * live site's blurred, half-opacity sibling preview.
 */
export function blit(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  { pixelate = false } = {}
): void {
  const { ctx, width, height } = prepare(canvas);
  ctx.imageSmoothingEnabled = false;

  if (!pixelate) {
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }

  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(width / 8));
  small.height = Math.max(1, Math.round(height / 8));

  const smallCtx = small.getContext("2d")!;
  smallCtx.imageSmoothingEnabled = false;
  smallCtx.drawImage(source, 0, 0, small.width, small.height);

  ctx.globalAlpha = 0.5;
  ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, width, height);
  ctx.globalAlpha = 1;
}

function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Replays a drawing onto a display canvas over `duration` ms, painting only
 * the paths that are new each frame. Resolves with the fully rendered drawing
 * (for cheap re-blits on resize), or `null` if aborted.
 */
export async function replay(
  canvas: HTMLCanvasElement,
  drawing: DrawingData,
  { duration = 500, signal }: { duration?: number; signal?: AbortSignal } = {}
): Promise<HTMLCanvasElement | null> {
  const total = drawing.paths.length;

  if (total === 0 || duration <= 0 || reducedMotion()) {
    const source = await renderDrawing(drawing);
    if (signal?.aborted) return null;
    blit(canvas, source);
    return source;
  }

  const source = await renderDrawing({ ...drawing, paths: [] });
  let painted = 0;
  const start = await nextFrame();

  while (painted < total) {
    const now = await nextFrame();
    if (signal?.aborted) return null;

    const upto = Math.ceil(Math.min(1, (now - start) / duration) * total);
    if (upto > painted) {
      await paintOnto(source, drawing, drawing.paths.slice(painted, upto));
      painted = upto;
      blit(canvas, source);
    }
  }

  return source;
}

/** Stacks drawings top to bottom, each scaled to `width`, on a white canvas. */
async function stack(drawings: DrawingData[], width: number): Promise<HTMLCanvasElement> {
  const sources = await Promise.all(drawings.map(renderDrawing));
  const heights = sources.map((source) => Math.round((source.height * width) / source.width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = heights.reduce((sum, height) => sum + height, 0);

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";

  let y = 0;
  sources.forEach((source, index) => {
    ctx.drawImage(source, 0, y, width, heights[index]);
    y += heights[index];
  });

  return canvas;
}

/** WebP where the browser can encode it (Safari can't), JPEG otherwise. Both are far smaller than PNG. */
function encodeThumb(canvas: HTMLCanvasElement): string {
  const webp = canvas.toDataURL("image/webp", THUMB_QUALITY);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/jpeg", THUMB_QUALITY);
}

/** Gallery thumbnail for one section. */
export async function drawingToThumb(drawing: DrawingData): Promise<string> {
  return encodeThumb(await stack([drawing], THUMB_WIDTH));
}

/** Gallery thumbnail for a corpse: its panels stacked top/mid/bot. */
export async function corpseToThumb(drawings: DrawingData[]): Promise<string> {
  return encodeThumb(await stack(drawings, THUMB_WIDTH));
}

/** Full-size PNG of one or more stacked drawings, for the download button. */
export async function drawingsToPng(drawings: DrawingData[]): Promise<Blob | null> {
  const canvas = await stack(drawings, DOWNLOAD_WIDTH);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
