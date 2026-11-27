<script lang="ts">
  import type { DrawingData } from "@ecc/lexicons";
  import type { Snippet } from "svelte";
  import Drawing from "#lib/corpse/drawing.svelte";

  type Props = {
    drawing: DrawingData;
    label: string;
    tilt?: number;
    turned?: boolean;
    /** What's printed on the back. */
    back: Snippet;
  };

  let { drawing, label, tilt = 0, turned = $bindable(false), back }: Props = $props();
</script>

<!-- A single third: a strip of paper that turns over top-to-bottom. -->
<div class="strip" style:rotate="{tilt}deg">
  <button class="flip" data-turned={turned || undefined} onclick={() => (turned = !turned)} aria-label={turned ? "turn it face up" : "turn it over"}>
    <span class="face front"><Drawing {drawing} replay duration={900} {label} /></span>
    <span class="face rear"></span>
  </button>
  <div class="printed-back" data-shown={turned || undefined} aria-hidden={!turned}>
    {@render back()}
  </div>
</div>

<style>
  .strip {
    position: relative;
    perspective: 1600px;
    container-type: inline-size;
  }

  .flip {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 3 / 1;
    transform-style: preserve-3d;
    transition: transform 700ms cubic-bezier(0.6, 0.05, 0.3, 1);
  }

  .flip[data-turned] {
    transform: rotateX(180deg);
  }

  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    background: #fff;
    border: 2px solid var(--light-blue);
    box-shadow: 3px 3px 0 0 var(--blue);
  }

  .front :global(canvas) {
    width: 100%;
    height: 100%;
  }

  .rear {
    transform: rotateX(180deg);
    background: linear-gradient(to bottom, #f6f8fd, #fbfcff 40%, #fbfcff 60%, #f6f8fd);
    box-shadow: none;
  }

  .flip:focus-visible {
    outline: 2px dashed var(--blue);
    outline-offset: 8px;
  }

  .printed-back {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 250ms ease;
  }

  .printed-back[data-shown] {
    opacity: 1;
    transition-delay: 600ms;
  }

  .printed-back[data-shown] :global(a) {
    pointer-events: auto;
  }

  /* a strip is short: tighten the printed back so it fits */
  .printed-back :global(.printed) {
    gap: 1.4cqw;
    padding: 2cqw;
  }

  .printed-back :global(.name) {
    font-size: clamp(1rem, 4.4cqw, 1.75rem);
  }

  .printed-back :global(.lines) {
    font-size: clamp(0.75rem, 2.2cqw, 0.9375rem);
    gap: 0.6cqw;
  }

  .printed-back :global(.stamp-line) {
    font-size: clamp(0.5625rem, 1.5cqw, 0.6875rem);
  }
</style>
