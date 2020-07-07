<template>
  <div class="toolbar">
    <div class="brush">
      <div>
        <input
          type="radio"
          name="mode"
          id="draw"
          value="draw"
          v-model="mode"
          :class="{ active: mode === 'draw' }"
        />
        <label for="draw">Draw</label>
      </div>

      <div>
        <input
          type="radio"
          name="mode"
          id="erase"
          value="erase"
          v-model="mode"
        />
        <label for="erase">Erase</label>
      </div>

      <div>
        <input type="radio" name="mode" id="fill" value="fill" v-model="mode" />
        <label for="fill">Fill</label>
      </div>

      <div class="size">
        <button @click="decrementSize" :disabled="size.current == size.min">
          -
        </button>
        <span>{{ size.current }}px</span>
        <button @click="incrementSize" :disabled="size.current == size.max">
          +
        </button>
      </div>
    </div>

    <div class="edits">
      <div>
        <button @click="undoCanvas" :disabled="history.step <= 0">
          Undo
        </button>
        <button
          @click="redoCanvas"
          :disabled="history.step >= history.paths.length"
        >
          Redo
        </button>
      </div>
      <button @click="clearCanvas" :disabled="drawingIsEmpty">
        Clear
      </button>
      <button @click="saveDrawing" :disabled="drawingIsEmpty">
        Save
      </button>
    </div>

    <div class="palette">
      <button
        class="swatch"
        v-for="(color, index) in colors"
        :key="index"
        :class="{ active: color === currentColor }"
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
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, computed } from "vue";
import { useStore } from "vuex";

import { db } from "../../firebase";

export default {
  name: "ToolBar",
  setup() {
    const store = useStore();
    const size = computed(() => store.state.mouse.size);
    const colors = computed(() => store.state.mouse.palette.colors);
    const history = computed(() => store.state.drawing.history);
    const drawing = computed(() => store.state.drawing.paths);
    const currentColor = computed(() => store.state.mouse.palette.current);
    const drawingIsEmpty = computed(() => store.getters.drawingIsEmpty);
    const mode = computed({
      get: () => store.state.mode,
      set: (mode) => store.dispatch("setMode", mode),
    });

    onMounted(() => {
      document.addEventListener("keydown", handleShortcuts);
      document.querySelector("#draw").click(); // is this dumb? 🤔
    });

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleShortcuts);
    });

    const handleShortcuts = (e) => {
      // console.log("keydown", e.key, e.keyCode);
      switch (e.keyCode) {
        case 68: // "d"
          document.querySelector("#draw").click(); // is this dumb? 🤔
          break;
        case 69: // "e"
          document.querySelector("#erase").click(); // is this dumb? 🤔
          break;
        case 70: // "e"
          document.querySelector("#fill").click(); // is this dumb? 🤔
          break;

        case 219: // "["
          store.dispatch("decrementSize");
          break;
        case 221: // "]"
          store.dispatch("incrementSize");
          break;

        case 90: // "z"
          store.dispatch("undoCanvas");
          break;
        case 88: // "x"
          store.dispatch("redoCanvas");
          break;

        case 67: // "c" OR
        case 8: // "backspace"
          store.dispatch("clearCanvas", e);
          break;

        case 83: // "s"
          store.dispatch("saveDrawing");
          break;
      }
    };

    const incrementSize = () => store.dispatch("incrementSize");
    const decrementSize = () => store.dispatch("decrementSize");
    const setColor = (color) => store.dispatch("setColor", color);
    const addColor = (event) => store.dispatch("addColor", event.target.value);
    const undoCanvas = () => store.dispatch("undoCanvas");
    const redoCanvas = () => store.dispatch("redoCanvas");
    const clearCanvas = (event) => store.dispatch("clearCanvas", event);
    const saveDrawing = () => store.dispatch("saveDrawing");

    return {
      size,
      mode,
      colors,
      currentColor,
      incrementSize,
      decrementSize,
      undoCanvas,
      redoCanvas,
      clearCanvas,
      setColor,
      addColor,
      history,
      drawing,
      saveDrawing,
      drawingIsEmpty,
    };
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  padding: 0.5rem 0;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  :not(.palette) label,
  :not(.palette) button,
  :not(.palette) span {
    margin-right: 1rem;
  }

  > div > button:last-child {
    margin-right: 0;
  }
}

.brush,
.edits {
  display: flex;
}

.palette {
  display: flex;
  width: 100%;
  margin-top: 1rem;

  &.erasing {
    opacity: 0.5;
    cursor: not-allowed;
    button,
    label,
    input {
      pointer-events: none;
    }
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
