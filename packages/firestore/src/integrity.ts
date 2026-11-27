export * as Integrity from "./integrity.js";

import * as errore from "errore";
import { db } from "./client.js";
import { Fixtures } from "./fixtures.js";
import { Records } from "./records.js";
import type { Corpse, Section, SectionType } from "./types.js";
import { SECTION_TYPES } from "./types.js";

export class FirestoreError extends errore.createTaggedError({
  name: "FirestoreError",
  message: "Firestore request failed",
}) {}

/** A section whose `featuredIn` doesn't match the corpses that actually use it. */
export interface FeaturedInMismatch {
  sectionId: string;
  /** Listed in `featuredIn`, but the corpse is gone or doesn't use this section. */
  extra: string[];
  /** Corpses that use this section but aren't listed. */
  missing: string[];
}

/** A corpse panel that points at a section that's gone or of the wrong type. */
export interface BrokenPanel {
  corpseId: string;
  type: SectionType;
  sectionId: string;
  problem: "missing" | "wrong-type";
}

export interface Report {
  checkedAt: string;
  sections: number;
  corpses: number;
  /** Fixable automatically (`repair`): references only, no content changes. */
  featuredIn: FeaturedInMismatch[];
  /** Needs a decision (hide or delete the corpse); never fixed automatically. */
  brokenPanels: BrokenPanel[];
  /** Sections in no corpse. Not an error (deleting a corpse leaves them), just information. */
  unused: string[];
}

interface Snapshot {
  sections: Section[];
  corpses: Corpse[];
}

async function load(): Promise<Snapshot> {
  if (Fixtures.enabled()) return Fixtures.summaries();

  const [sections, corpses] = await Promise.all([
    db().collection("sections").select(...Records.SECTION_SUMMARY_FIELDS).get(),
    db().collection("corpses").select(...Records.CORPSE_SUMMARY_FIELDS).get(),
  ]);
  return {
    sections: sections.docs.map(Records.toSection).filter(Records.isPresent),
    corpses: corpses.docs.map(Records.toCorpse).filter(Records.isPresent),
  };
}

/** For each section id, the corpses that use it, oldest first (as `featuredIn` is ordered). */
function usage(corpses: Corpse[]): Map<string, string[]> {
  const byDate = [...corpses].sort((a, b) => a.date.localeCompare(b.date));
  const users = new Map<string, string[]>();
  for (const corpse of byDate) {
    for (const sectionId of new Set(Object.values(corpse.sections))) {
      if (!sectionId) continue;
      users.set(sectionId, [...(users.get(sectionId) ?? []), corpse.id]);
    }
  }
  return users;
}

function analyse({ sections, corpses }: Snapshot): Report {
  const sectionsById = new Map(sections.map((section) => [section.id, section]));
  const users = usage(corpses);

  const featuredIn: FeaturedInMismatch[] = [];
  for (const section of sections) {
    const canonical = users.get(section.id) ?? [];
    const listed = new Set(section.featuredIn);
    const extra = section.featuredIn.filter((id) => !canonical.includes(id));
    const missing = canonical.filter((id) => !listed.has(id));
    if (extra.length || missing.length) featuredIn.push({ sectionId: section.id, extra, missing });
  }

  const brokenPanels: BrokenPanel[] = [];
  for (const corpse of corpses) {
    for (const type of SECTION_TYPES) {
      const sectionId = corpse.sections[type];
      const section = sectionsById.get(sectionId);
      if (!section) brokenPanels.push({ corpseId: corpse.id, type, sectionId, problem: "missing" });
      else if (section.type !== type) brokenPanels.push({ corpseId: corpse.id, type, sectionId, problem: "wrong-type" });
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    sections: sections.length,
    corpses: corpses.length,
    featuredIn,
    brokenPanels,
    unused: sections.filter((section) => !users.has(section.id)).map((section) => section.id),
  };
}

/** Read-only consistency check across every section and corpse (summaries only). */
export async function check(): Promise<Report | FirestoreError> {
  try {
    return analyse(await load());
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}

/**
 * Rewrites each mismatched `featuredIn` to exactly the corpses that use the
 * section, oldest first. Only touches references; returns the number of
 * sections changed.
 */
export async function repair(): Promise<{ repaired: number } | FirestoreError> {
  try {
    const snapshot = await load();
    const { featuredIn } = analyse(snapshot);
    if (featuredIn.length === 0) return { repaired: 0 };

    const users = usage(snapshot.corpses);
    if (Fixtures.enabled()) {
      for (const { sectionId } of featuredIn) Fixtures.setFeaturedIn(sectionId, users.get(sectionId) ?? []);
      return { repaired: featuredIn.length };
    }

    const writer = db().bulkWriter();
    for (const { sectionId } of featuredIn) {
      const refs = (users.get(sectionId) ?? []).map((id) => db().collection("corpses").doc(id));
      void writer.update(db().collection("sections").doc(sectionId), { featuredIn: refs });
    }
    await writer.close();
    return { repaired: featuredIn.length };
  } catch (cause) {
    return new FirestoreError({ cause });
  }
}
