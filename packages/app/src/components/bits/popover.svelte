<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    trigger,
    children,
    align = 'end',
    class: className,
  }: {
    open?: boolean;
    trigger: Snippet;
    children: Snippet;
    align?: 'start' | 'end';
    class?: string;
  } = $props();

  let triggerRef: HTMLButtonElement;
  let popoverRef: HTMLDivElement | null = $state(null);

  function handleClickOutside(event: MouseEvent) {
    if (
      open &&
      popoverRef &&
      triggerRef &&
      !popoverRef.contains(event.target as Node) &&
      !triggerRef.contains(event.target as Node)
    ) {
      open = false;
    }
  }

  $effect(() => {
    if (!open) return;
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class={['popover-container', className]}>
  <button
    bind:this={triggerRef}
    class="popover-trigger"
    type="button"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    {@render trigger()}
  </button>

  {#if open}
    <div
      bind:this={popoverRef}
      class={['popover-content', align === 'start' && 'align-start']}
      role="dialog"
    >
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .popover-container {
    position: relative;
  }

  .popover-trigger {
    all: unset;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
  }

  .popover-content {
    position: absolute;
    top: calc(100% + var(--space-xs));
    right: 0;
    outline: none;
    min-width: fit-content;
    background-color: var(--color-surface-raised);
    border-width: var(--panel-border-width);
    border-style: var(--panel-border-style);
    border-color: var(--panel-border-color);
    border-radius: var(--panel-radius);
    padding-inline: var(--space-md);
    padding-block: var(--space-md);
    z-index: var(--z-tooltip);
    max-height: 70vh;
    overflow-y: auto;
    animation: popover-slide-in var(--transition-normal) var(--ease-out);
  }

  .popover-content.align-start {
    right: auto;
    left: 0;
  }

  @keyframes popover-slide-in {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
