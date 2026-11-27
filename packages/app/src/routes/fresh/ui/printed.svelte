<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    /** Shown as "no. …" in the header line. */
    no: string;
    title: string;
    date: string;
    /** The lines between title and date (credits, counts…). */
    children: Snippet;
  };

  let { no, title, date, children }: Props = $props();
</script>

<!--
  What's printed on the back of a sheet, like the back of a postcard. Sized in
  cqw, so the parent must be a size container (container-type: inline-size).
-->
<div class="printed">
  <p class="stamp-line">exquisite corpse club · no. {(no.split("_").at(-1) ?? no).slice(0, 6).toLowerCase()}</p>
  <p class="name">{title}</p>
  <div class="lines">{@render children()}</div>
  <p class="stamp-line">{date}</p>
</div>

<style>
  .printed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3.5cqw;
    height: 100%;
    padding: 4cqw;
    text-align: center;
  }

  .stamp-line {
    font-family: var(--mono);
    font-size: clamp(0.625rem, 2.1cqw, 0.75rem);
    letter-spacing: 0.06em;
    color: var(--ink-soft);
  }

  .name {
    font-weight: 600;
    font-size: clamp(1.25rem, 7cqw, 2.25rem);
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: #2a3350;
  }

  .lines {
    display: flex;
    flex-direction: column;
    gap: 1.6cqw;
    font-size: clamp(0.8125rem, 3cqw, 1rem);
  }

  .lines :global(.by) {
    color: var(--ink-soft);
  }
</style>
