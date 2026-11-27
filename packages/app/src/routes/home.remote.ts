import { error } from "@sveltejs/kit";
import { command, query } from "$app/server";
import * as v from "valibot";
import { Corpses } from "@ecc/firestore";

/** A random complete corpse for the home page. */
export const randomCorpse = query(async () => {
  const corpse = await Corpses.random();
  if (!corpse) error(404, "no corpses yet");
  return corpse;
});

/**
 * Another random corpse's id, not the one on screen. A command rather than a
 * query: queries are GETs that can be cached, and this should differ every call.
 */
export const anotherCorpseId = command(v.optional(v.string()), async (current) => {
  const id = await Corpses.randomId(current);
  if (!id) error(404, "no other corpses yet");
  return id;
});
