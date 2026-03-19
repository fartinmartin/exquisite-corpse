import * as v from "valibot";
import { DrawingDataSchema } from "./drawing.js";

export const SectionTypeSchema = v.picklist(["top", "mid", "bot"]);

/**
 * club.exquisitecorpse.section record.
 * Stroke commands are the canonical data; the rendered PNG blob is server-managed.
 */
export const SectionRecordSchema = v.object({
  $type: v.literal("club.exquisitecorpse.section"),
  section: SectionTypeSchema,
  drawing: DrawingDataSchema,
  title: v.optional(v.string()),
  /** Local DB id of the assembled corpse this section belongs to. Null until matched. */
  corpseId: v.optional(v.string()),
  /** Opaque ID linking this record to a guest session. Omitted for authenticated users. */
  guestId: v.optional(v.string()),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

export type SectionType = v.InferOutput<typeof SectionTypeSchema>;
export type SectionRecord = v.InferOutput<typeof SectionRecordSchema>;
