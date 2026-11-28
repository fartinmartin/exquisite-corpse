/**
 * Which side the drawing rail sits on (phones in landscape), so it's under
 * the thumb that isn't drawing. Right by default; remembered per device.
 */
const KEY = "ecc-hand";

type Side = "left" | "right";

function createHand() {
  let side = $state<Side>("right");

  return {
    get side(): Side {
      return side;
    },
    /** Call from an `$effect` (reads localStorage). */
    load() {
      try {
        side = localStorage.getItem(KEY) === "left" ? "left" : "right";
      } catch {
        // private mode: right it is
      }
    },
    swap() {
      side = side === "right" ? "left" : "right";
      try {
        localStorage.setItem(KEY, side);
      } catch {
        // just for this visit
      }
    },
  };
}

export const hand = createHand();
