<script lang="ts">
  import type { PageData } from "./$types.js";

  let { data }: { data: PageData } = $props();
</script>

<main>
  <h1>Exquisite Corpse Club</h1>
  {#if data.user}
    <p>Signed in as {data.user.did}</p>
    <a href="/draw">Draw</a>
    <a href="/logout">Sign out</a>
  {:else}
    <a href="/login">Sign in with Bluesky</a>
    <a href="/draw">Draw as guest</a>
  {/if}
  <a href="/gallery">Gallery</a>
</main>
