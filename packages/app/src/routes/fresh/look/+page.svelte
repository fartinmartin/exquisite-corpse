<script lang="ts">
  import { page } from "$app/state";
  import type { Corpse, Section } from "@ecc/firestore";
  import Swap from "../ui/swap.svelte";
  import { backFor } from "#lib/corpse/backs.ts";
  import { tiltFor } from "#lib/corpse/folds.ts";
  import { thumbUrl } from "#lib/thumbs.ts";
  import { goto } from "$app/navigation";
  import { swipe } from "../ui/swipe.ts";
  import { listGallery } from "../../gallery/gallery.remote";

  type Part = "corpses" | "top" | "mid" | "bot";

  /** Paper a sheet shows until its drawing loads: the quiet fold backs. */
  const PAPERS = ["dots", "graph", "ruled", "scuffs"] as const;

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

  /**
   * Pages loaded past the first, tagged with the shelf they belong to. Derived
   * rather than reset in an effect, so a shelf switch never renders the old
   * shelf's items (with the wrong thumbnail collection) for a frame.
   */
  let loaded = $state<{ part: Part; items: (Corpse | Section)[]; nextPage: number; hasMore: boolean } | null>(null);
  let loading = $state(false);

  const extra = $derived(loaded?.part === part ? loaded : null);
  const items = $derived([...(first.items as (Corpse | Section)[]), ...(extra?.items ?? [])]);
  const hasMore = $derived(extra ? extra.hasMore : first.hasMore);

  async function loadMore() {
    const shelf = part;
    const page = extra?.nextPage ?? 1;
    loading = true;
    try {
      const result = await listGallery({ filter: shelf, sort: "date", page });
      const before = loaded?.part === shelf ? loaded.items : [];
      loaded = {
        part: shelf,
        items: [...before, ...(result.items as (Corpse | Section)[])],
        nextPage: page + 1,
        hasMore: result.hasMore,
      };
    } finally {
      loading = false;
    }
  }

  // swipe between shelves: left goes on to the next (creatures → tops → middles → bottoms)
  const shelfHref = (value: Part) => (value === "corpses" ? "/fresh/look" : `/fresh/look?part=${value}`);
  const shelfIndex = $derived(PARTS.findIndex((entry) => entry.value === part));
  const toShelf = (index: number) =>
    index >= 0 && index < PARTS.length ? () => goto(shelfHref(PARTS[index].value)) : undefined;

  const href = (item: Corpse | Section) => (isCorpses ? `/fresh/c/${item.id}` : `/fresh/s/${item.id}`);
</script>

<svelte:head>
  <title>exquisite corpse club ▪ look</title>
</svelte:head>

<main class="look" {@attach swipe({ left: toShelf(shelfIndex + 1), right: toShelf(shelfIndex - 1) })}>
  <nav class="parts">
    {#each PARTS as entry (entry.value)}
      <a
        href={entry.value === "corpses" ? "/fresh/look" : `/fresh/look?part=${entry.value}`}
        aria-current={entry.value === part ? "page" : undefined}
        data-sveltekit-reset="false"
      >
        {entry.label}
      </a>
    {/each}
  </nav>

  <ul class="wall" data-part={part}>
    {#each items as item (item.id)}
      <li style:--tilt="{tiltFor(item.id)}deg">
        <a href={href(item)}>
          <img
            src={thumbUrl(isCorpses ? "corpses" : "sections", item)}
            alt={item.title}
            loading="lazy"
            decoding="async"
            data-paper={backFor(item.id, PAPERS)}
          />
          <span class="mono">{item.title}</span>
        </a>
      </li>
    {/each}
  </ul>

  {#if hasMore}
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
    /* space reserved before the image arrives, so the wall doesn't jump */
    aspect-ratio: 1;
    object-fit: cover;
    background-color: #fff;
    border: 2px solid var(--light-blue);
    box-shadow: 3px 3px 0 0 var(--blue);
    rotate: var(--tilt);
    transition:
      rotate 200ms cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .wall[data-part="top"] img,
  .wall[data-part="mid"] img,
  .wall[data-part="bot"] img {
    aspect-ratio: 3 / 1;
  }

  /* blank paper while loading (same textures as the backs of folded sheets);
     the drawing covers it once it's in */
  .wall img[data-paper="dots"] {
    background-image: radial-gradient(circle, rgba(0, 100, 255, 0.16) 1px, transparent 1.3px);
    background-size: 9px 9px;
  }

  .wall img[data-paper="graph"] {
    background-image:
      linear-gradient(rgba(0, 100, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 100, 255, 0.1) 1px, transparent 1px);
    background-size: 14px 14px;
  }

  .wall img[data-paper="ruled"] {
    background-image:
      linear-gradient(90deg, transparent 11%, rgba(244, 78, 59, 0.28) 11%, rgba(244, 78, 59, 0.28) calc(11% + 1px), transparent calc(11% + 1px)),
      linear-gradient(transparent calc(100% - 1px), rgba(0, 100, 255, 0.16) calc(100% - 1px));
    background-size:
      100% 100%,
      100% 16px;
  }

  .wall img[data-paper="scuffs"] {
    background-image:
      radial-gradient(ellipse 22% 30% at 18% 62%, rgba(35, 31, 32, 0.06), transparent 70%),
      radial-gradient(ellipse 14% 22% at 82% 30%, rgba(35, 31, 32, 0.05), transparent 70%),
      linear-gradient(168deg, transparent 47%, rgba(35, 31, 32, 0.1) 47.3%, transparent 47.8%),
      linear-gradient(12deg, transparent 71%, rgba(35, 31, 32, 0.08) 71.2%, transparent 71.6%);
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
