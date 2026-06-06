<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Size } from '$components/styles/types';
  import { useToggleGroup } from './toggle-state.svelte.js';

  let {
    value,
    pressed = false,
    disabled = false,
    size,
    iconOnly = false,
    children,
    class: className,
    ...rest
  }: {
    value?: string;
    pressed?: boolean;
    disabled?: boolean;
    size?: Size;
    iconOnly?: boolean;
    class?: string;
  } & Omit<HTMLButtonAttributes, 'value' | 'disabled' | 'class'> = $props();

  const group = useToggleGroup();

  const active = $derived(
    group && value !== undefined ? group.isActive(value) : pressed
  );

  function toggle() {
    if (group && value !== undefined) {
      group.activate(value);
    } else {
      pressed = !pressed;
    }
  }
</script>

<button
  class={['toggle', iconOnly && 'is-icon-only', className]}
  type="button"
  aria-pressed={active}
  data-state={active ? 'on' : 'off'}
  data-size={size}
  data-slot="toggle"
  {disabled}
  onclick={toggle}
  {...rest}
>
  {@render children()}
</button>

<style>
  .toggle {
    --_padding-block: 0.65em;
    --_padding-inline: 0.75em;
    --_form-control-height: calc(2 * var(--_padding-block) + 1em * 1.25);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    white-space: nowrap;
    font: inherit;
    font-size: var(--form-control-font-size, var(--text-base));
    font-weight: var(--font-weight-medium);
    gap: var(--space-2xs);
    min-height: var(--_form-control-height);
    padding-block: 0;
    padding-inline: var(--_padding-inline);
    background-color: transparent;
    border-style: var(--border-style);
    border-width: var(--border-width-thin);
    border-color: transparent;
    border-radius: var(--form-control-border-radius);
    color: var(--color-neutral-on-normal);
    transition-property: color, background-color, border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .toggle:hover:not(:disabled) {
    background-color: var(--color-neutral-fill-normal);
  }

  .toggle:active:not(:disabled) {
    background-color: color-mix(in oklab, var(--color-neutral-fill-normal), black 10%);
  }

  .toggle[data-state='on'] {
    background-color: var(--color-neutral-fill-loud);
    color: var(--color-neutral-on-loud);
  }

  .toggle[data-state='on']:hover:not(:disabled) {
    background-color: color-mix(in oklab, var(--color-neutral-fill-loud), black 5%);
  }

  .toggle[data-state='on']:active:not(:disabled) {
    background-color: color-mix(in oklab, var(--color-neutral-fill-loud), black 10%);
  }

  .toggle:focus-visible {
    outline: none;
    border-color: var(--color-neutral-border-normal);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-neutral-border-normal) 25%, transparent);
  }

  .toggle:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* --- Sizes --- */
  .toggle[data-size='sm'] {
    font-size: var(--text-sm);
  }

  .toggle[data-size='md'] {
    font-size: var(--text-base);
  }

  .toggle[data-size='lg'] {
    font-size: var(--text-lg);
  }

  /* --- Icon-only --- */
  .toggle.is-icon-only {
    aspect-ratio: 1 / 1;
    width: var(--_form-control-height);
    padding-inline: 0;
  }
</style>
