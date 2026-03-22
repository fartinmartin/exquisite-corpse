import { alias } from "drizzle-orm/sqlite-core";
import { desc, eq, sql } from "drizzle-orm";
import type { SectionType } from "@ecc/lexicons";
import { db } from "../db/index.js";
import { sections } from "../section/section.sql.js";
import { corpses } from "../corpse/corpse.sql.js";
import { likes } from "./gallery.sql.js";

export namespace Gallery {
  export interface SectionRow {
    id: string;
    section: SectionType;
    recordUri: string;
    blobCid: string | null;
    createdAt: string;
    likeCount: number;
  }

  export interface CorpseRow {
    id: string;
    recordUri: string;
    title: string;
    topBlobCid: string | null;
    midBlobCid: string | null;
    botBlobCid: string | null;
    createdAt: string;
    likeCount: number;
  }

  export async function listSections(opts?: {
    section?: SectionType;
    limit?: number;
    offset?: number;
  }): Promise<SectionRow[]> {
    const rows = await db
      .select({
        id: sections.id,
        section: sections.section,
        recordUri: sections.recordUri,
        blobCid: sections.blobCid,
        createdAt: sections.createdAt,
        likeCount: sql<number>`count(${likes.id})`.as("like_count"),
      })
      .from(sections)
      .leftJoin(likes, eq(likes.subjectUri, sections.recordUri))
      .where(
        opts?.section
          ? eq(sections.section, opts.section)
          : eq(sections.moderationStatus, "approved")
      )
      .groupBy(sections.id)
      .orderBy(desc(sections.createdAt))
      .limit(opts?.limit ?? 50)
      .offset(opts?.offset ?? 0);

    return rows as SectionRow[];
  }

  export async function listCorpses(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<CorpseRow[]> {
    const top = alias(sections, "top");
    const mid = alias(sections, "mid");
    const bot = alias(sections, "bot");

    const rows = await db
      .select({
        id: corpses.id,
        recordUri: corpses.recordUri,
        title: corpses.title,
        topBlobCid: top.blobCid,
        midBlobCid: mid.blobCid,
        botBlobCid: bot.blobCid,
        createdAt: corpses.createdAt,
        likeCount: sql<number>`count(${likes.id})`.as("like_count"),
      })
      .from(corpses)
      .leftJoin(top, eq(top.recordUri, corpses.topUri))
      .leftJoin(mid, eq(mid.recordUri, corpses.midUri))
      .leftJoin(bot, eq(bot.recordUri, corpses.botUri))
      .leftJoin(likes, eq(likes.subjectUri, corpses.recordUri))
      .where(eq(corpses.moderationStatus, "approved"))
      .groupBy(corpses.id)
      .orderBy(desc(corpses.createdAt))
      .limit(opts?.limit ?? 50)
      .offset(opts?.offset ?? 0);

    return rows as CorpseRow[];
  }
}
