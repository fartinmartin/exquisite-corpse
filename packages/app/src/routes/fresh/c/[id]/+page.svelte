<script lang="ts">
  import { page } from "$app/state";
  import { learned } from "../../ui/learned.svelte.ts";
  import { TYPES } from "#lib/corpse/types.ts";
  import Actions from "../../ui/actions.svelte";
  import CreatureSheet from "../../ui/creature-sheet.svelte";
  import { getCorpse } from "../../../gallery/corpse/[id]/corpse.remote";

  // The creature; who drew it is printed on the back (tap to turn it over).
  const id = $derived(page.params.id ?? "");
  const corpse = $derived(await getCorpse(id));

  let turned = $state(false);

  // Turning a sheet over once is enough to know how.
  $effect(() => {
    if (turned) learned.learn("turn");
  });
</script>

<svelte:head>
  <title>exquisite corpse club ▪ {corpse.title}</title>
</svelte:head>

<main class="creature">
  <CreatureSheet {corpse} bind:turned />

  <div class="below">
    <h1>{corpse.title}</h1>
    <Actions
      collection="corpses"
      {id}
      likes={corpse.likes}
      drawings={TYPES.flatMap((type) => corpse.panels[type]?.drawing ?? [])}
      filename={`${corpse.title}.png`}
    />
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

</style>
