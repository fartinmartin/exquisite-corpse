<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className,
  }: {
    children: Snippet;
    class?: string;
  } = $props();
</script>

<div class={['card', className]}>
  {@render children()}
</div>

<style>
  .card {
    --inner-border-radius: calc(var(--panel-radius) - var(--panel-border-width));
    position: relative;
    background-color: var(--color-surface-raised);
    border: var(--panel-border-width) var(--panel-border-style) var(--panel-border-color);
    border-radius: var(--panel-radius);
  }

  .card :global(.card-header) {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding-block-start: var(--space-md);
    padding-inline: var(--space-md);
  }

  .card :global(.card-media) {
    display: flex;
    overflow: hidden;
    border-start-start-radius: var(--inner-border-radius);
    border-start-end-radius: var(--inner-border-radius);
  }

  .card :global(.card-content) {
    padding-block: var(--space-md);
    padding-inline: var(--space-md);
  }

  .card :global(.card-footer) {
    padding-block-end: var(--space-md);
    padding-inline: var(--space-md);
  }
</style>
