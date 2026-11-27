<script lang="ts">
  import { goto, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import type { CorpseWithSections } from "@ecc/firestore";
  import { TYPES } from "#lib/corpse/types.ts";
  import { anotherCorpseId } from "../../home.remote";
  import Actions from "./actions.svelte";
  import Arrow from "./arrow.svelte";
  import CreatureSheet from "./creature-sheet.svelte";
  import { learned } from "./learned.svelte.ts";
  import Swap from "./swap.svelte";

  type Props = { corpse: CorpseWithSections };

  let { corpse }: Props = $props();

  /*
   * One view for a creature, on home (a random one, URL stays /fresh so a
   * reload deals a new one) and on its own page. "another" navigates to the
   * next creature's own URL, so every creature you land on is shareable and
   * the back button walks back through them.
   */
  const href = $derived(`/fresh/c/${corpse.id}`);

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

  async function another() {
    if (dealing) return;
    dealing = true;
    failed = false;
    try {
      const id = await anotherCorpseId(corpse.id);
      // Leaving home: pin its history entry to this creature, so back returns
      // to it rather than dealing a different random one.
      if (page.route.id === "/fresh") replaceState(href, { pinned: corpse.id });
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

<main class="creature">
  <CreatureSheet {corpse} bind:turned />

  <div class="below">
    <h1>{corpse.title}</h1>
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
    padding-top: 1vh;
  }

  .below {
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

  .another {
    display: inline-flex;
    align-items: center;
  }
</style>
