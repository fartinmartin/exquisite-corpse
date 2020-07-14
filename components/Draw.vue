<template>
  <div class="mw-canvas">
    <tool-bar />
    <Canvas id="top" :section="sections.top" draw-mode />
    <Canvas id="mid" :section="sections.mid" draw-mode />
    <Canvas id="bot" :section="sections.bot" draw-mode />
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import ToolBar from "./ToolBar.vue";
import Canvas from "./Canvas.vue";

export default {
  name: "Draw",
  props: { type: String, sections: Object },
  components: {
    ToolBar,
    Canvas
  },
  mounted() {
    this.$store.dispatch("modules/drawing/clearDrawing");
    this.$store.dispatch("modules/mouse/resetMouse"); // "opinionated" i guess.. i dunno what that means really
  }
};
</script>
