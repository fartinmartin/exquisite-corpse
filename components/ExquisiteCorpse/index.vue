<template>
  <div class="container mw-canvas">
    <tool-bar />
    <Canvas id="top" :write="false" />
    <Canvas id="mid" :write="true" />
    <Canvas id="bot" :write="false" />
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import ToolBar from "./ToolBar.vue";
import Canvas from "./Canvas.vue";

export default {
  name: "ExquisiteCorpse",
  components: {
    ToolBar,
    Canvas
  }
};
</script>
