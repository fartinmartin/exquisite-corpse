/**
 * Shared state for the background doodles on /fresh pages. How they look was
 * settled in the doodle lab (archived with feat/layout-lab): tint, nine of them,
 * a slow drift, a jiggle on taps, and out of the way while you draw.
 */
function createDoodles() {
  let pulse = $state(0);
  let scattered = $state(false);

  return {
    /** Bumps on every tap/click; doodles give a small shuffle. */
    get pulse() {
      return pulse;
    },
    nudge() {
      if (!scattered) pulse += 1;
    },
    /** While drawing, the doodles leave the page so the drawing has focus. */
    get scattered() {
      return scattered;
    },
    set scattered(value) {
      scattered = value;
    },
  };
}

export const doodles = createDoodles();
