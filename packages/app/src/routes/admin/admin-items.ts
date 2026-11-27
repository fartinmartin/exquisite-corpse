import type { Collection, Corpse, Section, SectionType } from "@ecc/firestore";
import { thumbUrl } from "#lib/thumbs.ts";

export type Item = Section | Corpse;
export type Visibility = "all" | "visible" | "hidden";
export type Sort = "newest" | "likes";

export interface Filters {
  collection: Collection;
  visibility: Visibility;
  type: SectionType | "all";
  sort: Sort;
  search: string;
}

export function isSection(item: Item): item is Section {
  return "type" in item;
}

/** A search box value as a lowercase term. A pasted public URL becomes its id. */
export function searchTerm(raw: string): string {
  const fromUrl = raw.trim().match(/\/gallery\/(?:section|corpse)\/([A-Za-z0-9_-]+)/);
  return (fromUrl ? fromUrl[1] : raw.trim()).toLowerCase();
}

/** Items are already newest-first from the server; `likes` re-sorts. */
export function filterItems(items: Item[], filters: Filters): Item[] {
  const term = searchTerm(filters.search);

  const matches = items.filter((item) => {
    if (filters.visibility === "visible" && item.hidden) return false;
    if (filters.visibility === "hidden" && !item.hidden) return false;
    if (filters.type !== "all" && isSection(item) && item.type !== filters.type) return false;
    if (!term) return true;
    const text = [item.id, item.title, isSection(item) ? item.artist : ""].join(" ").toLowerCase();
    return text.includes(term);
  });

  return filters.sort === "likes" ? [...matches].sort((a, b) => b.likes - a.likes) : matches;
}

/** Public page for an item. */
export function publicHref(collection: Collection, id: string): string {
  return `/gallery/${collection === "sections" ? "section" : "corpse"}/${id}`;
}

/**
 * Thumb URL for admin views. Fetched directly rather than through the Image
 * CDN, because the CDN fetches without the admin cookie and hidden items would
 * 404 there.
 */
export function adminThumb(collection: Collection, item: { id: string; thumbVersion: number }): string {
  return thumbUrl(collection, item);
}
