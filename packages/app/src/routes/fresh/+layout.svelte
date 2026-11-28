<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import DoodleField from "./doodle-field.svelte";
  import { doodles as doodleState } from "./doodle-settings.svelte.ts";
  import { doodles } from "./doodles.remote";
  import Pencil from "./ui/pencil.svelte";
  import { learned } from "./ui/learned.svelte.ts";
  import { highlight } from "./ui/marks.ts";

  let { children } = $props();

  const field = $derived(await doodles());


  $effect(() => learned.load());

  /*
   * Creature to creature (home, /c/[id], "another", back/forward): the sheet
   * is tossed aside and the next one lands, still folded, then unfolds. Back
   * runs it the other way. Only between creature views: other navigations
   * just swap. Browsers without view transitions swap too.
   */
  const CREATURE_ROUTES = new Set(["/fresh", "/fresh/c/[id]"]);

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!CREATURE_ROUTES.has(navigation.from?.route.id ?? "") || !CREATURE_ROUTES.has(navigation.to?.route.id ?? "")) return;
    if (navigation.from?.url.href === navigation.to?.url.href) return;

    const back = navigation.type === "popstate" && navigation.delta < 0;
    document.documentElement.dataset.toss = back ? "back" : "forward";
    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      transition.finished.finally(() => delete document.documentElement.dataset.toss);
    });
  });

  let headerHeight = $state(72);
  const drawing = $derived(page.url.pathname.startsWith("/fresh/draw"));
  const looking = $derived(page.url.pathname.startsWith("/fresh/look"));

  // Doodles wind up while you hold a press and spring away when you let go.
  function pressed(event: PointerEvent) {
    if (event.isPrimary) doodleState.press(event.clientX, event.clientY);
  }

  function released(event: PointerEvent) {
    if (event.isPrimary) doodleState.release();
  }
</script>

<svelte:window
  onpointerdown={pressed}
  onpointerup={released}
  onpointercancel={released}
  onblur={() => doodleState.release()}
/>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
  />
</svelte:head>

