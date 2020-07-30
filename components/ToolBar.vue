<template>
  <div>
    <div class="toolbar border yellow mw-canvas canvas-tools">
      <div class="tool-group mode">
        <div
          class="tool draw"
          :class="{ active: mode === 'draw' }"
          data-tooltip="draw"
        >
          <input
            type="radio"
            name="mode"
            id="draw"
            value="draw"
            v-model="mode"
          />
          <label for="draw">
            <img src="~/assets/img/toolbar/draw.svg" />
          </label>
        </div>

        <div
          class="tool erase"
          :class="{ active: mode === 'erase' }"
          data-tooltip="erase"
        >
          <input
            type="radio"
            name="mode"
            id="erase"
            value="erase"
            v-model="mode"
          />
          <label for="erase">
            <img src="~/assets/img/toolbar/erase.svg" />
          </label>
        </div>

        <div
          class="tool fill"
          :class="{ active: mode === 'fill' }"
          data-tooltip="fill"
        >
          <input
            type="radio"
            name="mode"
            id="fill"
            value="fill"
            v-model="mode"
          />
          <label for="fill">
            <img src="~/assets/img/toolbar/fill.svg" />
          </label>
        </div>
      </div>

      <div class="tool-group size">
        <button
          class="tool size-down"
          :disabled="!currentSizeMoreThanMin"
          @click="decrementSize"
          data-tooltip="smaller"
        >
          <img src="~/assets/img/toolbar/size-down.svg" alt="" />
        </button>
        <span>{{ size.current }}px</span>
        <button
          class="tool size-up"
          :disabled="!currentSizeLessThanMax"
          @click="incrementSize"
          data-tooltip="bigger"
        >
          <img src="~/assets/img/toolbar/size-up.svg" alt="" />
        </button>
      </div>

      <div class="tool-group edits">
        <button
          class="tool undo"
          :disabled="cantUndo"
          @click="undoCanvas"
          data-tooltip="undo"
        >
          <img src="~/assets/img/toolbar/undo.svg" alt="" />
        </button>
        <button
          class="tool redo"
          :disabled="cantRedo"
          @click="redoCanvas"
          data-tooltip="redo"
        >
          <img src="~/assets/img/toolbar/redo.svg" alt="" />
        </button>
        <button
          class="tool clear"
          :disabled="isDrawingEmpty"
          @click="clearCanvas"
          data-tooltip="clear"
        >
          <img src="~/assets/img/toolbar/clear.svg" alt="" />
        </button>
        <button
          class="tool save"
          :disabled="isDrawingEmpty"
          @click="startSave"
          data-tooltip="save"
        >
          <img src="~/assets/img/toolbar/save.svg" alt="" />
        </button>
      </div>
    </div>

    <div class="toolbar border yellow color-palette">
      <div class="tool-group palette">
        <button
          class="swatch"
          v-for="(color, index) in palette.colors"
          :key="index"
          :class="{ active: color === palette.current }"
          :style="{ backgroundColor: color }"
          @click="setColor(color)"
        ></button>
        <input
          style="display: none;"
          type="color"
          id="addColor"
          @change="addColor($event)"
        />
        <label for="addColor" class="add-color">+</label>
        <!-- https://github.com/xiaokaike/vue-color (mostly for safari support 🤔) -->
      </div>
    </div>

    <SaveModal v-if="isSaving" @close-save="closeSave" />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import SaveModal from "./SaveModal";

