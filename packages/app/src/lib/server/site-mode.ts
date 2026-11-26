import { getStore } from "@netlify/blobs";
import { OPEN, type SiteState } from "#lib/site-mode.ts";

/**
 * Site mode (open / read-only / closed), changed from /admin or by the budget
 * hook (`/api/budget`) without a deploy.
 *
 * Stored in Netlify Blobs. The store is site-wide (shared by previews and
 * production), so each deploy context gets its own key: the published
 * production deploy uses `production`, and every other deploy uses its own id.
 * A draft can never close the live site.
 */

/** How long a function instance trusts its copy before re-reading. */
const TTL_MS = 30_000;

interface NetlifyPlatform {
  context?: { deploy?: { id?: string; published?: boolean } };
}

let memory: SiteState = OPEN; // local dev (no Blobs) and fallback
const cache = new Map<string, { state: SiteState; until: number }>();

function key(platform: unknown): string | null {
  const deploy = (platform as NetlifyPlatform | undefined)?.context?.deploy;
  if (!deploy) return null; // not on Netlify
  return deploy.published ? "production" : `deploy-${deploy.id}`;
}

function store() {
  try {
    return getStore("site");
  } catch {
    return null; // no Blobs environment (local dev)
  }
}

export async function getSiteState(platform: unknown): Promise<SiteState> {
  const id = key(platform);
  const blobs = id ? store() : null;
  if (!id || !blobs) return memory;

  const hit = cache.get(id);
  if (hit && hit.until > Date.now()) return hit.state;

  // Fail open: if Blobs is unreachable, keep serving rather than closing the site.
  const stored = (await blobs.get(id, { type: "json" }).catch(() => null)) as SiteState | null;
  const state = stored ?? OPEN;
  cache.set(id, { state, until: Date.now() + TTL_MS });
  return state;
}

export async function setSiteState(platform: unknown, state: SiteState): Promise<void> {
  const id = key(platform);
  const blobs = id ? store() : null;
  if (!id || !blobs) {
    memory = state;
    return;
  }
  await blobs.setJSON(id, state);
  cache.set(id, { state, until: Date.now() + TTL_MS });
}
