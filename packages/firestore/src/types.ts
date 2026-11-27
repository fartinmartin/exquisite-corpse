import type { DrawingData } from "@ecc/lexicons";

export type SectionType = "top" | "mid" | "bot";

export const SECTION_TYPES: SectionType[] = ["top", "mid", "bot"];

/** Point command shape used by the 2020 Vue app. Still present in Firestore. */
export interface LegacyPoint {
  mode: "draw" | "erase" | "fill" | "clear";
  color?: string;
  size?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

/** Legacy drawings were a map of path index → command list. */
export type LegacyDrawing = Record<string, LegacyPoint[]>;

/** `sections.drawing` field: canvas-paint data for new drawings, legacy map for old ones. */
export type StoredDrawing = DrawingData | LegacyDrawing;

export type Collection = "sections" | "corpses";

/**
 * Summaries carry no image data. The thumbnail is served separately (by id)
 * and `thumbVersion` changes whenever the stored thumb is replaced, so a
 * versioned thumb URL can be cached forever.
 */
export interface Section {
  id: string;
  type: SectionType;
  title: string;
  artist: string;
  date: string;
  likes: number;
  thumbVersion: number;
  featuredIn: string[];
  /** Hidden by a moderator: excluded from every public query and page. */
  hidden: boolean;
}

export interface SectionWithDrawing extends Section {
  drawing: DrawingData;
}

export interface Corpse {
  id: string;
  title: string;
  date: string;
  likes: number;
  thumbVersion: number;
  sections: Record<SectionType, string>;
  hidden: boolean;
  /**
   * Why a hidden corpse is hidden: `manual`, or `section:<id>` when hiding one
   * of its sections hid it (so unhiding that section can unhide it again).
   */
  hiddenBy?: string;
}

export interface CorpseWithSections extends Corpse {
  panels: Partial<Record<SectionType, SectionWithDrawing>>;
}

export interface SectionDetail {
  section: SectionWithDrawing;
  featuredIn: Corpse[];
  moreBy: Section[];
}

export interface LikeState {
  likes: number;
  liked: boolean;
}

/** A stored thumbnail, decoded from its data URL. */
export interface Thumb {
  contentType: string;
  bytes: Uint8Array<ArrayBuffer>;
}

export interface GalleryPage<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}
