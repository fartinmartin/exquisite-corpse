import { createCanvas, loadImage, type Canvas as NodeCanvas } from "canvas";
import { render } from "@fartinmartin/canvas-paint/render";
import type { DrawingData } from "@ecc/lexicons";

export namespace Render {
  /**
   * Renders a DrawingData (canvas-paint stroke commands) to a PNG buffer.
   */
  export async function toPng(drawing: DrawingData): Promise<Buffer> {
    const canvas = render(drawing, { createCanvas: createCanvas as unknown as (w: number, h: number) => HTMLCanvasElement }) as unknown as NodeCanvas;
    return canvas.toBuffer("image/png");
  }

  /**
   * Composites an ordered list of PNG buffers vertically (top to bottom).
   * All panels are scaled to the width of the first image.
   */
  export async function composite(pngs: Buffer[]): Promise<Buffer> {
    const images = await Promise.all(pngs.map((p) => loadImage(p)));
    const width = images[0].width;
    const totalHeight = images.reduce((sum, img) => sum + Math.round((img.height * width) / img.width), 0);
    const canvas = createCanvas(width, totalHeight);
    const ctx = canvas.getContext("2d");
    let y = 0;
    for (const img of images) {
      const h = Math.round((img.height * width) / img.width);
      ctx.drawImage(img, 0, y, width, h);
      y += h;
    }
    return canvas.toBuffer("image/png");
  }

  /**
   * Runs moderation checks on a rendered PNG before it's uploaded to PDS.
   * Returns true if the image passes all checks.
   *
   * TODO: integrate Google Cloud Vision SafeSearch or Hive Moderation.
   */
  export async function moderate(
    _png: Buffer
  ): Promise<{ ok: boolean; reason?: string }> {
    return { ok: true };
  }
}
