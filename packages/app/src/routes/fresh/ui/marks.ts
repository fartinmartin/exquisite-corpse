import { hash, prng } from "#lib/corpse/folds.ts";

/**
 * A hand-drawn highlighter stroke, slightly different per label: a small tilt
 * and uneven corners. Stable for a given text, so it doesn't change on reload.
 * Use as `style={highlight("draw the next one")}` on a `.hl` link or button.
 */
export function highlight(text: string): string {
  const rand = prng(hash(`hl:${text}`));
  const r = () => Math.round(2 + rand() * 9);
  const tilt = ((rand() * 2 - 1) * 1.3).toFixed(2);
  return `--r: ${tilt}deg; --radius: ${r()}px ${r()}px ${r()}px ${r()}px / ${r()}px ${r()}px ${r()}px ${r()}px`;
}
