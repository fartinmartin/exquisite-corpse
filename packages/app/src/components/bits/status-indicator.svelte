<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    status,
    class: className,
    ...rest
  }: {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    class?: string;
  } & Omit<HTMLAttributes<HTMLSpanElement>, 'class'> = $props();
</script>

<span
  class={['status-dot', className]}
  data-status={status}
  role="status"
  aria-label={status}
  {...rest}
></span>

<style>
  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
    background-color: var(--color-text-quiet);
  }

  .status-dot[data-status='connecting'] {
    background-color: var(--color-warning-fill-loud);
  }

  .status-dot[data-status='connected'] {
    background-color: var(--color-success-fill-loud);
  }

  .status-dot[data-status='error'] {
    background-color: var(--color-error-fill-loud);
  }
</style>
