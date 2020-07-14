<template>
  <div class="border">
    <div class="canvas-wrap">
      <div v-if="section && !section.type" class="drawing-meta">
        <div class="info">{{ section.title }} by {{ section.artist }}</div>
      </div>
      <div v-if="drawMode && !section.type" class="drawing-meta not-allowed">
        <div class="info">{{ section.title }} by {{ section.artist }}</div>
      </div>
      <canvas
        ref="canvas"
        v-on="drawMode ? { mousemove, mousedown, mouseup, mouseleave } : {}"
        :class="{ blur: drawMode && !section.type }"
      />
    </div>
  </div>
</template>

<script>
import floodFill from "~/assets/js/floodFill";

export default {
  name: "Canvas",
  props: {
    section: Object,
    drawMode: Boolean
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

    this.highDPI(canvas, ctx);

    this.canvas = canvas; // set local state
    this.ctx = ctx; // set local state

    if (this.drawMode && this.section.type) {
      this.$store.dispatch("modules/drawing/setCanvas", canvas); // set store state
      this.$store.dispatch("modules/drawing/setCtx", ctx); // set store state
    } else if (this.section) {
      !this.drawMode && this.makeDrawing(this.drawing, 3000);
      this.drawMode && this.makeDrawing(this.drawing);
    }
  },
  methods: {
    highDPI(canvas, ctx) {
      let rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;

      ctx.scale(devicePixelRatio, devicePixelRatio);

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    },
    // TODO: replace this.$store.state.modules with mapSate ? 🤔 this.canvas and this.ctx are taken
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

      if (this.drawMode && this.section.type) {
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
        // console.log(point.mode);
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
      // https://medium.com/@lelandzach/is-javascript-array-foreach-asynchronous-a473e59ee592
      drawing.forEach((path, i) => {
        if (timeout) {
          setTimeout(() =>
            path.forEach((point, i) => {
              setTimeout(
                () => this.handleDraw(point),
                (timeout / 100) * (i + 1)
              );
            }, timeout * (i + 1))
          );
        } else if (!timeout) {
          path.forEach(point => {
            this.handleDraw(point);
          });
        }
      });
    }
  },
  computed: {
    drawing() {
      if (this.section) {
        let drawing = { ...this.section.drawing };
        return Object.values(drawing);
      } else return;
    }
  }
};
</script>

<style lang="scss">
#top {
  border-bottom: none;
}

#mid {
  border-top: none;
  border-bottom: none;
}

#bot {
  border-top: none;
}

.canvas-wrap {
  position: relative;
  overflow: hidden;

  width: 100%;
  max-width: 540px;
  height: 0;
  padding-top: calc(100% / 3);

  /* width: 540px;
  height: 180px; */

  &:hover .drawing-meta {
    display: block;
  }
}

canvas {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.drawing-meta {
  display: none;
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // http://www.patternify.com/
  background: transparent
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
    repeat;

  .info {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    background: var(--white);
    height: 60px;
    min-width: 33%;
    border: 2px solid var(--orange);
    padding: 0 1rem;
  }
}

.drawing-meta.not-allowed {
  display: block;
  background: rgba(255, 255, 255, 0.6);

  .info {
    display: none;
  }

  &:hover .info {
    display: flex;
  }
}
</style>
