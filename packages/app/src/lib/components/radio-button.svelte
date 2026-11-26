<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    group: string;
    value: string;
    active: string;
    onselect?: (value: string) => void;
    children: Snippet;
  };

  let { group, value, active, onselect, children }: Props = $props();

  const id = $derived(`${group}-${value}`);
</script>

<div class="radio-wrap" class:active={active === value}>
  <input
    type="radio"
    name={group}
    id={id}
    {value}
    checked={active === value}
    onchange={() => onselect?.(value)}
  />
  <label for={id}>
    {@render children()}
  </label>
</div>

<style lang="scss">
  input {
    display: none;
  }

  .radio-wrap.active .icon {
    border: 2px solid var(--light-blue);
    border-top: 2px solid var(--lighter-blue);
    border-left: 2px solid var(--lighter-blue);
  }

  .radio-wrap:not(.active) {
    filter: grayscale(1);
    opacity: 0.6;
  }
</style>
