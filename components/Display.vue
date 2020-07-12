<template>
  <div class="container mw-canvas">
    <Canvas id="top" :drawing="sections.top" is-presenting />
    <Canvas id="mid" :drawing="sections.mid" is-presenting />
    <Canvas id="bot" :drawing="sections.bot" is-presenting />
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
