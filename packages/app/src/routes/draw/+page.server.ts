import { getSiteState } from "#lib/server/site-mode.ts";
import type { PageServerLoad } from "./$types";

/** Whether drawing is allowed right now (the site may be read-only). */
export const load: PageServerLoad = async ({ platform }) => {
  return { site: await getSiteState(platform) };
};
