<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Variant } from '$lib/components/styles/types';

  let {
    variant,
    appearance,
    size,
    title,
    children,
    icon,
    class: className,
    ...rest
  }: {
    variant?: Variant;
    appearance?: 'outlined' | 'soft' | 'soft-outlined';
    size?: 'sm' | 'md' | 'lg';
    title?: string;
    children?: Snippet;
    icon?: Snippet;
    class?: string;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'class'> = $props();
</script>

<div
  class={['alert flow', className]}
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  role="alert"
  {...rest}
>
  {#if icon}
    {@render icon()}
  {/if}
  {#if title}
    <div class="alert-title">{title}</div>
  {/if}
  {#if children}
    <div class="alert-description">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .alert {
    --flow-space: var(--space-2xs);
    position: relative;
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border: var(--border-width-thin) var(--border-style)
      var(--color-border-normal, var(--color-neutral-border-normal));
    padding-inline: var(--space-sm);
    padding-block: var(--space-xs);
    border-radius: var(--panel-radius);
  }

  .alert:has(:global(svg)) {
    display: grid;
    grid-template-columns: 1rem 1fr;
    row-gap: var(--space-3xs);
    column-gap: var(--space-xs);
  }

  .alert :global(svg) {
    justify-self: center;
    align-self: center;
  }

  .alert-title {
    font-weight: var(--font-weight-semibold);
    font-size: var(--text-base);
    letter-spacing: var(--tracking-tight);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    grid-column-start: 2;
  }

  .alert-description {
    grid-column-start: 2;
    display: flex;
    flex-direction: column;
    gap: var(--alert-description-gap, 0);
    font-size: var(--text-sm);
  }

  .alert :global(a) {
    color: inherit;
  }

  /* --- Appearances --- */
  .alert[data-appearance='outlined'] {
    background-color: transparent;
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
  }

  .alert[data-appearance='soft'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    border-color: transparent;
  }

  .alert[data-appearance='soft-outlined'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
  }

  /* --- Sizes --- */
  .alert[data-size='sm'] {
    font-size: var(--text-sm);
  }
  .alert[data-size='md'] {
    font-size: var(--text-base);
  }
  .alert[data-size='lg'] {
    font-size: var(--text-lg);
  }
</style>
