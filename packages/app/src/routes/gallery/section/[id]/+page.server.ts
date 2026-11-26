import { error } from "@sveltejs/kit";
import { Sections } from "@ecc/firestore";
import type { PageServerLoad } from "./$types";

/** Metadata for the document head; the body loads through the remote query. */
export const load: PageServerLoad = async ({ params }) => {
  const section = await Sections.get(params.id);
  if (section instanceof Error) error(404, "section not found");

  const currentType =
    section.type === "bot" ? "bottom" : section.type === "mid" ? "middle" : section.type;

  return {
    title: `exquisite corpse club ▪ ${section.title} by ${section.artist}`,
    description: `a ${currentType} third of an exquisite corpse!`,
  };
};
