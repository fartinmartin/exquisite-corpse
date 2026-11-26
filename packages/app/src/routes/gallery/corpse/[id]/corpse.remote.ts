import { error } from "@sveltejs/kit";
import { query } from "$app/server";
import * as v from "valibot";
import { Corpses } from "@ecc/firestore";

/** Public corpse page data. Per-visitor like state comes from `getLikeState`. */
export const getCorpse = query(v.string(), async (id) => {
  const corpse = await Corpses.get(id);
  if (corpse instanceof Corpses.CorpseNotFoundError) error(404, "corpse not found");
  if (corpse instanceof Error) error(500, corpse.message);
  return corpse;
});
