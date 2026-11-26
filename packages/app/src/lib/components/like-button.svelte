<script lang="ts">
  import { toggleLike } from "$lib/likes.remote";
  import heart from "$lib/assets/heart.svg?raw";
  import Icon from "./icon.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
    likes: number;
    liked: boolean;
  };

  let { collection, id, likes: initialLikes, liked: initialLiked }: Props = $props();

  // svelte-ignore state_referenced_locally
  let likes = $state(initialLikes);
  // svelte-ignore state_referenced_locally
  let liked = $state(initialLiked);
  let busy = $state(false);

  async function toggle() {
    if (busy) return;
    busy = true;
    try {
      const state = await toggleLike({ collection, id });
      likes = state.likes;
      liked = state.liked;
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
