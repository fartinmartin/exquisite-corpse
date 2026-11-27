import { query } from "$app/server";
import { Sections } from "@ecc/firestore";
import { thumbUrl } from "#lib/thumbs.ts";

/**
 * Real sections to scatter around the page as loose doodles — a few of each
 * kind, interleaved so neighbours differ. A small pool (12) so rotation has
 * something to swap in. Thumbs are server-rendered PNGs (/thumbs).
 */
export const doodles = query(async () => {
  const lists = await Promise.all(
    (["top", "mid", "bot"] as const).map((type) => Sections.list({ type, sort: "date", page: 0, pageSize: 4 }))
  );

  const picked: { id: string; thumb: string }[] = [];
  for (let i = 0; i < 4; i++) {
    for (const list of lists) {
      const item = list.items[i];
      if (item) picked.push({ id: item.id, thumb: thumbUrl("sections", item) });
    }
  }
  return picked;
});
