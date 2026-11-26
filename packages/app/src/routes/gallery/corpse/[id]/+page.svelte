<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import { page } from "$app/state";
  import type { SectionType } from "@ecc/firestore";
  import CanvasPanel from "#lib/components/canvas-panel.svelte";
  import MetaMenu from "#lib/components/meta-menu.svelte";
  import Panel from "#lib/components/panel.svelte";
  import { thumbOgImage } from "#lib/thumbs.ts";
  import { getCorpse } from "./corpse.remote";

  const TYPES: SectionType[] = ["top", "mid", "bot"];
  const id = $derived(page.params.id ?? "");

  const corpse = $derived(await getCorpse(id));
  const panels = $derived(TYPES.map((type) => corpse.panels[type]).filter((panel) => panel !== undefined));
  const drawings = $derived(panels.map((panel) => panel.drawing));

  /** "a, b, and c" */
  const artists = $derived(
    panels
      .map((panel) => panel.artist)
      .join(", ")
      .replace(/,(?!.*,)/gim, ", and")
  );
</script>

<Seo
  title={corpse.title}
  description={`an exquisite corpse drawn by ${artists}!`}
  image={thumbOgImage("corpses", corpse, page.url.origin)}
/>

  <div class="wrap">
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

    <Panel class="mt corpse-meta">
      <h1>{corpse.title}</h1>
      <MetaMenu
        collection="corpses"
        id={corpse.id}
        title={corpse.title}
        {drawings}
        likes={corpse.likes}
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
