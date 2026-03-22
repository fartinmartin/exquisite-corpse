<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    children,
    class: className,
    ...rest
  }: { children: Snippet; } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={['accordion', className]} {...rest}>
  {@render children()}
</div>

<style>
  .accordion {
    width: 100%;
  }

  .accordion :global(details) {
    border: 0;
    border-block-end: var(--border-width-thin) var(--border-style) var(--color-surface-border);
    display: block;
    padding-inline: 0;
    padding-block: var(--space-md);
  }

  .accordion :global(details summary) {
    position: relative;
    display: block;
    line-height: var(--leading-tight);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    padding-inline-end: 2em;
  }

  .accordion :global(details[open] summary) {
    margin-block-end: var(--space-xs);
  }

  .accordion :global(details summary::before) {
    position: absolute;
    top: calc(50% - 0.5em);
    right: 1em;
    width: 1em;
    height: 1em;
    transform-origin: center;
    background-color: currentColor;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 6l6 6l-6 6' /%3E%3C/svg%3E");
    mask-position: center;
    mask-size: 1.25em;
    mask-repeat: no-repeat;
    content: '';
    transition: rotate 50ms ease;
  }

  .accordion :global(details summary::-webkit-details-marker) {
    display: none;
  }

  .accordion :global(details[open] summary::before) {
    rotate: 90deg;
  }
</style>
