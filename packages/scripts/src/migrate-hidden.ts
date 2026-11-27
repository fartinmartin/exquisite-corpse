/**
 * Adds `hidden: false` to every section and corpse that has no `hidden` field.
 * Public queries filter on `hidden == false`, and Firestore never matches a
 * document that lacks the field, so this must run before (and again right
 * after) deploying the code that filters.
 *
 * Idempotent and additive: documents that already have `hidden` are untouched.
 *
 *   pnpm migrate:hidden              # dry run: counts only
 *   pnpm migrate:hidden -- --write   # apply
 *
 * Target a named database with FIRESTORE_DATABASE_ID (e.g. ecc-staging).
 * Credentials: run through varlock (see package.json), like the app.
 */
import { Client } from "@ecc/firestore";

const write = process.argv.includes("--write");
const db = Client.db();
const target = process.env.FIRESTORE_DATABASE_ID ?? "(default)";

console.log(`${write ? "WRITE" : "dry run"} against database ${target}`);

let total = 0;
for (const collection of ["sections", "corpses"] as const) {
  const snap = await db.collection(collection).select("hidden").get();
  const missing = snap.docs.filter((doc) => doc.get("hidden") === undefined);
  const hidden = snap.docs.filter((doc) => doc.get("hidden") === true).length;
  console.log(`${collection}: ${snap.size} docs, ${missing.length} missing \`hidden\`, ${hidden} hidden`);
  total += missing.length;

  if (!write || missing.length === 0) continue;
  const writer = db.bulkWriter();
  // `update` fails if the doc was deleted in the meantime, instead of re-creating it.
  for (const doc of missing) void writer.update(doc.ref, { hidden: false });
  await writer.close();
  console.log(`  updated ${missing.length}`);
}

console.log(write ? `done: ${total} updated` : `dry run: ${total} would be updated (pass --write)`);
