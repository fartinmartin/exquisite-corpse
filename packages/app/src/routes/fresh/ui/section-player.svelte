<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { untrack } from "svelte";
  import type { Corpse, CorpseWithSections, SectionWithDrawing } from "@ecc/firestore";
  import { backFor } from "#lib/corpse/backs.ts";
  import Fold from "#lib/corpse/fold.svelte";
  import { hash, prng, randomFold } from "#lib/corpse/folds.ts";
  import type { Panels } from "#lib/corpse/types.ts";
  import { getCorpse } from "../../gallery/corpse/[id]/corpse.remote";
  import Arrow from "./arrow.svelte";
  import { swipe } from "./swipe.ts";

  type Props = {
    section: SectionWithDrawing;
    /** Every creature the section is in, newest first. */
    creatures: Corpse[];
  };

  let { section, creatures }: Props = $props();

  /*
   * A section page plays like a playlist. First the third on its own: it
   * unfolds in its slot of the square with the other two thirds hatched
   * (the draw page's "someone else's third"). → folds it up and unfolds it
   * into the newest creature it's in, →
   * again folds it back up and opens the next one; ← goes back. `?in=<id>`
   * opens straight to a creature, so any step can be shared.
   */

  // Folded behind the section, so its own drawing faces up while folded.
  const plan = $derived(randomFold({ rand: prng(hash(section.id)), base: section.type, side: -1, face: "any" }));
  const solo = $derived<Panels>({ [section.type]: section });

  const last = $derived(creatures.length);

  /** 0: the section on its own; n: the nth creature (1-based). */
  let step = $state(0);
  // svelte-ignore state_referenced_locally
  let panels = $state<Panels>({ [section.type]: section });
  // the solo step unfolds on arrival too
  let open = $state(true);
  let busy = $state(false);
  let failed = $state(false);

  const current = $derived(step > 0 ? creatures[step - 1] : null);

  // A different section (navigating between section pages) starts over, solo.
  $effect.pre(() => {
    void section.id;
    step = 0;
    open = true;
    panels = { [section.type]: section };
  });

  // Creatures already fetched (or on their way), so stepping back is instant.
  const loaded = new Map<string, Promise<CorpseWithSections>>();
  function load(id: string): Promise<CorpseWithSections> {
    let pending = loaded.get(id);
    if (!pending) {
      pending = Promise.resolve(getCorpse(id));
      pending.catch(() => loaded.delete(id));
      loaded.set(id, pending);
    }
    return pending;
  }

  let whenFolded: (() => void) | null = null;
  function folded() {
    whenFolded?.();
    whenFolded = null;
  }

  async function go(to: number) {
    if (busy || to < 0 || to > last || to === step) return;
    busy = true;
    failed = false;
    try {
      const next = to > 0 ? load(creatures[to - 1].id) : null;
      // fold up what's open first; the next creature unfolds from the same sheet
      if (open) await new Promise<void>((resolve) => ((whenFolded = resolve), (open = false)));
      if (next) {
        const corpse = await next;
        panels = corpse.panels;
        step = to;
        open = true;
        // warm the one after, so → feels instant
        if (to < last) void load(creatures[to].id);
      } else {
        panels = solo;
        step = 0;
        open = true;
      }
      const url = new URL(page.url.href);
      if (step > 0) url.searchParams.set("in", creatures[step - 1].id);
      else url.searchParams.delete("in");
      replaceState(url, page.state);
    } catch {
      failed = true;
    } finally {
      busy = false;
    }
  }

  // Shared link to a step: open it on arrival (and on arriving at another section).
  $effect(() => {
    void section.id;
    untrack(() => {
      const wanted = page.url.searchParams.get("in");
      const index = wanted ? creatures.findIndex((corpse) => corpse.id === wanted) : -1;
      if (index >= 0) void go(index + 1);
    });
  });

  function keydown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (event.key === "ArrowRight" && step < last) {
      event.preventDefault();
      void go(step + 1);
    } else if (event.key === "ArrowLeft" && step > 0) {
      event.preventDefault();
      void go(step - 1);
    }
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="player">
  <button
    class="stamp step prev"
    onclick={() => go(step - 1)}
    disabled={step === 0 || busy}
    aria-label={step === 1 ? "back to the third on its own" : "previous creature"}
    aria-keyshortcuts="ArrowLeft"
  >
    <Arrow back />
  </button>

  <div
    class="sheet"
    {@attach swipe({
      left: step < last ? () => go(step + 1) : undefined,
      right: step > 0 ? () => go(step - 1) : undefined,
      follow: true,
    })}
    aria-label={current ? `${section.title} in ${current.title}` : `${section.title}, on its own`} role="img">
    <Fold {panels} {plan} {open} onfolded={folded} delay={0} back={backFor(section.id)} />
  </div>

  <button
    class="stamp step next"
    onclick={() => go(step + 1)}
    disabled={step === last || busy}
    aria-label="next creature"
    aria-keyshortcuts="ArrowRight"
  >
    <Arrow />
  </button>

  <p class="caption mono" aria-live="polite">
    {#if failed}
      couldn't unfold that one, try again?
    {:else if current}
      in <a class="squiggle" href={`/fresh/c/${current.id}`}>{current.title}</a>
      <span class="count">{step} of {last}</span>
    {:else if last > 0}
      on its own <span class="count">· in {last} {last === 1 ? "creature" : "creatures"}, → to see</span>
    {:else}
      on its own <span class="count">· not in a creature yet</span>
    {/if}
  </p>
</div>

<style>
  .player {
    display: grid;
    grid-template-columns: auto minmax(0, 560px) auto;
    grid-template-areas:
      "prev sheet next"
      ". caption .";
    align-items: center;
    justify-content: center;
    gap: 16px clamp(12px, 3vw, 32px);
    width: 100%;
  }

  .sheet {
    grid-area: sheet;
    width: min(100%, calc(100svh - 320px));
    min-width: min(100%, 280px);
    justify-self: center;
  }

  .prev {
    grid-area: prev;
  }

  .next {
    grid-area: next;
  }

  .step {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    font-size: 1.25rem;
  }

  .step :global(.arrow) {
    margin: 0;
  }

  .step:disabled {
    opacity: 0.25;
    rotate: 0deg;
  }

  .caption {
    grid-area: caption;
    text-align: center;
    min-height: 1.5em;
  }

  .count {
    margin-left: 6px;
  }

  /* phones: the sheet takes the width; the arrows sit either side of the caption */
  @media (max-width: 599px) {
    .player {
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        "sheet sheet sheet"
        "prev caption next";
    }
  }
</style>
