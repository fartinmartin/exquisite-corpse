import { getAuthContext } from "$lib/atproto/auth.js";
import type { LayoutServerLoad } from "./$types.js";

export const load: LayoutServerLoad = async (event) => {
  const auth = await getAuthContext(event);
  return {
    user: auth ? { did: auth.did } : null,
  };
};
