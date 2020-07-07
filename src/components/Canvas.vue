<template>
  <div>
    <canvas
      width="540"
      height="540"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    />
  </div>
</template>

<style lang="scss" scoped>
canvas {
  border: 1px solid gray;
}
</style>

<script>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Canvas",
  setup() {
    const store = useStore();
    const canvas = computed(() => store.state.canvas);
    const ctx = canvas.value;
    const size = computed(() => store.state.mouse.size);
    const mode = computed(() => store.state.mouse.mode);
    const color = computed(() => store.state.mouse.palette.current);
    const x = computed(() => store.state.mouse.x);
    const y = computed(() => store.state.mouse.y);
    const isDrawing = computed(() => store.state.mouse.isDrawing);

    onMounted(() => {
      const c = document.querySelector("canvas");
      const ctx = c.getContext("2d");
      store.dispatch("setCanvas", ctx);
    });

    const drawPath = ({ x1, y1, x2, y2, color, size, mode }) => {
      console.log("hello");
      console.log(ctx);
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

    const onMouseMove = (e) => {
      if (isDrawing.value) {
        let pointData = {
          x1: x,
          y1: y,
          x2: e.offsetX,
          y2: e.offsetY,
          color,
          size,
          mode,
        };
        store.dispatch("pushPointDataToCurrentPath", pointData);
        drawPath(pointData);
        store.dispatch("setMouseXY", { x: e.offsetX, y: e.offsetY });
      }
    };

    const onMouseDown = (e) => {
      console.log("down", e.offsetX, e.offsetY);
      store.dispatch("setMouseXY", { x: e.offsetX, y: e.offsetY });
      store.dispatch("setIsDrawing", true);
    };

    const onMouseUp = (e) => {
      console.log("up", e.offsetX, e.offsetY);
      store.dispatch("setIsDrawing", false);
      store.dispatch("pushCurrentPathToDrawing");
    };

    return {
      onMouseMove,
      onMouseUp,
      onMouseDown,
    };
  },
};
</script>
