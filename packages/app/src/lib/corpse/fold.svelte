<script lang="ts">
  import type { SectionType } from "@ecc/firestore";
  import { untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import type { BackId } from "./backs.ts";
  import Drawing from "./drawing.svelte";
  import { foldedAngle, type FoldPlan, type Hinge } from "./folds.ts";
  import { TYPES, type Panels } from "./types.ts";

  type Props = {
    panels: Panels;
    plan: FoldPlan;
    /** Start unfolding after this many ms. */
    delay?: number;
    /** Time each hinge takes to open. */
    step?: number;
    onunfolded?: () => void;
    /** Folded or open. Changing it animates: folding closes hinges in reverse order. */
    open?: boolean;
    onfolded?: () => void;
    /**
     * Controlled mode: how many hinges (in the plan's order) are open. When
     * set, nothing plays by itself — the caller folds and unfolds.
     */
    progress?: number;
    /** What the back of the paper looks like (see backs.ts). */
    back?: BackId;
    /** Turn the whole sheet over: top-over-bottom ("v") or side-to-side ("h"). */
    flip?: "h" | "v" | null;
  };

  let {
    panels,
    plan,
    delay = 250,
    step = 480,
    onunfolded,
    open = true,
    onfolded,
    progress,
    back = "plain",
    flip = null,
  }: Props = $props();

  const opened = new SvelteSet<SectionType>();

  const children = (parent: SectionType): Hinge[] => plan.hinges.filter((hinge) => hinge.parent === parent);

  // One-off marks on the back (the stamp) go on the flap you see first while
  // the sheet is folded — the first to open — not on every panel.
  const marked = $derived(plan.order[0]);

  /**
   * Each crease remembers which way it was folded: toward the viewer leaves a
   * valley, behind leaves a mountain. Keyed by the panel below the crease.
   */
  const creases = $derived.by(() => {
    const below: Partial<Record<SectionType, "valley" | "mountain">> = {};
    for (const hinge of plan.hinges) {
      const lower = TYPES.indexOf(hinge.panel) > TYPES.indexOf(hinge.parent) ? hinge.panel : hinge.parent;
      below[lower] = hinge.side === 1 ? "valley" : "mountain";
    }
    return below;
  });

  function transform(hinge: Hinge): string {
    if (opened.has(hinge.panel)) return "translateZ(0px) rotateX(0deg)";
    return `translateZ(${hinge.side * hinge.lift}px) rotateX(${foldedAngle(hinge)}deg)`;
  }

  // Open each hinge in the plan's (physically valid) order.
  $effect(() => {
    const order = plan.order;

    if (progress !== undefined) {
      // controlled: open exactly the first `progress` hinges; folding back
      // closes them in reverse, which is the only physical way
      const open = new Set(order.slice(0, progress));
      for (const type of order) {
        if (open.has(type)) opened.add(type);
        else opened.delete(type);
      }
      return;
    }

    // uncontrolled: animate toward `open`, one hinge at a time. Unfolding
    // follows the plan's order; folding is the same in reverse. Only hinges
    // not already in place are scheduled, so a mid-way toggle turns around.
    const wantOpen = open;
    const pending = untrack(() =>
      wantOpen ? order.filter((type) => !opened.has(type)) : [...order].reverse().filter((type) => opened.has(type))
    );
    const done = () => (wantOpen ? onunfolded : onfolded)?.();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const type of pending) wantOpen ? opened.add(type) : opened.delete(type);
      done();
      return;
    }

    // a fresh sheet waits a beat before opening; a toggle starts right away
    const start = wantOpen && untrack(() => opened.size) === 0 ? delay : 0;
    const gap = step + 40; // strictly one after another: a flap only moves once its parent is flat
    const timers = pending.map((type, index) =>
      setTimeout(() => (wantOpen ? opened.add(type) : opened.delete(type)), start + index * gap)
    );
    timers.push(setTimeout(done, start + (pending.length - 1) * gap + step));
    return () => timers.forEach(clearTimeout);
  });
</script>

