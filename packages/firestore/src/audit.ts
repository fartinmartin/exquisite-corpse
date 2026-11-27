export * as Audit from "./audit.js";

import { Timestamp } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import type { Collection } from "./types.js";

/**
 * A log of admin actions in the `adminActions` collection, newest first, with
 * undo for the reversible ones (hide/unhide). Deletes are logged but can't be
 * undone: the data is gone.
 */

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export class NotUndoableError extends errore.createTaggedError({
  name: "NotUndoableError",
  message: "Action $id can't be undone ($reason)",
}) {}

export type Action =
  | "hide"
  | "unhide"
  | "delete"
  | "make-corpse"
  | "rerender-thumb"
  | "site-mode"
  | "reset-likes"
  | "repair-refs";

export interface Entry {
  id: string;
  at: string;
  action: Action;
  collection?: Collection;
  ids: string[];
  /** Corpses that changed along with a section (hide cascade, delete cascade). */
  cascaded?: string[];
  /** Free text, e.g. the new site mode. */
  detail?: string;
  /** Set when this entry was undone; points at the entry that undid it. */
  undoneBy?: string;
  /** Set on an undo entry: the entry it reversed. */
  undoes?: string;
}

export type NewEntry = Omit<Entry, "id" | "at" | "undoneBy">;

const COLLECTION = "adminActions";
const UNDOABLE: Action[] = ["hide", "unhide"];

export function undoable(entry: Entry): boolean {
  return UNDOABLE.includes(entry.action) && !entry.undoneBy && !entry.undoes;
}

/** Records an action. Returns the new entry's id. */
export async function record(entry: NewEntry): Promise<string | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.recordAction(entry);

  try {
    // Firestore rejects `undefined`; the client is set to ignore it.
    const ref = await db().collection(COLLECTION).add({ ...entry, at: Timestamp.now() });
    return ref.id;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

export async function recent(limit = 50): Promise<Entry[] | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.recentActions(limit);

  try {
    const snap = await db().collection(COLLECTION).orderBy("at", "desc").limit(limit).get();
    return snap.docs.map((doc) => toEntry(doc.id, doc.data()));
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

function toEntry(id: string, data: FirebaseFirestore.DocumentData): Entry {
  const at = data.at instanceof Timestamp ? data.at.toDate().toISOString() : String(data.at);
  return { ...(data as Omit<Entry, "id" | "at">), id, at };
}

export async function get(id: string): Promise<Entry | null | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.recentActions(Infinity).find((entry) => entry.id === id) ?? null;

  try {
    const snap = await db().collection(COLLECTION).doc(id).get();
    return snap.exists ? toEntry(snap.id, snap.data()!) : null;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/** Links an entry to the entry that undid it. */
export async function markUndone(id: string, undoneBy: string): Promise<true | FirestoreError> {
  if (Fixtures.enabled()) return Fixtures.markActionUndone(id, undoneBy);

  try {
    await db().collection(COLLECTION).doc(id).update({ undoneBy });
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}
