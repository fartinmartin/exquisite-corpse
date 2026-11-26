<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    svg?: string;
    interactive?: boolean;
    shimmer?: boolean;
    class?: string;
    title?: string;
    tooltip?: string;
    children?: Snippet;
  };

  let {
    svg,
    interactive = true,
    shimmer = false,
    class: className,
    title,
    tooltip,
    children,
  }: Props = $props();
</script>

<div
  class={["icon", className]}
  class:interactive
  class:look-at-me={shimmer}
  {title}
  data-tooltip={tooltip}
>
  {#if svg}
    <img src={`/img/${svg}.svg`} alt="" />
  {/if}
  {@render children?.()}
</div>

<style lang="scss">
  .icon {
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 25px;
    height: 25px;

    box-sizing: content-box;
    border: 2px solid transparent;

    &.interactive:active {
      border: 2px solid var(--lighter-yellow);
      border-top: 2px solid var(--yellow);
      border-left: 2px solid var(--yellow);
      transform: translate3d(2px, 2px, 0);
    }

    * {
      pointer-events: none;
    }
  }

  .look-at-me {
    position: relative;
    overflow: hidden;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 25%;
      left: 50%;
      height: 100%;
      transform: rotate(45deg) translateX(-30px);
      background: rgba(255, 255, 255, 0.45);
      mix-blend-mode: screen;
      pointer-events: none;

      animation: diagonal-shimmer 2.5s infinite ease-in-out;
    }

    &::before {
      width: 4px;
      animation-delay: 250ms;
      background: rgba(255, 255, 255, 0.25);
    }

    &::after {
      width: 10px;
      animation-delay: 0ms;
    }
  }

  @keyframes diagonal-shimmer {
    0% {
      transform: rotate(45deg) translateX(-30px);
    }
    50% {
      transform: rotate(50deg) translateX(10px);
    }
    100% {
      transform: rotate(50deg) translateX(10px);
    }
  }
</style>
