import * as v from "valibot";
import type { Did } from "@atcute/lexicons";
import {
  DrawingDataSchema,
  SectionRecordSchema,
  type SectionRecord,
  type SectionType,
  type DrawingData,
} from "@ecc/lexicons";

export namespace Section {
  export interface CreateInput {
    section: SectionType;
    drawing: DrawingData;
    authorDid: Did;
    guestId?: string;
  }

  /** Validates drawing data submitted by the client. Throws on invalid input. */
  export function validateDrawing(data: unknown): DrawingData {
    return v.parse(DrawingDataSchema, data);
  }

  /** Builds a well-formed record payload ready to write to PDS. */
  export function buildRecord(
    input: CreateInput
  ): SectionRecord {
    return {
      $type: "club.exquisitecorpse.section",
      section: input.section,
      drawing: input.drawing,
      ...(input.guestId ? { guestId: input.guestId } : {}),
      createdAt: new Date().toISOString(),
    };
  }

  /** Validates a record retrieved from PDS against the expected schema. */
  export function parseRecord(data: unknown): SectionRecord {
    return v.parse(SectionRecordSchema, data);
  }
}
