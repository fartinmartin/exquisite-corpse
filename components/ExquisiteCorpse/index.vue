<template>
  <div class="container">
    <tool-bar />
    <!-- <canvas-top /> -->
    <!-- <canvas-mid /> -->
    <!-- <canvas-bot /> -->
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 540px;
}
</style>

<script>
import ToolBar from "./ToolBar.vue";

export default {
  name: "ExquisiteCorpse",
  components: {
    ToolBar
  }
};
</script>
