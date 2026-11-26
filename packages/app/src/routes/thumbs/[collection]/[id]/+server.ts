import { error } from "@sveltejs/kit";
import { Thumbs, type Collection } from "@ecc/firestore";
import { readCached, renderThumb, writeCached } from "#lib/server/thumbs.ts";
import type { RequestHandler } from "./$types";

const COLLECTIONS: Collection[] = ["sections", "corpses"];

/**
 * A section or corpse thumbnail, rendered from its drawing(s) on the server.
 *
 * Lookup order: CDN (in front of this function) → Netlify Blobs → render.
 * URLs carry `?v=<renderVersion>-<thumbVersion>`; any change gives a new URL,
 * so versioned responses are cached forever.
 */
export const GET: RequestHandler = async ({ params, url }) => {
  const collection = params.collection as Collection;
  if (!COLLECTIONS.includes(collection)) error(404, "not found");

  const version = url.searchParams.get("v");
  const cache = version ? "public, max-age=31536000, immutable" : "public, max-age=300";
  const headers = {
    "cache-control": cache,
    // `durable` shares the cached copy across all of Netlify's edge nodes, so
    // each thumb renders about once instead of once per edge location.
    "netlify-cdn-cache-control": `${cache}, durable`,
    // Keeps the cached thumb across deploys (a versioned URL never changes
    // content) and doubles as the purge tag for when an item is deleted or
    // hidden (admin plan, Phase 1).
    "netlify-cache-id": `thumb:${collection}:${params.id}`,
  };

  const key = `${collection}/${params.id}/${version ?? "latest"}`;
  const cached = version ? await readCached(key) : null;
  if (cached) return image(cached, "image/webp", { ...headers, "x-thumb-source": "blob" });

  const drawings = await Thumbs.drawings(collection, params.id);
  if (drawings instanceof Thumbs.ThumbNotFoundError) error(404, "thumb not found");
  if (drawings instanceof Error) error(500, drawings.message);

  const rendered = await renderThumb(drawings, key);
  if (!(rendered instanceof Error)) {
    if (version) await writeCached(key, rendered);
    return image(rendered, "image/webp", { ...headers, "x-thumb-source": "render" });
  }

  // Rendering failed: serve the old stored thumb if there is one, but don't
  // cache it forever, so a fixed renderer can take over.
  console.error(rendered.message, rendered.cause);
  const stored = await Thumbs.stored(collection, params.id);
  if (stored instanceof Error) error(500, rendered.message);
  const short = "public, max-age=300";
  return image(stored.bytes, stored.contentType, {
    ...headers,
    "cache-control": short,
    "netlify-cdn-cache-control": short,
    "x-thumb-source": "stored",
  });
};

function image(bytes: Uint8Array<ArrayBuffer>, contentType: string, headers: Record<string, string>) {
  return new Response(bytes, {
    headers: { ...headers, "content-type": contentType, "content-length": String(bytes.byteLength) },
  });
}
