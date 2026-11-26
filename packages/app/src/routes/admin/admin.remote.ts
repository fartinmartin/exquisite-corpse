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
