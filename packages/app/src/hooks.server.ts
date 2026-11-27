import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { joyful } from "joyful";
import { COOKIE_OPTIONS, GUEST_HANDLE_COOKIE } from "#lib/draw/state.svelte.ts";
import { isAdmin } from "#lib/server/admin.ts";
import { getSiteState } from "#lib/server/site-mode.ts";
import { closedPage } from "#lib/server/closed-page.ts";

/** Pages whose HTML is the same for every visitor. */
const PUBLIC_ROUTES = new Set(["/gallery", "/gallery/section/[id]", "/gallery/corpse/[id]"]);

/** Remote queries (`/_app/remote/<hash>/<name>`) whose results are the same for every visitor. */
const PUBLIC_QUERIES = new Set(["listGallery", "getSection", "getCorpse"]);

/**
 * Browsers revalidate every time; Netlify's CDN serves a shared copy for a
 * minute and keeps serving it while it refreshes in the background, so new
 * drawings and like counts show up within about a minute.
 */
const PUBLIC_CACHE = {
  "cache-control": "public, max-age=0, must-revalidate",
  "netlify-cdn-cache-control": "public, s-maxage=60, stale-while-revalidate=600, durable",
};

/**
 * Always reachable, whatever the mode: admin (to reopen), the budget hook and
 * thumbs. Signed-in admins bypass the gate entirely, so they can check the
 * site while it's closed.
 *
 * Goes by the requested URL, not `event.url`: for remote calls SvelteKit sets
 * that to the calling page, from a header the client controls.
 */
function isExempt(event: Parameters<Handle>[0]["event"]): boolean {
  const { pathname } = new URL(event.request.url);
  return (
    pathname.startsWith("/admin") ||
    pathname === "/api/budget" ||
    pathname.startsWith("/thumbs/") ||
    isAdmin(event.cookies)
  );
}

function remoteName(pathname: string): string | null {
  const [, app, remote, , name] = pathname.split("/");
  return app === "_app" && remote === "remote" ? (name ?? null) : null;
}

function isPublic(event: Parameters<Handle>[0]["event"]): boolean {
  if (event.request.method !== "GET") return false;

  // A remote call is judged by its own name, whatever page it claims to be from.
  const remote = remoteName(new URL(event.request.url).pathname);
  if (remote !== null) return PUBLIC_QUERIES.has(remote);

  return !!event.route.id && PUBLIC_ROUTES.has(event.route.id);
}

export const handle: Handle = async ({ event, resolve }) => {
  // Keep likes, cookies and analytics on one domain. Exact match only, so
  // deploy permalinks (`<id>--….netlify.app`) still work.
  if (event.url.hostname === "exquisite-corpse-club.netlify.app") {
    redirect(301, `https://exquisitecorpse.club${event.url.pathname}${event.url.search}`, { external: true });
  }

  // Site mode gate: closed serves a holding page. Read-only is enforced by the
  // write commands themselves (`requireWritable`).
  if (!isExempt(event)) {
    const state = await getSiteState(event.platform);
    if (state.mode === "closed") return closedPage(state);
  }

  // The draw page shows this as the default artist name. Other pages don't
  // need it, and skipping Set-Cookie there keeps them cacheable. The guest
  // token for likes is issued by `toggleLike`.
  if (event.route.id === "/draw" && !event.cookies.get(GUEST_HANDLE_COOKIE)) {
    event.cookies.set(GUEST_HANDLE_COOKIE, joyful({ segments: 2, separator: "-" }), {
      ...COOKIE_OPTIONS,
      httpOnly: false, // readable client-side for display
    });
  }

  const response = await resolve(event);

  if (isPublic(event) && response.ok && !response.headers.has("set-cookie")) {
    for (const [name, value] of Object.entries(PUBLIC_CACHE)) response.headers.set(name, value);
  }

  return response;
};
