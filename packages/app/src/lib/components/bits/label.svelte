<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    for: htmlFor,
    children,
    class: className,
  }: {
    for?: string;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<label class={['label', className]} for={htmlFor}>
  {@render children()}
</label>

<style>
  .label {
    display: inline-block;
    position: relative;
    font-size: var(--form-control-font-size, inherit);
    font-weight: var(--font-weight-medium);
    color: var(--form-control-label-color);
    line-height: var(--form-control-label-line-height);
    width: 100%;
  }

  .label :global(span:first-child) {
    display: block;
    margin-block-end: 0.5em;
  }
</style>
