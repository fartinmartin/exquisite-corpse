<script lang="ts">
  import { artistHref } from "#lib/corpse/types.ts";

  type Props = {
    name: string;
    /** -1 while the name sits somewhere hidden (e.g. the back of a sheet that's face up). */
    tabindex?: number;
  };

  let { name, tabindex }: Props = $props();

  /*
   * Every artist name on /fresh goes through here, so linking names to an
   * artist page later is one change. Names are free text today (anyone can
   * sign as anyone), so there's no page yet: see docs/plans/fresh.md,
   * "Artists". For now an @name links to Instagram, as on the old site, and
   * everything else (including "anonymous") is plain text.
   */
  const href = $derived(artistHref(name));
</script>

{#if href}
  <a class="squiggle artist" {href} target="_blank" rel="noopener noreferrer" {tabindex}>{name}</a>
{:else}
  <span class="artist">{name}</span>
{/if}
