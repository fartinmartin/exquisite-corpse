<script lang="ts">
  import { page } from "$app/state";
  import CanvasPanel from "$lib/components/canvas-panel.svelte";
  import MetaMenu from "$lib/components/meta-menu.svelte";
  import Panel from "$lib/components/panel.svelte";
  import RadioButton from "$lib/components/radio-button.svelte";
  import type { PageData } from "./$types";
  import { getSection } from "./section.remote";

  const id = $derived(page.params.id ?? "");

  let { data }: { data: PageData } = $props();

  let related = $state<"featuredIn" | "moreBy">("featuredIn");

  const result = $derived(await getSection(id));
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
</svelte:head>

  <div class="wrap">
    <div class="canvas-stack mw-canvas">
      <CanvasPanel
        id={result.section.type}
        mode="display"
        drawing={result.section.drawing}
        meta={{ title: result.section.title, artist: result.section.artist, href: `/gallery/section/${result.section.id}` }}
      />
    </div>

    <Panel class="mt meta">
      <h1>
        {result.section.title} <span><br class="br" />by</span>
        {result.section.artist}
      </h1>
      <MetaMenu
        collection="sections"
        id={result.section.id}
        title={result.section.title}
        thumb={result.section.thumb}
        likes={result.likeState.likes}
        liked={result.likeState.liked}
        artist={result.section.artist}
      />
    </Panel>

    <Panel class="mt mb related">
      <form>
        <RadioButton
          group="related"
          value="featuredIn"
          active={related}
          onselect={(value) => (related = value as typeof related)}
        >
          <span>featured in<span class="hom">...</span></span>
        </RadioButton>
        <RadioButton
          group="related"
          value="moreBy"
          active={related}
          onselect={(value) => (related = value as typeof related)}
        >
          <span>more <span class="hom">&nbsp;by this artist... </span></span>
        </RadioButton>
      </form>
    </Panel>

    {#if related === "featuredIn"}
      {#if result.featuredIn.length === 0}
        <div class="none-found">
          <Panel color="blue" style="width: max-content; margin: 0 auto">no drawings found!</Panel>
        </div>
      {:else}
        <div class="gallery mw-canvas">
          {#each result.featuredIn as corpse (corpse.id)}
            <a href={`/gallery/corpse/${corpse.id}`}>
              <Panel color="blue" interactive noPadding class="drawing">
                <img src={corpse.thumb} alt={corpse.title} />
              </Panel>
            </a>
          {/each}
        </div>
      {/if}
    {:else if result.moreBy.length === 0}
      <div class="none-found">
        <Panel color="blue" style="width: max-content; margin: 0 auto">no drawings found!</Panel>
      </div>
    {:else}
      <div class="gallery more-by mw-canvas">
        {#each result.moreBy as other (other.id)}
          <a href={`/gallery/section/${other.id}`}>
            <Panel color="blue" interactive noPadding class="drawing">
              <img src={other.thumb} alt={other.title} />
            </Panel>
          </a>
        {/each}
      </div>
    {/if}
  </div>


<style lang="scss">
  :global(.meta),
  :global(.related) {
    height: 60px;
  }

  :global(.meta) {
    @media screen and (max-width: calc(544px + calc(40px / 2))) {
      height: auto;
    }

    :global(.content) {
      justify-content: space-between;

      > :global(*:nth-child(2)) {
        margin-right: -6px;
      }
    }
  }

  h1 {
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    span {
      font-weight: normal;
    }

    @media screen and (max-width: calc(544px + calc(40px / 2))) {
      white-space: normal;
    }
  }

  .br {
    @media screen and (min-width: 444px) {
      display: none;
    }
  }

  :global(.related) {
    margin-top: 120px;

    @media screen and (max-width: calc(544px + calc(40px / 2))) {
      margin-top: calc(40px / 3);
    }

    :global(.content) {
      justify-content: flex-start;
      margin-left: calc(-1rem - 7px);
    }
  }

  form {
    display: flex;

    > :global(*:not(:last-child)) {
      margin-right: 1rem;
    }
  }

  :global(.radio-wrap) {
    span {
      white-space: nowrap;
    }
  }

  :global(.related .radio-wrap:not(.active)) {
    filter: none;
    opacity: 1;
  }

  :global(.related .radio-wrap.active) span {
    font-weight: bold;
  }

  :global(.related .radio-wrap:not(.active)) span {
    font-weight: normal;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(3, calc(516px / 3));
    grid-template-rows: repeat(1, calc(516px / 3));
    grid-gap: calc(40px / 3);

    @media screen and (max-width: calc(544px + calc(40px / 2))) {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: calc(calc(100vw - 40px) / 3);
    }
  }

  .gallery.more-by {
    grid-template-rows: repeat(2, max-content);
    min-height: 172px;
    position: relative;

    @media screen and (max-width: calc(544px + calc(40px / 2))) {
      grid-template-rows: calc(calc(100vw - 40px) / 3);
      min-height: initial;
    }
  }

  :global(.drawing .content) {
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .none-found {
    position: relative;
    min-height: 172px;
    display: grid;
    place-items: center;
  }
</style>
