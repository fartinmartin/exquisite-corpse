export * as Sections from "./sections.js";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as errore from "errore";
import type { DrawingData } from "@ecc/lexicons";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Drawing } from "./drawing.js";
import {
  Records,
  corpseToSummary,
  sectionToRecord,
  sectionToSummary,
  type CorpseRecord,
  type SectionRecord,
} from "./records.js";
import type {
  Corpse,
  GalleryPage,
  Section,
  SectionType,
  SectionWithDrawing,
} from "./types.js";
import { SECTION_TYPES } from "./types.js";

export class SectionNotFoundError extends errore.createTaggedError({
  name: "SectionNotFoundError",
  message: "Section $id not found",
}) {}

export class SiblingSectionError extends errore.createTaggedError({
  name: "SiblingSectionError",
  message: "Sibling section $id is missing or the wrong type",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export class DrawingTooLargeError extends errore.createTaggedError({
  name: "DrawingTooLargeError",
  message: "Drawing is too large to store ($kb KB, limit $limit KB)",
}) {}

export interface SaveInput {
  type: SectionType;
  title: string;
  artist: string;
  drawing: DrawingData;
  thumb: string;
  /** Ids of the two sections shown while drawing (all three get set on the corpse). */
  siblings: Partial<Record<SectionType, string>>;
  liker?: string;
}

export interface SaveResult {
  sectionId: string;
  corpseId: string;
}

export type SectionError = SectionNotFoundError | FirestoreError;

/** Firestore documents are capped at 1MiB; leave headroom for the thumb and fields. */
const DOCUMENT_BUDGET = 900_000;

/** Splits a title into words, falling back to a random flavour word. */
function words(value: string, fallback: string): string[] {
  const list = value.trim().split(/\s+/).filter(Boolean);
  return list.length > 0 ? list : [fallback];
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** One random word from each section title — the live site's corpse naming. */
function mashupTitle(titles: string[]): string {
  const fallbacks = ["the", "strange", "creature"];
  return titles
    .map((title, index) => pick(words(title, fallbacks[index] ?? "thing")))
    .join(" ");
}

function sortField(sort: "date" | "likes"): string {
  return sort === "likes" ? "likes" : "date";
}

export async function get(id: string): Promise<SectionWithDrawing | SectionError> {
  if (Fixtures.enabled()) {
    const section = Fixtures.section(id);
    return section ?? new SectionNotFoundError({ id });
  }

  try {
    const snap = await db().collection("sections").doc(id).get();
    if (!snap.exists) return new SectionNotFoundError({ id });
    const record = sectionToRecord(snap);
    if (!record) return new SectionNotFoundError({ id });
    return { ...sectionToSummary(record), drawing: record.drawing };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

export async function randomByType(type: SectionType): Promise<SectionWithDrawing | null> {
  if (Fixtures.enabled()) return Fixtures.randomSection(type);

  const snap = await Records.randomSnapshot("sections", { field: "type", value: type });
  if (!snap) return null;
  const record = sectionToRecord(snap);
  return record ? { ...sectionToSummary(record), drawing: record.drawing } : null;
}

export async function list(options: {
  type?: SectionType;
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): Promise<GalleryPage<Section>> {
  if (Fixtures.enabled()) return Fixtures.listSections(options);

  let query = db().collection("sections") as FirebaseFirestore.Query;
  if (options.type) query = query.where("type", "==", options.type);
  query = query.orderBy(sortField(options.sort), "desc");

  const { docs, hasMore } = await Records.paginate(query, {
    page: options.page,
    pageSize: options.pageSize,
  });

  const items = docs
    .map((doc) => sectionToRecord(doc))
    .filter((record): record is SectionRecord => record !== null)
    .map(sectionToSummary);

  return { items, page: options.page, hasMore };
}

/** The corpses a section appears in (its `featuredIn` refs). */
export async function featuredIn(sectionId: string, limit = 3): Promise<Corpse[]> {
  if (Fixtures.enabled()) return Fixtures.featuredIn(sectionId);

  const snap = await db().collection("sections").doc(sectionId).get();
  const record = snap.exists ? sectionToRecord(snap) : null;
  if (!record) return [];

  const ids = record.featuredIn.slice(-limit);
  const corpses = await Records.loadCorpses(ids);
  return corpses
    .map((doc) => Records.corpseToRecord(doc))
    .filter((corpse): corpse is CorpseRecord => corpse !== null)
    .map(Records.corpseToSummary);
}

/** Other sections by the same artist, most liked first. */
export async function moreByArtist(
  artist: string,
  { excludeId, limit = 6 }: { excludeId?: string; limit?: number }
): Promise<Section[]> {
  if (Fixtures.enabled()) return Fixtures.moreByArtist(artist, excludeId);

  if (!artist) return [];
  const snap = await db()
    .collection("sections")
    .where("artist", "==", artist)
    .orderBy("likes", "desc")
    .limit(limit + 1)
    .get();

  return snap.docs
    .filter((doc) => doc.id !== excludeId)
    .slice(0, limit)
    .map((doc) => sectionToRecord(doc))
    .filter((record): record is SectionRecord => record !== null)
    .map(sectionToSummary);
}

/**
 * Saves a drawn section and assembles the corpse it was drawn against.
 * The three panels' thumbnails are stacked server-side so the gallery reads
 * a single image per corpse.
 */
export async function save(
  input: SaveInput
): Promise<SaveResult | SiblingSectionError | DrawingTooLargeError | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.saveSection(input);

  const bytes = JSON.stringify(input.drawing).length + input.thumb.length;
  if (bytes > DOCUMENT_BUDGET) {
    return new DrawingTooLargeError({
      kb: Math.round(bytes / 1000),
      limit: Math.round(DOCUMENT_BUDGET / 1000),
    });
  }

  const siblingTypes = SECTION_TYPES.filter((type) => type !== input.type);
  const siblingIds = siblingTypes.map((type) => input.siblings[type]).filter(Boolean) as string[];

  // Read the panels shown while drawing, plus their thumbs for the corpse preview.
  const siblingRecords = new Map<string, SectionRecord>();
  for (const doc of await Records.loadSections(siblingIds)) {
    const record = sectionToRecord(doc);
    if (record) siblingRecords.set(record.id, record);
  }

  for (const type of siblingTypes) {
    const id = input.siblings[type];
    if (!id) continue;
    const record = siblingRecords.get(id);
    if (!record || record.type !== type) return new SiblingSectionError({ id });
  }

  const corpseRef = db().collection("corpses").doc();
  const sectionRef = db().collection("sections").doc();

  const thumbs: Partial<Record<SectionType, string>> = { [input.type]: input.thumb };
  const titles: Partial<Record<SectionType, string>> = { [input.type]: input.title };
  const panelIds: Partial<Record<SectionType, string>> = { [input.type]: sectionRef.id };

  for (const type of siblingTypes) {
    const record = input.siblings[type] ? siblingRecords.get(input.siblings[type]!) : undefined;
    if (!record) continue;
    thumbs[type] = record.thumb;
    titles[type] = record.title;
    panelIds[type] = record.id;
  }

  const corpseThumb = await Drawing.composeThumbs([thumbs.top, thumbs.mid, thumbs.bot]);
  const corpseTitle = mashupTitle([
    titles.top ?? input.title,
    titles.mid ?? input.title,
    titles.bot ?? input.title,
  ]);

  const now = Timestamp.now();
  const batch = db().batch();

  batch.set(sectionRef, {
    type: input.type,
    title: input.title.slice(0, 40).trim() || "untitled",
    artist: input.artist.slice(0, 30).trim() || "anonymous",
    date: now,
    likes: 0,
    likedBy: [],
    thumb: input.thumb,
    drawing: input.drawing,
    featuredIn: [corpseRef],
  });

  batch.set(corpseRef, {
    title: corpseTitle,
    date: now,
    likes: 0,
    likedBy: [],
    thumb: corpseThumb,
    sections: {
      top: db().collection("sections").doc(panelIds.top ?? sectionRef.id),
      mid: db().collection("sections").doc(panelIds.mid ?? sectionRef.id),
      bot: db().collection("sections").doc(panelIds.bot ?? sectionRef.id),
    },
  });

  for (const type of siblingTypes) {
    const id = input.siblings[type];
    if (!id) continue;
    batch.update(db().collection("sections").doc(id), {
      featuredIn: FieldValue.arrayUnion(corpseRef),
    });
  }

  try {
    await batch.commit();
    return { sectionId: sectionRef.id, corpseId: corpseRef.id };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Deletes a section. Corpse cleanup lives in `Admin.removeSection`. */
export async function remove(id: string): Promise<true | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.removeSection(id);

  try {
    await db().collection("sections").doc(id).delete();
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Total number of sections — used by the admin screen. */
export async function count(): Promise<number> {
  if (Fixtures.enabled()) return Fixtures.count().sections;

  const snap = await db().collection("sections").count().get();
  return snap.data().count;
}
