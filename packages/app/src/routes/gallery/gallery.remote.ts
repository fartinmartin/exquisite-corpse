import { query } from "$app/server";
import * as v from "valibot";
import { Corpses, Sections } from "@ecc/firestore";

const GalleryInput = v.object({
  filter: v.picklist(["corpses", "top", "mid", "bot"]),
  sort: v.picklist(["date", "likes"]),
  page: v.number(),
  pageSize: v.optional(v.number()),
});

export const listGallery = query(GalleryInput, async (input) => {
  const pageSize = input.pageSize ?? (input.filter === "corpses" ? 9 : 21);

  if (input.filter === "corpses") {
    const result = await Corpses.list({ sort: input.sort, page: input.page, pageSize });
    return { kind: "corpses" as const, ...result };
  }

  const result = await Sections.list({
    type: input.filter,
    sort: input.sort,
    page: input.page,
    pageSize,
  });
  return { kind: "sections" as const, ...result };
});
