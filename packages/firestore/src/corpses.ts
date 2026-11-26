export * as Corpses from "./corpses.js";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Drawing } from "./drawing.js";
import {
  Records,
  corpseToRecord,
  corpseToSummary,
  sectionToRecord,
  type CorpseRecord,
  type SectionRecord,
} from "./records.js";
import type {
  Corpse,
  CorpseWithSections,
  GalleryPage,
  SectionType,
  SectionWithDrawing,
} from "./types.js";
import { SECTION_TYPES } from "./types.js";

export class CorpseNotFoundError extends errore.createTaggedError({
  name: "CorpseNotFoundError",
  message: "Corpse $id not found",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type CorpseError = CorpseNotFoundError | FirestoreError;

/** Random word from each title, joined — matches the live site's naming. */
function mashupTitle(titles: string[]): string {
  const fallbacks = ["the", "strange", "creature"];
  return titles
    .map((title, index) => {
      const list = title.trim().split(/\s+/).filter(Boolean);
      const words = list.length > 0 ? list : [fallbacks[index] ?? "thing"];
      return words[Math.floor(Math.random() * words.length)];
    })
    .join(" ");
}

async function panelsFor(sections: Corpse["sections"]): Promise<CorpseWithSections["panels"]> {
  const ids = [sections.top, sections.mid, sections.bot].filter(Boolean);
  const panels: CorpseWithSections["panels"] = {};

  for (const doc of await Records.loadSections(ids)) {
    const record = sectionToRecord(doc);
    if (record) panels[record.type] = { ...Records.sectionToSummary(record), drawing: record.drawing };
  }

  return panels;
}

export async function get(id: string): Promise<CorpseWithSections | CorpseError> {
  try {
    const snap = await db().collection("corpses").doc(id).get();
    if (!snap.exists) return new CorpseNotFoundError({ id });
    const record = corpseToRecord(snap);
    if (!record) return new CorpseNotFoundError({ id });

    const corpse = corpseToSummary(record);
    return { ...corpse, panels: await panelsFor(corpse.sections) };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

export async function random(): Promise<CorpseWithSections | null> {
  const snap = await Records.randomSnapshot("corpses");
  if (!snap) return null;
  const record = corpseToRecord(snap);
  if (!record) return null;

  const corpse = corpseToSummary(record);
  return { ...corpse, panels: await panelsFor(corpse.sections) };
}

export async function list(options: {
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): Promise<GalleryPage<Corpse>> {
  const query = db()
    .collection("corpses")
    .orderBy(options.sort === "likes" ? "likes" : "date", "desc");

  const { docs, hasMore } = await Records.paginate(query, {
    page: options.page,
    pageSize: options.pageSize,
  });

  const items = docs
    .map((doc) => corpseToRecord(doc))
    .filter((record): record is CorpseRecord => record !== null)
    .map(corpseToSummary);

  return { items, page: options.page, hasMore };
}

/** Re-stacks a corpse's thumbnail from its three sections' thumbs. */
export async function rebuildThumb(id: string): Promise<true | CorpseError> {
  const corpse = await get(id);
  if (corpse instanceof Error) return corpse;

  const thumbs = SECTION_TYPES.map((type) => corpse.panels[type]?.thumb);
  const thumb = await Drawing.composeThumbs(thumbs);

  try {
    await db().collection("corpses").doc(id).update({ thumb });
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/**
 * Admin helper: pairs an existing section with random sections of the other
 * two types, the way the old site's "make corpse" button did.
 */
export async function createFromSection(sectionId: string): Promise<{ corpseId: string } | CorpseError> {
  const snap = await db().collection("sections").doc(sectionId).get();
  const section = snap.exists ? sectionToRecord(snap) : null;
  if (!section) return new CorpseNotFoundError({ id: sectionId });

  const panels: Partial<Record<SectionType, SectionRecord>> = { [section.type]: section };

  for (const type of SECTION_TYPES) {
    if (type === section.type) continue;
    const other = await Records.randomSnapshot("sections", { field: "type", value: type });
    const record = other ? sectionToRecord(other) : null;
    if (record) panels[type] = record;
  }

  const corpseRef = db().collection("corpses").doc();
  const thumb = await Drawing.composeThumbs(
    SECTION_TYPES.map((type) => panels[type]?.thumb)
  );
  const title = mashupTitle(
    SECTION_TYPES.map((type) => panels[type]?.title ?? "untitled")
  );

  const batch = db().batch();
  batch.set(corpseRef, {
    title,
    date: Timestamp.now(),
    likes: 0,
    likedBy: [],
    thumb,
    sections: Object.fromEntries(
      SECTION_TYPES.map((type) => [
        type,
        db().collection("sections").doc(panels[type]?.id ?? sectionId),
      ])
    ),
  });

  for (const type of SECTION_TYPES) {
    const panel = panels[type];
    if (!panel) continue;
    batch.update(db().collection("sections").doc(panel.id), {
      featuredIn: FieldValue.arrayUnion(corpseRef),
    });
  }

  try {
    await batch.commit();
    return { corpseId: corpseRef.id };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Deletes a corpse and removes it from its sections' `featuredIn` lists. */
export async function remove(id: string): Promise<true | CorpseError> {
  const corpse = await get(id);
  if (corpse instanceof Error) return corpse;

  const corpseRef = db().collection("corpses").doc(id);
  const batch = db().batch();

  for (const sectionId of Object.values(corpse.sections)) {
    if (!sectionId) continue;
    batch.update(db().collection("sections").doc(sectionId), {
      featuredIn: FieldValue.arrayRemove(corpseRef),
    });
  }

  batch.delete(corpseRef);

  try {
    await batch.commit();
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

export async function count(): Promise<number> {
  const snap = await db().collection("corpses").count().get();
  return snap.data().count;
}

export type { SectionWithDrawing };
