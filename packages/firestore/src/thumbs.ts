export * as Thumbs from "./thumbs.js";

import * as errore from "errore";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import type { Collection, Thumb } from "./types.js";

export class ThumbNotFoundError extends errore.createTaggedError({
  name: "ThumbNotFoundError",
  message: "No thumb for $collection/$id",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type ThumbError = ThumbNotFoundError | FirestoreError;

/** Splits a `data:` URL into its content type and bytes. `null` when malformed. */
export function decodeDataUrl(url: string): Thumb | null {
  const match = /^data:([^;,]+)((?:;[^;,]+)*),(.*)$/s.exec(url);
  if (!match) return null;
  const [, contentType, params, body] = match;
  const bytes = params.includes(";base64")
    ? Buffer.from(body, "base64")
    : Buffer.from(decodeURIComponent(body), "utf8");
  return { contentType, bytes: new Uint8Array(bytes) };
}

/** The stored thumbnail for a section or corpse, as bytes. */
export async function get(collection: Collection, id: string): Promise<Thumb | ThumbError> {
  const url = Fixtures.enabled()
    ? Fixtures.thumb(collection, id)
    : await Records.loadOne(collection, id, ["thumb"])
        .then((snap) => snap?.get("thumb") as string | undefined)
        .catch((cause: unknown) => new FirestoreError({ cause }));
  if (url instanceof Error) return url;

  const thumb = url ? decodeDataUrl(url) : null;
  return thumb ?? new ThumbNotFoundError({ collection, id });
}
