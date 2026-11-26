import { redirect } from "@sveltejs/kit";
import { ADMIN_COOKIE } from "#lib/server/admin.ts";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = ({ cookies }) => {
  cookies.delete(ADMIN_COOKIE, { path: "/" });
  redirect(303, "/");
};
