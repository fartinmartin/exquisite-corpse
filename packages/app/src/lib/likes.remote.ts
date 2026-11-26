import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { Likes } from "@ecc/firestore";
import { COOKIE_OPTIONS, GUEST_TOKEN_COOKIE } from "#lib/draw/state.svelte.ts";

const LikeTarget = v.object({
  collection: v.picklist(["sections", "corpses"]),
  id: v.string(),
});

/**
 * Like state for the current visitor. Fetched after hydration so the page
 * itself has no per-visitor data and can be CDN-cached.
 */
export const getLikeState = query(LikeTarget, async (input) => {
  const liker = getRequestEvent().cookies.get(GUEST_TOKEN_COOKIE);
  return Likes.state({ ...input, liker });
});

/** Toggles a like for the current guest cookie and returns the new state. */
export const toggleLike = command(LikeTarget, async (input) => {
  const event = getRequestEvent();
  let liker = event.cookies.get(GUEST_TOKEN_COOKIE);

  // Guest tokens are issued on first like rather than first visit, so page
  // responses don't carry Set-Cookie (which would make them uncacheable).
  if (!liker) {
    liker = crypto.randomUUID();
    event.cookies.set(GUEST_TOKEN_COOKIE, liker, COOKIE_OPTIONS);
  }

  const result = await Likes.toggle({ ...input, liker });
  if (result instanceof Likes.LikeTargetNotFoundError) error(404, result.message);
  if (result instanceof Error) error(500, result.message);

  // Hand the new state to the client's cached getLikeState without a refetch.
  getLikeState(input).set(result);
  return result;
});
