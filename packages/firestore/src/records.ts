export * as Records from "./records.js";

import {
  FieldPath,
  Timestamp,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
} from "firebase-admin/firestore";
import { db } from "./client.js";
import { Drawing } from "./drawing.js";
import type {
  Collection,
  Corpse,
  LikeState,
  Section,
  SectionType,
  SectionWithDrawing,
  StoredDrawing,
} from "./types.js";
import { SECTION_TYPES } from "./types.js";

/**
 * Field masks for reads. A section doc holds the drawing (up to ~900 KB), a
 * base64 thumb and an unbounded `likedBy` array, so every read names exactly
 * the fields it needs.
 */
export const SECTION_SUMMARY_FIELDS = [
  "type",
  "title",
  "artist",
  "date",
  "likes",
  "featuredIn",
  "thumbVersion",
];
export const SECTION_DRAWING_FIELDS = [...SECTION_SUMMARY_FIELDS, "drawing"];
export const CORPSE_SUMMARY_FIELDS = ["title", "date", "likes", "sections", "thumbVersion"];
export const LIKE_FIELDS = ["likes", "likedBy"];

/** Full stored shape. Only fixtures hold whole records in memory. */
export interface SectionRecord extends SectionWithDrawing {
  thumb: string;
  likedBy: string[];
}

export interface CorpseRecord extends Corpse {
  thumb: string;
  likedBy: string[];
}

function refId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof (value as DocumentReference).id === "string") {
    return (value as DocumentReference).id;
  }

  // JSON/emulator exports carry the path instead of a DocumentReference.
  const exported = value as { _path?: { segments?: string[] }; path?: string } | undefined;
  const segments = exported?._path?.segments ?? exported?.path?.split("/");
  const last = Array.isArray(segments) ? segments.at(-1) : undefined;
  return last ?? "";
}

function millis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  if (typeof value === "string") return Date.parse(value);
  const timestamp = value as
    | { seconds?: number; _seconds?: number }
    | undefined;
  const seconds = timestamp?.seconds ?? timestamp?._seconds;
  if (typeof seconds === "number") return seconds * 1000;
  return 0;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(refId).filter(Boolean);
}

export function toSection(snap: DocumentSnapshot): Section | null {
  const data = snap.data();
  if (!data) return null;

  const type = data.type as SectionType;
  if (!SECTION_TYPES.includes(type)) return null;

  return {
    id: snap.id,
    type,
    title: typeof data.title === "string" ? data.title : "untitled",
    artist: typeof data.artist === "string" ? data.artist : "anonymous",
    date: new Date(millis(data.date)).toISOString(),
    likes: typeof data.likes === "number" ? data.likes : 0,
    thumbVersion: typeof data.thumbVersion === "number" ? data.thumbVersion : 0,
    featuredIn: strings(data.featuredIn),
  };
}

/** Like `toSection`, plus the drawing (legacy records are converted here, and only here). */
export function toSectionWithDrawing(snap: DocumentSnapshot): SectionWithDrawing | null {
  const section = toSection(snap);
  if (!section) return null;
  return { ...section, drawing: Drawing.toDrawingData(snap.get("drawing") as StoredDrawing) };
}

export function toCorpse(snap: DocumentSnapshot): Corpse | null {
  const data = snap.data();
  if (!data) return null;

  const sections = (data.sections ?? {}) as Record<string, unknown>;

  return {
    id: snap.id,
    title: typeof data.title === "string" ? data.title : "untitled",
    date: new Date(millis(data.date)).toISOString(),
    likes: typeof data.likes === "number" ? data.likes : 0,
    thumbVersion: typeof data.thumbVersion === "number" ? data.thumbVersion : 0,
    sections: {
      top: refId(sections.top),
      mid: refId(sections.mid),
      bot: refId(sections.bot),
    },
  };
}

export function toLikeState(snap: DocumentSnapshot, liker?: string): LikeState {
  const likedBy = strings(snap.get("likedBy"));
  const likes = snap.get("likes");
  return {
    likes: typeof likes === "number" ? likes : 0,
    liked: Boolean(liker && likedBy.includes(liker)),
  };
}

export function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

/** Reads one document with a field mask. `null` when it doesn't exist. */
export async function loadOne(
  collection: Collection,
  id: string,
  fields: string[]
): Promise<DocumentSnapshot | null> {
  const [snap] = await db().getAll(db().collection(collection).doc(id), { fieldMask: fields });
  return snap?.exists ? snap : null;
}

/** Reads documents by id with a field mask, skipping ids that no longer exist. */
export async function loadMany(
  collection: Collection,
  ids: string[],
  fields: string[]
): Promise<DocumentSnapshot[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];
  const refs = unique.map((id) => db().collection(collection).doc(id));
  const snaps = await db().getAll(...refs, { fieldMask: fields });
  return snaps.filter((snap) => snap.exists);
}

/**
 * A random document id, then the first document at or after it — the Firestore
 * idiom for random sampling. Wraps around when the id sorts past the last doc.
 */
export async function randomSnapshot(
  collection: Collection,
  { fields, filter }: { fields: string[]; filter?: { field: string; value: string } }
): Promise<DocumentSnapshot | null> {
  const base = db().collection(collection);
  const randomKey = base.doc().id;

  const build = (op: ">=" | "<"): Query => {
    let query: Query = base.where(FieldPath.documentId(), op, randomKey);
    if (filter) query = query.where(filter.field, "==", filter.value);
    return query.select(...fields).limit(1);
  };

  const first = await build(">=").get();
  if (!first.empty) return first.docs[0];

  const second = await build("<").get();
  if (!second.empty) return second.docs[0];
  return null;
}

/** Offset-paged query helper. Requests one extra doc to know if more exist. */
export async function paginate(
  query: Query,
  { page, pageSize }: { page: number; pageSize: number }
): Promise<{ docs: DocumentSnapshot[]; hasMore: boolean }> {
  const offset = Math.max(0, page) * pageSize;
  const snap = await query.offset(offset).limit(pageSize + 1).get();
  return {
    docs: snap.docs.slice(0, pageSize),
    hasMore: snap.docs.length > pageSize,
  };
}
