import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { joyful } from "joyful";
import { COOKIE_OPTIONS, GUEST_HANDLE_COOKIE } from "#lib/draw/state.svelte.ts";

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

function isPublic(event: Parameters<Handle>[0]["event"]): boolean {
  if (event.request.method !== "GET") return false;
  if (event.route.id && PUBLIC_ROUTES.has(event.route.id)) return true;

  const [, app, remote, , name] = event.url.pathname.split("/");
  return app === "_app" && remote === "remote" && PUBLIC_QUERIES.has(name ?? "");
}

export const handle: Handle = async ({ event, resolve }) => {
  // Keep likes, cookies and analytics on one domain. Exact match only, so
  // deploy permalinks (`<id>--….netlify.app`) still work.
  if (event.url.hostname === "exquisite-corpse-club.netlify.app") {
    redirect(301, `https://exquisitecorpse.club${event.url.pathname}${event.url.search}`, { external: true });
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
