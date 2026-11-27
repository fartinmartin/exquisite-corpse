<script lang="ts">
  import { page } from "$app/state";
  import type { Corpse, Section } from "@ecc/firestore";
  import Swap from "../ui/swap.svelte";
  import { tiltFor } from "#lib/corpse/folds.ts";
  import { thumbUrl } from "#lib/thumbs.ts";
  import { listGallery } from "../../gallery/gallery.remote";

  type Part = "corpses" | "top" | "mid" | "bot";

  const PARTS: { value: Part; label: string }[] = [
    { value: "corpses", label: "creatures" },
    { value: "top", label: "tops" },
    { value: "mid", label: "middles" },
    { value: "bot", label: "bottoms" },
  ];

  const part = $derived(
    (PARTS.find((entry) => entry.value === page.url.searchParams.get("part"))?.value ?? "corpses") as Part
  );
  const isCorpses = $derived(part === "corpses");

  const first = $derived(await listGallery({ filter: part, sort: "date", page: 0 }));

  let more = $state<(Corpse | Section)[]>([]);
  let nextPage = $state(1);
  let hasMore = $state<boolean | null>(null);
  let loading = $state(false);

  // a new shelf starts from its first page
  $effect(() => {
    void part;
    more = [];
    nextPage = 1;
    hasMore = null;
  });

  const items = $derived([...(first.items as (Corpse | Section)[]), ...more]);

  async function loadMore() {
    loading = true;
    try {
      const result = await listGallery({ filter: part, sort: "date", page: nextPage });
      more = [...more, ...(result.items as (Corpse | Section)[])];
      hasMore = result.hasMore;
      nextPage += 1;
    } finally {
      loading = false;
    }
  }

  const href = (item: Corpse | Section) => (isCorpses ? `/fresh/c/${item.id}` : `/fresh/s/${item.id}`);
</script>

<svelte:head>
  <title>exquisite corpse club ▪ look</title>
</svelte:head>

<main class="look">
  <nav class="parts">
    {#each PARTS as entry (entry.value)}
      <a
        href={entry.value === "corpses" ? "/fresh/look" : `/fresh/look?part=${entry.value}`}
        aria-current={entry.value === part ? "page" : undefined}
        data-sveltekit-noscroll
      >
        {entry.label}
      </a>
    {/each}
  </nav>

  <ul class="wall" data-part={part}>
    {#each items as item (item.id)}
      <li style:--tilt="{tiltFor(item.id)}deg">
        <a href={href(item)}>
          <img src={thumbUrl(isCorpses ? "corpses" : "sections", item)} alt={item.title} loading="lazy" />
          <span class="mono">{item.title}</span>
        </a>
      </li>
    {/each}
  </ul>

  {#if hasMore ?? first.hasMore}
    <button class="stamp more" onclick={loadMore} disabled={loading}><Swap labels={["more", "…"]} active={loading ? 1 : 0} /></button>
  {/if}
</main>

<style>
  .look {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  .parts {
    display: flex;
    gap: 24px;
    font-size: 1.125rem;
    font-weight: 500;
  }

  .parts a {
    text-decoration: none;
    color: var(--ink-soft);
  }

  .parts a[aria-current="page"] {
    color: var(--ink);
    background: linear-gradient(transparent 58%, var(--marker) 58%);
  }

  .wall {
    list-style: none;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(190px, 100%), 1fr));
    gap: 48px 40px;
  }

  /* phones: two creatures per row */
  @media (max-width: 519px) {
    .wall:not([data-part="top"], [data-part="mid"], [data-part="bot"]) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px 20px;
    }
    .parts {
      gap: 16px;
      font-size: 1rem;
    }
  }

  .wall[data-part="top"],
  .wall[data-part="mid"],
  .wall[data-part="bot"] {
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  }

  .wall a {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-decoration: none;
  }

  /* each drawing is a little sheet of paper, set down slightly askew */
  .wall img {
    width: 100%;
    background: #fff;
    border: 2px solid var(--light-blue);
    box-shadow: 3px 3px 0 0 var(--blue);
    rotate: var(--tilt);
    transition:
      rotate 200ms cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  @media (hover: hover) {
    .wall a:hover img {
      rotate: 0deg;
      box-shadow: 6px 6px 0 0 var(--orange);
      border-color: var(--yellow);
    }
  }

  .wall .mono {
    padding-left: 2px;
  }

  .more {
    font-size: 0.9375rem;
  }
</style>
