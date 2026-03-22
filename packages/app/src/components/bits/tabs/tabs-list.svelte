<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { useTabs } from './tabs-state.svelte.js';

  let {
    children,
    class: className,
    ...rest
  }: HTMLAttributes<HTMLDivElement> = $props();

  const tabs = useTabs();
  const variant = $derived(tabs.variant);
</script>

<div class={['tabs-list', `variant-${variant}`, className]} role="tablist" data-slot="tabs-list" {...rest}>
  {@render children()}
</div>

<style>
  .tabs-list {
    display: inline-flex;
  }

  .variant-pill {
    --_padding-block: 0.65em;
    --_padding-inline: 0.75em;
    --_form-control-height: calc(2 * var(--_padding-block) + 1em * 1.25);
    --_tabs-list-padding: 3px;

    background-color: var(--color-surface-lowered);
    padding: var(--_tabs-list-padding);
    border-radius: var(--radius-lg);
    min-height: var(--_form-control-height);
  }

  .variant-underline {
    gap: 0;
  }
</style>
