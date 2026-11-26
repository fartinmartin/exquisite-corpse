import { error } from "@sveltejs/kit";
import { Thumbs, type Collection } from "@ecc/firestore";
import type { RequestHandler } from "./$types";

const COLLECTIONS: Collection[] = ["sections", "corpses"];

/**
 * Serves a stored thumbnail as an image. Thumb URLs carry `?v=<thumbVersion>`,
 * which changes whenever the thumb is replaced, so versioned responses are
 * cacheable forever by browsers and the CDN.
 */
export const GET: RequestHandler = async ({ params, url }) => {
  const collection = params.collection as Collection;
  if (!COLLECTIONS.includes(collection)) error(404, "not found");

  const thumb = await Thumbs.get(collection, params.id);
  if (thumb instanceof Thumbs.ThumbNotFoundError) error(404, "thumb not found");
  if (thumb instanceof Error) error(500, thumb.message);

  const cache = url.searchParams.has("v")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=300";

  return new Response(thumb.bytes, {
    headers: {
      "content-type": thumb.contentType,
      "content-length": String(thumb.bytes.byteLength),
      "cache-control": cache,
    },
  });
};
