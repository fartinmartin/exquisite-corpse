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
  data: function() {
    return {
      canvas: null,
      ctx: null
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    const ctx = canvas.getContext("2d");

    this.canvas = canvas; // set local state
    this.ctx = ctx; // set local state

    if (!this.drawing) {
      this.$store.dispatch("modules/drawing/setCanvas", canvas); // set store state
      this.$store.dispatch("modules/drawing/setCtx", ctx); // set store state
    } else if (this.drawing) {
      // this.makeDrawing(this.drawing);
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
    },

    mouseleave() {
      // to prevent sticky brush when leaving CANVAS
      this.$store.dispatch("modules/mouse/setIsDrawing", false);
    },

    handleDraw(e) {
      // this needs to work for live drawing + redrawing of paths from firebase
      // ...and it does! for now 😬

      let ctx = this.ctx;
      let point;

      if (!this.drawing) {
        point = {
          mode: this.$store.state.modules.mouse.mode,
          color: this.$store.state.modules.mouse.palette.current,
          size: this.$store.state.modules.mouse.size.current,
          x1: this.$store.state.modules.mouse.x,
          y1: this.$store.state.modules.mouse.y,
          x2: e.offsetX,
          y2: e.offsetY
        };
      } else if (this.drawing) {
        point = e; // e = point passed from this.makeDrawing()
      }

      switch (point.mode) {
        case "draw":
        case "erase":
          this.drawPath(ctx, point);
          break;
        case "fill":
          this.drawFill(ctx, point);
          break;
        case "clear":
          this.clearCanvas(ctx);
          break;
        default:
          break;
      }
    },

    drawPath(ctx, point) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = point.color;
      ctx.lineWidth = point.size * 2;

      if (point.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.moveTo(point.x1, point.y1);
      ctx.lineTo(point.x2, point.y2);
      ctx.stroke();
      ctx.closePath();

      if (point.mode === "erase") {
        ctx.globalCompositeOperation = "source-over";
      }
    },

    drawFill(ctx, point) {
      ctx.fillStyle = point.color;
      let tolerance = 100;
      floodFill.fill(point.x2, point.y2, tolerance, ctx);
    },

    clearCanvas(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    makeDrawing(drawing, timeout) {
      drawing.forEach(path => path.forEach(point => this.handleDraw(point)));
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
    /* maybe we blur the rest of the illustration? */
  }
}

canvas {
  transform: scale(0.5) translate3D(-50%, -50%, 0);
  overflow: hidden;
}
</style>
