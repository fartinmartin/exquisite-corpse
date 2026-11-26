export * as Likes from "./likes.js";

import { FieldValue } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";

export class LikeTargetNotFoundError extends errore.createTaggedError({
  name: "LikeTargetNotFoundError",
  message: "$collection/$id not found",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type Collection = "sections" | "corpses";

export interface LikeState {
  likes: number;
  liked: boolean;
}

/**
 * Toggles a like for an opaque liker id (the guest cookie), keeping the
 * `likes` counter and `likedBy` array in sync in one transaction.
 */
export async function toggle(input: {
  collection: Collection;
  id: string;
  liker: string;
}): Promise<LikeState | LikeTargetNotFoundError | FirestoreError> {
  if (Fixtures.enabled()) {
    const state = Fixtures.toggleLike(input.collection, input.id, input.liker);
    return state ?? new LikeTargetNotFoundError({ ...input });
  }

  const ref = db().collection(input.collection).doc(input.id);

  try {
    return await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new LikeTargetNotFoundError(input);

      const likedBy: string[] = Array.isArray(snap.get("likedBy")) ? snap.get("likedBy") : [];
      const liked = likedBy.includes(input.liker);
      const likes = Math.max(0, (snap.get("likes") ?? 0) + (liked ? -1 : 1));

      tx.update(ref, {
        likes,
        likedBy: liked
          ? FieldValue.arrayRemove(input.liker)
          : FieldValue.arrayUnion(input.liker),
      });

      return { likes, liked: !liked };
    });
  } catch (cause) {
    if (cause instanceof LikeTargetNotFoundError) return cause;
    return new FirestoreError({ cause });
  }
}

/** Reads like state without mutating it. */
export async function state(input: {
  collection: Collection;
  id: string;
  liker?: string;
}): Promise<LikeState> {
  if (Fixtures.enabled()) return Fixtures.likeState(input.collection, input.id, input.liker);

  const snap = await db().collection(input.collection).doc(input.id).get();
  const likedBy: string[] = Array.isArray(snap.get("likedBy")) ? snap.get("likedBy") : [];
  return {
    likes: snap.get("likes") ?? 0,
    liked: Boolean(input.liker && likedBy.includes(input.liker)),
  };
}

/** Admin helper: zero out likes on every corpse and section. */
export async function resetAll(): Promise<true | FirestoreError> {
  if (Fixtures.enabled()) return true;

  try {
    const batch = db().batch();
    for (const collection of ["corpses", "sections"] as const) {
      const snap = await db().collection(collection).get();
      snap.forEach((doc) => batch.update(doc.ref, { likes: 0, likedBy: [] }));
    }
    await batch.commit();
    return true;
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}
