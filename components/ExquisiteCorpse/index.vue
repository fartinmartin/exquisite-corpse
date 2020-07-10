<template>
  <div class="container mw-canvas">
    <tool-bar />
    <!-- <canvas-top /> -->
    <canvas-write type="mid" />
    <!-- <canvas-bot /> -->
  </div>
</template>

<style lang="scss" scoped></style>

<script>
import ToolBar from "./ToolBar.vue";
import CanvasWrite from "./CanvasWrite.vue";

export default {
  name: "ExquisiteCorpse",
  components: {
    ToolBar,
    CanvasWrite
  }
};
</script>
