import { error } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import * as v from "valibot";
import { getSiteState, setSiteState } from "#lib/server/site-mode.ts";
import type { RequestHandler } from "./$types";

/**
 * Receives Google Cloud budget notifications (budget → Pub/Sub topic → push
 * subscription → here) and switches the site to read-only when the month's
 * spend reaches the budget. A budget closure reopens on the first notification
 * of a new budget period that's back under budget. Manual modes are never
 * touched. Setup: docs/plans/admin-rebuild.md ("Budget gate").
 */

const auth = new OAuth2Client();

/** The data Cloud Billing publishes; only the fields used here are validated. */
const BudgetNotification = v.object({
  budgetDisplayName: v.optional(v.string()),
  costAmount: v.number(),
  budgetAmount: v.number(),
  currencyCode: v.optional(v.string()),
  costIntervalStart: v.string(),
});

const PushBody = v.object({
  message: v.object({ data: v.string() }),
});

/**
 * Only Pub/Sub may call this: it signs each push with an OIDC token for our
 * push service account, with this exact URL as the audience.
 */
async function verify(request: Request, url: URL): Promise<boolean> {
  const expected = process.env.BUDGET_PUSH_SERVICE_ACCOUNT;
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!expected || !token) return false;

  const ticket = await auth
    .verifyIdToken({ idToken: token, audience: `${url.origin}${url.pathname}` })
    .catch(() => null);
  const payload = ticket?.getPayload();
  return payload?.email === expected && payload.email_verified === true;
}

export const POST: RequestHandler = async ({ request, url, platform }) => {
  if (!(await verify(request, url))) error(401, "not authorised");

  const body = v.safeParse(PushBody, await request.json().catch(() => null));
  if (!body.success) return new Response(null, { status: 204 }); // ack: retrying won't fix it

  const decoded = JSON.parse(Buffer.from(body.output.message.data, "base64").toString("utf8"));
  const notification = v.safeParse(BudgetNotification, decoded);
  if (!notification.success) return new Response(null, { status: 204 });

  const { costAmount, budgetAmount, costIntervalStart } = notification.output;
  const state = await getSiteState(platform);
  const over = costAmount >= budgetAmount;

  if (over && state.mode === "open") {
    await setSiteState(platform, {
      mode: "read-only",
      reason: "budget",
      at: new Date().toISOString(),
      budgetPeriod: costIntervalStart,
    });
    console.warn(`budget gate: read-only (${costAmount} >= ${budgetAmount})`);
  } else if (
    !over &&
    state.reason === "budget" &&
    state.mode !== "open" &&
    state.budgetPeriod !== costIntervalStart
  ) {
    await setSiteState(platform, { mode: "open", reason: "budget", at: new Date().toISOString() });
    console.warn(`budget gate: reopened for period ${costIntervalStart}`);
  }

  // 2xx acknowledges the message; anything else makes Pub/Sub retry.
  return new Response(null, { status: 204 });
};
