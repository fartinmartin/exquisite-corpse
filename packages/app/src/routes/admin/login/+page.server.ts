import { fail, redirect } from "@sveltejs/kit";
import { ADMIN_COOKIE, adminToken, checkPassword, isAdmin, SESSION_MS } from "#lib/server/admin.ts";
import { lockedFor, recordFailure, recordSuccess } from "#lib/server/login-throttle.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  if (isAdmin(cookies)) redirect(307, "/admin");
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    const ip = getClientAddress();
    const minutes = await lockedFor(ip);
    if (minutes > 0) return fail(429, { error: `too many tries, wait ${minutes} min` });

    const form = await request.formData();
    if (!checkPassword(String(form.get("password") ?? ""))) {
      await recordFailure(ip);
      return fail(401, { error: "sry, wrong" });
    }

    await recordSuccess(ip);
    cookies.set(ADMIN_COOKIE, adminToken(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MS / 1000,
    });

    redirect(303, "/admin");
  },
};
