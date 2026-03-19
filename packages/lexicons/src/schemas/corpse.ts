import * as v from "valibot";

/**
 * club.exquisitecorpse.drawing record.
 * Written when all three sections are assembled into a complete corpse.
 */
export const CorpseRecordSchema = v.object({
  $type: v.literal("club.exquisitecorpse.drawing"),
  corpseId: v.string(),
  topUri: v.string(),
  midUri: v.string(),
  botUri: v.string(),
  /** CID of the composited PNG blob on the club PDS. */
  renderedBlob: v.string(),
  title: v.string(),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

export type CorpseRecord = v.InferOutput<typeof CorpseRecordSchema>;
