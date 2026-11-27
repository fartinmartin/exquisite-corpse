import { error } from "@sveltejs/kit";
import { query } from "$app/server";
import * as v from "valibot";
import { Sections } from "@ecc/firestore";

/** Public section page data. Per-visitor like state comes from `getLikeState`. */
export const getSection = query(v.string(), async (id) => {
  const detail = await Sections.detail(id);
  if (detail instanceof Sections.SectionNotFoundError) error(404, "section not found");
  if (detail instanceof Error) error(500, detail.message);
  return detail;
});

/** Every creature the section is in, newest first: the /fresh section page plays through them. */
export const getSectionCreatures = query(v.string(), async (id) => {
  const corpses = await Sections.creatures(id);
  if (corpses instanceof Sections.SectionNotFoundError) error(404, "section not found");
  if (corpses instanceof Error) error(500, corpses.message);
  return corpses;
});
