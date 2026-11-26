export * as Drawing from "./drawing.js";

import type { DrawingData, Path, Point } from "@ecc/lexicons";
import type { LegacyDrawing, LegacyPoint, StoredDrawing } from "./types.js";

/** Logical document size new drawings are recorded at. */
export const DOCUMENT_WIDTH = 1080;
export const DOCUMENT_HEIGHT = 360;

/**
 * Legacy (2020 Vue app) drawings were recorded in CSS pixels of the ~544px
 * panel. Drawings made on mobile were normalized at save time to a ~1080px
 * space, so the bounds tell us which space a record is in.
 */
const LEGACY_WIDTH = 544;
const LEGACY_MOBILE_WIDTH = 1080;
const LEGACY_MOBILE_THRESHOLD = 560;

/** True when `drawing` is already canvas-paint data rather than the legacy map. */
export function isDrawingData(value: unknown): value is DrawingData {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as DrawingData).paths) &&
    typeof (value as DrawingData).width === "number"
  );
}

export interface LegacyBounds {
  maxX: number;
  maxY: number;
}

/** Furthest x/y any legacy command reaches, including fill points. */
export function legacyBounds(legacy: LegacyDrawing): LegacyBounds {
  let maxX = 0;
  let maxY = 0;

  for (const commands of Object.values(legacy)) {
    for (const point of commands) {
      maxX = Math.max(maxX, point.x1 ?? 0, point.x2 ?? 0);
      maxY = Math.max(maxY, point.y1 ?? 0, point.y2 ?? 0);
    }
  }

  return { maxX, maxY };
}

/**
 * Normalizes either stored shape to canvas-paint data. Legacy point commands
 * become one Path per command. Points past the panel edge are kept as-is so
 * the drawing frames exactly like it did on the live site (clipped by the
 * canvas), rather than being rescaled.
 */
export function toDrawingData(stored: StoredDrawing | null | undefined): DrawingData {
  if (isDrawingData(stored)) return stored;

  const legacy: LegacyDrawing = stored ?? {};
  const { maxX, maxY } = legacyBounds(legacy);

  const width = maxX > LEGACY_MOBILE_THRESHOLD ? LEGACY_MOBILE_WIDTH : LEGACY_WIDTH;
  const height = Math.round(width / 3);

  const paths: Path[] = [];
  for (const commands of Object.values(legacy)) {
    for (const command of commands) paths.push(legacyPointToPath(command));
  }

  return {
    width,
    height,
    version: "legacy",
    bgColor: "#ffffff",
    paths,
  };
}

function legacyPointToPath(point: LegacyPoint): Path {
  const color = point.color ?? "#000000";
  // The old renderer used radius for dots and size * 2 for stroke width.
  const size = (point.size ?? 5) * 2;
  const cap = "round" as const;
  const join = "round" as const;

  if (point.mode === "clear") {
    return { mode: "clear", points: [], cap, join, tolerance: 30 };
  }

  if (point.mode === "fill") {
    return {
      mode: "fill",
      points: [{ x: point.x2 ?? 0, y: point.y2 ?? 0, color, size }],
      cap,
      join,
      tolerance: 50,
    };
  }

  const from: Point = { x: point.x1 ?? 0, y: point.y1 ?? 0, color, size };
  const to: Point = { x: point.x2 ?? 0, y: point.y2 ?? 0, color, size };
  const samePoint = from.x === to.x && from.y === to.y;

  return {
    mode: point.mode,
    points: samePoint ? [from] : [from, to],
    cap,
    join,
    tolerance: 30,
  };
}

/**
 * Stacks section thumbnails (data URLs) top/mid/bot into one corpse thumbnail.
 * Used when a corpse is assembled so the gallery never renders three panels.
 */
export async function composeThumbs(thumbs: (string | null | undefined)[]): Promise<string> {
  // Native module: import lazily so the rest of the app can run on hosts where
  // node-canvas is unavailable (Netlify functions, for example).
  const { createCanvas, loadImage } = await import("canvas");
  const images = await Promise.all(
    thumbs.map((thumb) => (thumb ? loadImage(thumb) : Promise.resolve(null)))
  );
  const present = images.filter((image) => image !== null);

  if (present.length === 0) return "";

  const width = Math.max(...present.map((image) => image.width));
  const height = present.reduce(
    (sum, image) => sum + Math.round((image.height * width) / image.width),
    0
  );

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let y = 0;
  for (const image of images) {
    if (!image) continue;
    const h = Math.round((image.height * width) / image.width);
    ctx.drawImage(image, 0, y, width, h);
    y += h;
  }

  return canvas.toDataURL("image/png");
}
