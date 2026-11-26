import { error } from "@sveltejs/kit";
import { Corpses } from "@ecc/firestore";
import type { PageServerLoad } from "./$types";

/** Metadata for the document head; the body loads through the remote query. */
export const load: PageServerLoad = async ({ params }) => {
  const corpse = await Corpses.get(params.id);
  if (corpse instanceof Error) error(404, "corpse not found");

  const artists = Object.values(corpse.panels)
    .map((panel) => panel?.artist)
    .filter(Boolean)
    .join(", ")
    .replace(/,(?!.*,)/gim, ", and");

  return {
    title: `exquisite corpse club ▪ ${corpse.title}`,
    description: `an exquisite corpse drawn by ${artists}!`,
  };
};
