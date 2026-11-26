import { command, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { Likes } from "@ecc/firestore";

const ToggleInput = v.object({
  collection: v.picklist(["sections", "corpses"]),
  id: v.string(),
});

/** Toggles a like for the current guest cookie and returns the new state. */
export const toggleLike = command(ToggleInput, async (input) => {
  const event = getRequestEvent();
  const liker = event.cookies.get("ecc_guest_token");
  if (!liker) error(401, "no guest session");

  const result = await Likes.toggle({ ...input, liker });
  if (result instanceof Error) error(result.message === "not found" ? 404 : 500, result.message);
  return result;
});
