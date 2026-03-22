<script lang="ts">
  import EmojiFavicon from "$components/bits/emoji-favicon.svelte";
  import "$components/styles/app.css"

  let { children } = $props();
</script>

<svelte:head>
  <EmojiFavicon emoji="🖼️"/>
</svelte:head>

{@render children()}
