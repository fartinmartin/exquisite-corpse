<script lang="ts">
  import Button from '$components/bits/button.svelte';
  import type { PageData } from "./$types.js";

  let { data }: { data: PageData } = $props();
</script>

<main class="canvas flow">
  <h1>exquisite corpse club</h1>

  {#if data.user}
    <p>signed in as {data.user.did}</p>
    <div class="cluster gap-xs">
      <Button href="/draw">draw</Button>
      <form method="POST" action="/logout">
        <Button type="submit">sign out</Button>
      </form>
    </div>
  {:else}
    <div class="cluster gap-xs">
      <Button href="/login">sign in with bluesky</Button>
      <Button href="/draw" appearance="outlined">draw as guest</Button>
    </div>
  {/if}

  <Button href="/gallery" appearance="ghost">gallery →</Button>
</main>

<style>
  main {
    padding-block: var(--space-xl);
    padding-inline: var(--space-md);
  }
</style>
