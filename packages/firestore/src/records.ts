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
import type { Corpse, Section, SectionType, SectionWithDrawing, StoredDrawing } from "./types.js";
import { SECTION_TYPES } from "./types.js";

export interface SectionRecord extends SectionWithDrawing {
  likes: number;
  likedBy: string[];
}

export interface CorpseRecord extends Corpse {
  likes: number;
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

export function sectionToRecord(snap: DocumentSnapshot): SectionRecord | null {
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
    likedBy: strings(data.likedBy),
    thumb: typeof data.thumb === "string" ? data.thumb : "",
    featuredIn: strings(data.featuredIn),
    drawing: Drawing.toDrawingData(data.drawing as StoredDrawing),
  };
}

export function sectionToSummary(record: SectionRecord): Section {
  const { drawing: _drawing, likedBy: _likedBy, ...summary } = record;
  return summary;
}

export function corpseToRecord(snap: DocumentSnapshot): CorpseRecord | null {
  const data = snap.data();
  if (!data) return null;

  const sections = (data.sections ?? {}) as Record<string, unknown>;

  return {
    id: snap.id,
    title: typeof data.title === "string" ? data.title : "untitled",
    date: new Date(millis(data.date)).toISOString(),
    likes: typeof data.likes === "number" ? data.likes : 0,
    likedBy: strings(data.likedBy),
    thumb: typeof data.thumb === "string" ? data.thumb : "",
    sections: {
      top: refId(sections.top),
      mid: refId(sections.mid),
      bot: refId(sections.bot),
    },
  };
}

export function corpseToSummary(record: CorpseRecord): Corpse {
  const { likedBy: _likedBy, ...summary } = record;
  return summary;
}

/** Fetches section snapshots by id, skipping ids that no longer exist. */
export async function loadSections(ids: string[]): Promise<DocumentSnapshot[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];
  const refs = unique.map((id) => db().collection("sections").doc(id));
  const snaps = await db().getAll(...refs);
  return snaps.filter((snap) => snap.exists);
}

export async function loadCorpses(ids: string[]): Promise<DocumentSnapshot[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];
  const refs = unique.map((id) => db().collection("corpses").doc(id));
  const snaps = await db().getAll(...refs);
  return snaps.filter((snap) => snap.exists);
}

/**
 * A random document id, then the first document at or after it — the Firestore
 * idiom for random sampling. Wraps around when the id sorts past the last doc.
 */
export async function randomSnapshot(
  collection: "sections" | "corpses",
  filter?: { field: string; value: string }
): Promise<DocumentSnapshot | null> {
  const base = db().collection(collection);
  const randomKey = base.doc().id;

  const build = (op: ">=" | "<"): Query => {
    let query: Query = base.where(FieldPath.documentId(), op, randomKey);
    if (filter) query = query.where(filter.field, "==", filter.value);
    return query.limit(1);
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
