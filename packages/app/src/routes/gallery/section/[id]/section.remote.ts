import { error } from "@sveltejs/kit";
import { getRequestEvent, query } from "$app/server";
import * as v from "valibot";
import { Likes, Sections } from "@ecc/firestore";

export const getSection = query(v.string(), async (id) => {
  const section = await Sections.get(id);
  if (section instanceof Error) error(404, "section not found");

  const [featuredIn, moreBy] = await Promise.all([
    Sections.featuredIn(id, 3),
    Sections.moreByArtist(section.artist, { excludeId: id }),
  ]);

  const liker = getRequestEvent().cookies.get("ecc_guest_token");
  const likeState = await Likes.state({ collection: "sections", id, liker });

  return { section, featuredIn, moreBy, likeState };
});
