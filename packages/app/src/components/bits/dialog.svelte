<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    children,
    class: className,
    onclose,
  }: {
    open?: boolean;
    children: Snippet;
    class?: string;
    onclose?: () => void;
  } = $props();

  let dialogRef: HTMLDialogElement;

  $effect(() => {
    if (!dialogRef) return;
    if (open && !dialogRef.open) {
      dialogRef.showModal();
    } else if (!open && dialogRef.open) {
      dialogRef.close();
    }
  });

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialogRef) {
      open = false;
    }
  }
</script>

<dialog
  bind:this={dialogRef}
  class={['dialog', className]}
  onclose={handleClose}
  onclick={handleBackdropClick}
>
  {@render children()}
</dialog>

<style>
  .dialog {
    align-content: start;
    margin: auto;
    inset: 0;
    overflow: hidden;
    width: 32rem;
    max-width: calc(100% - var(--space-3xl));
    padding: var(--space-lg);
    background-color: var(--color-surface-raised);
    border: var(--border-width-thin) var(--border-style) var(--color-border-normal);
    border-radius: var(--panel-radius);
    color: var(--color-text-normal);
  }

  .dialog:focus {
    outline: none;
  }

  .dialog[open] {
    display: grid;
    animation: dialog-open 200ms var(--ease-out);
  }

  .dialog::backdrop {
    background-color: var(--color-overlay);
    animation: dialog-backdrop-fade-in 200ms var(--ease-out);
  }

  @keyframes dialog-open {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes dialog-backdrop-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
