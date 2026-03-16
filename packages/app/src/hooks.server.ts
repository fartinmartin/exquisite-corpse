import type { Handle } from "@sveltejs/kit";

// Server startup hook — good place to initialize background services
// (e.g. firehose subscription for real-time section discovery) when needed
export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};
