<template>
  <div class="toolbar border">
    <div class="brush">
      <div class="tool" :class="{ active: getMode === 'draw' }">
        <input type="radio" name="mode" id="draw" value="draw" v-model="mode" />
        <label for="draw">
          <!-- Draw -->
          <!-- <img src="../assets/toolbar/draw.gif" alt="" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <defs>
              <style>
                .cls-7 {
                  fill: none;
                  stroke: #231f20;
                  stroke-miterlimit: 10;
                  stroke-width: 4px;
                }
              </style>
            </defs>
            <g id="Layer_2" data-name="Layer 2">
              <g id="Exports">
                <path fill="none" d="M0 0h60v60H0z" />
                <path
                  fill="#fbb040"
                  d="M38 32l-9.02 9.02h-.02V41H19V31l9-9 10 10z"
                />
                <path fill="#ffc840" d="M19 31h-8v-2l12-12 5 5-9 9z" />
                <path
                  fill="#ee2a7b"
                  d="M23 17l8-8 20 20-8.01 7.99L38 32 28 22l-5-5z"
                />
                <path
                  fill="#f7941d"
                  d="M28.99 49l-.03-7.98h.02L38 32l4.99 4.99L30.96 49h-1.97z"
                />
                <path
                  fill="#fff3b5"
                  d="M19 41h9.96v.02l.03 7.98H16l-5-5V31h8v10z"
                />
                <path
                  class="cls-7"
                  d="M23 17l8-8 20 20-8.01 7.99L30.96 49H11V29l12-12zM23 17l5 5 10 10 4.99 4.99.01.01M11 44l5 5"
                />
                <path
                  class="cls-7"
                  d="M29 51l-.01-2-.03-7.98V41H19V31H9M28 22l-9 9M28.98 41.02L38 32"
                />
              </g>
            </g>
          </svg>
        </label>
      </div>

      <div class="tool" :class="{ active: getMode === 'erase' }">
        <input
          type="radio"
          name="mode"
          id="erase"
          value="erase"
          v-model="mode"
        />
        <label for="erase">
          <!-- Erase -->
          <!-- <img src="../assets/toolbar/draw.gif" alt="" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <defs>
              <style>
                .cls-7 {
                  fill: none;
                  stroke: #231f20;
                  stroke-miterlimit: 10;
                  stroke-width: 4px;
                }
              </style>
            </defs>
            <g id="Layer_2" data-name="Layer 2">
              <g id="Exports">
                <path fill="none" d="M0 0h60v60H0z" />
                <path
                  fill="#ffc840"
                  d="M17.01 25.51L29.04 13.5h1.97l.03 7.98h-.02L22 30.5l-4.99-4.99z"
                />
                <path
                  fill="#fff3b5"
                  d="M31.04 21.48l-.03-7.98H44l5 5v13h-8v-10h-9.96v-.02z"
                />
                <path
                  fill="#ee2a7b"
                  d="M9 33.5l8.01-7.99L22 30.5l10 10 5 5-3 3H24l-15-15z"
                />
                <path fill="#f7941d" d="M32 40.5l9-9h8v2l-12 12-5-5z" />
                <path
                  fill="#fbb040"
                  d="M31.04 21.5H41v10l-9 9-10-10 9.02-9.02h.02v.02z"
                />
                <path
                  class="cls-7"
                  d="M37 45.5l-3 3H24l-15-15 8.01-7.99L29.04 13.5H49v20l-12 12zM37 45.5l-5-5-10-10-4.99-4.99-.01-.01M49 18.5l-5-5"
                />
                <path
                  class="cls-7"
                  d="M31 11.5l.01 2 .03 7.98v.02H41v10h10M32 40.5l9-9M31.02 21.48L22 30.5"
                />
              </g>
            </g>
          </svg>
        </label>
      </div>

      <div class="tool" :class="{ active: getMode === 'fill' }">
        <input type="radio" name="mode" id="fill" value="fill" v-model="mode" />
        <label for="fill">
          <!-- Fill -->
          <!-- <img src="../assets/toolbar/fill.gif" alt="" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
            <g data-name="Layer 2">
              <path fill="none" d="M0 0h60v60H0z" />
              <path
                stroke="#231f20"
                stroke-width="4"
                fill="#fff"
                stroke-miterlimit="10"
                d="M50.65 30l-20-20-20 20 19.96 20 20.04-20z"
              />
              <path
                stroke-miterlimit="1"
                stroke="#231f20"
                stroke-width="4"
                fill="none"
                d="M25.65 25l21-11"
              />
              <path
                fill="#231f20"
                stroke="#231f20"
                stroke-width="4"
                d="M10.65 50l-2-22 6-2-4 24z"
              />
            </g>
          </svg>
        </label>
      </div>

      <div class="size">
        <button
          @click="decrementSize"
          :disabled="size.current == size.min"
          class="tool"
        >
          <!-- - -->
          <img src="../assets/toolbar/sizeDown.gif" alt="" />
        </button>
        <span>{{ size.current }}px</span>
        <button
          @click="incrementSize"
          :disabled="size.current == size.max"
          class="tool"
        >
          <!-- + -->
          <img src="../assets/toolbar/sizeUp.gif" alt="" />
        </button>
      </div>
    </div>

    <div class="edits">
      <div>
        <button @click="undoCanvas" :disabled="history.step <= 0" class="tool">
          <!-- Undo -->
          <img src="../assets/toolbar/undo.gif" alt="" />
        </button>
        <button
          @click="redoCanvas"
          :disabled="history.step >= history.paths.length"
          class="tool"
        >
          <!-- Redo -->
          <img src="../assets/toolbar/redo.gif" alt="" />
        </button>
      </div>
      <button @click="clearCanvas" :disabled="drawingIsEmpty" class="tool">
        <!-- Clear -->
        <img src="../assets/toolbar/clear.gif" alt="" />
      </button>
      <button @click="saveDrawing" :disabled="drawingIsEmpty" class="tool">
        <!-- Save -->
        <img src="../assets/toolbar/save.gif" alt="" />
      </button>
    </div>

    <div class="palette" :class="{ erasing: getMode === 'erase' }">
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
    const getMode = computed(() => store.getters.getMode);
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
      if (!isNaN(e.key)) {
        store.dispatch("setColor", colors.value[e.key - 1]);
      }

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
    const saveDrawing = () => {
      if (store.getters.drawingIsEmpty) return;
      let data = {
        user: { ...store.getters.getUser },
        drawing: { ...store.getters.getDrawing },
        guides: { ...store.getters.getGuides },
      };
      console.log(data);
      db.collection("drawings")
        .add(data)
        .then(function (docRef) {
          console.log("drawing saved with id: ", docRef.id);
        })
        .catch(function (error) {
          console.error("error saving drawing: ", error);
        });
    };

    return {
      size,
      mode,
      getMode,
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
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  > div > button:last-child {
    margin-right: 0;
  }
}

input {
  display: none;
}

.tool {
  opacity: 0.5;
  margin-right: 1rem;
}

.tool.active {
  border-bottom: 2px solid black;
  opacity: 1;
}

.tool:hover {
  opacity: 1;
  label {
    cursor: pointer;
  }
}

:disabled {
  opacity: 0.25;
}

input[type="radio"]:checked {
  opacity: 0.5;
}

.size {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  > * {
    margin-right: 0;
  }
  > span {
    margin-right: 0.5rem;
    margin-top: -0.25rem;
    width: 4ch;
    font-size: 14px;
    text-align: center;
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

img,
svg {
  width: 100%;
  max-width: 25px;
  height: auto;
}
</style>
