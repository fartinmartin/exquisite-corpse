<template>
  <div class="mw-canvas">
    <tool-bar />
    <Canvas
      id="top"
      :drawing="sections.top"
      :is-presenting="sections.top !== null"
    />
    <Canvas
      id="mid"
      :drawing="sections.mid"
      :is-presenting="sections.mid !== null"
    />
    <Canvas
      id="bot"
      :drawing="sections.bot"
      :is-presenting="sections.bot !== null"
    />
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import ToolBar from "./ToolBar.vue";
import Canvas from "./Canvas.vue";

export default {
  name: "Draw",
  props: { sections: Object },
  components: {
    ToolBar,
    Canvas
  },
  mounted() {}
};
</script>
