import type { DrawingData } from "@ecc/lexicons";
import type { CanvasFactory, RenderData } from "@fartinmartin/canvas-paint/render";
import { getStore } from "@netlify/blobs";
import * as errore from "errore";
import { stack, THUMB_WIDTH } from "#lib/compose.ts";

const WEBP_QUALITY = 85;

export class RenderError extends errore.createTaggedError({
  name: "RenderError",
  message: "Rendering thumb $key failed",
}) {}

/** Renders drawings (top to bottom) to a WebP thumbnail on the server. */
export async function renderThumb(drawings: DrawingData[], key: string): Promise<Uint8Array<ArrayBuffer> | RenderError> {
  try {
    // Native module (Skia): loaded only when a thumb actually needs rendering.
    const { createCanvas } = await import("@napi-rs/canvas");
    const { render } = await import("@fartinmartin/canvas-paint/render");
    const factory = createCanvas as unknown as CanvasFactory;

    const sources = drawings.map((drawing) =>
      render(drawing as unknown as RenderData, { createCanvas: factory })
    );
    const canvas = stack(sources, { width: THUMB_WIDTH, createCanvas: factory });
    const bytes = await (canvas as unknown as import("@napi-rs/canvas").Canvas).encode("webp", WEBP_QUALITY);
    return new Uint8Array(bytes);
  } catch (cause) {
    return new RenderError({ key, cause });
  }
}

/**
 * The store is site-wide: previews and production share it. That's safe
 * because keys contain the render version and the content depends only on
 * the data. So any change to rendering must bump `RENDER_VERSION` in
 * `lib/thumbs.ts`, or a preview could overwrite production thumbs.
 *
 * Rendered thumbs persist in Netlify Blobs so a deploy (which empties the CDN)
 * doesn't mean re-rendering everything. Outside Netlify there's no store and
 * every miss renders, which is fine for local dev.
 */
function store() {
  try {
    return getStore("thumbs");
  } catch {
    return null; // not on Netlify (no Blobs environment)
  }
}

export async function readCached(key: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const blob = await store()?.get(key, { type: "arrayBuffer" }).catch(() => null);
  return blob ? new Uint8Array(blob) : null;
}

/** Best-effort: a failed write just means the next miss renders again. */
export async function writeCached(key: string, bytes: Uint8Array<ArrayBuffer>): Promise<void> {
  await store()?.set(key, bytes.buffer).catch(() => {});
}
