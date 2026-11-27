import type { SectionType } from "@ecc/firestore";
import { TYPES } from "./types.ts";

/**
 * Physically possible ways to fold a sheet in thirds, and to unfold it.
 *
 * One panel (the base) stays flat on the desk. The others hang off a parent
 * panel by a hinge (the parent's top or bottom edge) and are folded 180° onto
 * it, either in front (toward the viewer) or behind. Unfolding has to respect
 * layering: a flap tucked inside another can't open before the one covering it.
 *
 * And it has to stay inside the square: a flap only opens once the panel it
 * hangs from is flat. Opening a z-fold's end panel first is physically fine,
 * but its hinge is then on the outer edge of the folded packet, so it swings
 * out past the sheet's footprint — voted down in the fold lab
 * (docs/folds/votes.json).
 *
 *   base mid  — top and bottom fold onto the middle
 *               same side   → letter fold (one flap over the other)
 *               opposite    → z-fold
 *   base top/bot — the other two hang in a chain
 *               same side   → roll fold (last panel tucked inside)
 *               opposite    → z-fold (accordion)
 */

/** 1: the flap folds toward the viewer; -1: it folds behind its parent. */
export type Side = 1 | -1;

export interface Hinge {
  panel: SectionType;
  parent: SectionType;
  /** Which edge of the parent the panel hangs from. */
  edge: "top" | "bottom";
  side: Side;
  /** Gap (px) between this flap and its parent when folded: paper thickness, and room for tucked flaps. */
  lift: number;
}

export interface FoldPlan {
  name: string;
  base: SectionType;
  hinges: Hinge[];
  /** Unfold order: each entry opens its hinge. */
  order: SectionType[];
  /** Resting angle of the sheet on the desk, in degrees. */
  tilt: number;
}

const THICK = 1.5;

/** Seeded PRNG so a plan is stable for a given seed (and SSR-safe). */
export function prng(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable number for a string (e.g. a corpse id). */
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A small, stable tilt for a thing on the desk. */
export function tiltFor(id: string, range = 3): number {
  return (prng(hash(id))() * 2 - 1) * range;
}

/**
 * True when the folded packet shows the blank back of the paper, not a
 * drawing: at least one flap folds over the base toward the viewer, and any
 * second-level flap folds the same way as its parent (tucked inside, like a
 * roll fold). Letter/roll folds behind and end z-folds show a drawing.
 */
export function showsBack(plan: FoldPlan): boolean {
  const children = plan.hinges.filter((hinge) => hinge.parent === plan.base);
  if (!children.some((hinge) => hinge.side === 1)) return false;
  return plan.hinges.every((hinge) => {
    const parent = plan.hinges.find((entry) => entry.panel === hinge.parent);
    return !parent || parent.side === hinge.side;
  });
}

/**
 * A random fold. By default only folds that hide the drawing while folded;
 * pass `face: "any"` when a drawing on top is fine (e.g. your own third after
 * you draw).
 */
export function randomFold(
  options: { rand?: () => number; base?: SectionType; side?: Side; face?: "back" | "any" } = {}
): FoldPlan {
  const rand = options.rand ?? Math.random;
  if (options.face === "any") return anyFold({ ...options, rand });
  for (let i = 0; i < 64; i++) {
    const plan = anyFold({ ...options, rand });
    if (showsBack(plan)) return plan;
  }
  return anyFold({ base: "mid", side: 1, rand });
}

function anyFold(options: { rand: () => number; base?: SectionType; side?: Side }): FoldPlan {
  const rand = options.rand;
  const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
  const coin = (): Side => (rand() < 0.5 ? 1 : -1);

  const base = options.base ?? pick(TYPES);
  const side = options.side ?? coin();
  const tilt = Number(((rand() * 2 - 1) * 3.5).toFixed(2));

  if (base === "mid") {
    const topSide = side;
    const botSide = options.side ? side : coin();

    if (topSide === botSide) {
      // letter fold: whichever flap went down last is on the outside and opens first
      const outer = pick<SectionType>(["top", "bot"]);
      const inner: SectionType = outer === "top" ? "bot" : "top";
      return {
        name: `letter fold, ${outer === "top" ? "top" : "bottom"} flap outside`,
        base,
        tilt,
        hinges: [
          { panel: "top", parent: "mid", edge: "top", side: topSide, lift: outer === "top" ? THICK * 2 : THICK },
          { panel: "bot", parent: "mid", edge: "bottom", side: botSide, lift: outer === "bot" ? THICK * 2 : THICK },
        ],
        order: [outer, inner],
      };
    }

    // opposite sides: neither flap covers the other, so either can open first
    const first = pick<SectionType>(["top", "bot"]);
    return {
      name: "z-fold around the middle",
      base,
      tilt,
      hinges: [
        { panel: "top", parent: "mid", edge: "top", side: topSide, lift: THICK },
        { panel: "bot", parent: "mid", edge: "bottom", side: botSide, lift: THICK },
      ],
      order: [first, first === "top" ? "bot" : "top"],
    };
  }

  // base at one end: the middle hangs off it, the far end hangs off the middle
  const far: SectionType = base === "top" ? "bot" : "top";
  const edge = base === "top" ? "bottom" : "top";
  const farSide = options.side ? (rand() < 0.5 ? side : (-side as Side)) : coin();
  const from = base === "top" ? "the top" : "the bottom";

  if (farSide === side) {
    // roll: the far panel is tucked between the middle and the base
    return {
      name: `roll fold from ${from}`,
      base,
      tilt,
      hinges: [
        { panel: "mid", parent: base, edge, side, lift: THICK * 2 },
        { panel: far, parent: "mid", edge, side: farSide, lift: THICK },
      ],
      order: ["mid", far],
    };
  }

  // z/accordion: the far panel is on the outside. Swing the middle open
  // carrying it, then unfold it into place (never the far panel first).
  return {
    name: `z-fold from ${from}`,
    base,
    tilt,
    hinges: [
      { panel: "mid", parent: base, edge, side, lift: THICK },
      { panel: far, parent: "mid", edge, side: farSide, lift: THICK },
    ],
    order: ["mid", far],
  };
}

/** True when every flap opens after the panel it hangs from, i.e. nothing swings outside the square. */
export function staysInSquare(plan: FoldPlan): boolean {
  const flat = new Set<SectionType>([plan.base]);
  for (const panel of plan.order) {
    const hinge = plan.hinges.find((entry) => entry.panel === panel);
    if (!hinge || !flat.has(hinge.parent)) return false;
    flat.add(panel);
  }
  return true;
}

/** Folded hinge rotation: 180° toward the hinge's side. */
export function foldedAngle(hinge: Hinge): number {
  // rotateX(+θ) brings a panel hanging *below* its hinge toward the viewer;
  // a panel hanging *above* comes toward the viewer with −θ.
  return hinge.side * 180 * (hinge.edge === "bottom" ? 1 : -1);
}
