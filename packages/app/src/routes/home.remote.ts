import { error } from "@sveltejs/kit";
import { query } from "$app/server";
import { Corpses } from "@ecc/firestore";

/** A random complete corpse for the home page. */
export const randomCorpse = query(async () => {
  const corpse = await Corpses.random();
  if (!corpse) error(404, "no corpses yet");
  return corpse;
});
