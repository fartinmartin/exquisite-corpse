import { getOAuthClient } from "@ecc/core";
import { setSessionCookie } from "$lib/atproto/auth.js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";

export const GET: RequestHandler = async (event) => {
  const oauth = getOAuthClient();

  try {
    const { session } = await oauth.callback(event.url.searchParams);
    setSessionCookie(event, session.did);
  } catch (e) {
    console.error("OAuth callback error:", e);
    throw redirect(302, "/login?error=callback_failed");
  }

  throw redirect(302, "/");
};
