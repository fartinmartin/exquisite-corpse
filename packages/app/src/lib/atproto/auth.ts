import type { Did } from "@atcute/lexicons";
import type { RequestEvent } from "@sveltejs/kit";
import { getOAuthClient } from "@ecc/core";

const SESSION_COOKIE = "did";

export async function getAuthContext(event: RequestEvent) {
  const did = event.cookies.get(SESSION_COOKIE);
  if (!did) return null;

  try {
    const oauth = getOAuthClient();
    const session = await oauth.restore(did as Did);
    return { did: did as Did, session };
  } catch {
    event.cookies.delete(SESSION_COOKIE, { path: "/" });
    return null;
  }
}

export async function requireAuth(event: RequestEvent) {
  const auth = await getAuthContext(event);
  if (!auth) {
    const { redirect } = await import("@sveltejs/kit");
    throw redirect(302, "/login");
  }
  return auth;
}

export function setSessionCookie(event: RequestEvent, did: Did) {
  event.cookies.set(SESSION_COOKIE, did, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(event: RequestEvent) {
  event.cookies.delete(SESSION_COOKIE, { path: "/" });
}
