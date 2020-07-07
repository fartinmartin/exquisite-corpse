<template>
  <canvas
    id="c"
    width="540"
    height="540"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  />
</template>

<style lang="scss" scoped>
canvas {
  border: 1px solid gray;
  /*
    eventually edit scale for high-res output:
    transform: scale(0.5);

    and adjust HTML element to match:
    width="1080"
    height="1080"
  */
}
</style>

<script>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Canvas",
  setup() {
    const store = useStore();
    const ctx = computed(() => store.state.canvas.ctx);
    const size = computed(() => store.state.mouse.size.current);
    const mode = computed(() => store.state.mouse.mode);
    const color = computed(() => store.state.mouse.palette.current);
    const x = computed(() => store.state.mouse.x);
    const y = computed(() => store.state.mouse.y);
    const isDrawing = computed(() => store.state.mouse.isDrawing);

    onMounted(() => {
      const canvasElement = document.querySelector("canvas");
      const canvasElementCtx = canvasElement.getContext("2d");
      store.dispatch("setCanvasCtx", canvasElementCtx);
    });

    const drawPath = (e) => {
      let pointData = {
        mode: mode.value,
        x1: x.value,
        y1: y.value,
        x2: e.offsetX,
        y2: e.offsetY,
        color: color.value,
        size: size.value,
      };
      store.dispatch("pushPointDataToCurrentPath", pointData);
      store.dispatch("drawPath", pointData);
      store.dispatch("setMouseXY", { x: e.offsetX, y: e.offsetY });
    };

    const onMouseMove = (e) => {
      if (isDrawing.value && mode.value !== "fill") {
        drawPath(e);
      }
    };

    const onMouseDown = (e) => {
      store.dispatch("setMouseXY", { x: e.offsetX, y: e.offsetY });
      if (mode.value !== "fill") {
        store.dispatch("setIsDrawing", true);
        drawPath(e);
      } else {
        let pointData = {
          mode: mode.value,
          color: color.value,
          x: x.value,
          y: y.value,
        };
        store.dispatch("drawFill", pointData);
      }
    };

    const onMouseUp = (e) => {
      store.dispatch("setIsDrawing", false);
      store.dispatch("pushCurrentPathToDrawingAndHistory");
      store.dispatch("incrementHistory");
      store.dispatch("ifWeAreBackInTimeOverwriteHistory");
    };

    return {
      onMouseMove,
      onMouseUp,
      onMouseDown,
    };
  },
};
</script>
