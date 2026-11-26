import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { joyful } from "joyful";
import { Sections } from "@ecc/firestore";
import { DrawingDataSchema, SectionTypeSchema, type DrawingData } from "@ecc/lexicons";
import type { SectionType } from "@ecc/firestore";
import { GUEST_HANDLE_COOKIE } from "$lib/draw/state.svelte";

const SIBLING_TYPES: Record<SectionType, SectionType[]> = {
  top: ["mid", "bot"],
  mid: ["top", "bot"],
  bot: ["top", "mid"],
};

export interface Sibling {
  id: string;
  type: SectionType;
  title: string;
  artist: string;
  thumb: string;
  drawing: DrawingData;
}

/** Two random sections to draw against, for the section the artist picked. */
export const getSiblings = query(SectionTypeSchema, async (type) => {
  const siblings: Partial<Record<SectionType, Sibling>> = {};

  for (const siblingType of SIBLING_TYPES[type]) {
    const section = await Sections.randomByType(siblingType);
    if (!section) continue;
    siblings[siblingType] = {
      id: section.id,
      type: section.type,
      title: section.title,
      artist: section.artist,
      thumb: section.thumb,
      drawing: section.drawing,
    };
  }

  return siblings;
});

/** Two random lowercase words, used as the default section title. */
export const randomTitle = query(async () => {
  return joyful({ segments: 2, separator: " " }).toLowerCase();
});

const SaveInput = v.object({
  type: SectionTypeSchema,
  title: v.pipe(v.string(), v.maxLength(40)),
  artist: v.pipe(v.string(), v.maxLength(30)),
  drawing: DrawingDataSchema,
  // PNG data URL rendered client-side; Firestore caps documents at 1 MiB.
  thumb: v.pipe(v.string(), v.maxLength(1_000_000)),
  siblings: v.object({
    top: v.optional(v.string()),
    mid: v.optional(v.string()),
    bot: v.optional(v.string()),
  }),
});

export const saveDrawing = command(SaveInput, async (input) => {
  const event = getRequestEvent();
  const artist =
    input.artist.trim() ||
    event.cookies.get(GUEST_HANDLE_COOKIE) ||
    "anonymous";

  const result = await Sections.save({
    type: input.type,
    title: input.title,
    artist,
    drawing: input.drawing,
    thumb: input.thumb,
    siblings: input.siblings,
    liker: event.cookies.get("ecc_guest_token"),
  });

  if (result instanceof Error) error(500, result.message);
  return result;
});
