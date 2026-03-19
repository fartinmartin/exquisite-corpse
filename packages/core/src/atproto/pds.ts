import "@atcute/atproto";
import { Client, CredentialManager } from "@atcute/client";
import type { Did } from "@atcute/lexicons";
import { nanoid } from "nanoid";
import { getOAuthClient } from "./oauth.js";

// Lazy singleton for the club account client
let _clubClient: Client | null = null;

async function getClubClient(): Promise<Client> {
  if (_clubClient) return _clubClient;

  if (!process.env.ECC_DID) throw new Error("ECC_DID env var is required");
  if (!process.env.ECC_APP_PASSWORD)
    throw new Error("ECC_APP_PASSWORD env var is required");

  const manager = new CredentialManager({
    service: "https://bsky.social",
    onExpired: () => {
      _clubClient = null; // force re-login on next request
    },
  });

  await manager.login({
    identifier: process.env.ECC_DID,
    password: process.env.ECC_APP_PASSWORD,
  });

  _clubClient = new Client({ handler: manager });
  return _clubClient;
}

async function getUserClient(did: Did): Promise<Client> {
  const oauth = getOAuthClient();
  const session = await oauth.restore(did);
  return new Client({ handler: session });
}

export namespace Pds {
  /**
   * Uploads a PNG buffer as a blob to the given account's PDS.
   * Returns the blob ref to embed in the section record.
   */
  export async function uploadBlob(
    client: Client,
    png: Buffer
  ): Promise<{ $type: string; ref: { $link: string }; mimeType: string; size: number }> {
    const res = await client.post("com.atproto.repo.uploadBlob", {
      input: png,
      headers: { "Content-Type": "image/png" },
    });

    if (!res.ok) throw new Error(`Blob upload failed: ${res.data.message}`);
    return res.data.blob as Awaited<ReturnType<typeof Pds.uploadBlob>>;
  }

  /**
   * Writes a record to the given repo and returns its AT-URI.
   */
  export async function putRecord(
    client: Client,
    repo: Did,
    collection: `${string}.${string}.${string}`,
    record: Record<string, unknown>
  ): Promise<string> {
    const rkey = nanoid();

    const res = await client.post("com.atproto.repo.putRecord", {
      input: { repo, collection, rkey, record },
    });

    if (!res.ok) throw new Error(`Record write failed: ${res.data.message}`);
    return `at://${repo}/${collection}/${rkey}`;
  }

  /**
   * Returns an XRPC client authenticated as the given user (OAuth session).
   */
  export async function forUser(did: Did): Promise<Client> {
    return getUserClient(did);
  }

  /**
   * Returns an XRPC client authenticated as the club account (app password).
   */
  export async function forClub(): Promise<Client> {
    return getClubClient();
  }
}
