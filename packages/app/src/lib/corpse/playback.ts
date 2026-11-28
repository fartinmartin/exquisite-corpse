import type { SectionType } from "@ecc/firestore";
import type { DrawingData } from "@ecc/lexicons";
import { TYPES } from "./types.ts";

type Third = { drawing: DrawingData; date?: string };

/**
 * Playback timing for a creature: each third redraws itself stroke by
 * stroke, one after another, in the order they were actually drawn (oldest
 * first; position order when dates are missing). Longer drawings get a
 * little longer, within limits, so nothing drags.
 */
export function playbackPlan(panels: Partial<Record<SectionType, Third>>, { gap = 250 } = {}) {
  const order = TYPES.filter((type) => panels[type]).sort((a, b) => {
    const da = panels[a]!.date ?? "";
    const db = panels[b]!.date ?? "";
    return da === db ? TYPES.indexOf(a) - TYPES.indexOf(b) : da.localeCompare(db);
  });

  const thirds: Partial<Record<SectionType, { delay: number; duration: number }>> = {};
  let at = 0;
  for (const type of order) {
    const strokes = panels[type]!.drawing.paths.length;
    const duration = Math.min(2400, Math.max(900, 700 + strokes * 45));
    thirds[type] = { delay: at, duration };
    at += duration + gap;
  }
  return { order, thirds, total: Math.max(0, at - gap) };
}
