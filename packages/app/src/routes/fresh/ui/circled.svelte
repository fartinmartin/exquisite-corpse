<script lang="ts">
  import { tick, untrack } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import { LOOPS, MOVES, pickIndex, placeLoop } from "./loops.ts";

  type Props = {
    /** A drawn pencil after the label, with a move of its own. */
    pencil?: boolean;
    /** A closer loop, for tight spots (the phone's tool dock). */
    snug?: boolean;
  };

  let { pencil = false, snug = false }: Props = $props();

  /** How far the loop's box reaches past the button. */
  const pad = $derived(snug ? { x: 6, y: 6 } : { x: 14, y: 9 });
  /** Where the pencil's nib rests, in its 28×18 box. */
  const NIB = { x: 8.5, y: 16 };

  let width = $state(0);
  let height = $state(0);
  /** Picked in the browser only, so the server's page doesn't disagree. */
  let pick = $state<{ loop: number; move: number; tilt: number } | null>(null);

  const move = $derived(pick ? MOVES[pick.move] : null);
  const d = $derived(
    pick && width ? placeLoop(LOOPS[pick.loop], width + pad.x * 2, height + pad.y * 2, pick.tilt) : ""
  );

  let loop: SVGPathElement;
  let holder = $state<HTMLElement>();

  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- drawing: each run cancels the one before ----
  let run = 0;
  let running = false;

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  /** Calls `step` with 0→1 over `ms`; false if a newer run took over. */
  function tween(ms: number, token: number, step: (t: number) => void): Promise<boolean> {
    return new Promise((resolve) => {
      let start = 0;
      const frame = (now: number) => {
        if (token !== run) return resolve(false);
        start ||= now;
        const t = Math.min(1, (now - start) / ms);
        step(ease(t));
        if (t < 1) requestAnimationFrame(frame);
        else resolve(true);
      };
      requestAnimationFrame(frame);
    });
  }

  /** How much of a line is drawn, 0–1. */
  function ink(path: SVGPathElement, t: number) {
    path.style.strokeDashoffset = String(1 - t);
    path.style.opacity = t > 0.001 ? "1" : "0";
  }

  /** Moves the pencil from rest, in its own units, with an optional writing wobble. */
  function hand(x: number, y: number, wobble = 0) {
    holder
      ?.querySelector(".nib")
      ?.setAttribute("transform", `translate(${x} ${y}) rotate(${wobble} ${NIB.x} ${NIB.y})`);
  }

  const lines = () => [...(holder?.querySelectorAll<SVGPathElement>(".line") ?? [])];

  const loopTime = (path: SVGPathElement) => Math.min(1100, 260 + path.getTotalLength() * 1.5);

  /** The pencil circles the word: its nib rides the end of the line, then parks. */
  async function circle(at: HTMLElement, token: number) {
    const unit = at.offsetWidth / 28;
    // the resting nib, in the loop's coordinates
    const rest = { x: at.offsetLeft + NIB.x * unit + pad.x, y: at.offsetTop + NIB.y * unit + pad.y };
    const length = loop.getTotalLength();
    const nibAt = (distance: number) => {
      const point = loop.getPointAtLength(distance);
      return { x: (point.x - rest.x) / unit, y: (point.y - rest.y) / unit };
    };
    const start = nibAt(0);
    if (!(await tween(220, token, (t) => hand(start.x * t, start.y * t)))) return;
    const drawn = await tween(loopTime(loop), token, (t) => {
      ink(loop, t);
      const point = nibAt(length * t);
      hand(point.x, point.y);
    });
    if (!drawn) return;
    const end = nibAt(length);
    await tween(280, token, (t) => hand(end.x * (1 - t), end.y * (1 - t)));
  }

  /** The pencil's own flourish: each stroke in turn, hopping between them. */
  async function flourish(token: number) {
    let at = { x: 0, y: 0 };
    for (const line of lines()) {
      const length = line.getTotalLength();
      const begin = line.getPointAtLength(0);
      const from = at;
      const to = { x: begin.x - NIB.x, y: begin.y - NIB.y };
      const hopped = await tween(150, token, (t) =>
        hand(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 2)
      );
      if (!hopped) return;
      const drawn = await tween(Math.min(650, 90 + length * 12), token, (t) => {
        ink(line, t);
        const point = line.getPointAtLength(length * t);
        at = { x: point.x - NIB.x, y: point.y - NIB.y };
        hand(at.x, at.y, Math.sin(t * Math.PI * 5) * 5);
      });
      if (!drawn) return;
    }
    const from = at;
    await tween(200, token, (t) => hand(from.x * (1 - t), from.y * (1 - t) - Math.sin(t * Math.PI) * 2));
  }

  /** Draws the current pick from nothing, after `delay` ms. */
  async function play(delay = 0) {
    const token = ++run;
    running = true;
    await tick(); // the pick's paths are in the page
    if (token !== run) return;
    const done = still();
    hand(0, 0);
    ink(loop, done ? 1 : 0);
    for (const line of lines()) ink(line, done ? 1 : 0);
    if (!done) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      if (token !== run) return;
      if (holder && move?.circles) await circle(holder, token);
      else if (await tween(loopTime(loop), token, (t) => ink(loop, t))) await flourish(token);
    }
    if (token === run) running = false;
  }

  /**
   * Sits inside the button or link it marks: picks a loop, sizes it to the
   * button, draws it on arrival, and draws it again when pointed at or tabbed to.
   */
  const mark: Attachment<SVGSVGElement> = (node) =>
    untrack(() => {
      const button = node.parentElement!;
      const measure = () => ((width = button.offsetWidth), (height = button.offsetHeight));
      const observer = new ResizeObserver(measure);
      observer.observe(button);
      measure();

      const again = () => {
        if (running || still() || button.matches(':disabled, [aria-current="page"]')) return;
        void play();
      };
      // not for fingers: a tap is on its way somewhere
      const enter = (event: PointerEvent) => event.pointerType !== "touch" && again();
      const focus = () => button.matches(":focus-visible") && again();
      button.addEventListener("pointerenter", enter);
      button.addEventListener("focus", focus);

      pick = {
        loop: pickIndex(LOOPS.length),
        move: pickIndex(MOVES.length),
        tilt: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 3),
      };
      void play(400);

      return () => {
        run++;
        observer.disconnect();
        button.removeEventListener("pointerenter", enter);
        button.removeEventListener("focus", focus);
      };
    });

  // The pencil can come and go (the nav drops it while you're drawing). It
  // comes back with a new move; leaving, the loop just stays as it is.
  let had: boolean | undefined;
  $effect(() => {
    const has = pencil;
    untrack(() => {
      if (had === false && has && pick) {
        pick = { ...pick, move: pickIndex(MOVES.length, pick.move) };
        void play();
      } else if (had && !has) {
        run++;
        running = false;
        ink(loop, 1);
      }
      had = has;
    });
  });
