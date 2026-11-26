import { render } from "@fartinmartin/canvas-paint/render";
import type { RenderData } from "@fartinmartin/canvas-paint/render";
import type { DrawingData } from "@ecc/lexicons";

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

/** Sizes a display canvas to its CSS box at device resolution and paints white. */
function prepare(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const ratio = dpr();

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  return { ctx, width, height };
}

/**
 * Draws a stored drawing onto an existing canvas. `pixelate` reproduces the
 * live site's blurred, half-opacity sibling preview.
 */
export function drawStatic(
  canvas: HTMLCanvasElement,
  drawing: DrawingData,
  { pixelate = false } = {}
): void {
  const { ctx, width, height } = prepare(canvas);
  const source = render(asRenderData(drawing));

  if (!pixelate) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }

  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(width / 8));
  small.height = Math.max(1, Math.round(height / 8));

  const smallCtx = small.getContext("2d")!;
  smallCtx.imageSmoothingEnabled = false;
  smallCtx.drawImage(source, 0, 0, small.width, small.height);

  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 0.5;
  ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, width, height);
  ctx.globalAlpha = 1;
}

/** Renders a drawing to a 1080×360 PNG data URL for gallery thumbnails. */
export function drawingToThumb(drawing: DrawingData): string {
  const canvas = render(asRenderData(drawing));
  return canvas.toDataURL("image/png");
}

/** Stacks three PNG data URLs (top/mid/bot) into one corpse preview. */
export async function mergeThumbs(thumbs: (string | undefined)[]): Promise<string> {
  const images = await Promise.all(
    thumbs.map((thumb) => {
      if (!thumb) return Promise.resolve(null);
      return new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = thumb;
      });
    })
  );

  const present = images.filter((image): image is HTMLImageElement => image !== null);
  if (present.length === 0) return "";

  const width = Math.max(...present.map((image) => image.width));
  const height = present.reduce(
    (sum, image) => sum + Math.round((image.height * width) / image.width),
    0
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let y = 0;
  for (const image of images) {
    if (!image) continue;
    const h = Math.round((image.height * width) / image.width);
    ctx.drawImage(image, 0, y, width, h);
    y += h;
  }

  return canvas.toDataURL("image/png");
}
