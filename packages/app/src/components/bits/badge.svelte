<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Variant } from '$components/styles/types';

  let {
    variant,
    appearance,
    size,
    shape,
    children,
    class: className,
    ...rest
  }: {
    variant?: Variant;
    appearance?: 'soft' | 'outlined' | 'soft-outlined' | 'ghost';
    size?: 'lg';
    shape?: 'square' | 'rounded';
    class?: string;
  } & Omit<HTMLAttributes<HTMLSpanElement>, 'class'> = $props();
</script>

<span
  class={['badge', className]}
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  data-shape={shape}
  {...rest}
>
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    white-space: nowrap;
    flex-shrink: 0;
    overflow: hidden;
    background-color: var(--color-fill-loud, var(--color-neutral-fill-loud));
    color: var(--color-on-loud, var(--color-neutral-on-loud));
    border-radius: var(--radius-full);
    border-style: var(--border-style);
    border-width: var(--border-width-thin);
    border-color: transparent;
    padding: 0 0.75em;
    font-size: max(var(--text-xs), 0.75em);
    font-weight: var(--font-weight-medium);
    gap: var(--space-2xs);
    transition: color var(--transition-normal);
  }

  /* --- Appearances --- */
  .badge[data-appearance='soft'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }

  .badge[data-appearance='outlined'] {
    background-color: transparent;
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
  }

  .badge[data-appearance='soft-outlined'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
    border-style: var(--border-style);
    border-width: var(--border-width-thin);
  }

  .badge[data-appearance='ghost'] {
    background-color: transparent;
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }

  /* --- Sizes --- */
  .badge[data-size='lg'] {
    font-size: var(--text-sm);
  }

  /* --- Shapes --- */
  .badge[data-shape='square'] {
    border-radius: var(--radius-sm);
  }
  .badge[data-shape='rounded'] {
    border-radius: var(--radius-md);
  }
</style>
