/** The side a creature comes in from; the one it replaces leaves by the other. */
export type Side = "left" | "right";

/**
 * Which side the next dealt creature should come in from. Set just before
 * navigating, read by the layout's `onNavigate` (which can't see the
 * destination's page state).
 */
export const toss: { next?: Side } = {};
