<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    checked = $bindable(false),
    disabled = false,
    label,
    class: className,
    onchange,
    ...rest
  }: {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    class?: string;
    onchange?: (checked: boolean) => void;
  } & Omit<HTMLInputAttributes, 'checked' | 'disabled' | 'type' | 'class'> = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

{#if label}
  <label class={['switch-label', className]}>
    <input
      type="checkbox"
      role="switch"
      class="switch"
      {checked}
      {disabled}
      onchange={handleChange}
      {...rest}
    />
    {label}
  </label>
{:else}
  <input
    type="checkbox"
    role="switch"
    class={['switch', className]}
    {checked}
    {disabled}
    onchange={handleChange}
    {...rest}
  />
{/if}

<style>
  .switch-label {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    gap: 0.5em;
    font: inherit;
    font-size: var(--form-control-font-size);
    line-height: var(--form-control-line-height);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  .switch-label:has(:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch {
    --_switch-height: 1em;
    --_switch-width: 1.85em;
    --_switch-thumb-size: calc(var(--_switch-height) - var(--form-control-border-width) * 2);
    --_switch-thumb-travel: calc(var(--_switch-width) - var(--_switch-height));

    appearance: none;
    cursor: pointer;
    position: relative;
    font-size: var(--form-control-font-size, var(--text-base));
    width: var(--_switch-width);
    height: var(--_switch-height);
    border-radius: var(--radius-full);
    background-color: var(--color-surface-lowest);
    border: 1px var(--border-style) transparent;
    transition: background-color var(--transition-normal) var(--ease-in-out);
    flex-shrink: 0;
    margin: 0;
  }

  .switch::before {
    content: '';
    position: absolute;
    left: 0;
    width: var(--_switch-thumb-size);
    height: var(--_switch-thumb-size);
    border: var(--border-width-thin) var(--border-style) var(--color-border-quiet);
    border-radius: var(--radius-full);
    background-color: var(--color-surface-default);
    transition: transform var(--transition-normal) var(--ease-in-out);
  }

  .switch:checked {
    background-color: var(--color-accent-fill-loud, var(--color-neutral-fill-loud));
  }

  .switch:checked::before {
    transform: translateX(var(--_switch-thumb-travel));
  }

  .switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent-fill-loud) 25%, transparent);
    outline: none;
  }
</style>
