<script lang="ts">
  import Icon from "./icon.svelte";
  import Panel from "./panel.svelte";

  type Props = {
    isFirstPage: boolean;
    isLastPage: boolean;
    type: string;
    onprev: () => void;
    onnext: () => void;
  };

  let { isFirstPage, isLastPage, type, onprev, onnext }: Props = $props();

  const currentType = $derived(
    type === "bot" ? "bottoms" : type === "mid" ? "middles" : type === "top" ? "tops" : type
  );
</script>

<Panel class="prev-next mt {type}">
  <button
    class="prev"
    disabled={isFirstPage}
    onclick={onprev}
    data-tooltip={isFirstPage ? "this is the first page! :)" : "go back"}
    aria-label={isFirstPage ? "this is the first page! :)" : "go back"}
  >
    <Icon>
      <img src="/img/icons/arrow.svg" alt="" />
      <span>back</span>
    </Icon>
  </button>

  <button
    class="next"
    disabled={isLastPage}
    onclick={onnext}
    data-tooltip={isLastPage ? `no more ${currentType} :(` : `more ${currentType}!`}
    aria-label={isLastPage ? `no more ${currentType} :(` : `more ${currentType}!`}
  >
    <Icon>
      <span>more!</span>
      <img src="/img/icons/arrow.svg" alt="" />
    </Icon>
  </button>
</Panel>

<style lang="scss">
  :global(.prev-next .content) {
    display: flex;
    justify-content: space-between !important;
    height: 25px;
  }

  :global(.prev-next:not(.corpses)) {
    transform: translateY(calc(calc(40px / 3) + 56.15px * -1));
  }

  :global(.prev .icon),
  :global(.next .icon) {
    width: auto !important;

    img {
      width: 25px;
    }
  }

  :global(.prev span) {
    margin-right: 6px;
  }

  :global(.next span) {
    margin-left: 6px;
  }

  :global(.next .icon img) {
    transform: rotate(180deg);
  }
</style>
