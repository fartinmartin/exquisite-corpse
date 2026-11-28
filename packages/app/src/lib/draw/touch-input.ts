/**
 * Touch input in front of canvas-paint, which on its own draws with
 * whatever `touches[0]` is. This sits in the capture phase on the paint's
 * root, decides what a touch means, and forwards only real strokes to the
 * brush's own handlers (which accept duck-typed events):
 *
 * - **A pen** draws straight away: Apple Pencil (`touchType === "stylus"`,
 *   Safari) or any stylus that reports `pointerType: "pen"` (Chrome, Android,
 *   Windows; the pointer event arrives just before its touch event). Once a
 *   pencil has touched, fingers and palms no longer draw (palm rejection);
 *   they can still do the gestures below.
 * - **One finger** draws, starting a beat late (≤70ms, or once it moves 6px)
 *   so a second finger can still turn it into a gesture without leaving a
 *   dot. The stroke starts from where the finger first landed, so nothing
 *   is lost.
 * - **Two-finger tap** undoes, **three-finger tap** redoes (Procreate's
 *   convention): fingers down and up within 400ms, barely moving.
 *
 * Pressure isn't used: canvas-paint renders a stroke at one width (its first
 * point's), so varying it per point would need a renderer change.
 */

type Brush = {
  handleDown(event: unknown): void;
  handleMove(event: unknown): void;
  handleUp(event: unknown): void;
  handleLeave(event: unknown): void;
};

type Options = {
  undo: () => void;
  redo: () => void;
};

const HOLD_MS = 70;
const HOLD_PX = 6;
const TAP_MS = 400;
const TAP_PX = 20;

type Point = { id: number; pageX: number; pageY: number };

const isPen = (touch: Touch) => (touch as Touch & { touchType?: string }).touchType === "stylus";

/** canvas-paint reads `touches[0].pageX/Y` and calls `preventDefault()`. */
const fake = (point?: Point) => ({
  preventDefault() {},
  touches: point ? [{ pageX: point.pageX, pageY: point.pageY }] : [],
});

const find = (list: TouchList, id: number): Touch | undefined => [...list].find((touch) => touch.identifier === id);

export function attachTouchInput(root: HTMLElement, brush: Brush, options: Options): () => void {
  let penSeen = false;
  /** A pen pointer is down right now (for browsers without `touchType`). */
  let penDown = false;
  /** The touch currently drawing a stroke. */
  let drawing: number | null = null;
  /** A single finger that hasn't committed to drawing yet. */
  let pending: (Point & { t: number }) | null = null;
  /** A multi-finger gesture in progress. */
  let gesture: { most: number; t: number; x: number; y: number; moved: number } | null = null;

  const point = (touch: Touch): Point => ({ id: touch.identifier, pageX: touch.pageX, pageY: touch.pageY });

  function begin(at: Point) {
    drawing = at.id;
    pending = null;
    brush.handleDown(fake(at));
  }

  function track(event: TouchEvent) {
    const first = event.touches[0] ?? event.changedTouches[0];
    if (!gesture) gesture = { most: event.touches.length, t: event.timeStamp, x: first.pageX, y: first.pageY, moved: 0 };
    gesture.most = Math.max(gesture.most, event.touches.length);
  }

  function pointer(event: PointerEvent) {
    if (event.pointerType !== "pen") return;
    penDown = event.type === "pointerdown";
    if (penDown) penSeen = true;
  }

  function start(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    const pen = [...event.changedTouches].find(isPen) ?? (penDown ? event.changedTouches[0] : undefined);
    if (pen) penSeen = true;

    if (pen) {
      pending = null;
      gesture = null;
      if (drawing === null) begin(point(pen));
      return;
    }

    // fingers (or a palm)
    if (drawing !== null) return; // already drawing: extra fingers don't interrupt
    if (penSeen || gesture || event.touches.length > 1) {
      pending = null;
      track(event);
      return;
    }
    const touch = event.changedTouches[0];
    pending = { ...point(touch), t: event.timeStamp };
  }

  function move(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (drawing !== null) {
      const touch = find(event.touches, drawing);
      if (touch) brush.handleMove(fake(point(touch)));
      return;
    }

    if (pending) {
      const touch = find(event.touches, pending.id);
      if (!touch) return;
      const far = Math.hypot(touch.pageX - pending.pageX, touch.pageY - pending.pageY) > HOLD_PX;
      if (far || event.timeStamp - pending.t > HOLD_MS) {
        begin(pending);
        brush.handleMove(fake(point(touch)));
      }
      return;
    }

    if (gesture) {
      const touch = event.touches[0];
      if (touch) gesture.moved = Math.max(gesture.moved, Math.hypot(touch.pageX - gesture.x, touch.pageY - gesture.y));
    }
  }

  function end(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (drawing !== null && find(event.changedTouches, drawing)) {
      brush.handleUp(fake());
      drawing = null;
      return;
    }

    if (pending && find(event.changedTouches, pending.id)) {
      // a quick single tap: a dot
      begin(pending);
      brush.handleUp(fake());
      drawing = null;
      return;
    }

    if (gesture && event.touches.length === 0) {
      const quick = event.timeStamp - gesture.t < TAP_MS && gesture.moved < TAP_PX;
      if (quick && gesture.most === 2) options.undo();
      else if (quick && gesture.most >= 3) options.redo();
      gesture = null;
    }
  }

  function cancel(event: TouchEvent) {
    event.stopPropagation();
    if (drawing !== null) brush.handleLeave(fake());
    drawing = null;
    pending = null;
    gesture = null;
  }

  const listen = { capture: true, passive: false } as const;
  for (const type of ["pointerdown", "pointerup", "pointercancel"] as const) root.addEventListener(type, pointer, true);
  root.addEventListener("touchstart", start, listen);
  root.addEventListener("touchmove", move, listen);
  root.addEventListener("touchend", end, listen);
  root.addEventListener("touchcancel", cancel, listen);

  return () => {
    for (const type of ["pointerdown", "pointerup", "pointercancel"] as const) root.removeEventListener(type, pointer, true);
    root.removeEventListener("touchstart", start, listen);
    root.removeEventListener("touchmove", move, listen);
    root.removeEventListener("touchend", end, listen);
    root.removeEventListener("touchcancel", cancel, listen);
  };
}