</script>

<svg
  class="loop"
  {@attach mark}
  style:left="{-pad.x}px"
  style:top="{-pad.y}px"
  width={width + pad.x * 2}
  height={height + pad.y * 2}
  aria-hidden="true"
>
  <path bind:this={loop} {d} pathLength="1" />
</svg>
{#if pencil}
  <span class="holder" bind:this={holder}>
    <svg class="pencil" viewBox="0 0 28 18" aria-hidden="true">
      {#each move?.strokes ?? [] as stroke (stroke)}
        <path class="line" d={stroke} pathLength="1" />
      {/each}
      <g class="nib">
        <!-- body, ferrule, point -->
        <path d="M10.2 11.6 C 14 8.2, 18.4 4.6, 22.3 1.8 C 23.6 2.4, 24.6 3.4, 25.3 4.7 C 21.4 7.6, 17.2 11.1, 13.3 14.4" />
        <path d="M20.4 3.2 C 21.6 3.9, 22.6 4.9, 23.3 6.1" />
        <path d="M10.2 11.6 C 9.5 13.1, 8.9 14.6, 8.5 16 C 10.1 15.6, 11.8 15.1, 13.3 14.4" />
      </g>
    </svg>
  </span>
{/if}

<style>
  path {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .loop {
    position: absolute;
    overflow: visible;
    pointer-events: none;
  }

  /* drawn by moving the dash along (pathLength 1); hidden until then */
  .loop path,
  .line {
    stroke-dasharray: 1 2;
    opacity: 0;
  }

  .loop path {
    stroke: var(--orange);
    stroke-width: 2.1;
  }

  /* one width for every move, so a new one never nudges the layout */
  .holder {
    display: inline-block;
    flex: none;
    width: 1.35em;
    height: 0.9em;
    margin-left: 0.5em;
  }

  .pencil {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .pencil path {
    stroke: currentColor;
    stroke-width: 1.7;
  }
</style>
