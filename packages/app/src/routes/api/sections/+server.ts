import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Section, Render, createID } from "@ecc/core";
import { getAuthContext } from "$lib/atproto/auth";

const GUEST_TOKEN_COOKIE = "ecc_guest_token";

export const POST: RequestHandler = async (event) => {
  // 1. Parse body
  const body = await event.request.json().catch(() => {
    throw error(400, "Invalid JSON");
  });

  const { drawing, section: sectionType, title } = body as {
    drawing: unknown;
    section: unknown;
    title: string;
  };

  if (!sectionType || !["top", "mid", "bot"].includes(sectionType as string)) {
    throw error(400, "Invalid section type");
  }

  // 2. Validate drawing data
  const drawingData = Section.validateDrawing(drawing);
  if (drawingData instanceof Error || !("width" in drawingData)) {
    throw error(400, "Invalid drawing data");
  }

  // 3. Render PNG
  const png = await Render.toPng(drawingData);

  // 4. Moderate
  const { ok, reason } = await Render.moderate(png);
  if (!ok) throw error(400, reason ?? "Content rejected by moderation");

  // 5. Determine author
  const auth = await getAuthContext(event);
  const guestToken = event.cookies.get(GUEST_TOKEN_COOKIE);

  if (!auth && !guestToken) throw error(401, "No session");

  // 6. Write section record to PDS
  // TODO: implement PDS upload (blob + record write via atproto)
  // For now, generate a placeholder URI so the rest of the pipeline can be wired
  const recordUri = `at://placeholder/${createID("section")}`;

  // 7. Insert into guest_drawings (for now, always — auth'd user tracking comes with PDS write)
  const sectionId = await Section.insertGuestDrawing({
    recordUri,
    guestToken: guestToken ?? `did:${auth!.did}`,
    section: sectionType as "top" | "mid" | "bot",
  });

  // 8. Check for a match
  const match = await Section.findMatch(sectionType as "top" | "mid" | "bot");

  // 9. If match: confirm reservation, assign corpseId
  // Assembly (Phase 3a) comes later
  let corpseId: string | null = null;
  if (match) {
    corpseId = createID("corpse");
    const siblingIds = Object.values(match.siblings)
      .filter(Boolean)
      .map((s) => s!.id);
    await Section.confirmMatch([sectionId, ...siblingIds], corpseId);
  }

  return json({ recordUri, sectionId, corpseId, matched: !!match });
};
