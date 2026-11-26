import { error } from "@sveltejs/kit";
import { getRequestEvent, query } from "$app/server";
import * as v from "valibot";
import { Corpses, Likes } from "@ecc/firestore";

export const getCorpse = query(v.string(), async (id) => {
  const corpse = await Corpses.get(id);
  if (corpse instanceof Error) error(404, "corpse not found");

  const liker = getRequestEvent().cookies.get("ecc_guest_token");
  const likeState = await Likes.state({ collection: "corpses", id, liker });

  return { corpse, likeState };
});
