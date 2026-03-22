<script lang="ts">
  import type { Snippet } from 'svelte';
  import { uid } from '@/styles/types';
  import Label from './label.svelte';

  let {
    label,
    value = $bindable(''),
    disabled = false,
    children,
    class: className,
    onchange,
  }: {
    label?: string;
    value?: string;
    disabled?: boolean;
    children: Snippet;
    class?: string;
    onchange?: (value: string) => void;
  } = $props();

  const selectId = uid('select');

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    onchange?.(value);
  }
</script>

{#if label}
  <Label for={selectId} class={className}>
    <span>{label}</span>
    <select id={selectId} class="select" {value} {disabled} onchange={handleChange}>
      {@render children()}
    </select>
  </Label>
{:else}
  <select class={['select', className]} {value} {disabled} onchange={handleChange}>
    {@render children()}
  </select>
{/if}

<style>
  .select {
    --_padding-block: 0.65em;
    --_padding-inline: 0.75em;
    --_form-control-height: calc(2 * var(--_padding-block) + 1em * 1.25);

    appearance: none;
    background-color: var(--color-surface-default);
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    font: inherit;
    font-size: var(--form-control-font-size, var(--text-base));
    min-height: var(--_form-control-height);
    padding-inline: var(--_padding-inline);
    padding-inline-end: 2.5em;
    padding-block: 0;
    border: var(--form-control-border-width) var(--border-style) var(--form-control-border-color);
    border-radius: var(--form-control-border-radius);
    color: var(--form-control-value-color);
    cursor: pointer;
    background-image:
      linear-gradient(45deg, transparent 50%, currentColor 50%),
      linear-gradient(135deg, currentColor 50%, transparent 50%);
    background-position:
      calc(100% - 1em) center,
      calc(100% - 0.75em) center;
    background-size: 0.25em 0.25em;
    background-repeat: no-repeat;
    transition-property: border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .select:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-neutral-border-normal) 50%, transparent);
    outline: none;
    border-color: var(--color-neutral-border-normal);
  }

  .select:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
