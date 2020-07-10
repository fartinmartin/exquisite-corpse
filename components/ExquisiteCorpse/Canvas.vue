<template>
  <div
    class="border"
    style="position: relative; width: 544px; height: 544px; margin: 0 auto;"
  >
    <canvas
      id="c"
      width="1080"
      height="1080"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    />
    <guide label="hT" v-bind:position="guides.hT"></guide>
    <guide label="tL" v-bind:position="guides.tL"></guide>
  </div>
</template>

<style lang="scss">
canvas {
  padding: 0;
  transform: scale(0.5) translate3D(-50%, -50%, 0);
  overflow: hidden;
}
</style>

<script>
import { onMounted, computed } from "vue";
import { useStore } from "vuex";
import Guide from "./Guide.vue";

export default {
  name: "Canvas",
  components: { Guide },
  setup() {
    const store = useStore();
    const ctx = computed(() => store.state.canvas.ctx);
    const mode = computed(() => store.state.mouse.mode);
    const currentColor = computed(() => store.state.mouse.palette.current);
    const isDrawing = computed(() => store.state.mouse.isDrawing);
    const guides = computed(() => store.state.drawing.guides);

    onMounted(() => {
      const canvasElement = document.querySelector("canvas");
      const canvasElementCtx = canvasElement.getContext("2d");
      store.dispatch("setCanvasCtx", canvasElementCtx);
    });

    const onMouseMove = (e) => {
      if (isDrawing.value && mode.value !== "fill") {
        store.dispatch("handleDrawPath", e);
      }
    };

    const onMouseDown = (e) => {
      store.dispatch("setMouseXY", { x: e.offsetX, y: e.offsetY });
      if (mode.value !== "fill") {
        store.dispatch("setIsDrawing", true);
        store.dispatch("handleDrawPath", e);
      } else {
        store.dispatch("handleDrawFill", e);
      }
    };

    const onMouseUp = (e) => {
      store.dispatch("setIsDrawing", false);
      if (mode.value !== "fill") {
        store.dispatch("pushCurrentPathToDrawingAndHistory");
      } else {
        store.dispatch("pushFilltoDrawingAndHistory");
      }
      store.dispatch("incrementHistory");
      store.dispatch("ifWeAreBackInTimeOverwriteHistory");
    };

    return {
      onMouseMove,
      onMouseUp,
      onMouseDown,
      guides,
    };
  },
};
</script>
