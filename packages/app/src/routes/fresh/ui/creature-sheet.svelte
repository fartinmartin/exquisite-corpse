<script lang="ts">
  import type { CorpseWithSections } from "@ecc/firestore";
  import { backFor } from "#lib/corpse/backs.ts";
  import Fold from "#lib/corpse/fold.svelte";
  import { hash, prng, randomFold } from "#lib/corpse/folds.ts";
  import { TYPES } from "#lib/corpse/types.ts";
  import Artist from "./artist.svelte";
  import Printed from "./printed.svelte";

  type Props = {
    corpse: CorpseWithSections;
    /** Face down, showing what's printed on the back. */
    turned?: boolean;
    /** Already unfolded (arriving from the draw page's reveal): no unfold on arrival. */
    startOpen?: boolean;
  };

  let { corpse, turned = $bindable(false), startOpen = false }: Props = $props();

  // Each creature arrives folded its own (physically possible) way, at its own angle.
  const plan = $derived(randomFold({ rand: prng(hash(corpse.id)) }));

  const credits = $derived(TYPES.flatMap((type) => (corpse.panels[type] ? [corpse.panels[type]!] : [])));

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }).toLowerCase();
</script>

<!-- A creature on paper; tap to turn it over and read who drew it. -->
<div class="turnable">
  <button class="sheet" onclick={() => (turned = !turned)} aria-label={turned ? "turn it face up" : "turn it over"}>
    {#key corpse.id}
      <Fold panels={corpse.panels} {plan} {startOpen} flip={turned ? "v" : null} back={turned ? "plain" : backFor(corpse.id)} />
    {/key}
  </button>

  <div class="back" data-shown={turned || undefined} style:rotate="{plan.tilt}deg" aria-hidden={!turned}>
    <Printed no={corpse.id} title={corpse.title} date={date(corpse.date)}>
      {#each credits as panel (panel.id)}
        <p>
          <a class="squiggle" href={`/fresh/s/${panel.id}`} tabindex={turned ? 0 : -1}>{panel.title}</a>
          <span class="by">by</span>
          <Artist name={panel.artist} tabindex={turned ? 0 : -1} />
        </p>
      {/each}
    </Printed>
  </div>
</div>

<style>
  .turnable {
    position: relative;
    width: min(100%, 560px, calc(100svh - 300px));
    min-width: min(100%, 280px);
    container-type: inline-size;
  }

  .sheet {
    display: block;
    width: 100%;
  }

  .sheet:focus-visible {
    outline: 2px dashed var(--blue);
    outline-offset: 8px;
  }

  .back {
    position: absolute;
    inset: 8% 6%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 250ms ease;
  }

  .back[data-shown] {
    opacity: 1;
    transition-delay: 650ms; /* once the sheet has turned */
  }

  /* links on the back work; tapping anywhere else turns it back */
  .back[data-shown] :global(a) {
    pointer-events: auto;
  }
</style>
