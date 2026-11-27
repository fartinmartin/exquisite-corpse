/**
 * Read-only consistency report (see `Integrity.check`). Repairs are done from
 * /admin, where they're logged.
 *
 *   pnpm integrity
 */
import { Integrity } from "@ecc/firestore";

const report = await Integrity.check();
if (report instanceof Error) throw report;

console.log(`${report.sections} sections, ${report.corpses} corpses`);
console.log(`featuredIn mismatches (auto-repairable): ${report.featuredIn.length}`);
for (const item of report.featuredIn.slice(0, 20)) {
  console.log(`  ${item.sectionId}: extra [${item.extra.join(", ")}] missing [${item.missing.join(", ")}]`);
}
console.log(`broken corpse panels (need a decision): ${report.brokenPanels.length}`);
for (const item of report.brokenPanels.slice(0, 20)) {
  console.log(`  corpse ${item.corpseId} ${item.type} → ${item.sectionId} (${item.problem})`);
}
console.log(`sections in no corpse (info): ${report.unused.length}`);
