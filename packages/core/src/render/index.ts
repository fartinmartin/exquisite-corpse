import type { DrawingData } from "@ecc/lexicons";

export namespace Render {
  /**
   * Renders a DrawingData (canvas-paint stroke commands) to a PNG buffer.
   * Uses node-canvas server-side — never accepts blobs from the client.
   *
   * TODO: implement with node-canvas + canvas-paint headless rendering.
   */
  export async function toPng(_drawing: DrawingData): Promise<Buffer> {
    throw new Error("Render.toPng not yet implemented");
  }

  /**
   * Runs moderation checks on a rendered PNG before it's uploaded to PDS.
   * Returns true if the image passes all checks.
   *
   * TODO: integrate Google Cloud Vision SafeSearch or Hive Moderation.
   */
  export async function moderate(_png: Buffer): Promise<{ ok: boolean; reason?: string }> {
    return { ok: true };
  }
}
