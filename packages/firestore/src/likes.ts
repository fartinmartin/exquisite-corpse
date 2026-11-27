export * as Likes from "./likes.js";

import { FieldValue } from "firebase-admin/firestore";
import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import type { Collection, LikeState } from "./types.js";

export class LikeTargetNotFoundError extends errore.createTaggedError({
  name: "LikeTargetNotFoundError",
  message: "$collection/$id not found",
}) {}

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

export type { Collection, LikeState };

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
      // Only the like fields: the rest of the doc (drawing, thumb) is large.
      const [snap] = await tx.getAll(ref, { fieldMask: Records.LIKE_FIELDS });
      if (!snap?.exists) throw new LikeTargetNotFoundError(input);

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

  const snap = await Records.loadOne(input.collection, input.id, Records.LIKE_FIELDS);
  return snap ? Records.toLikeState(snap, input.liker) : { likes: 0, liked: false };
}

/**
 * Admin helper: zero out likes on every corpse and section. Reads only document
 * ids (no drawings) and writes through a BulkWriter, so it isn't bound by the
 * 500-write batch limit.
 */
export async function resetAll(): Promise<{ updated: number } | FirestoreError> {
  if (Fixtures.enabled()) return { updated: 0 };

  try {
    const writer = db().bulkWriter();
    let updated = 0;
    for (const collection of ["corpses", "sections"] as const) {
      const snap = await db().collection(collection).select().get();
      for (const doc of snap.docs) void writer.update(doc.ref, { likes: 0, likedBy: [] });
      updated += snap.size;
    }
    await writer.close();
    return { updated };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}
