export * as Sections from "./sections.js";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as errore from "errore";
import type { DrawingData } from "@ecc/lexicons";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import type {
  Corpse,
  GalleryPage,
  Section,
  SectionDetail,
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
  /** Ids of the two sections shown while drawing (all three get set on the corpse). */
  siblings: Partial<Record<SectionType, string>>;
}

export interface SaveResult {
  sectionId: string;
  corpseId: string;
}

export type SectionError = SectionNotFoundError | FirestoreError;

/** Firestore documents are capped at 1MiB; leave headroom for the other fields. */
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

  const snap = await Records.loadOne("sections", id, Records.SECTION_DRAWING_FIELDS).catch(
    (cause: unknown) => new FirestoreError({ cause })
  );
  if (snap instanceof Error) return snap;
  return (snap && Records.toSectionWithDrawing(snap)) ?? new SectionNotFoundError({ id });
}

/**
 * Everything the section page shows, in two round trips: the section, then its
 * corpses and the artist's other sections in parallel.
 */
export async function detail(id: string): Promise<SectionDetail | SectionError> {
  const section = await get(id);
  if (section instanceof Error) return section;

  const related = await Promise.all([
    featuredIn(section, 3),
    moreByArtist(section.artist, { excludeId: id }),
  ]).catch((cause: unknown) => new FirestoreError({ cause }));
  if (related instanceof Error) return related;

  const [corpses, moreBy] = related;
  return { section, featuredIn: corpses, moreBy };
}

export async function randomByType(type: SectionType): Promise<SectionWithDrawing | null> {
  if (Fixtures.enabled()) return Fixtures.randomSection(type);

  const snap = await Records.randomSnapshot("sections", {
    fields: Records.SECTION_DRAWING_FIELDS,
    filter: { field: "type", value: type },
  });
  return snap ? Records.toSectionWithDrawing(snap) : null;
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
  query = query.orderBy(sortField(options.sort), "desc").select(...Records.SECTION_SUMMARY_FIELDS);

  const { docs, hasMore } = await Records.paginate(query, {
    page: options.page,
    pageSize: options.pageSize,
  });

  return { items: docs.map(Records.toSection).filter(Records.isPresent), page: options.page, hasMore };
}

/** The most recent corpses a section appears in (its `featuredIn` refs). */
async function featuredIn(section: Section, limit: number): Promise<Corpse[]> {
  if (Fixtures.enabled()) return Fixtures.featuredIn(section.id);

  const ids = section.featuredIn.slice(-limit);
  const snaps = await Records.loadMany("corpses", ids, Records.CORPSE_SUMMARY_FIELDS);
  return snaps.map(Records.toCorpse).filter(Records.isPresent);
}

/** Other sections by the same artist, most liked first. */
async function moreByArtist(
  artist: string,
  { excludeId, limit = 6 }: { excludeId?: string; limit?: number }
): Promise<Section[]> {
  if (Fixtures.enabled()) return Fixtures.moreByArtist(artist, excludeId);

  if (!artist) return [];
  const snap = await db()
    .collection("sections")
    .where("artist", "==", artist)
    .orderBy("likes", "desc")
    .select(...Records.SECTION_SUMMARY_FIELDS)
    .limit(limit + 1)
    .get();

  return snap.docs
    .filter((doc) => doc.id !== excludeId)
    .slice(0, limit)
    .map(Records.toSection)
    .filter(Records.isPresent);
}

/** Saves a drawn section and assembles the corpse it was drawn against. */
export async function save(
  input: SaveInput
): Promise<SaveResult | SiblingSectionError | DrawingTooLargeError | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.saveSection(input);

  const bytes = JSON.stringify(input.drawing).length;
  if (bytes > DOCUMENT_BUDGET) {
    return new DrawingTooLargeError({
      kb: Math.round(bytes / 1000),
      limit: Math.round(DOCUMENT_BUDGET / 1000),
    });
  }

  const siblingTypes = SECTION_TYPES.filter((type) => type !== input.type);
  const siblingIds = siblingTypes.map((type) => input.siblings[type]).filter(Boolean) as string[];

  // Read the panels shown while drawing: their type (to validate) and title (for
  // the corpse name). Thumbnails are rendered from drawings on request.
  const siblingSnaps = await Records.loadMany("sections", siblingIds, ["type", "title"]);
  const siblingRecords = new Map(siblingSnaps.map((snap) => [snap.id, snap]));

  for (const type of siblingTypes) {
    const id = input.siblings[type];
    if (!id) continue;
    if (siblingRecords.get(id)?.get("type") !== type) return new SiblingSectionError({ id });
  }

  const corpseRef = db().collection("corpses").doc();
  const sectionRef = db().collection("sections").doc();

  const titles: Partial<Record<SectionType, string>> = { [input.type]: input.title };
  const panelIds: Partial<Record<SectionType, string>> = { [input.type]: sectionRef.id };

  for (const type of siblingTypes) {
    const snap = input.siblings[type] ? siblingRecords.get(input.siblings[type]!) : undefined;
    if (!snap) continue;
    titles[type] = snap.get("title");
    panelIds[type] = snap.id;
  }

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
    drawing: input.drawing,
    featuredIn: [corpseRef],
  });

  batch.set(corpseRef, {
    title: corpseTitle,
    date: now,
    likes: 0,
    likedBy: [],
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

/** Total number of sections — used by the admin screen. */
export async function count(): Promise<number> {
  if (Fixtures.enabled()) return Fixtures.count().sections;

  const snap = await db().collection("sections").count().get();
  return snap.data().count;
}
