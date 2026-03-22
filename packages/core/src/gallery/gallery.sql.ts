import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const likes = sqliteTable(
  "likes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectUri: text("subject_uri").notNull(),
    likerDid: text("liker_did"),
    guestToken: text("guest_token"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [
    unique("unique_like_did").on(t.subjectUri, t.likerDid),
    unique("unique_like_guest").on(t.subjectUri, t.guestToken),
  ]
);

export const profiles = sqliteTable("profiles", {
  did: text("did").primaryKey(),
  handle: text("handle").notNull(),
  displayName: text("display_name"),
  avatarCid: text("avatar_cid"),
  indexedAt: text("indexed_at").notNull().default(sql`(datetime('now'))`),
});
