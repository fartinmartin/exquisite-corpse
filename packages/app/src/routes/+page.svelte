<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import type { SectionType } from "@ecc/firestore";
  import CanvasPanel from "#lib/components/canvas-panel.svelte";
  import NavMenu from "#lib/components/nav-menu.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { randomCorpse } from "./home.remote";

  const TYPES: SectionType[] = ["top", "mid", "bot"];

  const corpse = $derived(await randomCorpse());
</script>

<Seo />

<div class="wrap">
  <Panel class="mb index-nav">
    <h1>exquisite corpse club</h1>
    <NavMenu />
  </Panel>

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


</div>

<style lang="scss">
  :global(.index-nav),
  :global(.index-title) {
    height: 60px;
  }

  :global(.index-nav .content) {
    justify-content: space-between;
  }
</style>
