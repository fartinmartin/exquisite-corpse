<script lang="ts">
  import type { HTMLProgressAttributes } from 'svelte/elements';
  import type { Variant } from '$lib/components/styles/types';

  let {
    value,
    max = 100,
    variant,
    size,
    class: className,
    ...rest
  }: {
    value?: number;
    max?: number;
    variant?: Variant;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  } & Omit<HTMLProgressAttributes, 'value' | 'max' | 'class'> = $props();
</script>

<progress
  class={['progress', className]}
  data-variant={variant}
  data-size={size}
  {value}
  {max}
  {...rest}
></progress>

<style>
  .progress {
    appearance: none;
    width: 100%;
    height: 4px;
    border: none;
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    background-color: var(
      --color-fill-normal,
      var(--color-neutral-fill-normal)
    );
  }

  /* Webkit (Chrome, Safari, CEP) */
  .progress::-webkit-progress-bar {
    background-color: var(
      --color-fill-normal,
      var(--color-neutral-fill-normal)
    );
    border-radius: var(--radius-full, 9999px);
  }

  .progress::-webkit-progress-value {
    background-color: var(--color-fill-loud, var(--color-neutral-fill-loud));
    border-radius: var(--radius-full, 9999px);
    transition: width 0.3s ease;
  }

  /* Firefox */
  .progress::-moz-progress-bar {
    background-color: var(--color-fill-loud, var(--color-neutral-fill-loud));
    border-radius: var(--radius-full, 9999px);
  }

  /* Indeterminate (no value attr) */
  .progress:indeterminate::-webkit-progress-bar {
    background: linear-gradient(
      90deg,
      transparent 25%,
      var(--color-fill-loud, var(--color-neutral-fill-loud)) 50%,
      transparent 75%
    );
    background-size: 200% 100%;
    animation: indeterminate 1.5s linear infinite;
  }

  @keyframes indeterminate {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* --- Sizes --- */
  .progress[data-size='sm'] {
    height: 2px;
  }
  .progress[data-size='md'] {
    height: 4px;
  }
  .progress[data-size='lg'] {
    height: 6px;
  }
</style>
