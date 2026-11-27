<script lang="ts">
  import { backFor } from "#lib/corpse/backs.ts";
  import Fold from "#lib/corpse/fold.svelte";
  import { hash, prng, randomFold } from "#lib/corpse/folds.ts";
  import { learned } from "./ui/learned.svelte.ts";
  import { randomCorpse } from "../home.remote";

  // Home: one creature at a time; tap for another. Who drew it lives on its own page.
  const corpse = $derived(await randomCorpse());
  const plan = $derived(randomFold({ rand: prng(hash(corpse.id)) }));

  let shuffling = $state(false);

  /** Swap in the next creature; it arrives folded and unfolds itself. */
  async function another() {
    if (shuffling) return;
    learned.learn("another");
    shuffling = true;
    try {
      await randomCorpse().refresh();
    } finally {
      shuffling = false;
    }
  }
</script>

<svelte:head>
  <title>exquisite corpse club</title>
</svelte:head>

<main class="home">
  <button class="sheet" onclick={another} aria-label="show another creature" disabled={shuffling}>
    {#key corpse.id}
      <Fold panels={corpse.panels} {plan} back={backFor(corpse.id)} />
    {/key}
  </button>

  <div class="below">
    <h1><a class="squiggle" href={`/fresh/c/${corpse.id}`}>{corpse.title}</a></h1>
    {#if learned.needs("another")}<p class="mono hint">tap the drawing for another</p>{/if}
  </div>
</main>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    padding-top: 1vh;
  }

  .sheet {
    display: block;
    width: min(100%, 560px, calc(100vh - 300px));
    min-width: min(100%, 280px);
    transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @media (hover: hover) {
    .sheet:hover {
      transform: rotate(-0.6deg) translateY(-2px);
    }
  }

  .sheet:active {
    transform: scale(0.99);
  }

  .sheet:focus-visible {
    outline: 2px dashed var(--blue);
    outline-offset: 8px;
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

  h1 .squiggle {
    padding-bottom: 6px;
    background-size: 22px 6px;
  }

  /* a title first; the pencil line only shows when you reach for it */
  h1 .squiggle:not(:hover, :focus-visible) {
    background-image: none;
  }


</style>
