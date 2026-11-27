import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { Admin, Corpses, Likes, Sections } from "@ecc/firestore";
import { requireAdmin } from "#lib/server/admin.ts";
import { getSiteState, setSiteState } from "#lib/server/site-mode.ts";
import { forgetThumbs } from "#lib/server/thumbs.ts";

function context() {
  const event = getRequestEvent();
  requireAdmin(event.cookies);
  return event;
}

function fail(cause: unknown): never {
  error(500, cause instanceof Error ? cause.message : "request failed");
}

export const counts = query(async () => {
  context();
  return {
    sections: await Sections.count(),
    corpses: await Corpses.count(),
  };
});

export const makeCorpse = command(v.string(), async (sectionId) => {
  context();
  const result = await Corpses.createFromSection(sectionId);
  if (result instanceof Error) fail(result);
  return result;
});

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
  return { corpseIds: result.corpseIds };
});

export const deleteCorpse = command(v.string(), async (id) => {
  context();
  const result = await Admin.removeCorpse(id);
  if (result instanceof Error) fail(result);
  await forgetThumbs([{ collection: "corpses", id }]);
  return { ok: true };
});

export const updateThumb = command(v.string(), async (id) => {
  context();
  const result = await Corpses.rebuildThumb(id);
  if (result instanceof Error) fail(result);
  return { ok: true };
});

export const resetLikes = command(async () => {
  context();
  const result = await Likes.resetAll();
  if (result instanceof Error) fail(result);
  return { ok: true };
});

export const downloadPaths = command(v.string(), async (id) => {
  context();
  const drawing = await Admin.sectionDrawing(id);
  if (drawing instanceof Error) fail(drawing);
  return { drawing };
});

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
  return state;
});

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

/**
 * Hides or unhides one or more items (hiding a section also hides its corpses).
 * Hiding clears their thumbs from Blobs and the CDN; pages drop them within
 * about a minute as their cache refreshes.
 */
export const setHidden = command(HideInput, async ({ collection, ids, hidden }) => {
  context();
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
  return { cascaded };
});
