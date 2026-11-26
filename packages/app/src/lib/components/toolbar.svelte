<script lang="ts">
  import { drawState } from "$lib/draw/state.svelte";
  import Icon from "./icon.svelte";
  import Panel from "./panel.svelte";
  import RadioButton from "./radio-button.svelte";

  type Props = {
    enabled?: boolean;
    onsave: () => void;
  };

  let { enabled = true, onsave }: Props = $props();

  let colorInput = $state<HTMLInputElement>();

  function addColor() {
    const value = colorInput?.value;
    if (value) drawState.addColor(value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName)) return;

    if (!Number.isNaN(Number(event.key)) && Number(event.key) > 0) {
      const color = drawState.colors[Number(event.key) - 1];
      if (color) drawState.color = color;
      return;
    }

    switch (event.code) {
      case "KeyD":
        drawState.mode = "draw";
        break;
      case "KeyE":
        drawState.mode = "erase";
        break;
      case "KeyF":
        drawState.mode = "fill";
        break;
      case "BracketLeft":
        drawState.size -= 1;
        break;
      case "BracketRight":
        drawState.size += 1;
        break;
      case "KeyZ":
        drawState.undo();
        break;
      case "KeyX":
        drawState.redo();
        break;
      case "KeyC":
      case "Delete":
        drawState.clear();
        break;
      case "KeyS":
        onsave();
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div>
  <Panel class="toolbar canvas-tools">
    <div class="tool-group mode">
      <RadioButton
        group="mode"
        value="draw"
        active={drawState.mode}
        onselect={() => (drawState.mode = "draw")}
      >
        <Icon svg="toolbar/draw" tooltip="draw" />
      </RadioButton>
      <RadioButton
        group="mode"
        value="erase"
        active={drawState.mode}
        onselect={() => (drawState.mode = "erase")}
      >
        <Icon svg="toolbar/erase" tooltip="erase" />
      </RadioButton>
      <RadioButton
        group="mode"
        value="fill"
        active={drawState.mode}
        onselect={() => (drawState.mode = "fill")}
      >
        <Icon svg="toolbar/fill" tooltip="fill" />
      </RadioButton>
    </div>

    <div class="tool-group size">
      <button
        onclick={() => (drawState.size -= 1)}
        data-tooltip="smaller"
        aria-label="smaller"
        disabled={drawState.size <= 1}
      >
        <Icon svg="toolbar/size-down" />
      </button>
      <span>{drawState.size}px</span>
      <button
        onclick={() => (drawState.size += 1)}
        data-tooltip="bigger"
        aria-label="bigger"
        disabled={drawState.size >= 10}
      >
        <Icon svg="toolbar/size-up" />
      </button>
    </div>

    <div class="tool-group edits">
      <button
        onclick={() => drawState.undo()}
        data-tooltip="undo"
        aria-label="undo"
        disabled={!drawState.canUndo}
      >
        <Icon svg="toolbar/undo" />
      </button>
      <button
        onclick={() => drawState.redo()}
        data-tooltip="redo"
        aria-label="redo"
        disabled={!drawState.canRedo}
      >
        <Icon svg="toolbar/redo" />
      </button>
      <button
        onclick={() => drawState.clear()}
        data-tooltip="clear"
        aria-label="clear"
        disabled={drawState.empty}
      >
        <Icon svg="toolbar/clear" />
      </button>
    </div>

    <div class="tool-group save">
      <button
        onclick={onsave}
        data-tooltip="save"
        aria-label="save"
        disabled={drawState.empty}
      >
        <Icon svg="toolbar/save" />
      </button>
    </div>
  </Panel>

  <Panel class="toolbar mt mb">
    <div class="tool-group palette">
      {#each drawState.colors as swatch, index (index)}
        <button
          class="swatch"
          class:active={swatch === drawState.color}
          style={`background-color: ${swatch}`}
          onclick={() => (drawState.color = swatch)}
          aria-label={`color ${index + 1}`}
        ></button>
      {/each}
      <input type="color" bind:this={colorInput} onchange={addColor} aria-label="add color" />
      <button
        class="add-color"
        onclick={() => colorInput?.click()}
        data-tooltip="add color swatch"
        aria-label="add color swatch"
      >
        <span>+</span>
      </button>
    </div>
  </Panel>
</div>

<style lang="scss">
  :global(.toolbar) {
    height: 60px;

    :global(.content) {
      justify-content: space-between;
      flex-wrap: wrap;
    }

    @media screen and (max-width: 508px) {
      height: initial;

      .tool-group:not(.palette) {
        width: 50%;
        margin: 0 !important;

        &.size,
        &.save {
          margin-top: 1rem !important;
        }

        &.edits,
        &.save {
          justify-content: flex-end;
        }

        &.mode {
          order: 1;
        }
        &.size {
          order: 3;
        }
        &.edits {
          order: 2;
        }
        &.save {
          order: 4;
        }
      }
    }
  }

  .tool-group {
    display: flex;
    align-items: center;

    &:not(:first-child) {
      margin-left: 2rem;
    }

    > *:not(:first-child) {
      margin-left: 0.5rem;
    }
  }

  .mode :global(.radio-wrap:nth-child(3)) {
    margin-left: 0.6rem !important;
  }

  .size span {
    width: 4ch;
    text-align: center;
    pointer-events: none;
  }

  :global(.palette) {
    width: 100%;

    > *:not(:first-child) {
      margin-left: 0;
    }
  }

  input[type="color"] {
    display: none;
  }

  .add-color,
  .swatch {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid transparent;
  }

  .swatch.active {
    border: 2px solid rgba(255, 255, 255, 0.75);
  }

  .add-color {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--lighter-blue);

    span {
      pointer-events: none;
      transition: transform 0.3s ease;
      line-height: 1;
    }
  }
</style>
