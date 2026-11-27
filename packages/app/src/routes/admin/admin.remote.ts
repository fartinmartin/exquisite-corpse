import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { Admin, Audit, Corpses, Integrity, Likes } from "@ecc/firestore";
import { requireAdmin } from "#lib/server/admin.ts";
import { getSiteState, setSiteState } from "#lib/server/site-mode.ts";
import { forgetThumbs } from "#lib/server/thumbs.ts";

/**
 * Every admin query and command. Each one checks the admin cookie first, and
 * every mutation is written to the audit log (`Audit`).
 */

function context() {
  const event = getRequestEvent();
  requireAdmin(event.cookies);
  return event;
}

function fail(cause: unknown): never {
  error(500, cause instanceof Error ? cause.message : "request failed");
}

/** Best-effort: a logging failure never fails the action it describes. */
async function log(entry: Audit.NewEntry): Promise<string | null> {
  const id = await Audit.record(entry);
  if (id instanceof Error) {
    console.error("audit log write failed:", id.cause);
    return null;
  }
  // Refresh the activity list in the same response (single-flight).
  await recentActions().refresh();
  return id;
}

/* ---------------------------------------------------------------- browse */

/** Every section and corpse (hidden included) for browse/search; filtered client-side. */
export const summaries = query(async () => {
  context();
  const result = await Admin.summaries();
  if (result instanceof Error) fail(result);
  return result;
});

const HideInput = v.object({
  collection: v.picklist(["sections", "corpses"]),
  ids: v.pipe(v.array(v.string()), v.minLength(1), v.maxLength(100)),
  hidden: v.boolean(),
});

async function applyHidden({ collection, ids, hidden }: v.InferOutput<typeof HideInput>) {
  const cascaded: string[] = [];
  for (const id of ids) {
    const result = await Admin.setHidden(collection, id, hidden);
    if (result instanceof Error) fail(result);
    cascaded.push(...result.cascaded);
  }

  if (hidden) {
    await forgetThumbs([
      ...ids.map((id) => ({ collection, id })),
      ...cascaded.map((id) => ({ collection: "corpses" as const, id })),
    ]);
  }

  await summaries().refresh();
  return cascaded;
}

/**
 * Hides or unhides one or more items (hiding a section also hides its corpses).
 * Hiding clears their thumbs from Blobs and the CDN; pages drop them within
 * about a minute as their cache refreshes.
 */
export const setHidden = command(HideInput, async (input) => {
  context();
  const cascaded = await applyHidden(input);
  await log({ action: input.hidden ? "hide" : "unhide", collection: input.collection, ids: input.ids, cascaded });
  return { cascaded };
});

/* --------------------------------------------------------------- delete */

/** What deleting a section would also remove (its corpses), for the confirm step. */
export const sectionDeletePreview = query(v.string(), async (id) => {
  context();
  const preview = await Admin.previewSectionDelete(id);
  if (preview instanceof Error) fail(preview);
  return preview;
});

export const corpseDeletePreview = query(v.string(), async (id) => {
  context();
  const corpse = await Admin.previewCorpseDelete(id);
  if (corpse instanceof Error) fail(corpse);
  return corpse;
});

export const deleteSection = command(v.string(), async (id) => {
  context();
  const result = await Admin.removeSection(id);
  if (result instanceof Error) fail(result);
  await forgetThumbs([
    { collection: "sections", id },
    ...result.corpseIds.map((corpseId) => ({ collection: "corpses" as const, id: corpseId })),
  ]);
  await summaries().refresh();
  await log({ action: "delete", collection: "sections", ids: [id], cascaded: result.corpseIds });
  return { corpseIds: result.corpseIds };
});

export const deleteCorpse = command(v.string(), async (id) => {
  context();
  const result = await Admin.removeCorpse(id);
  if (result instanceof Error) fail(result);
  await forgetThumbs([{ collection: "corpses", id }]);
  await summaries().refresh();
  await log({ action: "delete", collection: "corpses", ids: [id] });
  return { ok: true };
});

/* ---------------------------------------------------------- item tools */

export const makeCorpse = command(v.string(), async (sectionId) => {
  context();
  const result = await Corpses.createFromSection(sectionId);
  if (result instanceof Error) fail(result);
  await summaries().refresh();
  await log({ action: "make-corpse", collection: "corpses", ids: [result.corpseId], detail: `from section ${sectionId}` });
  return result;
});

export const updateThumb = command(v.string(), async (id) => {
  context();
  const result = await Corpses.rebuildThumb(id);
  if (result instanceof Error) fail(result);
  await summaries().refresh();
  await log({ action: "rerender-thumb", collection: "corpses", ids: [id] });
  return { ok: true };
});

export const downloadPaths = command(v.string(), async (id) => {
  context();
  const drawing = await Admin.sectionDrawing(id);
  if (drawing instanceof Error) fail(drawing);
  return { drawing };
});

/* ------------------------------------------------------------ site-wide */

export const siteMode = query(async () => {
  const event = context();
  return getSiteState(event.platform);
});

/** Manual changes are never undone by the budget hook (it only reopens its own closures). */
export const setSiteMode = command(v.picklist(["open", "read-only", "closed"]), async (mode) => {
  const event = context();
  const state = { mode, reason: "manual" as const, at: new Date().toISOString() };
  await setSiteState(event.platform, state);
  await siteMode().set(state);
  await log({ action: "site-mode", ids: [], detail: mode });
  return state;
});

export const resetLikes = command(async () => {
  context();
  const result = await Likes.resetAll();
  if (result instanceof Error) fail(result);
  await summaries().refresh();
  await log({ action: "reset-likes", ids: [], detail: `${result.updated} docs` });
  return result;
});

/* ----------------------------------------------------- activity + health */

export const recentActions = query(async () => {
  context();
  const entries = await Audit.recent(50);
  if (entries instanceof Error) fail(entries);
  return entries.map((entry) => ({ ...entry, undoable: Audit.undoable(entry) }));
});

/** Reverses a hide or unhide, and links the two log entries. */
export const undoAction = command(v.string(), async (id) => {
  context();
  const entry = await Audit.get(id);
  if (entry instanceof Error) fail(entry);
  if (!entry || !Audit.undoable(entry) || !entry.collection) {
    error(409, "that action can't be undone");
  }

  const hidden = entry.action === "unhide";
  const cascaded = await applyHidden({ collection: entry.collection, ids: entry.ids, hidden });
  const undoId = await log({
    action: hidden ? "hide" : "unhide",
    collection: entry.collection,
    ids: entry.ids,
    cascaded,
    undoes: entry.id,
  });
  if (undoId) await Audit.markUndone(entry.id, undoId);
  await recentActions().refresh();
  return { ok: true };
});

export const integrityReport = query(async () => {
  context();
  const report = await Integrity.check();
  if (report instanceof Error) fail(report);
  return report;
});

/** Fixes `featuredIn` references (the only safe automatic repair). */
export const repairReferences = command(async () => {
  context();
  const result = await Integrity.repair();
  if (result instanceof Error) fail(result);
  await integrityReport().refresh();
  await summaries().refresh();
  if (result.repaired > 0) await log({ action: "repair-refs", ids: [], detail: `${result.repaired} sections` });
  return result;
});
