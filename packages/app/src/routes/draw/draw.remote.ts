import { command, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import * as v from "valibot";
import { Section, Render, Pds, Corpse, createID } from "@ecc/core";
import { DrawingDataSchema, SectionTypeSchema } from "@ecc/lexicons";
import type { Did } from "@atcute/lexicons";
import { getAuthContext } from "$lib/atproto/auth";

const GUEST_TOKEN_COOKIE = "ecc_guest_token";
const COLLECTION = "club.exquisitecorpse.section" as const;

const SubmitSectionInput = v.object({
  drawing: DrawingDataSchema,
  section: SectionTypeSchema,
  title: v.optional(v.string()),
});

export const submitSection = command(SubmitSectionInput, async ({ drawing, section: sectionType, title }) => {
  const event = getRequestEvent();

  // 1. Validate drawing data
  const drawingData = Section.validateDrawing(drawing);
  if (!("width" in drawingData)) throw error(400, "Invalid drawing data");

  // 2. Render PNG
  const png = await Render.toPng(drawingData);

  // 3. Moderate
  const { ok, reason } = await Render.moderate(png);
  if (!ok) throw error(400, reason ?? "Content rejected by moderation");

  // 4. Determine author
  const auth = await getAuthContext(event);
  const guestToken = event.cookies.get(GUEST_TOKEN_COOKIE);
  if (!auth && !guestToken) throw error(401, "No session");

  // 5. Get the right PDS client and author DID
  const isGuest = !auth;
  const clubDid = process.env.ECC_DID as Did;
  const authorDid: Did = isGuest ? clubDid : auth!.did;
  const client = isGuest ? await Pds.forClub() : await Pds.forUser(auth!.did);

  // 6. Upload PNG blob
  const blob = await Pds.uploadBlob(client, png);

  // 7. Build and write section record
  const record = Section.buildRecord({
    section: sectionType,
    drawing: drawingData,
    title: title ?? "",
    ...(isGuest && guestToken ? { guestId: guestToken } : {}),
  });

  const recordUri = await Pds.putRecord(client, authorDid, COLLECTION, {
    ...record,
    renderedBlob: blob,
  });

  // 8. Insert into sections table
  const sectionId = await Section.insert({
    recordUri,
    guestToken: guestToken ?? `did:${auth!.did}`,
    section: sectionType,
    blobCid: blob.ref.$link,
    title: title ?? "",
  });

  // 9. Check for a match
  const match = await Section.findMatch(sectionType);

  // 10. If match found: assign corpseId and assemble
  let corpseId: string | null = null;
  if (match) {
    corpseId = createID("corpse");
    const siblingIds = Object.values(match.siblings).filter(Boolean).map((s) => s!.id);
    await Section.confirmMatch([sectionId, ...siblingIds], corpseId);
    await Corpse.assemble(corpseId);
  }

  return { recordUri, sectionId, corpseId, matched: !!match };
});
