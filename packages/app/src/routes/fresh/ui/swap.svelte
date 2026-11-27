<script lang="ts">
  type Props = {
    /** Every label the control can show; the widest sets its size. */
    labels: string[];
    /** Index of the label to show. */
    active: number;
  };

  let { labels, active }: Props = $props();
</script>

<!--
  Changing a button's text without it changing size: every label shares one
  grid cell, the inactive ones are visibility: hidden (they keep their space),
  and the switch crossfades. aria-live announces the new label.
-->
<span class="swap" aria-live="polite">
  {#each labels as label, index (label)}
    <span data-on={index === active || undefined} aria-hidden={index !== active}>{label}</span>
  {/each}
</span>

<style>
  .swap {
    display: inline-grid;
  }

  .swap > span {
    grid-area: 1 / 1;
    text-align: center;
    visibility: hidden;
    opacity: 0;
    translate: 0 3px;
    transition:
      opacity 150ms ease,
      translate 150ms ease,
      visibility 0s 150ms;
  }

  .swap > span[data-on] {
    visibility: visible;
    opacity: 1;
    translate: 0 0;
    transition:
      opacity 150ms ease,
      translate 150ms ease,
      visibility 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    .swap > span {
      translate: none;
    }
  }
</style>
