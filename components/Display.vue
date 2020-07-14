<template>
  <div class="mw-canvas">
    <Canvas id="top" :section="sections.top" />
    <Canvas id="mid" :section="sections.mid" />
    <Canvas id="bot" :section="sections.bot" />
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import Canvas from "./Canvas.vue";

export default {
  name: "Display",
  props: { sections: Object },
  components: { Canvas }
};
</script>
