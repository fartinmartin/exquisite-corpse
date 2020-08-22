<template>
  <Panel :id="id" color="blue" no-padding>
    <div class="canvas-wrap">
      <CanvasMeta
        v-if="mode === 'display'"
        :title="section.title"
        :artist="section.artist"
        :docId="section.docId"
      />
      <CanvasMeta
        v-if="mode === 'pixelate'"
        :title="drawing.title"
        :artist="drawing.artist"
        ref="notAllowed"
      />
      <canvas
        ref="canvas"
        v-on="
          mode === 'draw' ? { mousemove, mousedown, mouseup, mouseleave } : {}
        "
        v-touch:moving="mode === 'draw' ? mousemove : {}"
        v-touch:start="mode === 'draw' ? mousedown : {}"
        v-touch:end="mode === 'draw' ? mouseup : {}"
      />
    </div>
  </Panel>
</template>

<script>
import floodFill from "~/assets/js/floodFill";
import { mapState, mapGetters } from "vuex";

export default {
  name: "Canvas",
  props: {
    id: { type: String, required: true }, // top, mid, or bot
    mode: { type: String, required: true }, // draw, display, or pixelate
    section: Object, // for when mode === "display"
  },
  data: () => ({ canvas: null, ctx: null }),
  computed: {
    ...mapState("modules/mouse", ["palette", "size", "x", "y", "isDrawing"]),
    ...mapState("modules/mouse", { mouseMode: (state) => state.mode }),
    ...mapState("modules/drawing", ["sections", "paths", "history"]),
    ...mapGetters(["isMobile"]),
    drawing() {
      if (this.mode === "display") {
        return this.section;
      } else if (this.mode === "pixelate") {
        return this.sections[this.id];
      }
    },
  },
  beforeDestroy() {
    this.canvas.removeEventListener("touchstart", (e) => e.preventDefault());
    this.canvas.removeEventListener("touchmove", (e) => e.preventDefault());
    this.canvas.removeEventListener("touchend", (e) => e.preventDefault());
    this.canvas.removeEventListener("touchcancel", (e) => e.preventDefault());
  },
  mounted() {
    // set state
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    // set canvas to match DPR
    this.highDPI(this.canvas, this.ctx);

    // do not scroll safari window when drawing on canvas
    this.canvas.addEventListener("touchstart", (e) => e.preventDefault());
    this.canvas.addEventListener("touchmove", (e) => e.preventDefault());
    this.canvas.addEventListener("touchend", (e) => e.preventDefault());
    this.canvas.addEventListener("touchcancel", (e) => e.preventDefault());

    // set white bg (no transparency!) TODO: should this happen in "draw" mode? its probably not a big deal, but if a user's first path is "erase" and second is "fill" this bug becomes apparent.
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // dispatch based on this.mode
    switch (this.mode) {
      case "draw":
        this.$store.dispatch("modules/drawing/setCanvas", this.canvas);
        this.$store.dispatch("modules/drawing/setCtx", this.ctx);
        break;
      case "pixelate":
        this.makeDrawing(this.drawing.paths);
        this.pixelateDrawing(this.canvas, this.ctx, 75);
        break;
      case "display":
        this.makeDrawing(this.drawing.paths, 500);
        break;
      default:
        break;
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

    handleTouchEvents(event) {
      const parent = event.target.parentElement;
      const e = {
        type: event.type, // for taps on mobile
        offsetX: event.targetTouches
          ? event.targetTouches[0].pageX - parent.offsetLeft - parent.scrollLeft
          : event.offsetX,
        offsetY: event.targetTouches
          ? event.targetTouches[0].pageY - parent.offsetTop - parent.scrollTop
          : event.offsetY,
      };
      return e;
    },

    mousedown(event) {
      const e = this.handleTouchEvents(event);
      this.$store.dispatch("modules/mouse/setMousePosition", e);
      this.$store.dispatch("modules/mouse/setIsDrawing", true);

      if (this.mouseMode !== "fill") {
        this.handleDraw(e); // for dots
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      } else {
        this.handleDraw(e); // for fills
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
      }
    },

    mousemove(event) {
      const e = this.handleTouchEvents(event);
      if (this.isDrawing && this.mouseMode !== "fill") {
        this.handleDraw(e); // for paths
        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
        this.$store.dispatch("modules/mouse/setMousePosition", e);
      }
    },

    mouseup() {
      if (this.isDrawing) {
        this.$store.dispatch("modules/drawing/completePath");
      }
    },

    mouseleave() {
      if (this.isDrawing) {
        this.$store.dispatch("modules/drawing/completePath");
      }
    },

    handleResponsiveDraw(point, option) {
      const width = 1080;
      const current = this.$refs.canvas.width;
      const f = width / current;

      let newPoint;
      if (option) {
        newPoint = point;
        newPoint.size = Math.round(point.size / f);
      } else {
        newPoint = { mode: point.mode, color: point.color };
        newPoint.x1 = Math.round(point.x1 / f);
        newPoint.x2 = Math.round(point.x2 / f);
        newPoint.y1 = Math.round(point.y1 / f);
        newPoint.y2 = Math.round(point.y2 / f);
        newPoint.size = Math.round(point.size / f);
      }

      return newPoint;
    },

    handleDraw(e) {
      const ctx = this.ctx;
      let point;

      if (this.mode === "draw") {
        const temp = {
          mode: this.mouseMode,
          color: this.palette.current,
          size: this.size.current,
          x1: this.x,
          y1: this.y,
          x2: e.offsetX,
          y2: e.offsetY,
        };
        if (this.isMobile) {
          point = this.handleResponsiveDraw(temp, "size"); // might still work, checking if pixelate() is throwing vuex erros
        } else {
          point = temp;
        }
      } else {
        if (this.isMobile) {
          point = this.handleResponsiveDraw(e);
        } else {
          point = e; // e = point passed from this.makeDrawing()
        }
      }

      switch (point.mode) {
        case "draw":
        case "erase":
          if (point.x1 === point.x2 && point.y1 === point.y2) {
            this.drawCircle(ctx, point);
          } else {
            this.drawPath(ctx, point);
          }
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

    drawCircle(ctx, point) {
      if (point.mode === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      }

      ctx.beginPath();
      ctx.arc(point.x1, point.y1, point.size, 0, 2 * Math.PI, true);
      ctx.fillStyle = point.color;
      ctx.fill();

      if (point.mode === "erase") {
        ctx.globalCompositeOperation = "source-over";
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
      let dprPoint = {
        x2: point.x2 * devicePixelRatio,
        y2: point.y2 * devicePixelRatio,
      };
      floodFill.fill(dprPoint.x2, dprPoint.y2, tolerance, ctx);
    },

    clearCanvas(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    async makeDrawing(drawing, duration) {
      if (duration) {
        const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
        const totalPoints = drawing.reduce((c, p) => (c += p.length), 0);
        const delay = duration / totalPoints;

        for (const path of drawing) {
          for (const point of path) {
            await waitFor(delay);
            this.handleDraw(point);
          }
        }
      } else {
        for (const path of drawing) {
          for (const point of path) {
            this.handleDraw(point);
          }
        }
      }
    },

    async pixelateDrawing(canvas, ctx, value) {
      const dpr = devicePixelRatio;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      // dim output and turn off image smoothing for pixelated effect (prefixed in some browsers)
      ctx.filter = "opacity(50%)";
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = false;

      // get current image
      const imgData = ctx.getImageData(0, 0, w * dpr, h * dpr);
      const img = await createImageBitmap(imgData);

      // scale factor
      const fw = (img.width / value) | 0;
      const fh = (img.height / value) | 0;

      // draw current image at scaled factor (aka really small and in the top left corner)
      ctx.drawImage(img, 0, 0, fw, fh);

      // take that small corner bit and enlarge it to full canvas size (aka pixelate it)
      const imgData2 = ctx.getImageData(0, 0, fw, fh);
      const img2 = await createImageBitmap(imgData2);
      this.clearCanvas(ctx);
      ctx.drawImage(img2, 0, 0, fw, fh, 0, 0, w / dpr, h / dpr);

      // remove white bg on meta-box div
      this.$refs.notAllowed.bg();
    },
  },
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
}

canvas {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}
</style>
