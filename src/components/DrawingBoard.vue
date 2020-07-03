<template>
  <div class="container">
    <div>
      <div class="toolbar">
        <div class="brush">
          <button @click="toggleMode">Mode: {{ state.mouse.mode }}</button>

          <div class="size">
            <button
              @click="decrementSize"
              :disabled="state.mouse.size.current == state.mouse.size.min"
            >
              -
            </button>
            <span>{{ state.mouse.size.current }}px</span>
            <button
              @click="incrementSize"
              :disabled="state.mouse.size.current == state.mouse.size.max"
            >
              +
            </button>
          </div>
        </div>

        <div class="edits">
          <div>
            <button @click="undoCanvas">Undo</button>
            <button @click="redoCanvas">Redo</button>
          </div>
          <button @click="clearCanvas">Clear</button>
        </div>

        <div
          class="palette"
          :class="state.mouse.mode === 'erase' ? 'erasing' : null"
        >
          <button
            v-for="(color, index) in state.mouse.palette.colors"
            :key="index"
            class="swatch"
            :class="color === state.mouse.palette.current ? 'active' : null"
            :style="{ backgroundColor: color }"
            @click="setColor(color)"
          ></button>
          <input
            type="color"
            id="addColor"
            @change="addColor($event)"
            style="display: none;"
          />
          <label for="addColor" class="add-color">+</label>
        </div>
      </div>
    </div>
    <canvas
      id="drawingBoard"
      width="560"
      height="560"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    />
  </div>
</template>

<style lang="scss" scoped>
#drawingBoard {
  border: 1px solid gray;
}

.container {
  max-width: 560px;
  margin: 0 auto;
}

.toolbar {
  padding: 0.5rem 0;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.brush,
.edits {
  display: flex;
}

.palette {
  display: flex;
  width: 100%;

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
  /* border: 2px solid rgba(0, 0, 0, 0.5); */
  align-items: center;
  justify-content: center;
}
</style>

<script>
import { onMounted, reactive, onBeforeUnmount } from "vue";
import { db } from "../../firebase";

export default {
  name: "DrawingBoard",

  setup() {
    onMounted(() => {
      var c = document.getElementById("drawingBoard");
      state.canvas = c.getContext("2d");

      document.addEventListener("keydown", handleShortcuts);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleShortcuts);
    });

    const handleShortcuts = (e) => {
      if (!isNaN(e.key)) {
        state.mouse.palette.current = state.mouse.palette.colors[e.key - 1];
      }

      switch (e.keyCode) {
        case 68: // "d"
          toggleMode();
          break;
        case 8: // "backspace"
          clearCanvas();
          break;
        case 219: // "["
          decrementSize();
          break;
        case 221: // "]"
          incrementSize();
          break;
      }
    };

    let state = reactive({
      canvas: null,
      mouse: {
        x: 0,
        y: 0,
        isDrawing: false,
        mode: "draw",
        size: {
          current: 2,
          min: 1,
          max: 10,
        },
        palette: {
          current: "#000000",
          colors: [
            "#000000",
            "#F44E3B",
            "#FE9200",
            "#FCDC00",
            "#A4DD00",
            "#68CCCA",
            "#AEA1FF",
            "#FDA1FF",
          ],
        },
      },
    });

    const toggleMode = () => {
      state.mouse.mode === "draw"
        ? (state.mouse.mode = "erase")
        : (state.mouse.mode = "draw");
    };

    const drawPath = (x1, y1, x2, y2) => {
      let ctx = state.canvas;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = state.mouse.palette.current;
      ctx.lineWidth = state.mouse.size.current;

      if (state.mouse.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();

      if (state.mouse.mode === "erase") {
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const onMouseMove = (e) => {
      if (state.mouse.isDrawing) {
        drawPath(state.mouse.x, state.mouse.y, e.offsetX, e.offsetY);
        state.mouse.x = e.offsetX;
        state.mouse.y = e.offsetY;
      }
    };

    const onMouseDown = (e) => {
      state.mouse.x = e.offsetX;
      state.mouse.y = e.offsetY;
      state.mouse.isDrawing = true;
    };

    const onMouseUp = () => {
      state.mouse.isDrawing = false;
    };

    const decrementSize = () =>
      state.mouse.size.current > state.mouse.size.min
        ? state.mouse.size.current--
        : state.mouse.size.current;
    const incrementSize = () =>
      state.mouse.size.current < state.mouse.size.max
        ? state.mouse.size.current++
        : state.mouse.size.current;

    const setColor = (color) => {
      state.mouse.palette.current = color;
    };

    const addColor = (event) => {
      const newColor = event.target.value;
      state.mouse.palette.colors.includes(newColor)
        ? null
        : state.mouse.palette.colors.push(event.target.value);
      setColor(newColor);
    };

    const undoCanvas = () => {
      console.log("undo");
    };

    const redoCanvas = () => {
      console.log("redo");
    };

    const clearCanvas = () => {
      let ctx = state.canvas;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    return {
      state,
      toggleMode,
      onMouseMove,
      onMouseUp,
      onMouseDown,
      decrementSize,
      incrementSize,
      setColor,
      addColor,
      undoCanvas,
      redoCanvas,
      clearCanvas,
    };
  },
};
</script>
