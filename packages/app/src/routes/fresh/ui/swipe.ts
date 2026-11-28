import type { Attachment } from "svelte/attachments";

type Options = {
  /** Finger moved left: usually "next". Omit (or return false) when there's nowhere to go. */
  left?: () => unknown;
  /** Finger moved right: usually "back". */
  right?: () => unknown;
  /** Move the element with the finger while dragging (off for whole pages). */
  follow?: boolean;
  /**
   * Fade with the drag. "out": a swipe that counts fades it away (the element
   * is being replaced; re-attach, e.g. by reading the item's id in the
   * attachment, to clear it for the next one). "drag": only while dragging,
   * it comes back when the swipe counts (the same element changes state).
   */
  fade?: "out" | "drag";
  /** Anything that identifies the current item: when it changes, the attachment re-runs (clearing a fade-out). */
  key?: unknown;
};

/** Past this, a release counts as a swipe… */
const DISTANCE = 64;
/** …or a quick flick past this speed (px/ms) and a shorter distance. */
const FLICK_SPEED = 0.45;
const FLICK_DISTANCE = 24;
/** iOS uses swipes from the very edge for its own back gesture. */
const EDGE = 24;

/**
 * Elements that faded out on a swipe and are waiting for the next item
 * (browsers without view transitions, where nothing else animates the swap):
 * the next attachment fades them back in.
 */
const fadedOut = new WeakSet<HTMLElement>();

const viewTransitions = () => typeof document !== "undefined" && "startViewTransition" in document;

/**
 * Horizontal swipes on touch screens (and pens), as an attachment:
 * `{@attach swipe({ left: next, right: back })}`. Vertical scrolling keeps
 * working (`touch-action: pan-y`), mice are ignored, and a swipe never also
 * counts as a tap on whatever is underneath.
 *
 * With `follow`, the element trails the finger (damped, with a little tilt)
 * and springs back if the swipe doesn't count. When it does count, the
 * element stays where the finger left it, so the navigation's own animation
 * (the toss, a fold) carries on from there.
 */
export function swipe(options: Options): Attachment<HTMLElement> {
  return (node) => {
    const previousTouchAction = node.style.touchAction;
    node.style.touchAction = "pan-y";

    // the next item arrived after a fade-out: fade it in
    if (fadedOut.has(node)) {
      fadedOut.delete(node);
      node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    }

    let start: { x: number; y: number; t: number; id: number } | null = null;
    let horizontal: boolean | null = null;
    let swallowClick = false;

    const reset = (animate: boolean) => {
      node.style.transition = animate
        ? "translate 380ms cubic-bezier(0.34, 1.56, 0.64, 1), rotate 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease"
        : "";
      node.style.translate = "";
      node.style.rotate = "";
      node.style.opacity = "";
    };

    const down = (event: PointerEvent) => {
      swallowClick = false;
      if (event.pointerType === "mouse" || !event.isPrimary) return;
      if (event.clientX < EDGE || event.clientX > window.innerWidth - EDGE) return;
      start = { x: event.clientX, y: event.clientY, t: performance.now(), id: event.pointerId };
      horizontal = null;
      if (options.follow) node.style.transition = "";
    };

    const move = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      // decide once, after a few pixels: a swipe, or a scroll
      if (horizontal === null && Math.hypot(dx, dy) > 8) horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
      if (!horizontal) return;
      // damped, and more so toward a side with nowhere to go
      const possible = dx < 0 ? options.left : options.right;
      const damp = possible ? 0.55 : 0.18;
      if (options.follow) {
        node.style.translate = `${dx * damp}px 0`;
        node.style.rotate = `${dx * damp * 0.025}deg`;
      }
      if (options.fade && possible) node.style.opacity = String(1 - Math.min(0.7, Math.abs(dx) / 260));
    };

    const up = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const speed = Math.abs(dx) / Math.max(1, performance.now() - start.t);
      const counts =
        horizontal === true && (Math.abs(dx) > DISTANCE || (speed > FLICK_SPEED && Math.abs(dx) > FLICK_DISTANCE));
      const action = dx < 0 ? options.left : options.right;
      start = null;

      if (horizontal) swallowClick = true; // a drag is never also a tap
      if (counts && action && options.fade === "out" && !viewTransitions()) {
        // no toss to carry it off: fade it away, then go
        node.style.transition = "opacity 140ms ease";
        node.style.opacity = "0";
        fadedOut.add(node);
        setTimeout(() => {
          if (action() === false) {
            fadedOut.delete(node);
            reset(true);
          }
        }, 150);
        setTimeout(() => node.isConnected && fadedOut.has(node) && reset(true), 1500);
        return;
      }
      if (counts && action && action() !== false) {
        if (options.fade === "drag") {
          node.style.transition = "opacity 200ms ease";
          node.style.opacity = "";
        }
        // spring back if nothing re-attached this element shortly after
        setTimeout(() => node.isConnected && reset(true), 900);
        return;
      }
      reset(true);
    };

    const cancel = () => {
      start = null;
      reset(true);
    };

    const click = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("click", click, true);

    return () => {
      // re-attached (e.g. the next item arrived): start clean, no transition
      reset(false);
      node.style.touchAction = previousTouchAction;
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", cancel);
      node.removeEventListener("click", click, true);
    };
  };
}
