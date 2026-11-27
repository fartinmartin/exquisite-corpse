<script lang="ts">
  import { untrack } from "svelte";
  import { Spring } from "svelte/motion";
  import { doodles as doodleState, type Press, type Release } from "./doodle-settings.svelte.ts";
  import { tint } from "./ink.ts";

  type Doodle = { id: string; thumb: string };
  type Props = { doodles: Doodle[] };

  let { doodles }: Props = $props();

  const COUNT = 9;

  // Spots around the edges of the viewport (vw/vh), so the centre stays clear.
  const SPOTS = [
    { x: 1, y: 14, w: 17, r: -9, d: 9 },
    { x: 79, y: 10, w: 15, r: 7, d: 11 },
    { x: 3, y: 52, w: 13, r: 5, d: 8 },
    { x: 83, y: 44, w: 16, r: -6, d: 10 },
    { x: 0, y: 84, w: 15, r: 8, d: 12 },
    { x: 80, y: 80, w: 17, r: -4, d: 9 },
    { x: 60, y: 1, w: 11, r: 11, d: 13 },
    { x: 24, y: 2, w: 10, r: -12, d: 10 },
    { x: 66, y: 93, w: 12, r: -8, d: 11 },
  ];

  const byId = $derived(Object.fromEntries(doodles.map((doodle) => [doodle.id, doodle])));

  // Every section becomes a faint sky-blue watermark, so filled and line drawings sit back equally.
  let tinted = $state<Record<string, string>>({});

  $effect(() => {
    for (const doodle of doodles) {
      if (tinted[doodle.id]) continue;
      tint(doodle.id, doodle.thumb).then((src) => (tinted[doodle.id] = src));
    }
  });

  // Nine on screen; one swaps every few seconds so every section gets a turn.
  let shown = $state<string[]>([]);

  $effect(() => {
    shown = doodles.map((doodle) => doodle.id).slice(0, COUNT);
  });

  $effect(() => {
    const timer = setInterval(() => {
      if (doodleState.scattered) return;
      const hidden = doodles.map((doodle) => doodle.id).filter((id) => !shown.includes(id));
      if (hidden.length === 0) return;
      const next = [...shown];
      next[Math.floor(Math.random() * next.length)] = hidden[Math.floor(Math.random() * hidden.length)];
      shown = next;
    }, 6000);
    return () => clearInterval(timer);
  });

  /*
   * Press, hold, release. Pressing leans every doodle toward the press point,
   * slowly, so a long hold winds them up (and squashes them a little). Letting
   * go flings them the other way, scaled by how long you held, and they wobble
   * back to rest on an underdamped spring.
   */
  type Phase = "rest" | "hold" | "fling" | "settle";
  let phase = $state<Phase>("rest");
  let jiggle = $state(SPOTS.map(() => ({ x: 0, y: 0, r: 0 })));
  let innerWidth = $state(1280);

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Unit vector from a doodle's centre toward a point on screen. */
  function toward(slot: number, point: { x: number; y: number }) {
    const spot = SPOTS[slot];
    const width = Math.min(260, Math.max(96, (spot.w / 100) * innerWidth));
    const cx = (spot.x / 100) * innerWidth + width / 2;
    const cy = (spot.y / 100) * innerHeight + parallax(spot) + width / 6;
    const dx = point.x - cx;
    const dy = point.y - cy;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length, near: Math.max(0.35, 1 - length / Math.max(innerWidth, innerHeight)) };
  }

  function hold(press: Press) {
    phase = "hold";
    jiggle = SPOTS.map((_, slot) => {
      const dir = toward(slot, press);
      return { x: dir.x * 14 * dir.near, y: dir.y * 14 * dir.near, r: dir.x * 3 };
    });
  }

  let timers: ReturnType<typeof setTimeout>[] = [];

  function fling(release: Release) {
    for (const timer of timers) clearTimeout(timer);
    const push = 10 + release.strength * 46;
    const spin = 2 + release.strength * 12;
    phase = "fling";
    jiggle = SPOTS.map((_, slot) => {
      const dir = toward(slot, release);
      const side = Math.random() < 0.5 ? -1 : 1;
      return { x: -dir.x * push * dir.near, y: -dir.y * push * dir.near, r: side * spin * (0.6 + Math.random() * 0.4) };
    });
    timers = [
      setTimeout(() => {
        phase = "settle";
        jiggle = SPOTS.map(() => ({ x: 0, y: 0, r: 0 }));
      }, 160),
      setTimeout(() => (phase = "rest"), 160 + 1400),
    ];
  }

  // Only a new press or release triggers these; the layout reads inside
  // (size, scroll) are untracked so scrolling doesn't re-fling.
  $effect(() => {
    const press = doodleState.held;
    if (press && !reducedMotion()) untrack(() => hold(press));
  });

  $effect(() => {
    const release = doodleState.released;
    if (release && !reducedMotion()) untrack(() => fling(release));
  });

  $effect(() => () => timers.forEach(clearTimeout));

  /** An underdamped spring as a CSS linear() easing: overshoots and wobbles a few times. */
  const SPRING = `linear(${Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return (1 - Math.exp(-5 * t) * Math.cos(13 * t)).toFixed(3);
  }).join(", ")})`;

  // Scroll: doodles move up with the page on a spring and wrap round the viewport.
  let scrollY = $state(0);
  let innerHeight = $state(800);
  const scrolled = new Spring(0, { stiffness: 0.06, damping: 0.55 });

  $effect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrolled.set(scrollY, { instant: reduced });
  });

  /** Bigger doodles move more, like they're closer. Off the top, they re-enter from below. */
  function parallax(spot: (typeof SPOTS)[number]): number {
    const depth = 0.12 + ((spot.w - 10) / 7) * 0.28;
    const top = (spot.y / 100) * innerHeight;
    const span = innerHeight + 240;
    const moved = top - scrolled.current * depth + 120;
    return ((((moved % span) + span) % span) - 120) - top;
  }

  /** Scattered: each doodle slides out past its nearest side edge. */
  function offset(slot: number) {
    const spot = SPOTS[slot];
    const nudge = jiggle[slot];
    if (!doodleState.scattered) return `${nudge.x}px ${nudge.y}px`;
    return `${spot.x < 50 ? -45 : 45}vw ${(spot.y - 50) * 0.3}vh`;
  }
