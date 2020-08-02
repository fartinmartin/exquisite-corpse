<template>
  <canvas
    ref="canvasThumb"
    width="1080"
    height="360"
    style="width: 540px; height: 180px;"
  />
</template>

<script>
import floodFill from "~/assets/js/floodFill";
import asyncForEach, { waitFor } from "~/assets/js/asyncForEach";

export default {
  name: "CanvasThumb",
  props: { section: Array },
  data: function () {
    return {
      canvas: null,
      ctx: null,
    };
  },
  mounted() {
    // init canvas
    const canvas = this.$refs.canvasThumb;
    const ctx = canvas.getContext("2d");

    this.highDPI(canvas, ctx);

    this.canvas = canvas; // set local state
    this.ctx = ctx; // set local state

    ctx.fillStyle = "#ffffff"; // set white bg (no transparency!)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.makeDrawing(this.section);
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

    handleDraw(point) {
      const ctx = this.ctx;

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
      drawing.forEach((path) => {
        path.forEach((point) => {
          this.handleDraw(point);
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  position: absolute;
  top: -100%;
  left: -100%;
}
</style>
