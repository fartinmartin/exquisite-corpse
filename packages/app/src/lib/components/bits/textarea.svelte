<script lang="ts">
  import { uid, type Size } from '@/styles/types';
  import Label from './label.svelte';

  let {
    label,
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    invalid = false,
    rows = 3,
    size,
    onchange,
    class: className,
  }: {
    label: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    rows?: number;
    size?: Size;
    onchange?: (value: string) => void;
    class?: string;
  } = $props();

  const textareaId = uid('textarea');

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<Label for={textareaId} class={className}>
  <span>{label}</span>
  <textarea
    id={textareaId}
    class="textarea"
    {placeholder}
    {disabled}
    {rows}
    data-size={size}
    aria-invalid={invalid || undefined}
    oninput={handleInput}>{value}</textarea
  >
</Label>

<style>
  .textarea {
    font: inherit;
    font-size: var(--form-control-font-size, var(--text-base));
    width: 100%;
    min-width: 0;
    padding: var(--space-xs);
    border: var(--form-control-border-width) var(--border-style) var(--form-control-border-color);
    border-radius: var(--form-control-border-radius);
    background-color: var(--form-control-background-color);
    color: var(--form-control-value-color);
    resize: vertical;
    line-height: var(--leading-normal);
    transition-property: border-color;
    transition-timing-function: var(--ease-out);
    transition-duration: var(--transition-normal);
  }

  .textarea::placeholder {
    color: var(--form-control-placeholder-color);
    opacity: 0.5;
  }

  .textarea:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-fill-loud);
  }

  .textarea[aria-invalid='true']:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-error-fill-loud) 25%, transparent);
    outline: none;
    border-color: var(--color-error-fill-loud);
  }

  .textarea:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* --- Sizes --- */
  .textarea[data-size='xs'] {
    font-size: var(--text-xs);
  }
  .textarea[data-size='sm'] {
    font-size: var(--text-sm);
  }
  .textarea[data-size='md'] {
    font-size: var(--text-base);
  }
  .textarea[data-size='lg'] {
    font-size: var(--text-lg);
  }
</style>