</script>

<!--
  Loose doodles: sections other people drew, tinted sky blue and scattered
  around the edge of the page. They drift, follow scroll on a spring, jiggle
  when you tap, and leave while you draw.
-->
<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<div
  class="field"
  aria-hidden="true"
  data-scattered={doodleState.scattered || undefined}
  data-phase={phase}
  style:--spring={SPRING}
>
  {#each shown as id, slot (id)}
    {@const spot = SPOTS[slot]}
    {#if byId[id] && tinted[id] && spot}
      <span
        class="doodle"
        style:left="{spot.x}vw"
        style:top="calc({spot.y}vh + {parallax(spot)}px)"
        style:width="clamp(96px, {spot.w}vw, 260px)"
        style:--r="{spot.r + jiggle[slot].r}deg"
        style:--d="{spot.d}s"
        style:translate={offset(slot)}
        style:animation-delay="0s, -{slot * 1.7}s"
      >
        <img src={tinted[id]} alt="" />
      </span>
    {/if}
  {/each}
</div>

<style>
  .field {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    mix-blend-mode: multiply;
  }

  .doodle {
    position: absolute;
    aspect-ratio: 3 / 1;
    rotate: var(--r);
    opacity: 0.45;
    animation: appear 500ms ease-out backwards;
    transition:
      translate 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
      rotate 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 300ms ease;
  }

  /* press and hold: a slow lean toward the press point and a slight squash (anticipation) */
  @property --tension {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }

  .field {
    --tension: 0;
    transition: --tension 250ms ease-out;
  }

  .field[data-phase="hold"] {
    --tension: 1;
    transition: --tension 1200ms cubic-bezier(0.3, 0, 0.6, 1);
  }

  [data-phase="hold"] .doodle {
    transition:
      translate 1200ms cubic-bezier(0.3, 0, 0.6, 1),
      rotate 1200ms cubic-bezier(0.3, 0, 0.6, 1),
      opacity 300ms ease;
  }

  /* let go: out fast… */
  [data-phase="fling"] .doodle {
    transition:
      translate 160ms cubic-bezier(0.2, 0.8, 0.3, 1),
      rotate 160ms cubic-bezier(0.2, 0.8, 0.3, 1),
      opacity 300ms ease;
  }

  /* …and wobble home */
  [data-phase="settle"] .doodle {
    transition:
      translate 1400ms var(--spring),
      rotate 1400ms var(--spring),
      opacity 300ms ease;
  }

  .doodle img {
    scale: calc(1 - var(--tension) * 0.06);
  }

  /* leaving for drawing mode: quicker, no bounce */
  [data-scattered] .doodle {
    opacity: 0;
    transition:
      translate 400ms cubic-bezier(0.55, 0, 0.75, 0.2),
      opacity 350ms ease;
  }

  .doodle img {
    display: block;
    width: 100%;
    height: 100%;
  }

  @keyframes appear {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .doodle {
      animation:
        appear 500ms ease-out backwards,
        drift var(--d) ease-in-out infinite alternate;
    }
  }

  @keyframes drift {
    from {
      transform: translate(0, 0) rotate(0deg);
    }
    to {
      transform: translate(6px, -10px) rotate(2deg);
    }
  }

  /* phones: fewer, quieter doodles */
  @media (max-width: 719px) {
    .doodle:nth-child(n + 5) {
      display: none;
    }
    .doodle {
      opacity: 0.3;
    }
  }
</style>
