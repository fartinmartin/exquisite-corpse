import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  guestToken: text("guest_token"),
  did: text("did"),
  recordUri: text("record_uri").notNull(),
  section: text("section", { enum: ["top", "mid", "bot"] }).notNull(),
  corpseId: text("corpse_id"),
  moderationStatus: text("moderation_status", {
    enum: ["pending", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  blobCid: text("blob_cid"),
  title: text("title"),
  reservedUntil: text("reserved_until"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
