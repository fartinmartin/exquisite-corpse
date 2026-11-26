<script lang="ts">
  import DownloadButton from "./download-button.svelte";
  import LikeButton from "./like-button.svelte";
  import PermalinkButton from "./permalink-button.svelte";

  type Props = {
    collection: "sections" | "corpses";
    id: string;
    title: string;
    thumb: string;
    likes: number;
    liked: boolean;
    artist?: string;
  };

  let { collection, id, title, thumb, likes, liked, artist }: Props = $props();
</script>

<div class="menu">
  <LikeButton {collection} {id} {likes} {liked} />
  <PermalinkButton {collection} {id} />
  <DownloadButton image={thumb} {title} {artist} />
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
