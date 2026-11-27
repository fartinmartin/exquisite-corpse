/**
 * Copies every section and corpse from the production database into a named
 * database, for testing migrations and indexes against real data.
 *
 *   FIRESTORE_DATABASE_ID=ecc-staging pnpm copy:database
 *
 * Reads production, writes only to FIRESTORE_DATABASE_ID (refuses `(default)`).
 * Document references are rewritten to point inside the target database.
 */
import { getApps } from "firebase-admin/app";
import { DocumentReference, getFirestore, type Firestore } from "firebase-admin/firestore";
import { Client } from "@ecc/firestore";

const targetId = process.env.FIRESTORE_DATABASE_ID;
if (!targetId || targetId === "(default)") {
  throw new Error("Set FIRESTORE_DATABASE_ID to the database to copy INTO (never the production default).");
}

const target = Client.db(); // honours FIRESTORE_DATABASE_ID
const source = getFirestore(getApps()[0]!); // production "(default)"

/** Rewrites references (also inside arrays/maps) to point into the target database. */
function remap(value: unknown, into: Firestore): unknown {
  if (value instanceof DocumentReference) return into.doc(value.path);
  if (Array.isArray(value)) return value.map((item) => remap(item, into));
  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item, into)]));
  }
  return value;
}

for (const collection of ["sections", "corpses"]) {
  const snap = await source.collection(collection).get();
  const writer = target.bulkWriter();
  for (const doc of snap.docs) void writer.set(target.collection(collection).doc(doc.id), remap(doc.data(), target) as object);
  await writer.close();
  console.log(`${collection}: copied ${snap.size}`);
}
