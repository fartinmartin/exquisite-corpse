export * as Admin from "./admin.js";

import { FieldValue } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Records } from "./records.js";

export class NotFoundError extends errore.createTaggedError({
  name: "NotFoundError",
  message: "$collection/$id not found",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type AdminError = NotFoundError | FirestoreError;

/** Deletes a section, plus every corpse it appears in. */
export async function removeSection(id: string): Promise<true | AdminError> {
  const ref = db().collection("sections").doc(id);
  const snap = await Records.loadOne("sections", id, ["featuredIn"]);
  if (!snap) return new NotFoundError({ collection: "sections", id });

  const featuredIn = (snap.get("featuredIn") ?? []) as { id?: string; path?: string }[];

  try {
    for (const corpseRef of featuredIn) {
      const corpseId = corpseRef.id ?? corpseRef.path?.split("/").pop();
      if (corpseId) await removeCorpse(corpseId);
    }
    await ref.delete();
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Deletes a corpse and clears the reference from its sections. */
export async function removeCorpse(id: string): Promise<true | AdminError> {
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

/** Removes the `featuredIn` back-reference from every section. */
export async function clearFeaturedInRefs(): Promise<true | FirestoreError> {
  try {
    const snap = await db().collection("sections").get();
    const batch = db().batch();
    snap.forEach((doc) => batch.update(doc.ref, { featuredIn: FieldValue.delete() }));
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
