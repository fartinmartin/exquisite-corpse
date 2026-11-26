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
