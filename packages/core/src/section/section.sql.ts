import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const guestDrawings = sqliteTable("guest_drawings", {
  id: text("id").primaryKey(),
  guestToken: text("guest_token").notNull(),
  recordUri: text("record_uri").notNull(),
  section: text("section", { enum: ["top", "mid", "bot"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
