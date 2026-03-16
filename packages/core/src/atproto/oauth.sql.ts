import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const oauthSessions = sqliteTable("oauth_sessions", {
  key: text("key").primaryKey(),
  session: text("session").notNull(),
});

export const oauthStates = sqliteTable("oauth_states", {
  key: text("key").primaryKey(),
  state: text("state").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
