import { defineConfig } from "drizzle-kit";

export default defineConfig({
  strict: true,
  verbose: true,
  schema: "./src/**/*.sql.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:local.db",
  },
});