export default {
  name: "ToolBar",
  components: { SaveModal },
  data: function () {
    return {
      isSaving: false,
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  computed: {
    mode: {
      get() {
        return this.$store.state.modules.mouse.mode;
      },
      set(value) {
        this.$store.dispatch("modules/mouse/setMode", value);
      },
    },
    ...mapState("modules/mouse", ["palette", "size"]),
    ...mapGetters("modules/mouse", [
      "currentSizeLessThanMax",
      "currentSizeMoreThanMin",
    ]),
    ...mapGetters("modules/drawing", [
      "cantUndo",
      "cantRedo",
      "isDrawingEmpty",
    ]),
  },
  methods: {
    handleShortcuts(e) {
      // console.log("keydown", e.key, e.keyCode);
      if (!this.isSaving) {
        if (!isNaN(e.key)) {
          this.setColor(this.palette.colors[e.key - 1]);
        }

        switch (e.keyCode) {
          case 68: // "d"
            this.mode = "draw";
            break;
          case 69: // "e"
            this.mode = "erase";
            break;
          case 70: // "e"
            this.mode = "fill";
            break;

          case 219: // "["
            this.decrementSize();
            break;
          case 221: // "]"
            this.incrementSize();
            break;

          case 90: // "z"
            this.undoCanvas();
            break;
          case 88: // "x"
            this.redoCanvas();
            break;

          case 67: // "c" OR
          case 8: // "backspace"
            this.clearCanvas(e); // sent with event in order to log in history
            break;

          case 83: // "s"
            this.startSave();
            break;
        }
      }
    },
    addColor(e) {
      this.$store.dispatch("modules/mouse/addColor", e.target.value);
    },
    setColor(e) {
      this.$store.dispatch("modules/mouse/setColor", e);
    },
    decrementSize() {
      this.$store.dispatch("modules/mouse/decrementSize");
    },
    incrementSize() {
      this.$store.dispatch("modules/mouse/incrementSize");
    },
    undoCanvas() {
      this.$store.dispatch("modules/drawing/undoCanvas");
    },
    redoCanvas() {
      this.$store.dispatch("modules/drawing/redoCanvas");
    },
    clearCanvas(e) {
      this.$store.dispatch("modules/drawing/clearCanvas", e);
    },
    startSave() {
      this.isSaving = true;
    },
    closeSave(e) {
      this.isSaving = false;
      if (e) {
        this.$router.push({ path: `/gallery/${e}` });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  height: 60px;
  display: flex;
  padding: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
  user-select: none;

  @media screen and (max-width: 544px) {
    height: initial;

    .size {
      order: 3;
      margin-top: 0.5rem;

      > span {
        margin: 0;
      }
    }
  }

  &:not(:first-child) {
    margin: calc(40px / 6 * 2) 0;
  }

  /* label, */
  img {
    pointer-events: none;
  }
}

.canvas-tools {
  padding: calc(1rem - 4px) 1rem; // to account for box-sizing 🤔
}

.tool-group {
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }
}

$icon-size: 25px;

.tool {
  width: $icon-size;
  height: $icon-size;

  box-sizing: content-box;
  border: 2px solid transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  input {
    display: none;
  }

  label {
    width: 100%;
  }

  svg,
  img {
    width: 100%;
    display: block;
  }
}

.palette label,
.tool {
  &:not([disabled]):active {
    border: 2px solid var(--lighter-blue);
    border-top: 2px solid var(--light-blue);
    border-left: 2px solid var(--light-blue);
    transform: translate3d(2px, 2px, 0);
  }
}

.mode .tool.active {
  border: 2px solid var(--light-blue);
  border-top: 2px solid var(--lighter-blue);
  border-left: 2px solid var(--lighter-blue);

  &:active {
    border: 2px solid var(--lighter-blue);
    border-top: 2px solid var(--light-blue);
    border-left: 2px solid var(--light-blue);
    transform: translate3d(2px, 2px, 0);
  }
}

.mode .tool:not(.active) {
  filter: grayscale(1);
  opacity: 0.6;
}

.fill {
  margin-left: 0.6rem !important;
}

.size {
  span {
    width: 4ch;
    text-align: center;
    pointer-events: none;
  }
}

.palette {
  width: 100%;

  > *:not(:first-child) {
    margin-left: 0;
  }
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
  /* cursor: pointer; */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
