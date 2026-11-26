<script lang="ts">
  import { navigating } from "$app/state";
  import { drawState } from "#lib/draw/state.svelte.ts";

  type CursorState = "auto" | "pointer" | "disabled" | "grab" | "draw" | "erase" | "fill";

  let cursorEl: HTMLElement;
  let tooltipEl = $state<HTMLElement>();

  let x = $state(0);
  let y = $state(0);
  let cursor = $state<CursorState>("auto");
  let tooltip = $state<string | null>(null);
  let flipTooltip = $state(false);

  let lastEvent: MouseEvent | null = null;

  const loading = $derived(navigating.to !== null);

  const offset = $derived.by(() => {
    switch (cursor) {
      case "auto":
        return { x: -3, y: 0 };
      case "disabled":
        return { x: -5, y: -5 };
      case "draw":
        return { x: 1, y: -24 };
      case "erase":
        return { x: -12, y: -21 };
      case "fill":
        return { x: -1, y: -22 };
      default:
        return { x: 0, y: 0 };
    }
  });

  function evaluate(event: MouseEvent) {
    lastEvent = event;

    const target = event.target as HTMLElement;
    const targets = target?.parentNode ? [target, target.parentNode as HTMLElement] : [document.documentElement];

    const hasTooltip = (node: HTMLElement) => node.dataset?.tooltip;
    const isDisabled = (node: HTMLElement) => "disabled" in node ? Boolean((node as HTMLButtonElement).disabled) || node.classList.contains("disabled") : node.classList.contains("disabled");
    const isCanvas = (node: HTMLElement) => node.tagName === "CANVAS";
    const isClickable = (node: HTMLElement) =>
      ["BUTTON", "LABEL", "INPUT", "A", "SELECT"].includes(node.tagName) ||
      node.classList.contains("pointer");

    if (loading || document.body.dataset.loading === "true") cursor = "auto";
    else if (targets.some(isDisabled)) cursor = "disabled";
    else if (targets.some(isCanvas)) cursor = drawState.mode;
    else if (targets.some(isClickable)) cursor = "pointer";
    else cursor = "auto";

    const tooltipTarget = targets.find(hasTooltip);
    tooltip = tooltipTarget?.dataset.tooltip ?? null;

    x = event.clientX + offset.x;
    y = event.clientY + offset.y;
  }

  function move(event: MouseEvent) {
    evaluate(event);
    if (cursorEl) cursorEl.style.transform = `translate(${x}px,${y}px)`;

    if (tooltip && tooltipEl) {
      flipTooltip = window.innerWidth - event.clientX < tooltipEl.offsetWidth + 60;
    }
  }

  function down(event: MouseEvent) {
    if ((event.target as HTMLElement)?.tagName !== "CANVAS") cursor = "grab";
  }

  function up(event: MouseEvent) {
    if ((event.target as HTMLElement)?.tagName !== "CANVAS") {
      move(event);
      tooltip = null;
    }
  }

  $effect(() => {
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  });

  // Re-evaluate the last hovered target when loading or the brush mode changes.
  $effect(() => {
    void loading;
    void drawState.mode;
    if (lastEvent) {
      evaluate(lastEvent);
      if (cursorEl) cursorEl.style.transform = `translate(${x}px,${y}px)`;
    }
  });
</script>

<div id="cursor" bind:this={cursorEl}>
  {#if loading}
    <img src="/img/cursor/loading.svg" alt="" />
  {:else if cursor === "auto"}
    <img src="/img/cursor/auto.svg" alt="" />
  {:else}
    <img src={`/img/cursor/${cursor}.svg`} alt="" />
  {/if}
  {#if tooltip}
    <div
      class="tooltip"
      class:flip={flipTooltip}
      bind:this={tooltipEl}
    >{tooltip}</div>
  {/if}
</div>

<style lang="scss">
  :global(html:not(.touch) *) {
    cursor: none;
  }

  :global(.touch) #cursor {
    display: none;
  }

  .tooltip {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem 0.4rem 0.5rem;
    line-height: 1;
    width: max-content;
    background: #eeeeee;
    border: 2px solid var(--black);

    position: absolute;
    top: 30px;
    left: 30px;
    z-index: -1;
    pointer-events: none;

    &.flip {
      left: auto;
      right: 30px;
    }
  }

  #cursor {
    pointer-events: none;

    z-index: 1000;

    width: 25px;
    height: 25px;

    position: fixed;
    top: 0;
    left: 0;

    transform: translate(-100%, -100%);
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
