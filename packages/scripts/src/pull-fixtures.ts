/**
 * Copies a handful of real corpses (and their three sections) out of
 * Firestore into packages/firestore/fixtures/real.json, so `ECC_FIXTURES=1`
 * dev runs can be tested against real drawings. Read-only.
 *
 *   pnpm --filter @ecc/scripts pull:fixtures [count]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Corpses } from "@ecc/firestore";

const count = Number(process.argv[2] ?? 12);
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../../firestore/fixtures/real.json");

const listed = await Corpses.list({ sort: "likes", page: 0, pageSize: count });

const corpses = [];
const sections = new Map<string, unknown>();

for (const summary of listed.items) {
  const corpse = await Corpses.get(summary.id);
  if (corpse instanceof Error) {
    console.warn(`skip ${summary.id}: ${corpse.message}`);
    continue;
  }
  const { panels, ...rest } = corpse;
  if (!panels.top || !panels.mid || !panels.bot) continue;
  corpses.push(rest);
  for (const panel of [panels.top, panels.mid, panels.bot]) sections.set(panel.id, panel);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ corpses, sections: [...sections.values()] }));
console.log(`wrote ${corpses.length} corpses, ${sections.size} sections → ${out}`);
process.exit(0);
