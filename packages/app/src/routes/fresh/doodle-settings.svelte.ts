/**
 * Shared state for the background doodles on /fresh pages. How they look was
 * settled in the doodle lab (archived with feat/layout-lab): tint, nine of them,
 * a slow drift, and out of the way while you draw.
 *
 * Presses wind them up: holding builds tension toward the press point, and
 * letting go flings them away from it, harder the longer you held.
 */

/** Holding longer than this doesn't wind them up any further. */
export const FULL_HOLD_MS = 1200;

export type Press = { x: number; y: number; at: number };
export type Release = { x: number; y: number; strength: number; count: number };

function createDoodles() {
  let scattered = $state(false);
  let held = $state<Press | null>(null);
  let released = $state<Release | null>(null);

  return {
    /** While drawing, the doodles leave the page so the drawing has focus. */
    get scattered() {
      return scattered;
    },
    set scattered(value) {
      scattered = value;
      if (value) held = null;
    },

    /** The press in progress, if any. */
    get held() {
      return held;
    },
    /** The last release; `count` bumps on each one. */
    get released() {
      return released;
    },

    press(x: number, y: number) {
      if (scattered) return;
      held = { x, y, at: performance.now() };
    },
    release() {
      if (!held) return;
      const strength = Math.min(1, (performance.now() - held.at) / FULL_HOLD_MS);
      released = { x: held.x, y: held.y, strength, count: (released?.count ?? 0) + 1 };
      held = null;
    },
  };
}

export const doodles = createDoodles();
