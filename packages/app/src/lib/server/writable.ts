import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { isAdmin } from "./admin.ts";
import { getSiteState } from "./site-mode.ts";

/**
 * Refuses a public write unless the site is open. Signed-in admins can always
 * write. Call it first in every command visitors can use to change data.
 *
 * This can't live in the `handle` hook by URL: for remote commands `event.url`
 * is the page that made the call, taken from a header the client controls.
 */
export async function requireWritable(): Promise<void> {
  const event = getRequestEvent();
  if (isAdmin(event.cookies)) return;
  const { mode } = await getSiteState(event.platform);
  if (mode !== "open") error(503, "drawing is paused");
}
