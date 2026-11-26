<script lang="ts">
  import type { SectionType } from "@ecc/firestore";
  import CanvasPanel from "$lib/components/canvas-panel.svelte";
  import Loading from "$lib/components/loading.svelte";
  import NavMenu from "$lib/components/nav-menu.svelte";
  import Panel from "$lib/components/panel.svelte";
  import { randomCorpse } from "./home.remote";

  const TYPES: SectionType[] = ["top", "mid", "bot"];
</script>

<svelte:head>
  <title>exquisite corpse club</title>
</svelte:head>

<div class="wrap">
  <Panel class="mb index-nav">
    <h1>exquisite corpse club</h1>
    <NavMenu />
  </Panel>

  <svelte:boundary>
    {@const corpse = await randomCorpse()}

    <div class="canvas-stack mw-canvas">
      {#each TYPES as type (type)}
        {@const panel = corpse.panels[type]}
        {#if panel}
          <CanvasPanel
            id={type}
            mode="display"
            drawing={panel.drawing}
            meta={{
              title: panel.title,
              artist: panel.artist,
              href: `/gallery/section/${panel.id}`,
            }}
          />
        {/if}
      {/each}
    </div>

    <Panel class="mt index-title">
      <a href={`/gallery/corpse/${corpse.id}`}>{corpse.title}</a>
    </Panel>

    {#snippet pending()}
      <Loading subtext="digging up a random corpse" />
    {/snippet}

    {#snippet failed()}
      <Loading color="red" text="oh no" subtext="we have misplaced our corpses!" />
    {/snippet}
  </svelte:boundary>
</div>

<style lang="scss">
  .index-nav,
  .index-title {
    height: 60px;
  }

  .index-nav :global(.content) {
    justify-content: space-between;
  }
</style>
