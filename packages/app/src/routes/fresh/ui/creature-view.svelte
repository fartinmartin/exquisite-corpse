<script lang="ts">
  import { goto, preloadCode } from "$app/navigation";
  import { page } from "$app/state";
  import type { CorpseWithSections } from "@ecc/firestore";
  import { playbackPlan } from "#lib/corpse/playback.ts";
  import { LABELS, TYPES } from "#lib/corpse/types.ts";
  import { getCorpse } from "../../gallery/corpse/[id]/corpse.remote";
  import { anotherCorpseId } from "../../home.remote";
  import Actions from "./actions.svelte";
  import CreatureSheet from "./creature-sheet.svelte";
  import { learned } from "./learned.svelte.ts";
  import Swap from "./swap.svelte";
  import { swipe } from "./swipe.ts";
  import { toss, type Side } from "./toss.ts";

  type Props = { corpse: CorpseWithSections };

  let { corpse }: Props = $props();

  /*
   * One view for a creature, on home (a random one, URL stays /fresh so a
   * reload deals a new one) and on its own page. "random" (internally
   * `another`) navigates to the next creature's own URL, so every creature you
   * land on is shareable and the back button walks back through them.
   */
  const href = $derived(`/fresh/c/${corpse.id}`);

  /** Arriving straight from the draw page: the third this visitor just drew. */
  const drawn = $derived(page.state.drawn);

  let turned = $state(false);

  /*
   * Playback (the old site's): watch the creature being drawn again, third by
   * third in the order the artists drew them. Turns the sheet face up first.
   */
  let replayKey = $state(0);
  let replaying = $state(false);
  let replayTimer: ReturnType<typeof setTimeout> | undefined;

  function replay() {
    turned = false;
    replayKey += 1;
    replaying = true;
    clearTimeout(replayTimer);
    replayTimer = setTimeout(() => (replaying = false), playbackPlan(corpse.panels).total + 200);
  }

  $effect(() => () => clearTimeout(replayTimer));
  let dealing = $state(false);
  let failed = $state(false);

  // A new creature arrives face up, and not mid-replay.
  $effect.pre(() => {
    void corpse.id;
    turned = false;
    replayKey = 0;
    replaying = false;
  });

  /*
   * A first visit to home asks for one thing: turn the drawing over. The
   * buttons wait until that's happened (their space is kept, with the hint in
   * it). Other creature pages always have them.
   */
  const home = $derived(page.route.id === "/fresh");
  const waiting = $derived(home && learned.needs("turn"));

  // Turning a sheet over once is enough to know how.
  $effect(() => {
    if (turned) learned.learn("turn");
  });

  /*
   * The next creature, dealt ahead of time: a beat after one settles, pick
   * the next id and load its drawings, so "another" (and →) can toss
   * straight away instead of waiting on two round trips. Holding the query
   * keeps it in the client cache until the creature page asks for it.
   */
  let upcoming: { from: string; id: string; corpse: ReturnType<typeof getCorpse> } | null = null;

  $effect(() => {
    const current = corpse.id;
    upcoming = null;
    const timer = setTimeout(async () => {
      try {
        const id = await anotherCorpseId(current);
        if (corpse.id !== current) return;
        const next = { from: current, id, corpse: getCorpse(id) };
        upcoming = next;
        await Promise.all([next.corpse, preloadCode("/fresh/c/[id]")]);
      } catch {
        upcoming = null; // "another" falls back to asking when pressed
      }
    }, 1000);
    return () => clearTimeout(timer);
  });

  /**
   * Deals a random creature, which comes in from `from`: the side the finger
   * (or arrow key) brings it from, or either one for the button.
   */
  async function another(from: Side = Math.random() < 0.5 ? "left" : "right") {
    if (dealing) return;
    dealing = true;
    failed = false;
    try {
      const id = upcoming?.from === corpse.id ? upcoming.id : await anotherCorpseId(corpse.id);
      // Leaving home: pin its history entry to this creature, so back returns
      // to it rather than dealing a different random one.
      if (page.route.id === "/fresh") await goto(href, { state: { pinned: corpse.id }, shallow: true, replace: true });
      toss.next = from;
      await goto(`/fresh/c/${id}`, { state: { another: from } });
    } catch {
      failed = true;
    } finally {
      dealing = false;
    }
  }

  // → and ← both deal another, brought in from that side. Back is the browser's.
  function keydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      void another(event.key === "ArrowRight" ? "right" : "left");
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<main class="creature middle">
  <!-- swipe the sheet either way to deal another, which follows your finger in -->
  <div class="swipe-area" {@attach swipe({ left: () => another("right"), right: () => another("left"), follow: true, fade: "out", key: corpse.id })}>
    <CreatureSheet {corpse} bind:turned {drawn} {replayKey} />
  </div>

  <div class="below">
    <h1>{corpse.title}</h1>
    {#if drawn}<p class="mono drew">you drew the {LABELS[drawn]}</p>{/if}
    <div class="controls" data-waiting={waiting || undefined} data-unsure={(home && !learned.loaded) || undefined}>
      <Actions
        collection="corpses"
        id={corpse.id}
        likes={corpse.likes}
        drawings={TYPES.flatMap((type) => corpse.panels[type]?.drawing ?? [])}
        filename={`${corpse.title}.png`}
        {href}
      >
        <button class="stamp" style:--r="1.5deg" onclick={replay} disabled={replaying} aria-label="replay: watch it being drawn">
          <Swap labels={["replay", "…"]} active={replaying ? 1 : 0} />
        </button>
        <button class="stamp" style:--r="-1.5deg" onclick={() => another()} disabled={dealing} aria-label="a random creature" aria-keyshortcuts="ArrowLeft ArrowRight">
          <Swap labels={["random", "…"]} active={dealing ? 1 : 0} />
        </button>
      </Actions>
      {#if learned.needs("turn")}<p class="mono hint">tap the drawing to see who drew it</p>{/if}
    </div>
    {#if failed}<p class="mono">couldn't find one, try again?</p>{/if}
  </div>
</main>

<style>
  .creature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }

  /* named for the toss between creatures (fresh/+layout.svelte) */
  .swipe-area {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .swipe-area > :global(.turnable) {
    view-transition-name: creature;
  }

  .below {
    view-transition-name: creature-meta;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
  }

  h1 {
    font-weight: 600;
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    letter-spacing: -0.035em;
    line-height: 1.05;
  }

  .controls {
    display: grid;
    justify-items: center;
    gap: 10px;
  }

  .controls :global(.actions) {
    margin-top: 6px;
    justify-content: center;
    /* arriving after the first turn: once the sheet is most of the way over */
    transition:
      visibility 0s 600ms,
      opacity 300ms ease 600ms,
      translate 300ms ease 600ms;
  }

  /* before the page knows who's visiting, app.html's early check decides */
  .controls[data-waiting] :global(.actions),
  :global(html[data-first-visit]) .controls[data-unsure] :global(.actions) {
    visibility: hidden;
    opacity: 0;
    translate: 0 6px;
    transition: none;
  }

  .controls[data-waiting] > :global(*) {
    grid-area: 1 / 1;
    align-self: center;
  }

  .drew {
    margin-top: -4px;
  }
</style>
