export * as Admin from "./admin.js";

import { FieldValue } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import type { Corpse, Section } from "./types.js";

export class NotFoundError extends errore.createTaggedError({
  name: "NotFoundError",
  message: "$collection/$id not found",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type AdminError = NotFoundError | FirestoreError;

export interface SectionDeletePreview {
  section: Section;
  /** Every corpse the section appears in; deleting the section deletes these too. */
  corpses: Corpse[];
}

/** What deleting a section would remove, without changing anything. */
export async function previewSectionDelete(id: string): Promise<SectionDeletePreview | AdminError> {
  if (Fixtures.enabled()) {
    return Fixtures.previewSectionDelete(id) ?? new NotFoundError({ collection: "sections", id });
  }

  try {
    const snap = await Records.loadOne("sections", id, Records.SECTION_SUMMARY_FIELDS);
    const section = snap ? Records.toSection(snap) : null;
    if (!section) return new NotFoundError({ collection: "sections", id });

    const corpses = await Records.loadMany("corpses", section.featuredIn, Records.CORPSE_SUMMARY_FIELDS);
    return { section, corpses: corpses.map(Records.toCorpse).filter(Records.isPresent) };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** The corpse a delete would remove, for the confirm step. Its sections stay. */
export async function previewCorpseDelete(id: string): Promise<Corpse | AdminError> {
  if (Fixtures.enabled()) {
    return Fixtures.corpse(id) ?? new NotFoundError({ collection: "corpses", id });
  }

  try {
    const snap = await Records.loadOne("corpses", id, Records.CORPSE_SUMMARY_FIELDS);
    const corpse = snap ? Records.toCorpse(snap) : null;
    return corpse ?? new NotFoundError({ collection: "corpses", id });
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/**
 * Deletes a section plus every corpse it appears in, in one batch, and clears
 * those corpses from their other sections' `featuredIn`. Returns the deleted
 * corpse ids so callers can clean up their thumbs.
 */
export async function removeSection(id: string): Promise<{ corpseIds: string[] } | AdminError> {
  if (Fixtures.enabled()) {
    return Fixtures.removeSection(id) ?? new NotFoundError({ collection: "sections", id });
  }

  const preview = await previewSectionDelete(id);
  if (preview instanceof Error) return preview;

  try {
    const corpses = preview.corpses;
    const batch = db().batch();

    for (const corpse of corpses) {
      const corpseRef = db().collection("corpses").doc(corpse.id);
      for (const sectionId of new Set(Object.values(corpse.sections))) {
        if (!sectionId || sectionId === id) continue;
        batch.update(db().collection("sections").doc(sectionId), {
          featuredIn: FieldValue.arrayRemove(corpseRef),
        });
      }
      batch.delete(corpseRef);
    }
    batch.delete(db().collection("sections").doc(id));

    await batch.commit();
    return { corpseIds: corpses.map((corpse) => corpse.id) };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Deletes a corpse and clears the reference from its sections. */
export async function removeCorpse(id: string): Promise<true | AdminError> {
  if (Fixtures.enabled()) return Fixtures.removeCorpse(id);

  const ref = db().collection("corpses").doc(id);
  const snap = await Records.loadOne("corpses", id, ["sections"]);
  if (!snap) return new NotFoundError({ collection: "corpses", id });

  const sections = (snap.get("sections") ?? {}) as Record<string, { id?: string; path?: string }>;
  const batch = db().batch();

  for (const sectionRef of Object.values(sections)) {
    const sectionId = sectionRef?.id ?? sectionRef?.path?.split("/").pop();
    if (!sectionId) continue;
    batch.update(db().collection("sections").doc(sectionId), {
      featuredIn: FieldValue.arrayRemove(ref),
    });
  }

  batch.delete(ref);

  try {
    await batch.commit();
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Returns the raw legacy path commands for a section (admin export). */
export async function sectionDrawing(id: string): Promise<unknown | NotFoundError> {
  const snap = await Records.loadOne("sections", id, ["drawing"]);
  if (!snap) return new NotFoundError({ collection: "sections", id });
  return snap.get("drawing");
}

export interface Summaries {
  sections: Section[];
  corpses: Corpse[];
}

/**
 * Every section and corpse, hidden included, as summaries (no drawings or
 * thumbs: ~0.2 KB each). Admin browse/search filters this in the browser,
 * which avoids an index per filter combination. Fine up to a few thousand
 * docs; past that, page it.
 */
export async function summaries(): Promise<Summaries | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.summaries();

  try {
    const [sections, corpses] = await Promise.all([
      db().collection("sections").select(...Records.SECTION_SUMMARY_FIELDS).get(),
      db().collection("corpses").select(...Records.CORPSE_SUMMARY_FIELDS).get(),
    ]);
    const byNewest = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);
    return {
      sections: sections.docs.map(Records.toSection).filter(Records.isPresent).sort(byNewest),
      corpses: corpses.docs.map(Records.toCorpse).filter(Records.isPresent).sort(byNewest),
    };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/**
 * Hides or unhides an item. Hiding a section also hides every visible corpse
 * it's in (marked `hiddenBy: section:<id>`); unhiding it unhides only those,
 * not corpses that were hidden on their own. Returns the corpse ids that
 * changed alongside it, so callers can clean up thumbs.
 */
export async function setHidden(
  collection: "sections" | "corpses",
  id: string,
  hidden: boolean
): Promise<{ cascaded: string[] } | AdminError> {
  if (Fixtures.enabled()) {
    const cascaded = Fixtures.setHidden(collection, id, hidden);
    return cascaded ? { cascaded } : new NotFoundError({ collection, id });
  }

  try {
    if (collection === "corpses") {
      const snap = await Records.loadOne("corpses", id, ["hidden"]);
      if (!snap) return new NotFoundError({ collection, id });
      await snap.ref.update(hidden ? { hidden, hiddenBy: "manual" } : { hidden, hiddenBy: FieldValue.delete() });
      return { cascaded: [] };
    }

    const snap = await Records.loadOne("sections", id, Records.SECTION_SUMMARY_FIELDS);
    const section = snap ? Records.toSection(snap) : null;
    if (!snap || !section) return new NotFoundError({ collection, id });

    const by = `section:${id}`;
    const corpses = (await Records.loadMany("corpses", section.featuredIn, Records.CORPSE_SUMMARY_FIELDS))
      .map(Records.toCorpse)
      .filter(Records.isPresent);
    const affected = corpses.filter((corpse) => (hidden ? !corpse.hidden : corpse.hiddenBy === by));

    const batch = db().batch();
    batch.update(snap.ref, { hidden });
    for (const corpse of affected) {
      batch.update(
        db().collection("corpses").doc(corpse.id),
        hidden ? { hidden: true, hiddenBy: by } : { hidden: false, hiddenBy: FieldValue.delete() }
      );
    }
    await batch.commit();
    return { cascaded: affected.map((corpse) => corpse.id) };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}
