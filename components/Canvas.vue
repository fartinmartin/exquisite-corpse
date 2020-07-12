<template>
  <div class="canvas-wrap border" :class="{ 'not-allowed': drawing }">
    <canvas
      width="1080"
      height="360"
      ref="canvas"
      v-on="!drawing ? { mousemove, mousedown, mouseup, mouseleave } : {}"
    />
  </div>
</template>

<script>
import floodFill from "~/assets/js/floodFill";

export default {
  name: "Canvas",
  props: {
    drawing: Array,
    isPresenting: Boolean
  },
  mounted() {
    if (!this.drawing) {
      let ctx = this.$refs.canvas.getContext("2d");
      this.$store.dispatch("modules/drawing/setCtx", ctx);
    }
  },
  methods: {
    mousedown(e) {
      this.$store.dispatch("modules/mouse/setMousePosition", e);
      if (this.$store.state.modules.mouse.mode !== "fill") {
        this.$store.dispatch("modules/mouse/setIsDrawing", true);
        this.handleDraw(e); // for dots
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      } else {
        this.handleDraw(e); // for fills
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      }
    },

    mousemove(e) {
      if (
        this.$store.state.modules.mouse.isDrawing &&
        this.$store.state.modules.mouse.mode !== "fill"
      ) {
        this.handleDraw(e); // for paths
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
        this.$store.dispatch("modules/mouse/setMousePosition", e);
      }
    },

    mouseup(e) {
      this.$store.dispatch("modules/mouse/setIsDrawing", false);
      this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory");
      this.$store.dispatch("modules/drawing/incrementHistory");
      // this.$store.dispatch("modules/drawing/ifWeAreBackInTimeOverwriteHistory");
    },

    mouseleave() {
      // to prevent sticky brush when leaving CANVAS
      this.$store.dispatch("modules/mouse/setIsDrawing", false);
    },

    handleDraw(e) {
      let ctx = this.$refs.canvas.getContext("2d");
      let pointData = {
        mode: this.$store.state.modules.mouse.mode,
        color: this.$store.state.modules.mouse.palette.current,
        size: this.$store.state.modules.mouse.size.current,
        x1: this.$store.state.modules.mouse.x,
        y1: this.$store.state.modules.mouse.y,
        x2: e.offsetX,
        y2: e.offsetY
      };
      if (pointData.mode === "draw" || pointData.mode === "erase")
        this.drawPath(ctx, pointData);
      else if (pointData.mode === "fill") this.drawFill(ctx, pointData);
    },

    drawPath(ctx, pointData) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = pointData.color;
      ctx.lineWidth = pointData.size * 2;

      if (this.$store.state.modules.mouse.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.moveTo(pointData.x1, pointData.y1);
      ctx.lineTo(pointData.x2, pointData.y2);
      ctx.stroke();
      ctx.closePath();

      if (this.$store.state.modules.mouse.mode === "erase") {
        ctx.globalCompositeOperation = "source-over";
      }
    },

    drawFill(ctx, pointData) {
      ctx.fillStyle = pointData.color;
      let tolerance = 100;
      floodFill.fill(pointData.x2, pointData.y2, tolerance, ctx);
    },

    makeDrawing(ctx, drawing, timeout) {},

    draw(path) {}
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
