<script lang="ts">
  import { page } from "$app/state";
  import type { SectionType } from "@ecc/firestore";
  import type { PageData } from "./$types";
  import CanvasPanel from "#lib/components/canvas-panel.svelte";
  import MetaMenu from "#lib/components/meta-menu.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { getCorpse } from "./corpse.remote";

  const TYPES: SectionType[] = ["top", "mid", "bot"];
  const id = $derived(page.params.id ?? "");

  let { data }: { data: PageData } = $props();

  const result = $derived(await getCorpse(id));
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
</svelte:head>

  <div class="wrap">
    <div class="canvas-stack mw-canvas">
      {#each TYPES as type (type)}
        {@const panel = result.corpse.panels[type]}
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

    <Panel class="mt corpse-meta">
      <h1>{result.corpse.title}</h1>
      <MetaMenu
        collection="corpses"
        id={result.corpse.id}
        title={result.corpse.title}
        thumb={result.corpse.thumb}
        likes={result.likeState.likes}
        liked={result.likeState.liked}
      />
    </Panel>
  </div>


<style lang="scss">
  :global(.corpse-meta) {
    height: 60px;

    :global(.content) {
      justify-content: space-between;

      > :global(*:nth-child(2)) {
        margin-right: -6px;
      }
    }
  }
</style>
