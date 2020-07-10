<template>
  <div class="canvas-wrap border">
    <canvas
      id="type"
      class="write"
      width="1080"
      height="360"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    />
  </div>
</template>

<script>
export default {
  name: "CanvasWrite",
  props: {
    type: String
  },
  mounted() {
    console.log("van");
  },
  methods: {
    onMouseMove(e) {},
    onMouseDown(e) {},
    onMouseUp(e) {}
  }
};
</script>

<style lang="scss">
.canvas-wrap {
  position: relative;
  width: 544px;
  height: calc(544px / 3);
  margin: 0 auto;
}

canvas {
  transform: scale(0.5) translate3D(-50%, -50%, 0);
  overflow: hidden;
}
</style>
