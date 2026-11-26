import { fail, redirect } from "@sveltejs/kit";
import { ADMIN_COOKIE, adminToken, isAdmin } from "#lib/server/admin.ts";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  if (isAdmin(cookies)) redirect(307, "/admin");
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const password = String(form.get("password") ?? "");
    const expected = process.env.ECC_ADMIN_PASSWORD;

    if (!expected || password !== expected) {
      return fail(401, { error: "sry, wrong" });
    }

    cookies.set(ADMIN_COOKIE, adminToken(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    redirect(303, "/admin");
  },
};
