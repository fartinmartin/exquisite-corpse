import { clearSessionCookie } from "$lib/atproto/auth.js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";

export const POST: RequestHandler = async (event) => {
  clearSessionCookie(event);
  throw redirect(302, "/");
};
