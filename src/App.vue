<template>
  <div
    id="eq"
    :class="{
      draw: mode === 'draw',
      erase: mode === 'erase',
      fill: mode === 'fill',
    }"
  >
    <ExquisiteCorpse />
  </div>
</template>

<script>
import { onMounted, computed } from "vue";
import ExquisiteCorpse from "./components/ExquisiteCorpse.vue";
import { useStore } from "vuex";
import { auth } from "../firebase";

export default {
  name: "App",
  components: {
    ExquisiteCorpse,
  },
  setup() {
    const store = useStore();
    const mode = computed(() => store.state.mouse.mode);
    onMounted(() => {
      auth.signInAnonymously();
      auth.onAuthStateChanged((user) => {
        if (user) {
          store.dispatch("setUser", user);
        } else {
          store.dispatch("setUser", null);
        }
      });
    });
    return {
      mode,
    };
  },
};
</script>

<style>
#eq.draw canvas {
  cursor: url("./assets/toolbar/draw@0.5x.png") 0 45, auto;
}
#eq.erase canvas {
  cursor: url("./assets/toolbar/erase@0.5x.png") 10 45, auto;
}
#eq.fill canvas {
  cursor: url("./assets/toolbar/fill@0.5x.png") 0 45, auto;
}
</style>
