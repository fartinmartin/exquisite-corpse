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
import {
  initCanvas,
  makeDrawing,
  pixelateDrawing,
  handleDraw,
} from "~/assets/js/canvasLogic";
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
    ["touchstart", "touchmove", "touchend", "touchcancel"].forEach((event) =>
      this.canvas.removeEventListener(event, (e) => e.preventDefault(), false)
    );
  },
  mounted() {
    // set state
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    initCanvas(this.canvas);

    // do not scroll safari window when drawing on canvas
    ["touchstart", "touchmove", "touchend", "touchcancel"].forEach((event) =>
      this.canvas.addEventListener(event, (e) => e.preventDefault(), false)
    );

    // dispatch based on this.mode
    switch (this.mode) {
      case "draw":
        this.$store.dispatch("modules/drawing/setCanvas", this.canvas);
        this.$store.dispatch("modules/drawing/setCtx", this.ctx);
        break;
      case "pixelate":
        makeDrawing(this.ctx, this.drawing.paths);
        pixelateDrawing(this.ctx);
        break;
      case "display":
        makeDrawing(this.ctx, this.drawing.paths, 500);
        break;
      default:
        break;
    }
  },
  methods: {
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

      handleDraw(this.ctx, this.makePoint(e), "draw");
      this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
    },

    mousemove(event) {
      if (this.isDrawing && this.mouseMode !== "fill") {
        const e = this.handleTouchEvents(event);

        handleDraw(this.ctx, this.makePoint(e), "draw"); // for paths

        this.$store.dispatch("modules/drawing/logPathToCurrentPath", e);
        this.$store.dispatch("modules/mouse/setMousePosition", e);
      }
    },

    mouseup() {
      this.isDrawing && this.$store.dispatch("modules/drawing/completePath");
    },

    mouseleave() {
      this.isDrawing && this.$store.dispatch("modules/drawing/completePath");
    },

    makePoint(e) {
      const f = 1080 / this.canvas.width;

      let point = {
        mode: this.mouseMode,
        color: this.palette.current,
        size: this.size.current,
        x1: this.x,
        y1: this.y,
        x2: e.offsetX,
        y2: e.offsetY,
      };

      return point;
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
