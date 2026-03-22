<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useTabs } from './tabs-state.svelte.js';

  let {
    value,
    children,
    class: className,
  }: {
    value: string;
    children: Snippet;
    class?: string;
  } = $props();

  const tabs = useTabs();
  const active = $derived(tabs.isActive(value));
</script>

{#if active}
  <div
    class={['tabs-panel', className]}
    id={tabs.panelId(value)}
    role="tabpanel"
    aria-labelledby={tabs.triggerId(value)}
    data-value={value}
    data-state="active"
    data-slot="tabs-content"
    tabindex={0}
  >
    {@render children()}
  </div>
{/if}

<style>
  .tabs-panel {
    outline-style: none;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
