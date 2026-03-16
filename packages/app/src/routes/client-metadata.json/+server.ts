import { getOAuthClient } from '@ecc/core';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const oauth = getOAuthClient();
  return json(oauth.metadata);
};
