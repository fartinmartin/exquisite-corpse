<script lang="ts">
  import { navigating, page } from "$app/state";
  import Cursor from "$lib/components/cursor.svelte";
  import Help from "$lib/components/help.svelte";
  import Nav from "$lib/components/nav.svelte";
  import { help } from "$lib/help.svelte";
  import "$lib/styles/global.scss";

  let { children } = $props();

  const isIndex = $derived(page.route.id === "/");
  const busy = $derived(navigating.to !== null);

  $effect(() => {
    const html = document.documentElement;
    html.classList.add("ontouchstart" in html ? "touch" : "no-touch");
  });
</script>

{#if !isIndex}
  <Nav />
{/if}

{#if busy}
  <div class="progress"></div>
{/if}

{@render children()}

{#if help.open}
  <Help />
{/if}

<Cursor />
