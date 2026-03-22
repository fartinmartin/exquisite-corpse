import { eq } from "drizzle-orm";
import type { Did } from "@atcute/lexicons";
import { useTransaction, createTransaction } from "../db/transaction.js";
import { sections } from "../section/section.sql.js";
import { corpses } from "./corpse.sql.js";
import { Render } from "../render/index.js";
import { Pds } from "../atproto/pds.js";
import { createID } from "../util/id.js";

const CORPSE_COLLECTION = "club.exquisitecorpse.drawing" as const;
const POST_COLLECTION = "app.bsky.feed.post" as const;

/** Picks a random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Splits a string into words, filtering empty strings. */
function words(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/**
 * Generates a corpse title by mashing up three section titles.
 * One of four strategies is chosen at random.
 */
export function mashupTitle(t1: string, t2: string, t3: string): string {
  const w1 = words(t1 || "the");
  const w2 = words(t2 || "strange");
  const w3 = words(t3 || "creature");

  const mid = (w: string[]) => w[Math.floor(w.length / 2)];

  const strategies = [
    // first of T1 + middle of T2 + last of T3
    () => [w1[0], mid(w2), w3[w3.length - 1]].join(" "),
    // random word from each
    () => [pick(w1), pick(w2), pick(w3)].join(" "),
    // last of T1 + first of T2 + middle of T3
    () => [w1[w1.length - 1], w2[0], mid(w3)].join(" "),
    // interleave: T1[0], T2[0], T3[0], T1[1]... take first 4 words
    () => {
      const all: string[] = [];
      const len = Math.max(w1.length, w2.length, w3.length);
      for (let i = 0; i < len && all.length < 4; i++) {
        if (w1[i]) all.push(w1[i]);
        if (w2[i] && all.length < 4) all.push(w2[i]);
        if (w3[i] && all.length < 4) all.push(w3[i]);
      }
      return all.join(" ");
    },
  ];

  return pick(strategies)();
}

export namespace Corpse {
  /**
   * Assembles a complete corpse from three matched sections.
   * Composites their PNG blobs, writes a drawing record to the club PDS,
   * inserts into the local corpses table, and posts to the club's bsky feed.
   */
  export async function assemble(corpseId: string): Promise<void> {
    const clubDid = process.env.ECC_DID as Did;

    // 1. Fetch the three section rows (ordered top → mid → bot)
    const rows = await useTransaction((tx) =>
      tx
        .select()
        .from(sections)
        .where(eq(sections.corpseId, corpseId))
    );

    const order = ["top", "mid", "bot"] as const;
    const sorted = order.map((type) => {
      const row = rows.find((r) => r.section === type);
      if (!row) throw new Error(`Missing ${type} section for corpse ${corpseId}`);
      return row;
    });

    // 2. Fetch each PNG blob from PDS
    const pngs = await Promise.all(
      sorted.map(async (row) => {
        if (!row.blobCid) throw new Error(`Missing blobCid for section ${row.id}`);
        const did = row.did ?? clubDid;
        const res = await fetch(
          `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${row.blobCid}`
        );
        if (!res.ok) throw new Error(`Blob fetch failed for ${row.blobCid}`);
        return Buffer.from(await res.arrayBuffer());
      })
    );

    // 3. Composite vertically
    const compositePng = await Render.composite(pngs);

    // 4. Upload composited blob to club PDS
    const client = await Pds.forClub();
    const compositeBlob = await Pds.uploadBlob(client, compositePng);

    // 5. Generate title
    const [topRow, midRow, botRow] = sorted;
    const title = mashupTitle(topRow.title ?? "", midRow.title ?? "", botRow.title ?? "");

    // 6. Write drawing record to club PDS
    const recordUri = await Pds.putRecord(client, clubDid, CORPSE_COLLECTION, {
      $type: CORPSE_COLLECTION,
      corpseId,
      topUri: topRow.recordUri,
      midUri: midRow.recordUri,
      botUri: botRow.recordUri,
      renderedBlob: compositeBlob.ref.$link,
      title,
      createdAt: new Date().toISOString(),
    });

    // 7. Insert into local corpses table
    await createTransaction(async () => {
      await useTransaction((tx) =>
        tx.insert(corpses).values({
          id: createID("corpse"),
          recordUri,
          topUri: topRow.recordUri,
          midUri: midRow.recordUri,
          botUri: botRow.recordUri,
          title,
          moderationStatus: "approved",
        })
      );
    });

    // 8. Write bsky post: composited image + title + @mentions of auth'd contributors
    const mentionedDids = [...new Set(sorted.map((r) => r.did).filter(Boolean) as string[])];
    const mentionText = mentionedDids.map((did) => `@${did}`).join(" ");
    const postText = mentionText ? `${title}\n\n${mentionText}` : title;

    await Pds.putRecord(client, clubDid, POST_COLLECTION, {
      $type: POST_COLLECTION,
      text: postText,
      embed: {
        $type: "app.bsky.embed.images",
        images: [
          {
            image: compositeBlob,
            alt: title,
          },
        ],
      },
      createdAt: new Date().toISOString(),
    });
  }
}
