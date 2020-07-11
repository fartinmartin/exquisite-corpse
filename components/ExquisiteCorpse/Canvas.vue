<template>
  <div class="canvas-wrap border" :class="{ 'not-allowed': !write }">
    <canvas
      width="1080"
      height="360"
      v-on="write ? { mousemove, mousedown, mouseup } : {}"
    />
  </div>
</template>

<script>
export default {
  name: "Canvas",
  props: {
    write: Boolean
  },
  mounted() {},
  methods: {
    mousedown(e) {
      this.$store.dispatch("modules/mouse/setMousePosition", {
        x: e.offsetX,
        y: e.offsetY
      });
      if (this.$store.state.modules.mouse.mode !== "fill") {
        this.$store.dispatch("modules/mouse/setIsDrawing", true);
        this.$store.dispatch("modules/drawing/drawPath", e);
      } else {
        this.$store.dispatch("modules/drawing/drawFill", e);
      }
    },
    mousemove(e) {
      if (
        this.$store.state.modules.mouse.isDrawing &&
        this.$store.state.modules.mouse.mode !== "fill"
      ) {
        this.$store.dispatch("modules/drawing/drawPath", e);
      }
    },
    mouseup(e) {
      this.$store.dispatch("modules/mouse/setIsDrawing", false);
      if (this.$store.state.modules.mouse.mode !== "fill") {
        this.$store.dispatch(
          "modules/drawing/pushCurrentPathToDrawingAndHistory"
        );
      } else {
        this.$store.dispatch("modules/drawing/pushFillToDrawingAndHistory");
      }
      this.$store.dispatch("modules/drawing/incrementHistory");
      this.$store.dispatch("modules/drawing/ifWeAreBackInTimeOverwriteHistory");
    }
  }
};
</script>

<style lang="scss">
.canvas-wrap {
  position: relative;
  width: 544px;
  height: calc(544px / 3);
  margin: 0 auto;
  overflow: hidden;

  &#top {
    border-bottom: none;
  }
  &#mid {
    border-top: none;
    border-bottom: none;
  }
  &#bot {
    border-top: none;
  }
}

.canvas-wrap.not-allowed {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    /* height: calc(100% - 10px); */
    height: 100%;
    // http://www.patternify.com/
    background: #ffffff
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
      repeat;
  }
}

canvas {
  transform: scale(0.5) translate3D(-50%, -50%, 0);
  overflow: hidden;
}
</style>
