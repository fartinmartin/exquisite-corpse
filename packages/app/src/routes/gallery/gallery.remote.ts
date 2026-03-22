import { query } from "$app/server";
import * as v from "valibot";
import { Gallery } from "@ecc/core";
import { SectionTypeSchema } from "@ecc/lexicons";

const BLOB_BASE = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${process.env.ECC_DID}&cid=`;

function blobUrl(cid: string | null | undefined): string | null {
  return cid ? BLOB_BASE + cid : null;
}

const ListSectionsInput = v.object({
  section: v.optional(SectionTypeSchema),
  offset: v.optional(v.number()),
});

const ListCorpsesInput = v.object({
  offset: v.optional(v.number()),
});

export const listSections = query(
  ListSectionsInput,
  async (opts) => {
    const rows = await Gallery.listSections({ ...opts, limit: 50 });
    return rows.map((r) => ({ ...r, imageUrl: blobUrl(r.blobCid) }));
  }
);

export const listCorpses = query(
  ListCorpsesInput,
  async (opts) => {
    const rows = await Gallery.listCorpses({ ...opts, limit: 50 });
    return rows.map((r) => ({
      ...r,
      topImageUrl: blobUrl(r.topBlobCid),
      midImageUrl: blobUrl(r.midBlobCid),
      botImageUrl: blobUrl(r.botBlobCid),
    }));
  }
);
