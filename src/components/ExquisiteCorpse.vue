<template>
  <div class="container">
    <div class="ec-wrap">
      <div>
        <tool-bar></tool-bar>
        <Canvas></Canvas>
        <button @click="log = !log">
          <span v-show="!log">show</span><span v-show="log">hide</span> log
        </button>
      </div>
      <log v-show="log"></log>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 540px;
  margin: 0 auto;
}

.ec-wrap {
  margin-top: -4rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  margin-top: 2rem;
}
</style>

<script>
import { ref } from "vue";
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
  setup() {
    const log = ref(false);
    return { log };
  },
};
</script>
