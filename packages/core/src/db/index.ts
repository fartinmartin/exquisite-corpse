import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export * from "drizzle-orm";

// Anchor local.db to packages/core/ regardless of process cwd
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbUrl = `file:${join(__dirname, "../../local.db")}`;

const client = createClient({
  url: process.env.DATABASE_URL ?? defaultDbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  logger: process.env.DRIZZLE_LOG === "true"
    ? { logQuery(query, params) { console.log("[drizzle]", query, params); } }
    : undefined,
});
export type DB = typeof db;
