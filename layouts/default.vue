<template>
  <div id="__tino" ref="tino">
    <Help v-if="isHelping" />
    <Nav />

    <transition name="fade">
      <Nuxt v-if="isLoggedIn" />
    </transition>

    <CustomCursor />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { clearAllBodyScrollLocks } from "body-scroll-lock";
import { handleBodyScroll } from "~/assets/js/handleBodyScroll";

export default {
  computed: {
    ...mapState(["isHelping"]),
    ...mapState("user", ["isLoggedIn"])
  },
  beforeDestroy() {
    clearAllBodyScrollLocks();
  },
  beforeMount() {
    this.$store.dispatch("user/onEnter");
  },
  mounted() {
    // modernizr style class names for touch devices
    if ("ontouchstart" in document.documentElement) {
      document.documentElement.classList.add("touch");
    } else {
      document.documentElement.classList.add("no-touch");
    }

    handleBodyScroll(this.$refs.tino);
  }
};
</script>
