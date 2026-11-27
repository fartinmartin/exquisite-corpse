import { hash, prng } from "./folds.ts";

/**
 * What the back of the paper looks like while a creature is folded. All are
 * pure CSS from the original palette, kept low-contrast: texture, not
 * decoration. Styles live in fold.svelte under `[data-back]`.
 */
export const BACKS = [
  { id: "plain", label: "plain" },
  { id: "bleed", label: "ink bleed-through" },
  { id: "dots", label: "sky dots" },
  { id: "graph", label: "graph paper" },
  { id: "ruled", label: "ruled notebook" },
  { id: "envelope", label: "security envelope" },
  { id: "stamp", label: "no peeking stamp" },
  { id: "scuffs", label: "pencil scuffs" },
] as const;

export type BackId = (typeof BACKS)[number]["id"];

/** A stable back for a creature, so a page looks the same on every load. */
export function backFor(id: string, allowed: readonly BackId[] = BACKS.map((back) => back.id)): BackId {
  return allowed[Math.floor(prng(hash(`back:${id}`))() * allowed.length)] ?? "plain";
}

export function backLabel(id: BackId): string {
  return BACKS.find((back) => back.id === id)?.label ?? id;
}
