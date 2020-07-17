<template>
  <div class="mw-canvas">
    <Canvas id="top" mode="display" :section="sections.top" />
    <Canvas id="mid" mode="display" :section="sections.mid" />
    <Canvas id="bot" mode="display" :section="sections.bot" />
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
