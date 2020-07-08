<template>
  <ExquisiteCorpse />
</template>

<script>
import { onMounted } from "vue";
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
    return {};
  },
};
</script>
