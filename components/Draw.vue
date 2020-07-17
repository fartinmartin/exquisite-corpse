<template>
  <div class="mw-canvas">
    <tool-bar />
    <Canvas id="top" :mode="sections.top.type === type ? 'draw' : 'pixelate'" />
    <Canvas id="mid" :mode="sections.mid.type === type ? 'draw' : 'pixelate'" />
    <Canvas id="bot" :mode="sections.bot.type === type ? 'draw' : 'pixelate'" />
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import ToolBar from "./ToolBar.vue";
import Canvas from "./Canvas.vue";
import { mapState } from "vuex";

export default {
  name: "Draw",
  components: {
    ToolBar,
    Canvas
  },
  computed: {
    ...mapState("modules/drawing", ["type", "sections"])
  }
};
</script>
