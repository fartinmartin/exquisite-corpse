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
