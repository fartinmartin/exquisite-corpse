<script lang="ts">
  import Seo from "#lib/components/seo.svelte";
  import { goto } from "$app/navigation";
  import type { SectionType } from "@ecc/firestore";
  import type { DrawingData } from "@ecc/lexicons";
  import CanvasPanel from "#lib/components/canvas-panel.svelte";
  import Loading from "#lib/components/loading.svelte";
  import Panel from "#lib/components/panel.svelte";
  import SaveModal from "#lib/components/save-modal.svelte";
  import SectionPicker from "#lib/components/section-picker.svelte";
  import Toolbar from "#lib/components/toolbar.svelte";
  import { drawState, GUEST_HANDLE_COOKIE } from "#lib/draw/state.svelte.ts";
  import { corpseToThumb, drawingToThumb } from "#lib/render.ts";
  import { getSiblings, randomTitle, saveDrawing, type Sibling } from "./draw.remote";

  const TYPES: SectionType[] = ["top", "mid", "bot"];

  let section = $state<SectionType | null>(null);
  let siblings = $state<Partial<Record<SectionType, Sibling>>>({});
  let fetching = $state(false);
  let saving = $state(false);
  let error = $state<string | null>(null);
  let title = $state("untitled");
  let artist = $state("anonymous");

  function cookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  $effect(() => {
    artist = cookie(GUEST_HANDLE_COOKIE) ?? "anonymous";
    drawState.reset();
  });

  async function pick(type: SectionType) {
    section = type;
    fetching = true;
    error = null;
    drawState.reset();

    try {
      const [panels, words] = await Promise.all([getSiblings(type), randomTitle()]);
      siblings = panels;
      title = words;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "could not load sections";
    } finally {
      fetching = false;
    }
  }

  function siblingIds() {
    return {
      top: siblings.top?.id,
      mid: siblings.mid?.id,
      bot: siblings.bot?.id,
    };
  }

  async function save({ title, artist }: { title: string; artist: string }) {
    const paint = drawState.paint;
    if (!paint || !section) throw new Error("nothing to save");

    const drawing = paint.save() as unknown as DrawingData;
    // Compose the corpse preview in the browser — no native canvas on the server.
    const panels: Partial<Record<SectionType, DrawingData>> = {
      top: siblings.top?.drawing,
      mid: siblings.mid?.drawing,
      bot: siblings.bot?.drawing,
      [section]: drawing,
    };
    const [thumb, corpseThumb] = await Promise.all([
      drawingToThumb(drawing),
      corpseToThumb(TYPES.map((type) => panels[type]).filter((panel) => panel !== undefined)),
    ]);

    const result = await saveDrawing({
      type: section,
      title,
      artist,
      drawing,
      thumb,
      siblings: siblingIds(),
      corpseThumb,
    });

    await goto(`/gallery/corpse/${result.corpseId}`);
  }
</script>

<Seo title="draw" description="create your very own masterpiece!" />

<div class="wrap">
  {#if saving && section && drawState.paint}
    {@const drawing = drawState.paint.save() as unknown as DrawingData}
    <SaveModal
      {drawing}
      defaultTitle={title}
      defaultArtist={artist}
      onsave={save}
      onclose={() => (saving = false)}
    />
  {/if}

  {#if !section}
    <SectionPicker onpick={pick} />
  {:else if fetching}
    <div class="mw-canvas">
      <Panel class="mb" />
      <Panel class="mb" />
      <Loading subtext="preparing your canvas" />
    </div>
  {:else if error}
    <Panel color="red" class="error">
      <p>{error}</p>
    </Panel>
  {:else}
    <div class="mw-canvas">
      <Toolbar enabled={!saving} onsave={() => (saving = true)} />

      <div class="canvas-stack">
        {#each TYPES as type (type)}
          {@const sibling = siblings[type]}
          {#if type === section}
            <CanvasPanel id={type} mode="draw" />
          {:else}
            <CanvasPanel
              id={type}
              mode="pixelate"
              drawing={sibling?.drawing}
              meta={sibling ? { title: sibling.title, artist: sibling.artist } : undefined}
            />
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  :global(.error) {
    margin-bottom: calc(40px / 3);
  }

</style>
