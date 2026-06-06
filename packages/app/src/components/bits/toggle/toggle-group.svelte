<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { createToggleGroup } from './toggle-state.svelte.js';

  let {
    value = '',
    onchange,
    children,
    class: className,
    ...rest
  }: {
    value?: string;
    onchange?: (value: string) => void;
    class?: string;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'class'> = $props();

  // svelte-ignore state_referenced_locally
  const group = createToggleGroup(value);
  // svelte-ignore state_referenced_locally
  let prev = value;
  $effect(() => {
    if (group.value !== prev) {
      prev = group.value;
      onchange?.(group.value);
    }
  });
</script>

<div class={['toggle-group', className]} role="group" data-slot="toggle-group" {...rest}>
  {@render children()}
</div>

<style>
  .toggle-group {
    display: inline-flex;
    align-items: center;
  }
</style>
