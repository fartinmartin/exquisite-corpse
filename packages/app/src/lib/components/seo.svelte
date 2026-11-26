<script lang="ts">
  import { page } from "$app/state";

  type Props = {
    /** Page-specific part of the title; the site name is added in front. */
    title?: string;
    description?: string;
    /** Absolute URL for link previews. Defaults to the site banner. */
    image?: string;
    /** Keep the page out of search results (admin, errors). */
    noindex?: boolean;
  };

  const SITE = "exquisite corpse club";
  const DEFAULT_DESCRIPTION = "an online collaborative drawing game. ✏️";
  const BANNER = { path: "/banner.png", width: 1200, height: 627 };

  let { title, description = DEFAULT_DESCRIPTION, image, noindex = false }: Props = $props();

  const fullTitle = $derived(title ? `${SITE} ▪ ${title}` : SITE);
  // Query strings don't change page content here, so they're left out of the canonical URL.
  const url = $derived(`${page.url.origin}${page.url.pathname}`);
  const imageUrl = $derived(image ?? `${page.url.origin}${BANNER.path}`);
</script>

<!-- Every page renders exactly one of these; app.html only has site-wide tags. -->
<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {:else}
    <link rel="canonical" href={url} />
  {/if}

  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={imageUrl} />
  {#if !image}
    <meta property="og:image:width" content={String(BANNER.width)} />
    <meta property="og:image:height" content={String(BANNER.height)} />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
