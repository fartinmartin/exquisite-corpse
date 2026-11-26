export * as Thumbs from "./thumbs.js";

import * as errore from "errore";
import type { DrawingData } from "@ecc/lexicons";
import { Corpses } from "./corpses.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import { Sections } from "./sections.js";
import type { Collection, Thumb } from "./types.js";
import { SECTION_TYPES } from "./types.js";

export class ThumbNotFoundError extends errore.createTaggedError({
  name: "ThumbNotFoundError",
  message: "No thumb for $collection/$id",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type ThumbError = ThumbNotFoundError | FirestoreError;

/**
 * The drawings a thumbnail is rendered from, top to bottom: one for a
 * section, the three panels for a corpse.
 */
export async function drawings(
  collection: Collection,
  id: string
): Promise<DrawingData[] | ThumbError> {
  if (collection === "sections") {
    const section = await Sections.get(id);
    if (section instanceof Sections.SectionNotFoundError) return new ThumbNotFoundError({ collection, id });
    if (section instanceof Error) return new FirestoreError({ cause: section });
    return [section.drawing];
  }

  const corpse = await Corpses.get(id);
  if (corpse instanceof Corpses.CorpseNotFoundError) return new ThumbNotFoundError({ collection, id });
  if (corpse instanceof Error) return new FirestoreError({ cause: corpse });

  const panels = SECTION_TYPES.map((type) => corpse.panels[type]?.drawing).filter(
    (drawing): drawing is DrawingData => drawing !== undefined
  );
  return panels.length > 0 ? panels : new ThumbNotFoundError({ collection, id });
}

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

/**
 * The thumbnail stored on the document by the old save path. Only a fallback
 * for when rendering from the drawing fails; new saves don't store one.
 */
export async function stored(collection: Collection, id: string): Promise<Thumb | ThumbError> {
  const url = Fixtures.enabled()
    ? Fixtures.thumb(collection, id)
    : await Records.loadOne(collection, id, ["thumb"])
        .then((snap) => snap?.get("thumb") as string | undefined)
        .catch((cause: unknown) => new FirestoreError({ cause }));
  if (url instanceof Error) return url;

  const thumb = url ? decodeDataUrl(url) : null;
  return thumb ?? new ThumbNotFoundError({ collection, id });
}
