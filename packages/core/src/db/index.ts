import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as atprotoSchema from "../atproto/oauth.sql.js";
import * as sectionSchema from "../section/section.sql.js";
import * as gallerySchema from "../gallery/gallery.sql.js";

export * from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbUrl = `file:${join(__dirname, "../../local.db")}`;

const client = createClient({
  url: process.env.DATABASE_URL ?? defaultDbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: { ...atprotoSchema, ...sectionSchema, ...gallerySchema },
  logger: process.env.DRIZZLE_LOG === "true"
    ? { logQuery(query, params) { console.log("[drizzle]", query, params); } }
    : undefined,
});
export type DB = typeof db;
