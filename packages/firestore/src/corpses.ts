export * as Corpses from "./corpses.js";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
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
  const ids = [sections.top, sections.mid, sections.bot];
  const snaps = await Records.loadMany("sections", ids, Records.SECTION_DRAWING_FIELDS);
  const panels: CorpseWithSections["panels"] = {};

  for (const panel of snaps.map(Records.toSectionWithDrawing).filter(Records.isPresent)) {
    panels[panel.type] = panel;
  }

  return panels;
}

/** A corpse and its three panels' drawings, in two round trips. */
export async function get(id: string): Promise<CorpseWithSections | CorpseError> {
  if (Fixtures.enabled()) return Fixtures.corpse(id);

  try {
    const snap = await Records.loadOne("corpses", id, Records.CORPSE_SUMMARY_FIELDS);
    const corpse = snap ? Records.toCorpse(snap) : null;
    if (!corpse) return new CorpseNotFoundError({ id });
    return { ...corpse, panels: await panelsFor(corpse.sections) };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

export async function random(): Promise<CorpseWithSections | null> {
  if (Fixtures.enabled()) return Fixtures.randomCorpse();

  const snap = await Records.randomSnapshot("corpses", { fields: Records.CORPSE_SUMMARY_FIELDS });
  const corpse = snap ? Records.toCorpse(snap) : null;
  if (!corpse) return null;
  return { ...corpse, panels: await panelsFor(corpse.sections) };
}

export async function list(options: {
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): Promise<GalleryPage<Corpse>> {
  if (Fixtures.enabled()) return Fixtures.listCorpses(options);

  const query = db()
    .collection("corpses")
    .orderBy(options.sort === "likes" ? "likes" : "date", "desc")
    .select(...Records.CORPSE_SUMMARY_FIELDS);

  const { docs, hasMore } = await Records.paginate(query, {
    page: options.page,
    pageSize: options.pageSize,
  });

  return { items: docs.map(Records.toCorpse).filter(Records.isPresent), page: options.page, hasMore };
}

/**
 * Forces a corpse thumbnail to be re-rendered: a new version gives it a new
 * URL, so cached and stored copies of the old one are never served again.
 */
export async function rebuildThumb(id: string): Promise<true | CorpseError> {
  if (Fixtures.enabled()) return true;

  try {
    const snap = await Records.loadOne("corpses", id, ["title"]);
    if (!snap) return new CorpseNotFoundError({ id });
    await db().collection("corpses").doc(id).update({ thumbVersion: Date.now() });
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
  if (Fixtures.enabled()) {
    const result = Fixtures.makeCorpse(sectionId);
    return result ?? new CorpseNotFoundError({ id: sectionId });
  }

  const PANEL_FIELDS = ["type", "title"];
  const snap = await Records.loadOne("sections", sectionId, PANEL_FIELDS);
  const type = snap?.get("type") as SectionType | undefined;
  if (!snap || !type) return new CorpseNotFoundError({ id: sectionId });

  type Panel = { id: string; title: string };
  const toPanel = (doc: FirebaseFirestore.DocumentSnapshot): Panel => ({
    id: doc.id,
    title: doc.get("title") ?? "untitled",
  });
  const panels: Partial<Record<SectionType, Panel>> = { [type]: toPanel(snap) };

  const others = await Promise.all(
    SECTION_TYPES.filter((other) => other !== type).map(async (other) => {
      const doc = await Records.randomSnapshot("sections", {
        fields: PANEL_FIELDS,
        filter: { field: "type", value: other },
      });
      return [other, doc] as const;
    })
  );
  for (const [other, doc] of others) if (doc) panels[other] = toPanel(doc);

  const corpseRef = db().collection("corpses").doc();
  const title = mashupTitle(
    SECTION_TYPES.map((type) => panels[type]?.title ?? "untitled")
  );

  const batch = db().batch();
  batch.set(corpseRef, {
    title,
    date: Timestamp.now(),
    likes: 0,
    likedBy: [],
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
  if (Fixtures.enabled()) return Fixtures.removeCorpse(id);

  const snap = await Records.loadOne("corpses", id, ["sections"]);
  const corpse = snap ? Records.toCorpse(snap) : null;
  if (!corpse) return new CorpseNotFoundError({ id });

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
  if (Fixtures.enabled()) return Fixtures.count().corpses;

  const snap = await db().collection("corpses").count().get();
  return snap.data().count;
}

export type { SectionWithDrawing };
