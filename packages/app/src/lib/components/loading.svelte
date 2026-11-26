<script lang="ts">
  import Panel from "./panel.svelte";

  type Props = {
    text?: string;
    subtext?: string;
    color?: "yellow" | "blue" | "red" | "green";
    throttle?: number;
    style?: string;
  };

  let {
    text = "plz hold",
    subtext,
    color = "blue",
    throttle = 0,
    style,
  }: Props = $props();

  let visible = $state(throttle === 0);

  $effect(() => {
    if (throttle === 0) {
      visible = true;
      return;
    }
    const timer = setTimeout(() => (visible = true), throttle);
    return () => clearTimeout(timer);
  });
</script>

<div class="loading-wrap mw-canvas" class:transparent={!visible} {style}>
  <Panel
    class="loading body-bg"
    {color}
    noPadding
    style={`background-color: var(--lighter-${color}) !important`}
  >
    <div class="text-wrap">
      <div class="text">{text}</div>
      {#if subtext}<div class="subtext">{subtext}</div>{/if}
    </div>
  </Panel>
</div>

<style lang="scss">
  .transparent {
    opacity: 0;
  }

  .loading-wrap {
    transition: opacity 0.1s ease;

    height: 0;
    position: relative;
    padding-top: 100%;

    .loading {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      max-width: none;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;

    .text-wrap {
      text-align: center;
      padding: 1rem;
      background: var(--white);
      border: 2px dashed var(--brdr-color);
    }

    .subtext {
      color: #7f7f7f;
    }
  }
</style>
