<script lang="ts">
  import { page } from "$app/state";
  import Panel from "$lib/components/panel.svelte";

  const notFound = $derived(page.status === 404);
</script>

<svelte:head>
  <title>exquisite corpse club</title>
</svelte:head>

<div class="container">
  <Panel color="red" class="error-msg">
    <h1 class="mb">
      oop,
      {#if notFound}
        <span>this page does not exist!</span>
      {:else}
        <span>an error occurred!</span>
      {/if}
    </h1>
    <span>best head back <a href="/">home</a></span>
  </Panel>
</div>

<style lang="scss">
  .container {
    display: grid;
    place-items: center;
    min-height: 100vh;
  }

  :global(.error-msg) {
    :global(.content) {
      flex-direction: column;
    }

    :global(a) {
      text-decoration: underline;
      color: var(--blue);
    }
  }
</style>
