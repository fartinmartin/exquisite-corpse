import type { ActorIdentifier } from "@atcute/lexicons";
import { getOAuthClient } from "@ecc/core";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types.js";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const handle = data.get("handle");

    if (!handle || typeof handle !== "string") {
      return fail(400, { error: "Handle is required" });
    }

    try {
      const oauth = getOAuthClient();
      const { url } = await oauth.authorize({
        target: { type: "account", identifier: handle.trim() as ActorIdentifier },
      });
      throw redirect(302, url.toString());
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { error: "Failed to initiate sign-in. Check your handle and try again." });
    }
  },
};
