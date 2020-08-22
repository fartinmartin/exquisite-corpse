<template>
  <canvas ref="canvasThumb" width="540" height="180" />
</template>

<script>
import floodFill from "~/assets/js/floodFill";

export default {
  name: "CanvasThumb",
  props: { section: Array },
  data: () => ({ canvas: null, ctx: null }),
  mounted() {
    // set state
    this.canvas = this.$refs.canvasThumb;
    this.ctx = this.canvas.getContext("2d");

    // set canvas to match DPR
    this.highDPI(this.canvas, this.ctx);

    // set white bg (no transparency!) TODO: should this happen in "draw" mode? its probably not a big deal, but if a user's first path is "erase" and second is "fill" this bug becomes apparent.
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.makeDrawing(this.section);
  },
  methods: {
    highDPI(canvas, ctx) {
      let rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;

      ctx.scale(2, 2);

      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    },

    handleDraw(point) {
      const ctx = this.ctx;

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
      let tolerance = 50;
      let dprPoint = {
        x2: point.x2 * devicePixelRatio,
        y2: point.y2 * devicePixelRatio,
      };
      floodFill.fill(dprPoint.x2, dprPoint.y2, tolerance, ctx);
    },

    clearCanvas(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    makeDrawing(drawing) {
      for (const path of drawing) {
        for (const point of path) {
          this.handleDraw(point);
        }
      }
    },
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
