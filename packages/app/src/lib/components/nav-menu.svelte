<script lang="ts">
  import Icon from "./icon.svelte";
  import { help } from "$lib/help.svelte";
  import { page } from "$app/state";

  const isIndex = $derived(page.route.id === "/");
</script>

<div class="menu">
  <button onclick={() => help.show()} data-tooltip="help" aria-label="help">
    <Icon svg="icons/info" shimmer={isIndex} />
  </button>
  <a href="/gallery" data-tooltip="gallery" aria-label="gallery">
    <Icon svg="icons/gallery" />
  </a>
  <a href="/draw" data-tooltip="draw" aria-label="draw">
    <Icon svg="toolbar/draw" />
  </a>
</div>

<style lang="scss">
  .menu {
    display: flex;
    margin-right: -6px;

    > * {
      margin-left: 1rem;
    }
  }
</style>
