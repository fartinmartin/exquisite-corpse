<template>
  <div class="container">
    <div>
      <tool-bar></tool-bar>
      <Canvas></Canvas>
    </div>
    <log></log>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
</style>

<script>
import ToolBar from "./ToolBar.vue";
import Canvas from "./Canvas.vue";
import Log from "./Log.vue";

export default {
  name: "ExquisiteCorpse",
  components: {
    Canvas,
    ToolBar,
    Log,
  },
};
</script>
