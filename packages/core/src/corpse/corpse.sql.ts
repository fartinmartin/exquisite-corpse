import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const corpses = sqliteTable("corpses", {
  id: text("id").primaryKey(),
  recordUri: text("record_uri").notNull(),
  topUri: text("top_uri").notNull(),
  midUri: text("mid_uri").notNull(),
  botUri: text("bot_uri").notNull(),
  title: text("title").notNull(),
  moderationStatus: text("moderation_status", {
    enum: ["pending", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
