/**
 * A native CSS cursor that previews the brush on the drawing: a dot of the
 * current colour at the size it will draw, a dashed ring for the eraser, and a
 * dot with a small drip for fill. Native, so it never lags behind the mouse.
 *
 * `scale` is on-screen pixels per canvas pixel (canvas-paint draws on a
 * 1080-wide canvas and the brush width is `size * 2` there).
 */
export function brushCursor({
  mode,
  size,
  color,
  scale,
}: {
  mode: "draw" | "erase" | "fill";
  size: number;
  color: string;
  scale: number;
}): string {
  // Browsers cap cursor images at 128px; keep a visible minimum.
  const d = Math.max(4, Math.min(120, size * 2 * scale));
  const pad = 3;
  const box = Math.ceil(d + pad * 2);
  const c = box / 2;
  const r = d / 2;

  let shape: string;
  if (mode === "erase") {
    shape =
      `<circle cx="${c}" cy="${c}" r="${r}" fill="rgba(255,255,255,0.6)" stroke="#231f20" stroke-width="1.2" stroke-dasharray="3 2"/>`;
  } else if (mode === "fill") {
    const w = 18;
    shape =
      `<path d="M9 2 C 9 2, 3 9, 3 12 a6 6 0 0 0 12 0 C 15 9, 9 2, 9 2 Z" fill="${color}" stroke="#231f20" stroke-width="1.2"/>` +
      `<circle cx="9" cy="12" r="1" fill="#fff"/>`;
    return `url("data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">${shape}</svg>`
    )}") 9 16, crosshair`;
  } else {
    // white then ink outline, so the dot shows on any colour
    shape =
      `<circle cx="${c}" cy="${c}" r="${r + 1}" fill="none" stroke="#fff" stroke-width="1.5"/>` +
      `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}" stroke="#231f20" stroke-width="1"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}" viewBox="0 0 ${box} ${box}">${shape}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${Math.round(c)} ${Math.round(c)}, crosshair`;
}
