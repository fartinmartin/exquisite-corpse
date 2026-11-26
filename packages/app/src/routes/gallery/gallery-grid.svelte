<script lang="ts">
  import type { Corpse, Section } from "@ecc/firestore";
  import Loading from "#lib/components/loading.svelte";
  import Panel from "#lib/components/panel.svelte";
  import PrevNext from "#lib/components/prev-next.svelte";
  import { thumbAttrs } from "#lib/thumbs.ts";
  import { listGallery } from "./gallery.remote";

  type Filter = "corpses" | "top" | "mid" | "bot";
  type Sort = "date" | "likes";
  type Item = Corpse | Section;

  type Props = {
    filter: Filter;
    sort: Sort;
    page: number;
    mobile: boolean;
    onpage: (page: number) => void;
  };

  let { filter, sort, page, mobile, onpage }: Props = $props();

  let extra = $state<Item[]>([]);
  let nextMobilePage = $state(1);
  let loadingMore = $state(false);
  let hasMore = $state(true);
  let sentinel = $state<HTMLElement>();

  const kind = $derived(filter === "corpses" ? "corpse" : "section");
  const collection = $derived(filter === "corpses" ? "corpses" : "sections");

  /** Roughly the first screenful on desktop; later rows load as they scroll in. */
  const EAGER_COUNT = 9;

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    loadingMore = true;
    try {
      const result = await listGallery({ filter, sort, page: nextMobilePage });
      extra = [...extra, ...(result.items as Item[])];
      hasMore = result.hasMore;
      nextMobilePage += 1;
    } finally {
      loadingMore = false;
    }
  }

  const result = $derived(await listGallery({ filter, sort, page: mobile ? 0 : page }));
  const items = $derived((mobile ? [...result.items, ...extra] : result.items) as Item[]);

  $effect(() => {
    if (!mobile || !sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  });
</script>

  <div class={["gallery", "mw-canvas", filter !== "corpses" ? "section" : ""]}>
    {#each items as item, index (item.id)}
      <a href={`/gallery/${kind}/${item.id}`}>
        <Panel color="blue" interactive noPadding class="drawing">
          <img
            {...thumbAttrs(collection, item)}
            alt={item.title}
            loading={index < EAGER_COUNT ? "eager" : "lazy"}
          />
        </Panel>
      </a>
    {/each}
  </div>

  {#if mobile}
    <div class="sentinel" bind:this={sentinel}></div>
    {#if hasMore}
      <Loading class="mt" subtext="curating masterpieces" color="yellow" throttle={500} />
    {:else}
      <Loading class="mt" text="that's it!" subtext="no more masterpieces" color="red" />
    {/if}
  {:else}
    <PrevNext
      isFirstPage={page === 0}
      isLastPage={!result.hasMore}
      type={filter}
      onprev={() => onpage(Math.max(0, page - 1))}
      onnext={() => onpage(page + 1)}
    />
  {/if}



<style lang="scss">
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(516px / 3), 1fr));
    grid-template-rows: repeat(auto-fill, minmax(calc(516px / 3), 1fr));
    grid-gap: calc(40px / 3);
    height: 544px;

    @media (max-width: 571px) {
      height: auto;
    }
  }

  .gallery.section {
    grid-template-rows: repeat(6, max-content);
  }

  .gallery:not(.section) :global(.drawing),
  .gallery:not(.section) :global(.drawing .content) {
    height: 100%;
  }

  .gallery:not(.section) img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gallery.section img {
    width: 100%;
    height: auto;
  }

  .sentinel {
    height: 1px;
  }
</style>
