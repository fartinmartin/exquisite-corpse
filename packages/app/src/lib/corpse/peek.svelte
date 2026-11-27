<script lang="ts">
  import type { SectionType } from "@ecc/firestore";
  import type { DrawingData } from "@ecc/lexicons";
  import type { Snippet } from "svelte";
  import Drawing from "./drawing.svelte";

  type Props = {
    type?: SectionType;
    drawing?: DrawingData;
    /** Which edge of this drawing touches the section being drawn. */
    edge: "top" | "bottom";
    /** Show a sliver of the drawing past the fold (only for direct neighbours). */
    sliver?: boolean;
    /** Fully unfolded: the whole drawing is revealed. */
    open?: boolean;
    /** Text on the folded flap. */
    children?: Snippet;
  };

  let { type, drawing, edge, sliver = true, open = false, children }: Props = $props();
</script>

<!--
  A neighbouring section, folded away. Like the paper game, the only thing you
  get to see is a thin sliver of its lines crossing the fold — enough to join
  up with, not enough to know what it is.
-->
<div class={["peek", edge]} class:open class:sliver data-type={type}>
  <div class="window">
    {#if drawing}
      <div class="sheet"><Drawing {drawing} /></div>
    {/if}
  </div>
  <div class="flap" aria-hidden={open}>
    {@render children?.()}
  </div>
</div>

<style>
  .peek {
    --sliver: 0.12; /* fraction of the neighbour that shows past the fold */
    --flap: 36px;
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--paper);
  }

  /* The flap sits on the far side of the sliver, away from the live canvas. */
  .bottom {
    flex-direction: column-reverse;
  }

  .window {
    position: relative;
    overflow: hidden;
    height: 0;
    padding-top: 0;
    transition: padding-top 700ms var(--ease-in-out);
  }

  .sliver .window {
    padding-top: calc(100% / 3 * var(--sliver));
  }

  .open .window {
    padding-top: calc(100% / 3);
  }

  .sheet {
    position: absolute;
    left: 0;
    width: 100%;
  }

  /* bottom edge of the section above / top edge of the section below */
  .bottom .sheet {
    bottom: 0;
  }
  .top .sheet {
    top: 0;
  }

  .sliver:not(.open) .window::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .bottom.sliver:not(.open) .window::after {
    background: linear-gradient(to bottom, color-mix(in srgb, var(--surface-sunk) 90%, transparent), transparent 70%);
  }
  .top.sliver:not(.open) .window::after {
    background: linear-gradient(to top, color-mix(in srgb, var(--surface-sunk) 90%, transparent), transparent 70%);
  }

  .flap {
    height: var(--flap);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-2);
    font-size: 0.75rem;
    color: var(--fold-ink);
    overflow: hidden;
    background: repeating-linear-gradient(
      -45deg,
      var(--fold) 0 6px,
      var(--paper) 6px 12px
    );
    transition:
      height 500ms var(--ease-in-out),
      opacity 300ms var(--ease-out);
  }

  .bottom .flap {
    border-bottom: 1px dashed var(--crease);
  }
  .top .flap {
    border-top: 1px dashed var(--crease);
  }

  .open .flap {
    height: 0;
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .window,
    .flap {
      transition: none;
    }
  }
</style>
