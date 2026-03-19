import * as v from "valibot";
import { and, eq, isNull, lt, or, sql, inArray } from "drizzle-orm";
import type { Did } from "@atcute/lexicons";
import {
  DrawingDataSchema,
  SectionRecordSchema,
  type SectionRecord,
  type SectionType,
  type DrawingData,
} from "@ecc/lexicons";
import { useTransaction } from "../db/transaction.js";
import { guestDrawings } from "./section.sql.js";
import { createID } from "../util/id.js";

const RESERVATION_MINUTES = 30;

export namespace Section {
  export interface CreateInput {
    section: SectionType;
    drawing: DrawingData;
    title: string;
    authorDid?: Did;
    guestId?: string;
  }

  export interface MatchResult {
    siblings: Partial<Record<SectionType, { id: string; recordUri: string }>>;
  }

  /** Validates drawing data submitted by the client. */
  export function validateDrawing(
    data: unknown
  ): DrawingData | v.ValiError<typeof DrawingDataSchema> {
    const result = v.safeParse(DrawingDataSchema, data);
    if (!result.success)
      return result.issues as unknown as v.ValiError<typeof DrawingDataSchema>;
    return result.output;
  }

  /** Builds a well-formed record payload ready to write to PDS. */
  export function buildRecord(input: CreateInput): SectionRecord {
    return {
      $type: "club.exquisitecorpse.section",
      section: input.section,
      drawing: input.drawing,
      title: input.title,
      ...(input.guestId ? { guestId: input.guestId } : {}),
      createdAt: new Date().toISOString(),
    };
  }

  /** Validates a record retrieved from PDS against the expected schema. */
  export function parseRecord(data: unknown): SectionRecord {
    return v.parse(SectionRecordSchema, data);
  }

  /**
   * Finds one available section of each sibling type and reserves them for 30
   * minutes. Returns null if a complete match isn't available.
   *
   * "Available" = approved + no corpseId + not currently reserved.
   * Expired reservations are released lazily by this query.
   * Prefers recently submitted sections (recency skew).
   */
  export async function findMatch(
    sectionType: SectionType
  ): Promise<MatchResult | null> {
    const all: SectionType[] = ["top", "mid", "bot"];
    const siblingTypes = all.filter((t) => t !== sectionType);
    const now = new Date().toISOString();
    const reservedUntil = new Date(
      Date.now() + RESERVATION_MINUTES * 60 * 1000
    ).toISOString();

    return useTransaction(async (tx) => {
      const siblings: MatchResult["siblings"] = {};

      for (const type of siblingTypes) {
        const [row] = await tx
          .select({ id: guestDrawings.id, recordUri: guestDrawings.recordUri })
          .from(guestDrawings)
          .where(
            and(
              eq(guestDrawings.section, type),
              eq(guestDrawings.moderationStatus, "approved"),
              isNull(guestDrawings.corpseId),
              or(
                isNull(guestDrawings.reservedUntil),
                lt(guestDrawings.reservedUntil, now)
              )
            )
          )
          .orderBy(sql`${guestDrawings.createdAt} DESC`)
          .limit(1);

        if (!row) return null;
        siblings[type] = row;
      }

      // Reserve matched siblings
      const siblingIds = Object.values(siblings)
        .filter(Boolean)
        .map((s) => s!.id);

      await tx
        .update(guestDrawings)
        .set({ reservedUntil })
        .where(inArray(guestDrawings.id, siblingIds));

      return { siblings };
    });
  }

  /**
   * Inserts a guest section row into the local DB after PDS write.
   */
  export async function insertGuestDrawing(input: {
    recordUri: string;
    guestToken: string;
    section: SectionType;
  }): Promise<string> {
    const id = createID("section");
    await useTransaction((tx) =>
      tx.insert(guestDrawings).values({
        id,
        guestToken: input.guestToken,
        recordUri: input.recordUri,
        section: input.section,
        moderationStatus: "approved",
      })
    );
    return id;
  }

  /**
   * Confirms a reservation: assigns corpseId to all three sections and clears reservedUntil.
   */
  export async function confirmMatch(
    siblingIds: string[],
    corpseId: string
  ): Promise<void> {
    await useTransaction((tx) =>
      tx
        .update(guestDrawings)
        .set({ corpseId, reservedUntil: null })
        .where(inArray(guestDrawings.id, siblingIds))
    );
  }
}
