<template>
  <div>
    <Panel class="toolbar canvas-tools">
      <div class="tool-group mode">
        <RadioButton group="mode" value="draw" v-model="mode">
          <Icon svg="toolbar/draw" data-tooltip="draw" />
        </RadioButton>
        <RadioButton group="mode" value="erase" v-model="mode">
          <Icon svg="toolbar/erase" data-tooltip="erase" />
        </RadioButton>
        <RadioButton group="mode" value="fill" v-model="mode">
          <Icon svg="toolbar/fill" data-tooltip="fill" />
        </RadioButton>
      </div>

      <div class="tool-group size">
        <button
          @click="decrementSize"
          data-tooltip="smaller"
          :disabled="!canShrink"
        >
          <Icon svg="toolbar/size-down" />
        </button>
        <span>{{ size.current }}px</span>
        <button
          @click="incrementSize"
          data-tooltip="bigger"
          :disabled="!canGrow"
        >
          <Icon svg="toolbar/size-up" />
        </button>
      </div>

      <div class="tool-group edits">
        <button @click="undoCanvas" data-tooltip="undo" :disabled="cantUndo">
          <Icon svg="toolbar/undo" />
        </button>
        <button @click="redoCanvas" data-tooltip="redo" :disabled="cantRedo">
          <Icon svg="toolbar/redo" />
        </button>
        <button
          @click="clearCanvas"
          data-tooltip="clear"
          :disabled="isDrawingEmpty"
        >
          <Icon svg="toolbar/clear" />
        </button>
      </div>

      <div class="tool-group save">
        <button
          @click="$emit('start-save')"
          data-tooltip="save"
          :disabled="isDrawingEmpty"
        >
          <Icon svg="toolbar/save" />
        </button>
      </div>
    </Panel>

    <Panel class="toolbar mt mb">
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
          style="display: none"
          type="color"
          id="addColor"
          @change="addColor($event)"
        />
        <label for="addColor" class="add-color">+</label>
        <!-- TODO: https://github.com/xiaokaike/vue-color (mostly for safari support 🤔) -->
      </div>
    </Panel>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "ToolBar",
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  computed: {
    mode: {
      get() {
        return this.$store.state.mouse.mode;
      },
      set(value) {
        this.$store.dispatch("mouse/setMode", value);
      }
    },
    ...mapState("drawing", ["isSaving"]),
    ...mapState("mouse", ["palette", "size"]),
    ...mapGetters("mouse", ["canGrow", "canShrink"]),
    ...mapGetters("drawing", ["cantUndo", "cantRedo", "isDrawingEmpty"])
  },
  methods: {
    handleShortcuts(e) {
      if (this.isSaving === "modal-open") return;

      if (!isNaN(e.key)) {
        this.setColor(this.palette.colors[e.key - 1]);
      }

      switch (e.code) {
        case "KeyD":
          this.mode = "draw";
          break;
        case "KeyE":
          this.mode = "erase";
          break;
        case "KeyF":
          this.mode = "fill";
          break;

        case "BracketLeft":
          this.decrementSize();
          break;
        case "BracketRight":
          this.incrementSize();
          break;

        case "KeyZ":
          this.undoCanvas();
          break;
        case "KeyX":
          this.redoCanvas();
          break;

        case "KeyC":
        case "Delete":
          this.clearCanvas(e); // sent with event in order to log in history
          break;

        case "KeyS":
          this.$emit("start-save");
          break;
      }
    },
    addColor(e) {
      this.$store.dispatch("mouse/addColor", e.target.value);
    },
    setColor(e) {
      this.$store.dispatch("mouse/setColor", e);
    },
    decrementSize() {
      this.$store.dispatch("mouse/decrementSize");
    },
    incrementSize() {
      this.$store.dispatch("mouse/incrementSize");
    },
    undoCanvas() {
      this.$store.dispatch("drawing/undoCanvas");
    },
    redoCanvas() {
      this.$store.dispatch("drawing/redoCanvas");
    },
    clearCanvas(e) {
      this.$store.dispatch("drawing/clearCanvas", e);
    }
  }
};
</script>

<style lang="scss">
.toolbar {
  height: 60px;

  > .content {
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

.mode div:nth-child(3) {
  // fill bucket
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

.palette label {
  &:not([disabled]):active {
    border: 2px solid var(--lighter-blue);
    border-top: 2px solid var(--light-blue);
    border-left: 2px solid var(--light-blue);
    transform: translate3d(2px, 2px, 0);
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
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
