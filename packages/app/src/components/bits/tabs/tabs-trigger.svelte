<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { useTabs } from './tabs-state.svelte.js';

  let {
    value,
    disabled = false,
    children,
    class: className,
    ...rest
  }: {
    value: string;
    disabled?: boolean;
    class?: string;
  } & Omit<HTMLButtonAttributes, 'value' | 'disabled' | 'class'> = $props();

  const tabs = useTabs();
  const active = $derived(tabs.isActive(value));
  const variant = $derived(tabs.variant);
</script>

<button
  class={['tabs-trigger', `variant-${variant}`, className]}
  id={tabs.triggerId(value)}
  role="tab"
  type="button"
  data-state={active ? 'active' : 'inactive'}
  data-slot="tabs-trigger"
  aria-selected={active}
  aria-controls={tabs.panelId(value)}
  tabindex={active ? 0 : -1}
  {disabled}
  onclick={() => tabs.activate(value)}
  {...rest}
>
  {@render children()}
</button>

<style>
  .tabs-trigger {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    white-space: nowrap;
    font-size: inherit;
    color: var(--color-text-normal);
    font-weight: var(--font-weight-medium);
    gap: var(--space-2xs);
    outline-style: none;
  }

  .tabs-trigger:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* pill variant */
  .variant-pill {
    padding-block: 0;
    padding-inline: 0.75em;
    background-color: var(--color-surface-lowered);
    border-width: var(--border-width-thin);
    border-style: var(--border-style);
    border-color: transparent;
    border-radius: var(--radius-md);
    transition-property: color, background-color, border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .variant-pill[data-state='active'] {
    background-color: var(--color-surface-default);
    border-color: var(--color-border-quiet);
  }

  .variant-pill:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-neutral-border-normal) 25%, transparent);
    border-color: var(--color-neutral-border-normal);
    z-index: var(--z-raised);
  }

  /* underline variant */
  .variant-underline {
    color: var(--color-text-quiet);
    font-size: var(--text-sm);
    padding: var(--space-md) var(--space-sm);
    border-bottom: 2px solid transparent;
    user-select: none;
    -webkit-user-select: none;
  }

  .variant-underline:hover {
    color: var(--color-text-normal);
  }

  .variant-underline[data-state='active'] {
    color: var(--color-text-normal);
    border-bottom-color: var(--color-accent-fill-loud);
  }

  .variant-underline:focus-visible {
    box-shadow: 0 0 0 3px inset color-mix(in oklab, var(--color-accent-fill-loud) 25%, transparent);
  }
</style>
