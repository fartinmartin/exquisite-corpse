import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

/**
 * Locks admin login for an IP after repeated failures. Both of the free plan's
 * Netlify rate-limit rules are already used (saves, likes), so failures are
 * counted in Netlify Blobs. Outside Netlify they're counted in memory.
 */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Attempts {
  failures: number;
  /** Start of the current counting window. */
  since: number;
}

const memory = new Map<string, Attempts>();

function store() {
  try {
    return getStore("admin-login");
  } catch {
    return null; // no Blobs environment (local dev)
  }
}

/** IPs are hashed so the store never holds them in the clear. */
function key(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function read(id: string): Promise<Attempts | null> {
  const blobs = store();
  if (!blobs) return memory.get(id) ?? null;
  return ((await blobs.get(id, { type: "json" }).catch(() => null)) as Attempts | null) ?? null;
}

async function write(id: string, attempts: Attempts | null): Promise<void> {
  const blobs = store();
  if (!blobs) {
    if (attempts) memory.set(id, attempts);
    else memory.delete(id);
    return;
  }
  await (attempts ? blobs.setJSON(id, attempts) : blobs.delete(id)).catch(() => {});
}

/** Minutes until this IP may try again, or 0 if it isn't locked. */
export async function lockedFor(ip: string): Promise<number> {
  const attempts = await read(key(ip));
  if (!attempts || attempts.failures < MAX_FAILURES) return 0;
  const remaining = attempts.since + WINDOW_MS - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 60_000) : 0;
}

export async function recordFailure(ip: string): Promise<void> {
  const id = key(ip);
  const attempts = await read(id);
  const fresh = !attempts || Date.now() - attempts.since > WINDOW_MS;
  await write(id, fresh ? { failures: 1, since: Date.now() } : { ...attempts, failures: attempts.failures + 1 });
}

export async function recordSuccess(ip: string): Promise<void> {
  await write(key(ip), null);
}
