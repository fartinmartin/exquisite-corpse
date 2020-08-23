<template>
  <canvas ref="canvasThumb" width="540" height="180" />
</template>

<script>
import { initCanvas, makeDrawing } from "~/assets/js/canvasLogic";

export default {
  name: "CanvasThumb",
  props: { section: Array },
  data: () => ({ canvas: null, ctx: null }),
  mounted() {
    this.canvas = this.$refs.canvasThumb;
    this.ctx = this.canvas.getContext("2d");

    initCanvas(this.canvas, { scale: 2 });
    makeDrawing(this.ctx, this.section);
  },
};
</script>

<style lang="scss" scoped>
canvas {
  width: 540px;
  height: 180px;
  opacity: 0;
  pointer-events: none;
}
</style>
