<script lang="ts">
  import { navigating, page } from "$app/state";
  import Cursor from "#lib/components/cursor.svelte";
  import Help from "#lib/components/help.svelte";
  import Nav from "#lib/components/nav.svelte";
  import { help } from "#lib/help.svelte.ts";
  import "#lib/styles/global.scss";

  let { children } = $props();

  const isIndex = $derived(page.route.id === "/");
  const busy = $derived(navigating.to !== null);
  // /fresh has its own chrome (header, about, brush cursor).
  const fresh = $derived(page.route.id?.startsWith("/fresh") ?? false);

  $effect(() => {
    const html = document.documentElement;
    html.classList.add("ontouchstart" in html ? "touch" : "no-touch");
  });
</script>

{#if !isIndex && !fresh}
  <Nav />
{/if}

{#if busy}
  <div class="progress"></div>
{/if}

{@render children()}

{#if help.open && !fresh}
  <Help />
{/if}

{#if !fresh}
  <Cursor />
{/if}
