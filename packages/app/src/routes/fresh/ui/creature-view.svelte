<script lang="ts">
  import { goto, preloadCode } from "$app/navigation";
  import { page } from "$app/state";
  import type { CorpseWithSections } from "@ecc/firestore";
  import { LABELS, TYPES } from "#lib/corpse/types.ts";
  import { getCorpse } from "../../gallery/corpse/[id]/corpse.remote";
  import { anotherCorpseId } from "../../home.remote";
  import Actions from "./actions.svelte";
  import Arrow from "./arrow.svelte";
  import CreatureSheet from "./creature-sheet.svelte";
  import { learned } from "./learned.svelte.ts";
  import Swap from "./swap.svelte";
  import { swipe } from "./swipe.ts";

  type Props = { corpse: CorpseWithSections };

  let { corpse }: Props = $props();

  /*
   * One view for a creature, on home (a random one, URL stays /fresh so a
   * reload deals a new one) and on its own page. "another" navigates to the
   * next creature's own URL, so every creature you land on is shareable and
   * the back button walks back through them.
   */
  const href = $derived(`/fresh/c/${corpse.id}`);

  /** Arriving straight from the draw page: the third this visitor just drew. */
  const drawn = $derived(page.state.drawn);

  let turned = $state(false);
  let dealing = $state(false);
  let failed = $state(false);

  // A new creature arrives face up.
  $effect.pre(() => {
    void corpse.id;
    turned = false;
  });

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

  async function another() {
    if (dealing) return;
    dealing = true;
    failed = false;
    try {
      const id = upcoming?.from === corpse.id ? upcoming.id : await anotherCorpseId(corpse.id);
      // Leaving home: pin its history entry to this creature, so back returns
      // to it rather than dealing a different random one.
      if (page.route.id === "/fresh") await goto(href, { state: { pinned: corpse.id }, shallow: true, replace: true });
      await goto(`/fresh/c/${id}`, { state: { another: true } });
    } catch {
      failed = true;
    } finally {
      dealing = false;
    }
  }

  // → deals another; ← steps back, but only through creatures "another" dealt.
  function keydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      void another();
    } else if (event.key === "ArrowLeft" && page.state.another) {
      event.preventDefault();
      history.back();
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<main class="creature middle">
  <!-- swipe the sheet: left deals another, right goes back (when "another" brought you here) -->
  <div class="swipe-area" {@attach swipe({ left: another, right: page.state.another ? () => history.back() : undefined, follow: true, fade: "out", key: corpse.id })}>
    <CreatureSheet {corpse} bind:turned {drawn} />
  </div>

  <div class="below">
    <h1>{corpse.title}</h1>
    {#if drawn}<p class="mono drew">you drew the {LABELS[drawn]}</p>{/if}
    <Actions
      collection="corpses"
      id={corpse.id}
      likes={corpse.likes}
      drawings={TYPES.flatMap((type) => corpse.panels[type]?.drawing ?? [])}
      filename={`${corpse.title}.png`}
      {href}
    >
      <button class="stamp another" style:--r="-1.5deg" onclick={another} disabled={dealing} aria-keyshortcuts="ArrowRight">
        <Swap labels={["another", "…"]} active={dealing ? 1 : 0} /><Arrow />
      </button>
    </Actions>
    {#if failed}<p class="mono">couldn't find another one, try again?</p>{/if}
    {#if learned.needs("turn")}<p class="mono hint">tap the drawing to see who drew it</p>{/if}
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

  .below :global(.actions) {
    margin-top: 6px;
    justify-content: center;
  }

  .drew {
    margin-top: -4px;
  }

  .another {
    display: inline-flex;
    align-items: center;
  }
</style>
