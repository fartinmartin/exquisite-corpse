/**
 * Converts legacy (2020 Vue app) Firestore drawings to canvas-paint DrawingData.
 *
 * The app already converts legacy records on read (`Drawing.toDrawingData`), so
 * this is optional: run it when you want canonical data in Firestore.
 *
 * Dry run (default): reports what would change.
 *   pnpm convert:drawings
 * Write:
 *   pnpm convert:drawings -- --write [--backup] [--force] [--limit=100]
 *
 * Converted data is ~2.5x larger than the legacy command arrays. Records that
 * would exceed Firestore's 1MiB document limit are skipped unless `--force`.
 *
 * Requires Firestore credentials (FIREBASE_* env vars, ADC via
 * GOOGLE_APPLICATION_CREDENTIALS, or FIRESTORE_EMULATOR_HOST).
 */
import { Client, Drawing, type LegacyDrawing } from "@ecc/firestore";

const args = new Set(process.argv.slice(2));
const write = args.has("--write");
const backup = args.has("--backup");
const force = args.has("--force");
const limitArg = [...args].find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY;

interface Update {
  ref: FirebaseFirestore.DocumentReference;
  drawing: unknown;
  legacy: LegacyDrawing;
}

const DOCUMENT_BUDGET = 900_000;

const db = Client.db();
const snap = await db.collection("sections").get();

let legacyCount = 0;
let alreadyConverted = 0;
let empty = 0;
let mobileSpace = 0;
let outsideDocument = 0;
let totalPaths = 0;
let totalPoints = 0;
let largest = { id: "", bytes: 0 };
let skipped = 0;
const samples: string[] = [];
const warnings: string[] = [];
const updates: Update[] = [];

for (const doc of snap.docs) {
  if (legacyCount >= limit) break;

  const raw = doc.get("drawing");

  if (!raw || typeof raw !== "object") {
    empty += 1;
    continue;
  }

  if (Drawing.isDrawingData(raw)) {
    alreadyConverted += 1;
    continue;
  }

  const legacy = raw as LegacyDrawing;
  const bounds = Drawing.legacyBounds(legacy);
  const drawing = Drawing.toDrawingData(legacy);

  legacyCount += 1;
  totalPaths += drawing.paths.length;
  totalPoints += drawing.paths.reduce((sum, path) => sum + path.points.length, 0);

  if (drawing.width > 544) mobileSpace += 1;
  if (bounds.maxX > drawing.width || bounds.maxY > drawing.height) outsideDocument += 1;

  const bytes = JSON.stringify(drawing).length;
  if (bytes > largest.bytes) largest = { id: doc.id, bytes };
  if (bytes > DOCUMENT_BUDGET && !force) {
    skipped += 1;
    warnings.push(
      `${doc.id}: ${Math.round(bytes / 1000)}KB converted — skipped (pass --force to write anyway; Firestore's limit is 1MB)`
    );
    continue;
  }

  if (samples.length < 5) {
    samples.push(
      `${doc.id} (${doc.get("type")}): ${drawing.paths.length} paths, ${bounds.maxX}x${bounds.maxY} → ${drawing.width}x${drawing.height}`
    );
  }

  if (write) updates.push({ ref: doc.ref, drawing, legacy });
}

const summary = {
  mode: write ? "write" : "dry-run",
  sections: snap.size,
  legacyDrawings: legacyCount,
  alreadyConverted,
  emptyOrUnknown: empty,
  wouldWrite: updates.length,
  skippedOversize: skipped,
  mobileSpaceConverted: mobileSpace,
  outsideDocument,
  totalPaths,
  totalPoints,
  largest: { id: largest.id, kb: Math.round(largest.bytes / 100) / 10 },
  samples,
  warnings,
};

if (!write) {
  console.log(JSON.stringify({ ...summary, note: "dry run — pass --write to convert" }, null, 2));
  process.exit(0);
}

let written = 0;
for (let index = 0; index < updates.length; index += 400) {
  const chunk = updates.slice(index, index + 400);
  const batch = db.batch();
  for (const update of chunk) {
    batch.update(
      update.ref,
      backup
        ? { drawing: update.drawing, drawingLegacy: update.legacy }
        : { drawing: update.drawing }
    );
  }
  await batch.commit();
  written += chunk.length;
}

console.log(JSON.stringify({ ...summary, written }, null, 2));
