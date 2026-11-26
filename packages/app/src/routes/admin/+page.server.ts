import { redirect } from "@sveltejs/kit";
import { isAdmin } from "#lib/server/admin.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  if (!isAdmin(cookies)) redirect(307, "/admin/login");
  return {};
};
