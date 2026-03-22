<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { createTabs, type TabsVariant } from './tabs-state.svelte.js';

  let {
    value = '',
    variant = 'pill' as TabsVariant,
    onchange,
    children,
    class: className,
    ...rest
  }: {
    value?: string;
    variant?: TabsVariant;
    onchange?: (value: string) => void;
    class?: string;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'class'> = $props();

  // svelte-ignore state_referenced_locally
  const tabs = createTabs(value, variant);
  // svelte-ignore state_referenced_locally
  let prev = value;
  $effect(() => {
    if (tabs.activeTab !== prev) {
      prev = tabs.activeTab;
      onchange?.(tabs.activeTab);
    }
  });
</script>

<div class={['tabs', className]} data-slot="tabs" {...rest}>
  {@render children()}
</div>

<style>
  .tabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
