<script lang="ts">
  import type { LikeState } from "@ecc/firestore";
  import type { DrawingData } from "@ecc/lexicons";
  import { getLikeState, toggleLike } from "#lib/likes.remote.ts";
  import { drawingsToPng } from "#lib/render.ts";
  import Swap from "./swap.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
    /** Count from the (CDN-cached) page data, shown until this visitor's state loads. */
    likes: number;
    /** Panels to stack top to bottom for the download: one for a section, three for a creature. */
    drawings: DrawingData[];
    filename: string;
  };

  let { collection, id, likes: publicLikes, drawings, filename }: Props = $props();

  /** This visitor's state for `id`; `null` until fetched after hydration. */
  let own = $state<(LikeState & { id: string }) | null>(null);
  let busy = $state(false);
  let burst = $state(0);
  let copied = $state(false);
  let token = 0;

  const current = $derived(own?.id === id ? own : null);
  const likes = $derived(current?.likes ?? publicLikes);
  const liked = $derived(current?.liked ?? false);

  // Browser only, so cached page HTML never carries per-visitor state.
  $effect(() => {
    const target = { collection, id };
    const call = ++token;
    getLikeState(target).then(
      (state) => {
        if (call === token) own = { ...state, id: target.id };
      },
      () => {} // best-effort: the public count stays on screen
    );
  });

  async function like() {
    if (busy) return;
    busy = true;
    const target = { collection, id };
    const before = { likes, liked };
    // optimistic: the heart fills right away
    own = { id, liked: !before.liked, likes: before.likes + (before.liked ? -1 : 1) };
    if (!before.liked) burst++;
    token++; // supersede any in-flight getLikeState
    try {
      own = { ...(await toggleLike(target)), id: target.id };
    } catch {
      // refused (e.g. the site is read-only) or offline: put it back
      own = { ...before, id: target.id };
    } finally {
      busy = false;
    }
  }

  async function copy() {
    // only claim "copied!" when it really was
    const ok = await navigator.clipboard?.writeText(location.href).then(() => true, () => false);
    if (!ok) return;
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }

  // Rendered from the drawings on click, so pages don't ship a full-size image.
  async function download() {
    const blob = await drawingsToPng(drawings);
    if (!blob) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<!--
  The small actions under a drawing: a doodled heart, then ink stamps for the
  things you do right here (stamps act, squiggles navigate).
-->
<p class="actions mono">
  <button class="like" onclick={like} aria-pressed={liked} aria-label={liked ? "unlike" : "like"}>
    <span class="heart-wrap">
      <svg class="heart" data-filled={liked || undefined} viewBox="0 0 24 22" aria-hidden="true">
        <path
          d="M12 20.2 C 6.5 16.4, 1.8 12.6, 2.3 7.4 C 2.7 3.6, 6.6 1.6, 9.6 3.4 C 10.8 4.1, 11.6 5.2, 12.1 6.3 C 12.8 4.8, 14 3.4, 15.8 2.8 C 19 1.8, 22.2 4.2, 21.8 8 C 21.3 12.8, 16.6 16.6, 12 20.2 Z"
        />
      </svg>
      {#key burst}
        {#if liked && burst > 0}<span class="burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>{/if}
      {/key}
    </span>
    <span class="count">{likes}</span>
  </button>
  <button class="stamp" style:--r="-3deg" data-done={copied || undefined} onclick={copy}>
    <Swap labels={["copy link", "copied!"]} active={copied ? 1 : 0} />
  </button>
  <button class="stamp" style:--r="2deg" onclick={download}>download</button>
</p>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  .like {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ink);
  }

  .count {
    font-variant-numeric: tabular-nums;
    min-width: 1ch;
  }

  .heart-wrap {
    position: relative;
    display: inline-grid;
    place-items: center;
  }

  .heart {
    width: 20px;
    height: 18px;
    overflow: visible;
    transition: scale 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .heart path {
    fill: transparent;
    stroke: var(--ink);
    stroke-width: 1.8;
    stroke-linejoin: round;
    transition:
      fill 200ms ease,
      stroke 200ms ease;
  }

  @media (hover: hover) {
    .like:hover .heart path {
      stroke: var(--red);
    }
  }

  .heart[data-filled] {
    scale: 1.15;
  }

  .heart[data-filled] path {
    fill: var(--red);
    stroke: var(--red);
  }

  .like:focus-visible {
    outline: 2px dashed var(--blue);
    outline-offset: 4px;
  }

  .burst {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .burst i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2px;
    height: 5px;
    margin: -2.5px -1px;
    background: var(--red);
    border-radius: 1px;
    animation: pop 450ms ease-out forwards;
  }

  .burst i:nth-child(1) {
    --a: -90deg;
  }
  .burst i:nth-child(2) {
    --a: -18deg;
  }
  .burst i:nth-child(3) {
    --a: 54deg;
  }
  .burst i:nth-child(4) {
    --a: 126deg;
  }
  .burst i:nth-child(5) {
    --a: 198deg;
  }

  @keyframes pop {
    from {
      transform: rotate(var(--a)) translateY(-8px);
      opacity: 1;
    }
    to {
      transform: rotate(var(--a)) translateY(-17px);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .burst {
      display: none;
    }
  }
</style>
