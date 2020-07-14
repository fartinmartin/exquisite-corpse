<template>
  <div class="border">
    <div class="canvas-wrap">
      <div v-if="section && !section.type" class="drawing-meta">
        <div class="info">{{ section.title }} by {{ section.artist }}</div>
      </div>
      <div
        v-if="drawMode && !section.type"
        class="drawing-meta not-allowed"
        ref="notAllowed"
      >
        <div class="info">{{ section.title }} by {{ section.artist }}</div>
      </div>
      <canvas
        ref="canvas"
        v-on="drawMode ? { mousemove, mousedown, mouseup, mouseleave } : {}"
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
      !this.drawMode && this.makeDrawing(this.drawing, 1250);
      if (this.drawMode) {
        this.makeDrawing(this.drawing);
        this.pixelateDrawing(this.canvas, this.ctx, 50);
      }
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
      if (this.$store.state.modules.mouse.isDrawing) {
        this.$store.dispatch("modules/mouse/setIsDrawing", false);
        this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory");
        this.$store.dispatch("modules/drawing/incrementHistory");
      }
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
      let dpiPoint = {
        x2: point.x2 * devicePixelRatio,
        y2: point.y2 * devicePixelRatio
      };
      floodFill.fill(dpiPoint.x2, dpiPoint.y2, tolerance, ctx);
    },

    clearCanvas(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    makeDrawing(drawing, timeout) {
      if (timeout) {
        // 🚨 POTENTIAL IDEA: batch drawing off into arrays separated by "erase", "fill", and "clear"
        //                    run the "draw" points simlutaneously
        let pathTotal = 0;
        let pointTotal = 0;
        drawing.forEach(path => {
          pathTotal++;
          path.forEach(point => pointTotal++);
        });
        const delay = (pointTotal * pathTotal) / timeout;

        const waitFor = ms => new Promise(r => setTimeout(r, ms));
        const asyncForEach = async (array, callback) => {
          for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
          }
        };

        const handlePaths = async () => {
          await asyncForEach(drawing, async (path, i) => {
            await waitFor(delay);
            await handlePoints(path, i);
          });
          // console.log("Done!");
        };

        const handlePoints = async (path, i) => {
          await asyncForEach(path, async (point, i) => {
            await waitFor(delay / 100);
            this.handleDraw(point);
          });
        };

        handlePaths();
      } else {
        drawing.forEach((path, i) => {
          path.forEach(point => {
            this.handleDraw(point);
          });
        });
      }
    },

    async pixelateDrawing(canvas, ctx, value) {
      ctx.filter = "opacity(50%)";
      const imgData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      const img = await createImageBitmap(imgData);

      var fw = (img.width / value) | 0,
        fh = (img.height / value) | 0;

      /// turn off image smoothing (prefixed in some browsers)
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0, fw, fh);
      const imgData2 = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      const img2 = await createImageBitmap(imgData2);
      this.clearCanvas(ctx);
      ctx.drawImage(
        img2,
        0,
        0,
        fw,
        fh,
        0,
        0,
        img2.width / devicePixelRatio,
        img2.height / devicePixelRatio
      );

      this.$refs.notAllowed.style.backgroundColor = "transparent";
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
  background-color: var(--white);

  .info {
    display: none;
  }

  &:hover .info {
    display: flex;
  }
}
</style>
