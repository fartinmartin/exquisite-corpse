<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let {
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    label,
    class: className,
    onchange,
    ...rest
  }: {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    label?: string;
    class?: string;
    onchange?: (checked: boolean) => void;
  } & Omit<HTMLInputAttributes, 'checked' | 'indeterminate' | 'disabled' | 'type' | 'class'> = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

{#if label}
  <label class={['checkbox-label', className]}>
    <input
      type="checkbox"
      class="checkbox"
      {checked}
      {indeterminate}
      {disabled}
      onchange={handleChange}
      {...rest}
    />
    {label}
  </label>
{:else}
  <input
    type="checkbox"
    class={['checkbox', className]}
    {checked}
    {indeterminate}
    {disabled}
    onchange={handleChange}
    {...rest}
  />
{/if}

<style>
  .checkbox-label {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    font: inherit;
    font-size: var(--form-control-font-size);
    line-height: var(--form-control-line-height);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  .checkbox-label:has(:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox {
    --checked-icon-color: var(--color-accent-on-loud);
    --checked-icon-scale: 0.8;

    appearance: none;
    vertical-align: middle;
    font-size: var(--form-control-font-size, var(--text-base));
    width: 1.1em;
    height: 1.1em;
    border: var(--form-control-border-width) var(--form-control-border-style)
      var(--form-control-border-color);
    border-radius: min(0.4em, var(--radius-md));
    flex-shrink: 0;
    padding: 0;
    margin: 0;
    margin-inline-end: 0.5em;
    background: none;
    background-color: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    outline-style: none;
  }

  .checkbox:not(:disabled) {
    cursor: pointer;
  }

  .checkbox:checked::after,
  .checkbox:indeterminate::after {
    content: '';
    width: 1.1em;
    height: 1.1em;
    scale: var(--checked-icon-scale);
    background-color: currentColor;
  }

  .checkbox:checked,
  .checkbox:indeterminate {
    color: var(--checked-icon-color);
    background-color: var(--form-control-activated-color);
    border-color: var(--form-control-activated-color);
  }

  .checkbox:checked::after {
    mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>')
      center / 1em 1em no-repeat;
  }

  .checkbox:indeterminate::after {
    mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><path d="M431 256c0 17.7-14.3 32-32 32H49c-17.7 0-32-14.3-32-32s14.3-32 32-32h350c17.7 0 32 14.3 32 32z"/></svg>')
      center no-repeat;
  }

  .checkbox:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-neutral-border-normal) 25%, transparent);
    outline: none;
    border-color: var(--color-neutral-border-normal);
  }

  .checkbox:checked:focus-visible,
  .checkbox:indeterminate:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-accent-fill-loud);
  }
</style>
