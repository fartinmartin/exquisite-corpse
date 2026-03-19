import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Section, Render, Pds, createID } from "@ecc/core";
import type { Did } from "@atcute/lexicons";
import { getAuthContext } from "$lib/atproto/auth";

const GUEST_TOKEN_COOKIE = "ecc_guest_token";
const COLLECTION = "club.exquisitecorpse.section";

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
  if (!("width" in drawingData)) throw error(400, "Invalid drawing data");

  // 3. Render PNG
  const png = await Render.toPng(drawingData);

  // 4. Moderate
  const { ok, reason } = await Render.moderate(png);
  if (!ok) throw error(400, reason ?? "Content rejected by moderation");

  // 5. Determine author
  const auth = await getAuthContext(event);
  const guestToken = event.cookies.get(GUEST_TOKEN_COOKIE);
  if (!auth && !guestToken) throw error(401, "No session");

  // 6. Get the right PDS client and author DID
  const isGuest = !auth;
  const clubDid = process.env.ECC_DID as Did;
  const authorDid: Did = isGuest ? clubDid : auth!.did;
  const client = isGuest ? await Pds.forClub() : await Pds.forUser(auth!.did);

  // 7. Upload PNG blob
  const blob = await Pds.uploadBlob(client, png);

  // 8. Build and write section record
  const record = Section.buildRecord({
    section: sectionType as "top" | "mid" | "bot",
    drawing: drawingData,
    title: title ?? "",
    ...(isGuest && guestToken ? { guestId: guestToken } : {}),
  });

  const recordUri = await Pds.putRecord(client, authorDid, COLLECTION, {
    ...record,
    renderedBlob: blob,
  });

  // 9. Insert into guest_drawings (tracks all sections for matching)
  const sectionId = await Section.insertGuestDrawing({
    recordUri,
    guestToken: guestToken ?? `did:${auth!.did}`,
    section: sectionType as "top" | "mid" | "bot",
  });

  // 10. Check for a match
  const match = await Section.findMatch(sectionType as "top" | "mid" | "bot");

  // 11. If match found: assign corpseId to all three sections
  let corpseId: string | null = null;
  if (match) {
    corpseId = createID("corpse");
    const siblingIds = Object.values(match.siblings)
      .filter(Boolean)
      .map((s) => s!.id);
    await Section.confirmMatch([sectionId, ...siblingIds], corpseId);

    // TODO: Phase 3a — trigger assembleCorpse(corpseId, match)
  }

  return json({ recordUri, sectionId, corpseId, matched: !!match });
};
