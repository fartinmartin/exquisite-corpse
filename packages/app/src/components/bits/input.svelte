<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { uid, type Size } from '$components/styles/types';
  import Label from './label.svelte';

  let {
    label,
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    disabled = false,
    invalid = false,
    appearance,
    size,
    suffix,
    onchange,
    onblur,
    class: className,
    ...rest
  }: {
    label: string;
    value?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    appearance?: 'soft' | 'soft-outlined';
    size?: Size;
    suffix?: Snippet;
    onchange?: (value: string) => void;
    onblur?: () => void;
    class?: string;
  } & Omit<HTMLInputAttributes, 'value' | 'type' | 'placeholder' | 'disabled' | 'class'> = $props();

  const inputId = uid('input');

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<Label for={inputId} class={className}>
  <span>{label}</span>
  <div class="input-wrapper">
    <input
      id={inputId}
      class={['input', suffix && 'has-suffix']}
      {type}
      {placeholder}
      {value}
      {disabled}
      data-appearance={appearance}
      data-size={size}
      aria-invalid={invalid || undefined}
      oninput={handleInput}
      {onblur}
      {...rest}
    />
    {#if suffix}
      <div class="suffix">
        {@render suffix()}
      </div>
    {/if}
  </div>
</Label>

<style>
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    --_padding-block: 0.65em;
    --_padding-inline: 0.75em;
    --_form-control-height: calc(2 * var(--_padding-block) + 1em * 1.25);

    font: inherit;
    font-size: var(--form-control-font-size, var(--text-base));
    appearance: none;
    inline-size: 100%;
    padding-inline: var(--_padding-inline);
    padding-block: 0;
    height: var(--_form-control-height);
    border: var(--form-control-border-width) var(--border-style) var(--form-control-border-color);
    border-radius: var(--form-control-border-radius);
    background-color: var(--form-control-background-color);
    color: var(--form-control-value-color);
    transition-property: border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .input.has-suffix {
    padding-inline-end: var(--_suffix-width, 5rem);
  }

  .suffix {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding-inline-end: 0.25em;
  }

  .input::placeholder {
    color: var(--form-control-placeholder-color);
    opacity: 0.5;
  }

  .input:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-fill-loud);
  }

  .input[aria-invalid='true']:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-error-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-error-fill-loud);
  }

  .input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* --- Appearances --- */
  .input[data-appearance='soft'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: transparent;
  }

  .input[data-appearance='soft-outlined'] {
    background-color: var(--color-fill-normal, var(--color-neutral-fill-normal));
    color: var(--color-on-normal, var(--color-neutral-on-normal));
    border-color: var(--color-border-normal, var(--color-neutral-border-normal));
  }
  .input[data-appearance='soft-outlined']:focus-visible {
    border-color: var(--color-fill-loud);
  }

  /* --- Sizes --- */
  .input[data-size='xs'] {
    font-size: var(--text-xs);
  }
  .input[data-size='sm'] {
    font-size: var(--text-sm);
  }
  .input[data-size='md'] {
    font-size: var(--text-base);
  }
  .input[data-size='lg'] {
    font-size: var(--text-lg);
  }
</style>
