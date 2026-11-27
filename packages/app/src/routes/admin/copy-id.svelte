<script lang="ts">
  type Props = {
    id: string;
    /** Adds an adjacent button that opens the item. */
    onopen?: () => void;
  };

  let { id, onopen }: Props = $props();

  /** Outcome of the last copy, tied to its id so it never shows on another one. */
  let result = $state.raw<{ id: string; message: string } | null>(null);
  const feedback = $derived(result?.id === id ? result.message : null);

  let code = $state<HTMLElement>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(event: MouseEvent) {
    event.stopPropagation();
    const target = id;
    result = null;
    try {
      await navigator.clipboard.writeText(target);
      result = { id: target, message: "copied" };
    } catch {
      result = { id: target, message: "failed" };
      // Select the id so it can still be copied by hand.
      if (code) getSelection()?.selectAllChildren(code);
    }
    clearTimeout(timer);
    timer = setTimeout(() => (result = null), 1500);
  }

  /** Enter presses this button; it must not also reach the browser's "open" shortcut. */
  function keepEnter(event: KeyboardEvent) {
    if (event.key === "Enter") event.stopPropagation();
  }

  $effect(() => () => clearTimeout(timer));
</script>

<span class="copy-id">
  <button type="button" class="copy" title="copy id" aria-label="copy id {id}" onclick={copy} onkeydown={keepEnter}>
    <code bind:this={code}>{id}</code>
    {#if feedback}<span class="feedback" aria-hidden="true">{feedback}</span>{/if}
  </button>
  {#if onopen}
    <button type="button" class="open" title="open" aria-label="open {id}" onclick={onopen} onkeydown={keepEnter}>
      →
    </button>
  {/if}
  <span class="announce" role="status">
    {#if feedback}{feedback === "copied" ? `copied ${id}` : "copy failed"}{/if}
  </span>
</span>

<style lang="scss">
  .copy-id {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    max-width: 100%;
  }

  button:focus-visible {
    outline: 2px solid var(--blue);
  }

  .copy {
    position: relative;
    min-width: 0;
    cursor: copy;
  }

  code {
    font-family: inherit;
    text-decoration: underline dotted;
    // Ids are case-sensitive; the site lowercases everything else.
    text-transform: none;
    overflow-wrap: anywhere;
    user-select: text;
  }

  // Laid over the id, so nothing around it moves.
  .feedback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    background: var(--black);
    color: var(--white);
  }

  .open {
    padding: 0 0.25rem;
    border: 2px solid var(--black);
    line-height: 1.1;
    cursor: pointer;
  }

  .announce {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
