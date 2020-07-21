<template>
  <div class="border" :id="id">
    <div class="canvas-wrap">
      <CanvasMeta
        v-if="mode === 'display'"
        class="drawing-meta"
        :title="section.title"
        :artist="section.artist"
      />
      <CanvasMeta
        v-if="mode === 'pixelate'"
        class="drawing-meta not-allowed"
        :title="drawing.title"
        :artist="drawing.artist"
        ref="notAllowed"
      />
      <canvas
        ref="canvas"
        v-on="
          mode === 'draw' ? { mousemove, mousedown, mouseup, mouseleave } : {}
        "
      />
    </div>
  </div>
</template>

<script>
import floodFill from "~/assets/js/floodFill";
import asyncForEach, { waitFor } from "~/assets/js/asyncForEach";
import { mapState } from "vuex";
import CanvasMeta from "~/components/CanvasMeta.vue";

export default {
  name: "Canvas",
  components: { CanvasMeta },
  props: {
    id: {
      type: String, // top, mid, or bot
      required: true
    },
    mode: {
      type: String, // draw, display, or pixelate
      required: true
    },
    section: Object // maybe instead of passing we use getters to get state (using id) but then how do we handle display? maybe section only applys during display mode...
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

    if (this.mode === "draw") {
      this.$store.dispatch("modules/drawing/setCanvas", canvas); // set store state
      this.$store.dispatch("modules/drawing/setCtx", ctx);
    } else if (this.mode === "display") {
      this.makeDrawing(this.drawing.paths, 500);
    } else if (this.mode === "pixelate") {
      this.makeDrawing(this.drawing.paths);
      this.pixelateDrawing(this.canvas, this.ctx, 50);
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

    mousedown(e) {
      this.$store.dispatch("modules/mouse/setMousePosition", e);
      if (this.mouseMode !== "fill") {
        this.$store.dispatch("modules/mouse/setIsDrawing", true);
        this.handleDraw(e); // for dots
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      } else {
        this.handleDraw(e); // for fills
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      }
    },

    mousemove(e) {
      if (this.isDrawing && this.mouseMode !== "fill") {
        this.handleDraw(e); // for paths
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
        this.$store.dispatch("modules/mouse/setMousePosition", e);
      }
    },

    mouseup() {
      this.$store.dispatch("modules/mouse/setIsDrawing", false);
      this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory");
      this.$store.dispatch("modules/drawing/incrementHistory");
    },

    mouseleave() {
      // to prevent sticky brush when leaving CANVAS
      // TODO: this causes some history state error.. or something 🤷‍♂️
      if (this.isDrawing) {
        this.$store.dispatch("modules/mouse/setIsDrawing", false);
        this.$store.dispatch("modules/drawing/pushCurrentPathToDrawingHistory");
        this.$store.dispatch("modules/drawing/incrementHistory");
      }
    },

    handleDraw(e) {
      // this needs to work for live drawing + redrawing of paths from firebase
      // ...and it does! for now 😬 sort of (not in safari...) 🤔

      let ctx = this.ctx;
      let point;

      if (this.mode === "draw") {
        point = {
          mode: this.mouseMode,
          color: this.palette.current,
          size: this.size.current,
          x1: this.x,
          y1: this.y,
          x2: e.offsetX,
          y2: e.offsetY
        };
      } else if (this.mode === "display" || this.mode === "pixelate") {
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
        const handlePaths = async () => {
          await asyncForEach(drawing, async (path, i) => {
            let newTimeout;
            i > 0
              ? (newTimeout = timeout / drawing[i - 1].length / 100)
              : (newTimeout = timeout);
            await waitFor(newTimeout);
            await handlePoints(path, i);
          });
        };

        const handlePoints = async (path, i) => {
          await asyncForEach(path, async (point, i) => {
            await waitFor(5);
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

      this.$refs.notAllowed.bg();
    }
  },
  computed: {
    ...mapState("modules/mouse", ["palette", "size", "x", "y", "isDrawing"]),
    ...mapState("modules/mouse", { mouseMode: state => state.mode }),
    ...mapState("modules/drawing", ["sections"]),
    drawing() {
      if (this.mode === "display") {
        return this.section;
      } else if (this.mode === "pixelate") {
        return this.sections[this.id];
      }
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
</style>
