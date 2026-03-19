import { createCanvas, type Canvas as NodeCanvas } from "canvas";
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