<div class="fresh" style:--header="{headerHeight}px">
  <DoodleField doodles={field} />

  <header bind:clientHeight={headerHeight}>
    <a class="mark" href="/fresh">exquisite corpse club</a>
    <nav>
      <a class="squiggle" href="/fresh/look" aria-current={looking ? "page" : undefined}>look</a>
      <!-- the one call to action, on every page -->
      <a class="hl cta" href="/fresh/draw" style={highlight("draw")} aria-current={drawing ? "page" : undefined}>draw{#if !drawing}<Pencil />{/if}</a>
    </nav>
  </header>


  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  /*
   * /fresh — a from-scratch take.
   * One idea: a sheet of paper on a sky-blue desk, doodles drifting around it.
   * One framed object per page (the paper). Everything else is plain type.
   */
  :global(html:has(.fresh)) {
    --ink: #231f20;
    --ink-soft: #6d7690;
    --sky: #deebff;
    --sky-line: #b9d0f7;
    --blue: #0064ff;
    --light-blue: #81b2ff;
    --yellow: #fcda00;
    --orange: #fb9200;
    --red: #f44e3b;
    --green: #a4dd00;
    --marker: rgba(252, 218, 0, 0.6);

    --sans: "IBM Plex Sans", system-ui, sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, monospace;

    /* the paper keeps the original signature: light-blue edge, blue hard shadow */
    --tone-blue-border: var(--light-blue);
    --tone-blue-shadow: var(--blue);
    --crease: var(--light-blue);

    /* tokens the shared paper/drawing components (lib/corpse, lib/draw) read */
    --paper: #ffffff;
    --paper-ink: var(--ink);
    --fold: var(--sky);
    --fold-ink: var(--blue);
    --surface-sunk: var(--sky);
    --text-muted: var(--ink-soft);
    --focus: var(--blue);
    --tone-yellow-border: var(--yellow);
    --font-ui: var(--mono);
    --s-2: 8px;
    --s-3: calc(40px / 3);
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

    font-family: var(--sans);
    color: var(--ink);
    word-spacing: 0;
  }

  /* /fresh lays out its own page; drop the old site's padded, centred #app */
  :global(html:has(.fresh) #app) {
    display: block;
    /* place-items also centres (and shrinks) block children in current browsers */
    place-items: normal;
    padding: 0;
    /* svh, not vh: on phones vh is the height with the address bar hidden,
       so anything 100vh tall scrolls by the bar's height */
    min-height: 100svh;
  }

  /* The drawing sheet: one continuous surface the thirds sit on, creased by
     dashed folds rather than split into boxes. Light-blue edge, blue hard shadow. */
  :global(:where(.fresh) .paper) {
    color: var(--paper-ink);
    background: var(--paper);
    border: 2px solid var(--tone-blue-border);
    box-shadow: 2px 2px 0 0 var(--tone-blue-shadow);
    overflow: clip;
  }

  /* zero-specificity base, so page styles always win */
  :global(:where(.fresh) :where(h1, h2, h3)) {
    font-size: inherit;
    line-height: 1.2;
  }

  :global(:where(.fresh) :where(p)) {
    line-height: 1.5;
  }

  /* a full-height column, so a page can sit in the middle of what's under the header */
  .fresh {
    position: relative;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
  }

  /* ---- toss: one creature out, the next one in (see onNavigate) ---- */
  :global(html[data-toss]::view-transition-old(root)),
  :global(html[data-toss]::view-transition-new(root)) {
    animation: none;
  }

  :global(html[data-toss]::view-transition-old(creature-meta)) {
    animation: 140ms ease-in both toss-fade-out;
  }

  :global(html[data-toss]::view-transition-new(creature-meta)) {
    animation: 220ms ease-out 160ms both toss-fade-in;
  }

  :global(html[data-toss="forward"]::view-transition-old(creature)) {
    animation: 260ms cubic-bezier(0.55, 0, 0.75, 0.2) both toss-out-left;
  }
  :global(html[data-toss="forward"]::view-transition-new(creature)) {
    animation: 420ms cubic-bezier(0.2, 0.9, 0.3, 1.15) 120ms both toss-in-right;
  }
  :global(html[data-toss="back"]::view-transition-old(creature)) {
    animation: 260ms cubic-bezier(0.55, 0, 0.75, 0.2) both toss-out-right;
  }
  :global(html[data-toss="back"]::view-transition-new(creature)) {
    animation: 420ms cubic-bezier(0.2, 0.9, 0.3, 1.15) 120ms both toss-in-left;
  }

  @keyframes -global-toss-out-left {
    to {
      transform: translateX(-14vw) rotate(-9deg) scale(0.86);
      opacity: 0;
    }
  }
  @keyframes -global-toss-out-right {
    to {
      transform: translateX(14vw) rotate(9deg) scale(0.86);
      opacity: 0;
    }
  }
  @keyframes -global-toss-in-right {
    from {
      transform: translateX(10vw) rotate(7deg) scale(0.9);
      opacity: 0;
    }
  }
  @keyframes -global-toss-in-left {
    from {
      transform: translateX(-10vw) rotate(-7deg) scale(0.9);
      opacity: 0;
    }
  }
  @keyframes -global-toss-fade-out {
    to {
      opacity: 0;
    }
  }
  @keyframes -global-toss-fade-in {
    from {
      opacity: 0;
    }
  }

  header,
  .content {
    position: relative;
    z-index: 1;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 24px;
    padding: 24px clamp(20px, 4vw, 48px);
  }

  .mark {
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  nav {
    display: flex;
    align-items: baseline;
    gap: 20px;
    font-family: var(--mono);
    font-size: 0.875rem;
  }

  /* the page you're on keeps its squiggle in blue */
  nav .squiggle[aria-current="page"] {
    color: var(--blue);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='4' viewBox='0 0 16 4'%3E%3Cpath d='M0 2 Q 4 0.2 8 2 T 16 2' fill='none' stroke='%230064ff' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  }

  /* draw is a highlighter, in the sans like the other calls to action */
  nav .cta {
    font-family: var(--sans);
    font-size: 1rem;
    font-weight: 600;
  }

  /* already drawing: the mark stays, but it doesn't invite you again */
  nav .cta[aria-current="page"]::before {
    height: 0.3em;
    opacity: 0.45;
  }



  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 clamp(20px, 4vw, 48px) 64px;
  }

  /* one-sheet pages: centred vertically under the header (no effect once taller than the screen) */
  .fresh :global(.middle) {
    margin-block: auto;
  }

  /* shared bits for the /fresh pages */
  .fresh :global(.mono) {
    font-family: var(--mono);
    font-size: 0.8125rem;
    color: var(--ink-soft);
  }

  /* a gesture hint: arrives after a beat, gone once you've done the thing (ui/learned) */
  .fresh :global(.hint) {
    font-size: 0.75rem;
    animation: hint-in 600ms ease 1.2s backwards;
  }

  @keyframes hint-in {
    from {
      opacity: 0;
      translate: 0 4px;
    }
  }

  /*
   * Links and buttons, one job each:
   *   .hl        the one thing to do next: a hand-drawn highlighter (see ui/marks.ts)
   *   .squiggle  takes you somewhere: a pencil underline
   *   .stamp     does something right here: a crooked ink stamp
   */
  .fresh :global(.hl) {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    padding: 0 3px;
    font-weight: 500;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
  }

  .fresh :global(.hl::before) {
    content: "";
    position: absolute;
    z-index: -1;
    left: -4px;
    right: -6px;
    bottom: 0.05em;
    height: 0.55em;
    background: var(--yellow);
    opacity: 0.7;
    border-radius: var(--radius, 6px 3px 8px 4px);
    rotate: var(--r, -1deg);
    transition: height 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .fresh :global(.hl:hover),
  .fresh :global(.hl:focus-visible) {
    color: var(--ink);
    outline: none;
  }

  .fresh :global(.hl:not(:disabled):hover::before),
  .fresh :global(.hl:focus-visible::before) {
    height: 1.15em;
  }

  .fresh :global(.hl:disabled) {
    opacity: 0.35;
  }

  .fresh :global(.squiggle) {
    color: var(--ink);
    text-decoration: none;
    padding-bottom: 3px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='4' viewBox='0 0 16 4'%3E%3Cpath d='M0 2 Q 4 0.2 8 2 T 16 2' fill='none' stroke='%236d7690' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")
      repeat-x 0 100% / 16px 4px;
  }

  .fresh :global(.squiggle:hover),
  .fresh :global(.squiggle:focus-visible) {
    color: var(--blue);
    outline: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='4' viewBox='0 0 16 4'%3E%3Cpath d='M0 2 Q 4 0.2 8 2 T 16 2' fill='none' stroke='%230064ff' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
    animation: squiggle 600ms linear infinite;
  }

  @keyframes squiggle {
    to {
      background-position-x: 16px;
    }
  }

  .fresh :global(.stamp) {
    display: inline-block;
    padding: 3px 9px;
    font-family: var(--mono);
    font-size: 0.8125rem;
    letter-spacing: 0.03em;
    color: var(--blue);
    text-decoration: none;
    border: 1.5px solid rgba(0, 100, 255, 0.55);
    border-radius: 3px;
    rotate: var(--r, -2deg);
    transition:
      scale 120ms ease,
      rotate 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
      color 150ms,
      border-color 150ms,
      background-color 150ms;
  }

  .fresh :global(.stamp:hover) {
    color: var(--blue);
    background: rgba(0, 100, 255, 0.06);
  }

  .fresh :global(.stamp:active) {
    scale: 0.9;
    rotate: calc(var(--r, -2deg) * -1);
  }

  .fresh :global(.stamp[data-done]) {
    color: var(--red);
    border-color: rgba(244, 78, 59, 0.6);
    rotate: -6deg;
  }

  .fresh :global(.stamp:focus-visible) {
    outline: 2px dashed var(--blue);
    outline-offset: 3px;
  }

  .fresh :global(.arrow) {
    width: 1.1em;
    height: 0.6em;
    margin-left: 0.2em;
    flex: none;
    overflow: visible;
    transition: translate 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .fresh :global(.arrow[data-back]) {
    margin: 0 0.2em 0 0;
    scale: -1 1;
  }

  .fresh :global(.arrow path) {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .fresh :global(:is(a, button):not(:disabled):hover .arrow) {
    translate: 4px 0;
  }

  .fresh :global(:is(a, button):not(:disabled):hover .arrow[data-back]) {
    translate: -4px 0;
  }

  .fresh :global(a:hover) {
    color: var(--blue);
  }
</style>
