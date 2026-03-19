import type { Handle } from "@sveltejs/kit";
import { joyful } from "joyful";

const GUEST_TOKEN_COOKIE = "ecc_guest_token";
const GUEST_HANDLE_COOKIE = "ecc_guest_handle";

// Server startup hook — good place to initialize background services
// (e.g. firehose subscription for real-time section discovery) when needed
export const handle: Handle = async ({ event, resolve }) => {
  if (!event.cookies.get(GUEST_TOKEN_COOKIE)) {
    const token = crypto.randomUUID();
    const handle = joyful({ segments: 2, separator: "-" });

    event.cookies.set(GUEST_TOKEN_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    event.cookies.set(GUEST_HANDLE_COOKIE, handle, {
      path: "/",
      httpOnly: false, // readable client-side for display
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return resolve(event);
};
