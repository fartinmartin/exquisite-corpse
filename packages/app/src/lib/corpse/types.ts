import type { SectionType } from "@ecc/firestore";
import type { DrawingData } from "@ecc/lexicons";

export const TYPES: SectionType[] = ["top", "mid", "bot"];

export const LABELS: Record<SectionType, string> = {
  top: "top",
  mid: "middle",
  bot: "bottom",
};

/** What each third usually holds — used as gentle prompts, never rules. */
export const PROMPTS: Record<SectionType, string> = {
  top: "heads, hats, horizons",
  mid: "bodies, bellies, arms",
  bot: "legs, feet, the ground",
};

/** Enough to credit one section of a corpse. */
export interface CreditLike {
  id: string;
  title: string;
  artist: string;
}

/** The minimum a view needs to draw one section of a corpse. */
export interface PanelLike extends CreditLike {
  drawing: DrawingData;
}

export type Panels = Partial<Record<SectionType, PanelLike>>;

export type Credited = Partial<Record<SectionType, CreditLike>>;

/** Instagram handles start with @ and link out; everything else is plain text. */
export function artistHref(artist: string): string | undefined {
  return artist.startsWith("@") ? `https://www.instagram.com/${artist.slice(1)}/` : undefined;
}
