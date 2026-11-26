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

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  artist: string;
  date: string;
  likes: number;
  thumb: string;
  featuredIn: string[];
}

export interface SectionWithDrawing extends Section {
  drawing: DrawingData;
}

export interface Corpse {
  id: string;
  title: string;
  date: string;
  likes: number;
  thumb: string;
  sections: Record<SectionType, string>;
}

export interface CorpseWithSections extends Corpse {
  panels: Partial<Record<SectionType, SectionWithDrawing>>;
}

export interface GalleryPage<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}