<!--
  A corpse as a real folded sheet: one panel lies on the desk, the others are
  folded onto it with 3D hinges and open one by one in the plan's order.
-->
<div class="stage" style:--step="{step}ms" style:rotate="{plan.tilt}deg" data-back={back} data-flip={flip}>
  <!-- flip around the centre of the whole square: 1.5 slot-heights from its top -->
  <div
    class="slot"
    data-flipped={flip ?? undefined}
    style:top="{(TYPES.indexOf(plan.base) * 100) / 3}%"
    style:transform-origin="50% {(1.5 - TYPES.indexOf(plan.base)) * 100}%"
  >
    {@render panel(plan.base)}
  </div>
</div>

{#snippet panel(type: SectionType)}
  {@const drawing = panels[type]?.drawing}
  <div class="panel" data-type={type}>
    <div class="face front" data-crease={creases[type]} data-blank={drawing ? undefined : ""}>
      {#if drawing}<Drawing {drawing} />{/if}
    </div>
    <div class="face back" class:marked={type === marked}>
      {#if back === "bleed" && drawing}
        <!-- the ink seen through the paper: mirrored across the hinge, faint -->
        <div class="bleed"><Drawing {drawing} /></div>
      {/if}
    </div>
    {#each children(type) as hinge (hinge.panel)}
      <div class="hinge" data-edge={hinge.edge} style:transform={transform(hinge)}>
        {@render panel(hinge.panel)}
      </div>
    {/each}
  </div>
{/snippet}

<style>
  .stage {
    position: relative;
    aspect-ratio: 1;
    width: 100%;
    perspective: 1800px;
    transform-style: preserve-3d;
    transition: rotate 600ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .slot,
  .hinge,
  .panel {
    position: absolute;
    left: 0;
    width: 100%;
    transform-style: preserve-3d;
  }

  .slot {
    height: calc(100% / 3);
    transition: transform 900ms cubic-bezier(0.6, 0.05, 0.3, 1);
  }

  /* turn the sheet over: top-over-bottom, or side-to-side */
  .slot[data-flipped="v"] {
    transform: rotateX(180deg);
  }
  .slot[data-flipped="h"] {
    transform: rotateY(180deg);
  }

  .panel {
    top: 0;
    height: 100%;
  }

  .hinge {
    height: 100%;
    transition: transform var(--step) cubic-bezier(0.6, 0.05, 0.3, 1);
  }

  .hinge[data-edge="bottom"] {
    top: 100%;
    transform-origin: 50% 0;
  }

  .hinge[data-edge="top"] {
    bottom: 100%;
    transform-origin: 50% 100%;
  }

  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    background: #fff;
    border-inline: 2px solid var(--light-blue);
    box-shadow: 3px 0 0 0 var(--blue);
  }

  .face :global(canvas) {
    width: 100%;
    height: 100%;
  }

  /* a third nobody has drawn here (e.g. a section page before it unfolds
     into a creature): the draw page's "someone else's third" hatching */
  .front[data-blank] {
    background: repeating-linear-gradient(-45deg, var(--fold, #deebff) 0 6px, var(--paper, #fff) 6px 12px);
  }

  /* the outer edges of the whole sheet */
  [data-type="top"] > .front {
    border-top: 2px solid var(--light-blue);
  }

  /* panels overlap by a pixel so no seam shows between thirds */
  [data-type="mid"] > .face,
  [data-type="bot"] > .face {
    top: -1px;
  }

  /*
   * Creases are drawn over the drawing, not as a border (a border pushes the
   * drawing down and shows white dashes on coloured backgrounds). A valley
   * reads as a soft dark line; a mountain as a faint ridge of light.
   */
  .front[data-crease]::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 5px;
    pointer-events: none;
  }
  .front[data-crease="valley"]::after {
    background: linear-gradient(to bottom, rgba(35, 31, 32, 0.2) 0 1px, rgba(35, 31, 32, 0.05) 1px, transparent);
  }
  .front[data-crease="mountain"]::after {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0 1px, rgba(35, 31, 32, 0.06) 1px, transparent);
  }
  [data-type="bot"] > .face {
    border-bottom: 2px solid var(--light-blue);
    /* full-height right edge + bottom edge, so the shadow doesn't notch at the crease */
    box-shadow:
      3px 0 0 0 var(--blue),
      0 3px 0 0 var(--blue),
      3px 3px 0 0 var(--blue);
  }

  /* ---- the back of the paper ----
   * Every back sits on the same off-white with a faint crease shadow at the
   * folds (::after); [data-back] adds one quiet texture on top. */
  .back {
    transform: rotateX(180deg);
    overflow: hidden;
    background-color: #fbfcff;
    /* the hard shadow belongs to the drawing side only */
    box-shadow: none !important;
    border-block: none !important;
  }

  .back::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0, 100, 255, 0.06),
      transparent 28%,
      transparent 72%,
      rgba(0, 100, 255, 0.06)
    );
  }

  /* ink bleed-through: faint mirrored ghost of the drawing */
  .bleed {
    position: absolute;
    inset: 0;
    transform: scaleY(-1);
    opacity: 0.13;
    filter: grayscale(0.4) blur(0.6px);
  }

  .bleed :global(canvas) {
    width: 100%;
    height: 100%;
  }

  /* sky dots: the original background, very faint */
  [data-back="dots"] .back {
    background-image: radial-gradient(circle, rgba(0, 100, 255, 0.16) 1px, transparent 1.3px);
    background-size: 9px 9px;
  }

  /* graph paper */
  [data-back="graph"] .back {
    background-image:
      linear-gradient(rgba(0, 100, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 100, 255, 0.1) 1px, transparent 1px);
    background-size: 14px 14px;
  }

  /* ruled notebook: blue lines and one red margin */
  [data-back="ruled"] .back {
    background-image:
      linear-gradient(90deg, transparent 11%, rgba(244, 78, 59, 0.28) 11%, rgba(244, 78, 59, 0.28) calc(11% + 1px), transparent calc(11% + 1px)),
      linear-gradient(transparent calc(100% - 1px), rgba(0, 100, 255, 0.16) calc(100% - 1px));
    background-size:
      100% 100%,
      100% 16px;
  }

  /* security envelope: the tight mesh that hides what's inside */
  [data-back="envelope"] .back {
    background-image:
      repeating-linear-gradient(45deg, rgba(0, 100, 255, 0.1) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(-45deg, rgba(0, 100, 255, 0.08) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(90deg, rgba(35, 31, 32, 0.035) 0 2px, transparent 2px 7px);
  }

  /* a crooked ink stamp, once, on the outermost flap */
  [data-back="stamp"] .back.marked::before {
    content: "no peeking!";
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    rotate: -9deg;
    padding: 0.2em 0.7em;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: clamp(9px, 3.4cqw, 14px);
    font-weight: 600;
    letter-spacing: 0.06em;
    white-space: nowrap;
    color: rgba(244, 78, 59, 0.4);
    border: 2px solid rgba(244, 78, 59, 0.32);
    border-radius: 4px;
  }

  [data-back="stamp"] .back {
    container-type: inline-size;
  }

  /* backs are drawn the right way up for top-over-bottom; a side-to-side flip turns them half a turn */
  [data-flip="h"][data-back="stamp"] .back.marked::before {
    rotate: 171deg;
  }

  /* pencil scuffs: a couple of smudges and stray graphite strokes */
  [data-back="scuffs"] .back {
    background-image:
      radial-gradient(ellipse 22% 30% at 18% 62%, rgba(35, 31, 32, 0.06), transparent 70%),
      radial-gradient(ellipse 14% 22% at 82% 30%, rgba(35, 31, 32, 0.05), transparent 70%),
      linear-gradient(168deg, transparent 47%, rgba(35, 31, 32, 0.1) 47.3%, transparent 47.8%),
      linear-gradient(12deg, transparent 71%, rgba(35, 31, 32, 0.08) 71.2%, transparent 71.6%);
  }
</style>
