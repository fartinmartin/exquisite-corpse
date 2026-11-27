<script lang="ts">
  import { Spring } from "svelte/motion";
  import { doodles as doodleState } from "./doodle-settings.svelte.ts";
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

  // A small shuffle on every tap.
  let jiggle = $state(SPOTS.map(() => ({ x: 0, y: 0, r: 0 })));

  $effect(() => {
    if (doodleState.pulse === 0) return;
    jiggle = SPOTS.map(() => ({
      x: (Math.random() * 2 - 1) * 16,
      y: (Math.random() * 2 - 1) * 16,
      r: (Math.random() * 2 - 1) * 7,
    }));
  });

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
<svelte:window bind:scrollY bind:innerHeight />

<div class="field" aria-hidden="true" data-scattered={doodleState.scattered || undefined}>
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
