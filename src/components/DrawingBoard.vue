<template>
  <div class="container">
    <div>
      <div class="toolbar">
        <div class="brush">
          <div>
            <input
              type="radio"
              name="mode"
              id="draw"
              value="draw"
              v-model="state.mouse.mode"
              checked
            />
            <label for="draw">Draw</label>
          </div>

          <div>
            <input
              type="radio"
              name="mode"
              id="erase"
              value="erase"
              v-model="state.mouse.mode"
            />
            <label for="erase">Erase</label>
          </div>

          <div>
            <input
              type="radio"
              name="mode"
              id="fill"
              value="fill"
              v-model="state.mouse.mode"
            />
            <label for="fill">Fill</label>
          </div>

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
            <button @click="undoCanvas" :disabled="state.history.step <= 0">
              Undo
            </button>
            <button
              @click="redoCanvas"
              :disabled="state.history.step >= state.history.drawing.length"
            >
              Redo
            </button>
          </div>
          <button @click="clearCanvas">Clear</button>
          <button @click="saveDrawing">Save</button>
        </div>

        <div class="palette" :class="{ erasing: state.mouse.mode === 'erase' }">
          <button
            v-for="(color, index) in state.mouse.palette.colors"
            :key="index"
            class="swatch"
            :class="{ active: color === state.mouse.palette.current }"
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

      <canvas
        id="drawingBoard"
        width="560"
        height="560"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
      />
    </div>

    <div class="debug">
      <div class="debug-heading">
        <div>
          <pre>history.step: {{ state.history.step }}</pre>
          <pre>history.drawing.length: {{ state.history.drawing.length }}</pre>
        </div>
        <div>
          <pre>drawing.length: {{ state.drawing.length }}</pre>
        </div>
      </div>
      <div class="log">
        <h2>log</h2>
        <pre
          v-for="(path, i) in state.history.drawing"
          :key="i"
          style="text-align: left;"
          class="log-item"
          :class="{ active: i + 1 === state.history.step }"
        ><strong>{{i + 1}}</strong>{{ path }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#drawingBoard {
  border: 1px solid gray;
}

.debug {
  width: 100%;
}

.debug-heading {
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-align: left;
}

.log-item {
  max-width: 562px;
}

.log strong {
  margin-right: 1rem;
}

.log pre {
  height: 1.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  margin: 0;
  border: 2px solid transparent;
}

.log pre.active {
  border: 2px solid goldenrod;
}

.log pre:nth-child(odd) {
  background: #eee;
}

.container {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

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

<script>
import { onMounted, reactive, onBeforeUnmount } from "vue";
import { db } from "../../firebase";

import {
  getPixel,
  hexToRgb,
  floodFill,
  fillColor,
  setPixel,
} from "../modules/useFill.js";

export default {
  name: "DrawingBoard",

  setup() {
    let state = reactive({
      canvas: null,
      history: { step: 0, drawing: [] },
      drawing: [],
      currentPath: [],
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

    onMounted(() => {
      const c = document.getElementById("drawingBoard");
      state.canvas = c.getContext("2d");

      document.addEventListener("keydown", handleShortcuts);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", handleShortcuts);
    });

    const handleShortcuts = (e) => {
      // console.log(e);
      if (!isNaN(e.key)) {
        state.mouse.palette.current = state.mouse.palette.colors[e.key - 1];
      }

      switch (e.keyCode) {
        case 68: // "d"
          setMode("draw");
          break;
        case 69: // "e"
          setMode("erase");
          break;
        case 70: // "e"
          setMode("fill");
          break;
        case 67: // "c" OR
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

    const setMode = (e) => {
      typeof e === "string"
        ? (state.mouse.mode = e)
        : e.target.value === "draw"
        ? (state.mouse.mode = "draw")
        : e.target.value === "erase"
        ? (state.mouse.mode = "erase")
        : e.target.value === "fill"
        ? (state.mouse.mode = "fill")
        : null;
    };

    const drawPath = ({ x1, y1, x2, y2, color, size, mode }) => {
      let ctx = state.canvas;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;

      if (mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();

      if (mode === "erase") {
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const makeDrawing = (drawing) => {
      drawing.forEach((path) => {
        if (Array.isArray(path)) {
          path.forEach((pointData) => {
            pointData.mode === "fill"
              ? drawFill(pointData)
              : drawPath(pointData);
          });
        } else clearCanvas();
      });
    };

    const onMouseMove = (e) => {
      if (state.mouse.isDrawing) {
        let pointData = {
          x1: state.mouse.x,
          y1: state.mouse.y,
          x2: e.offsetX,
          y2: e.offsetY,
          color: state.mouse.palette.current,
          size: state.mouse.size.current,
          mode: state.mouse.mode,
        };
        state.currentPath.push(pointData); // log points
        drawPath(pointData); // draw path
        state.mouse.x = e.offsetX;
        state.mouse.y = e.offsetY;
      }
    };

    const onMouseDown = (e) => {
      state.mouse.x = e.offsetX;
      state.mouse.y = e.offsetY;
      if (state.mouse.mode === "fill") {
        let targetColor = getPixelColor(state.mouse.x, state.mouse.y);
        let currentColor = hexToRgb(state.mouse.palette.current);
        console.log(targetColor, currentColor);
        // floodFillStack(state.mouse.x, state.mouse.y, targetColor, currentColor);
        // log fill to history and to drawing?
      } else {
        state.mouse.isDrawing = true;
      }
    };

    const onMouseUp = () => {
      state.mouse.isDrawing = false;
      state.drawing.push(state.currentPath); // log path

      // overwrite "redo" history when drawing this line
      if (state.history.step < state.history.drawing.length) {
        const dif = state.history.drawing.length - state.history.step;
        state.history.drawing.length = state.history.drawing.length - dif;
      }

      state.history.drawing.push(state.currentPath); // log path
      state.history.step++; // increment history

      state.currentPath = []; // clear currentPath
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
      if (state.history.step >= 0) {
        state.history.step--;
        state.drawing.length = state.history.step;
        clearCanvas();
        makeDrawing(state.drawing);
      }
    };

    const redoCanvas = () => {
      if (state.history.step < state.history.drawing.length) {
        state.history.step++;
        const newDrawing = [...state.history.drawing];
        newDrawing.length = state.history.step;
        state.drawing = newDrawing;
        clearCanvas();
        makeDrawing(state.drawing);
      }
    };

    const clearCanvas = (e) => {
      if (e) {
        if (state.history.step < state.history.drawing.length) {
          const dif = state.history.drawing.length - state.history.step;
          state.history.drawing.length = state.history.drawing.length - dif;
        }

        state.history.step++;

        state.history.drawing.push("clear");
        state.drawing.push("clear");
      }
      let ctx = state.canvas;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const saveDrawing = () => {
      let data = {
        name: "fartin",
        drawing: { ...state.drawing },
      };

      db.collection("drawings").add(data);
    };

    return {
      state,
      setMode,
      onMouseMove,
      onMouseUp,
      onMouseDown,
      decrementSize,
      incrementSize,
      setColor,
      addColor,
      history,
      undoCanvas,
      redoCanvas,
      clearCanvas,
      saveDrawing,
    };
  },
};
</script>
