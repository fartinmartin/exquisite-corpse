<script lang="ts">
  import type { LikeState } from "@ecc/firestore";
  import { getLikeState, toggleLike } from "#lib/likes.remote.ts";
  import heart from "#lib/assets/heart.svg?raw";
  import Icon from "./icon.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
    /** Count from the (CDN-cached) page data, shown until this visitor's state loads. */
    likes: number;
  };

  let { collection, id, likes: publicLikes }: Props = $props();

  /** This visitor's state for `id`; `null` until fetched after hydration. */
  let own = $state<(LikeState & { id: string }) | null>(null);
  let busy = $state(false);
  let token = 0;

  const current = $derived(own?.id === id ? own : null);
  const likes = $derived(current?.likes ?? publicLikes);
  const liked = $derived(current?.liked ?? false);

  // Runs in the browser only, so cached page HTML never carries per-visitor state.
  $effect(() => {
    const target = { collection, id };
    const call = ++token;
    void (async () => {
      try {
        const state = await getLikeState(target);
        if (call === token) own = { ...state, id: target.id };
      } catch {
        // best-effort: the public count stays on screen
      }
    })();
  });

  async function toggle() {
    if (busy) return;
    busy = true;
    const target = { collection, id };
    try {
      const state = await toggleLike(target);
      token++; // supersede any in-flight getLikeState
      own = { ...state, id: target.id };
    } catch {
      // Refused (e.g. the site is read-only) or offline: the count just stays as is.
    } finally {
      busy = false;
    }
  }
</script>

<button onclick={toggle} aria-label={liked ? "unlike" : "like"}>
  <Icon class={`heart ${liked ? "liked" : ""}`}>
    <span>{likes > 0 ? likes : ""}</span>
    <div class="heart-icon">
      {@html heart}
    </div>
  </Icon>
</button>

<style lang="scss">
  :global(.icon.heart) {
    min-width: 25px;
  }

  :global(.icon.heart.liked) {
    padding: 0 0 0 5px;
  }

  :global(.icon.heart span) {
    margin-right: 0.25rem;
    font-size: 0.875rem;
    margin-bottom: 2px;
  }

  .heart-icon {
    width: 25px;
    height: 25px;
    pointer-events: none;

    :global(svg) {
      width: 100%;
      height: 100%;
    }
  }
</style>
