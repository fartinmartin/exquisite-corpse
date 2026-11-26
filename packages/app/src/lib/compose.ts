import type { CanvasFactory } from "@fartinmartin/canvas-paint/render";

/** Anything with a size that `drawImage` accepts: a browser canvas or a server (napi) canvas. */
type Source = { width: number; height: number };

/** Gallery/link-preview thumbnails are rendered this wide; the Image CDN serves smaller sizes. */
export const THUMB_WIDTH = 1080;

/**
 * Stacks rendered drawings top to bottom, each scaled to `width`, on white.
 * Shared by the browser (download button) and the server (`/thumbs`), so both
 * produce the same layout.
 */
export function stack<T extends Source>(
  sources: T[],
  { width, createCanvas }: { width: number; createCanvas: CanvasFactory }
): HTMLCanvasElement {
  const heights = sources.map((source) => Math.round((source.height * width) / source.width));

  const canvas = createCanvas(width, heights.reduce((sum, height) => sum + height, 0));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";

  let y = 0;
  sources.forEach((source, index) => {
    ctx.drawImage(source as unknown as CanvasImageSource, 0, y, width, heights[index]);
    y += heights[index];
  });

  return canvas;
}
