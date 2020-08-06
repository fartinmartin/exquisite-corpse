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
import Nav from "~/components/Nav.vue";
import Help from "~/components/Help.vue";
import CustomCursor from "~/components/CustomCursor.vue";
import { mapState } from "vuex";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

export default {
  components: { Nav, CustomCursor, Help },
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
