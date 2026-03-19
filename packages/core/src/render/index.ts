import { createCanvas } from "canvas";
import { render } from "@fartinmartin/canvas-paint/render";
import type { DrawingData } from "@ecc/lexicons";

export namespace Render {
  /**
   * Renders a DrawingData (canvas-paint stroke commands) to a PNG buffer.
   */
  export async function toPng(drawing: DrawingData): Promise<Buffer> {
    const { width, height } = drawing;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    render(drawing, ctx as unknown as CanvasRenderingContext2D);
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
