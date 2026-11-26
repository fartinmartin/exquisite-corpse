<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import DownloadButton from "./download-button.svelte";
  import LikeButton from "./like-button.svelte";
  import PermalinkButton from "./permalink-button.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
    title: string;
    drawings: DrawingData[];
    likes: number;
    artist?: string;
  };

  let { collection, id, title, drawings, likes, artist }: Props = $props();
</script>

<div class="menu">
  <LikeButton {collection} {id} {likes} />
  <PermalinkButton {collection} {id} />
  <DownloadButton {drawings} {title} {artist} />
</div>

<style lang="scss">
  .menu {
    display: flex;
    align-items: center;

    > :global(*) {
      margin-left: 0.5rem;
    }

    > :global(:nth-child(2)) {
      margin-left: 0.375rem;
    }
  }
</style>
