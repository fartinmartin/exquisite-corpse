import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbUrl = `file:${join(__dirname, "../../local.db")}`;

const client = createClient({
  url: process.env.DATABASE_URL ?? defaultDbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
