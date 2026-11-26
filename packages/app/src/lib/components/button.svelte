<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    color?: "yellow" | "red" | "green" | "blue";
    text?: string;
    type?: "button" | "submit";
    disabled?: boolean;
    class?: string;
    style?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  };

  let {
    color,
    text,
    type = "button",
    disabled = false,
    class: className,
    style,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  {type}
  class={[color ?? "", className]}
  {disabled}
  {style}
  {onclick}
>
  {@render children?.()}
  {#if text}{text}{/if}
</button>

<style lang="scss">
  button {
    width: 100%;
    padding: 0.5rem 0;

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    --background-color: var(--white);
    --border-top-left: var(--yellow);
    --border-bot-right: var(--lighter-yellow);

    background-color: var(--background-color);
    border: 2px solid var(--border-top-left);
    border-top: 2px solid var(--border-bot-right);
    border-left: 2px solid var(--border-bot-right);

    &:focus {
      outline: 2px dashed var(--background-color);
    }

    &:active {
      border: 2px solid var(--border-bot-right);
      border-top: 2px solid var(--border-top-left);
      border-left: 2px solid var(--border-top-left);
      transform: translate3d(2px, 2px, 0);
    }

    &.yellow {
      --background-color: var(--light-yellow);
      color: var(--black);
    }

    &.red {
      --background-color: var(--red);
      color: var(--white);
    }

    &.green {
      --background-color: var(--light-green);
      color: var(--black);
    }

    a {
      text-decoration: none;

      &:hover {
        color: var(--black);
      }
    }
  }
</style>
