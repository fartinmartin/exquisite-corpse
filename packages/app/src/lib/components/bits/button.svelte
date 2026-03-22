<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Variant, Appearance, Size } from '@/styles/types';
  import { openURL } from '@/lib/cep';

  let {
    variant,
    appearance,
    size,
    disabled = false,
    iconOnly = false,
    href,
    onclick,
    children,
    class: className,
    ...rest
  }: HTMLButtonAttributes & {
    variant?: Variant;
    appearance?: Appearance;
    size?: Size;
    iconOnly?: boolean;
    href?: string;
    children: Snippet;
    class?: string;
  } = $props();

  function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
    if (href) {
      openURL(href);
    }
    onclick?.(e);
  }
</script>

<button
  type="button"
  class={['button', iconOnly && 'is-icon-only', className]}
  data-variant={variant}
  data-appearance={appearance}
  data-size={size}
  {disabled}
  onclick={handleClick}
  {...rest}
>
  {@render children()}
</button>

<style>
  .button {
    --_padding-block: 0.65em;
    --_padding-inline: 0.75em;
    --_form-control-height: calc(2 * var(--_padding-block) + 1em * 1.25);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    font: inherit;
    font-size: var(--form-control-font-size, var(--text-base));
    border-color: transparent;
    padding-block: 0;
    background-color: var(--color-fill-loud, var(--color-neutral-fill-loud));
    border-radius: var(--form-control-border-radius);
    border-style: var(--border-style);
    border-width: var(--border-width-thin);
    color: var(--color-on-loud, var(--color-neutral-on-loud));
    font-weight: var(--font-weight-medium);
    gap: var(--space-2xs);
    min-height: var(--_form-control-height);
    padding-inline: var(--_padding-inline);
    transition-property: color, background-color, border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .button:hover:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-loud, var(--color-neutral-fill-loud)),
      var(--color-mix-hover, black 5%)
    );
  }

  .button:active:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-loud, var(--color-neutral-fill-loud)),
      var(--color-mix-active, black 10%)
    );
  }

  .button:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-fill-loud);
  }

  .button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* --- Appearances --- */
  .button[data-appearance='soft'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }
  .button[data-appearance='soft']:hover:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 5%
    );
  }
  .button[data-appearance='soft']:active:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 10%
    );
  }
  .button[data-appearance='soft']:focus-visible {
    border-color: transparent;
  }

  .button[data-appearance='soft-outlined'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
    border-style: var(--border-style);
    border-width: var(--border-width-thin);
  }
  .button[data-appearance='soft-outlined']:hover:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 5%
    );
  }
  .button[data-appearance='soft-outlined']:active:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 10%
    );
  }
  .button[data-appearance='soft-outlined']:focus-visible {
    border-color: var(--color-fill-loud);
  }

  .button[data-appearance='outlined'] {
    background-color: transparent;
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
  }
  .button[data-appearance='outlined']:hover:not(:disabled) {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }
  .button[data-appearance='outlined']:active:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 10%
    );
  }
  .button[data-appearance='outlined']:focus-visible {
    border-color: var(--color-fill-loud);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-fill-loud) 25%, transparent);
  }

  .button[data-appearance='ghost'] {
    background-color: transparent;
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }
  .button[data-appearance='ghost']:hover:not(:disabled) {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
  }
  .button[data-appearance='ghost']:active:not(:disabled) {
    background-color: color-mix(
      in oklab,
      var(--color-fill-normal, var(--color-neutral-fill-normal)),
      black 10%
    );
  }
  .button[data-appearance='ghost']:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-fill-loud) 25%, transparent);
    border-color: transparent;
    outline: none;
  }

  /* --- Sizes --- */
  .button[data-size='sm'] {
    font-size: var(--text-sm);
  }
  .button[data-size='md'] {
    font-size: var(--text-base);
  }
  .button[data-size='lg'] {
    font-size: var(--text-lg);
  }

  .button[data-appearance='link'] {
    all: unset;
    display: inline;
    color: var(--color-text-link);
    font: inherit;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    text-decoration: underline;
  }
  .button[data-appearance='link']:hover:not(:disabled) {
    background-color: transparent;
    text-decoration: none;
  }
  .button[data-appearance='link']:focus-visible {
    outline: 2px solid var(--color-text-link);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .button[data-appearance='link']:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* --- Icon-only --- */
  .button.is-icon-only {
    aspect-ratio: 1 / 1;
    width: var(--_form-control-height);
    padding-inline: 0;
  }
</style>
