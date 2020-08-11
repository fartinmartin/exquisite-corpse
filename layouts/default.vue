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
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

export default {
  computed: {
    ...mapState(["isHelping"]),
    ...mapState("modules/user", ["isLoggedIn"]),
  },
  beforeDestroy() {
    clearAllBodyScrollLocks();
  },
  beforeMount() {
    this.$store.dispatch("modules/user/onEnter");
  },
  mounted() {
    // modernizr style class names for touch devices
    if ("ontouchstart" in document.documentElement) {
      document.documentElement.classList.add("touch");
    } else {
      document.documentElement.classList.add("no-touch");
    }

    this.handleBodyScroll();
  },
  methods: {
    handleBodyScroll() {
      disableBodyScroll(this.$refs.tino, {
        allowTouchMove: (el) => el.tagName === "CANVAS",
      });
    },
  },
};
</script>
