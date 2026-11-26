/** Shared by server and browser: what the site currently allows. */
export type SiteMode = "open" | "read-only" | "closed";

/** Why the site is in its current mode. Only `budget` closures reopen on their own. */
export type SiteModeReason = "manual" | "budget";

export interface SiteState {
  mode: SiteMode;
  reason: SiteModeReason;
  /** ISO time of the change. */
  at: string;
  /** For `budget`: the budget period (`costIntervalStart`) that tripped it. */
  budgetPeriod?: string;
}

export const OPEN: SiteState = { mode: "open", reason: "manual", at: new Date(0).toISOString() };

/** Visitor-facing copy, by reason. */
export function pausedMessage(state: SiteState): string {
  return state.reason === "budget"
    ? "we've hit our limit for the month, so drawing is paused. the gallery is still open!"
    : "drawing is paused for a bit. the gallery is still open!";
}
