<script lang="ts">
  import type { SectionType } from "@ecc/firestore";
  import Icon from "./icon.svelte";
  import Panel from "./panel.svelte";
  import { help } from "$lib/help.svelte";

  type Props = {
    onpick: (type: SectionType) => void;
  };

  let { onpick }: Props = $props();

  const sections: { type: SectionType; label: string }[] = [
    { type: "top", label: "top" },
    { type: "mid", label: "middle" },
    { type: "bot", label: "bottom" },
  ];
</script>

<div>
  <Panel class="info-panel">
    <span>pick a section to start drawing!</span>
    <button onclick={() => help.show()} aria-label="help" data-tooltip="help">
      <Icon svg="icons/info" />
    </button>
  </Panel>

  <div class="mw-canvas">
    {#each sections as section (section.type)}
      <Panel class="section-template mt" color="blue" interactive noPadding>
        <button class="section-button" onclick={() => onpick(section.type)}>
          <span class="meta-box">
            <span class="info">{section.label}</span>
          </span>
        </button>
      </Panel>
    {/each}
  </div>
</div>

<style lang="scss">
  :global(.info-panel) {
    height: 60px;

    span {
      margin-right: 0.5rem;
    }

    @media screen and (max-width: 418px) {
      height: auto;
    }
  }

  :global(.section-template) {
    position: relative;
    width: 100%;
    height: 0;

    min-height: initial;
    padding-top: calc(100% / 3) !important;

    &:hover .meta-box {
      display: block;
    }
  }

  .section-button {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  :global(.touch) .meta-box {
    display: block;
  }

  .meta-box {
    display: none;
    position: absolute;
    z-index: 100;
    inset: 0;
    /* http://www.patternify.com/ */
    background: transparent
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
      repeat;

    .info {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 101;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      background: var(--white);
      height: 60px;
      min-width: 33%;
      border: 2px solid var(--orange);
      padding: 0 1rem;
    }
  }
</style>
