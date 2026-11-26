import type { Collection } from "@ecc/firestore";

/** Set at build time from Netlify's `NETLIFY=true` build env (see vite.config.ts). */
declare const __NETLIFY_IMAGE_CDN__: boolean;

const WIDTHS = [360, 720, 1080];

/** Gallery cells are ~172px wide on desktop and full-width on phones. */
const SIZES = "(max-width: 571px) 100vw, 172px";

/** Intrinsic aspect ratios, so the browser reserves space before the image loads. */
const DIMENSIONS: Record<Collection, { width: number; height: number }> = {
  corpses: { width: 540, height: 540 },
  sections: { width: 540, height: 180 },
};

/**
 * Bump when the rendered output changes (renderer, size, encoding), so every
 * thumb gets a new URL and blob key instead of the old render being served.
 */
const RENDER_VERSION = "r1";

export interface ThumbRef {
  id: string;
  thumbVersion: number;
}

/** Versioned, cache-forever URL for a thumbnail rendered from the item's drawing(s). */
export function thumbUrl(collection: Collection, item: ThumbRef): string {
  return `/thumbs/${collection}/${item.id}?v=${RENDER_VERSION}-${item.thumbVersion}`;
}

function resized(source: string, width: number): string {
  return `/.netlify/images?url=${encodeURIComponent(source)}&w=${width}`;
}

/**
 * `<img>` attributes for a thumbnail. On Netlify, the Image CDN resizes the
 * 1080px render for each display size; elsewhere the render is served as-is.
 */
export function thumbAttrs(collection: Collection, item: ThumbRef) {
  const source = thumbUrl(collection, item);
  const base = { ...DIMENSIONS[collection], decoding: "async" as const };
  if (!__NETLIFY_IMAGE_CDN__) return { ...base, src: source };

  return {
    ...base,
    src: resized(source, WIDTHS[0]),
    srcset: WIDTHS.map((width) => `${resized(source, width)} ${width}w`).join(", "),
    sizes: SIZES,
  };
}

/**
 * Absolute image URL for link previews (og:image). Preview scrapers don't all
 * read WebP, so on Netlify the Image CDN re-encodes to JPEG.
 */
export function thumbOgImage(collection: Collection, item: ThumbRef, origin: string): string {
  const source = thumbUrl(collection, item);
  if (!__NETLIFY_IMAGE_CDN__) return `${origin}${source}`;
  return `${origin}/.netlify/images?url=${encodeURIComponent(source)}&w=1080&fm=jpg`;
}
