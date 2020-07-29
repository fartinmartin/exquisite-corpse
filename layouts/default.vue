<template>
  <div>
    <Help v-if="isHelping" />
    <Nav />
    <Nuxt />
    <CustomCursor />
  </div>
</template>

<script>
import Nav from "~/components/Nav.vue";
import Help from "~/components/Help.vue";
import CustomCursor from "~/components/CustomCursor.vue";
import { mapState } from "vuex";

export default {
  components: { Nav, CustomCursor, Help },
  computed: mapState(["isHelping"]),
  mounted() {
    // this.$store.dispatch("modules/user/signOut");
    this.$store.dispatch("modules/user/signInAnonymously");

    // modernizr style class names for touch devices
    if ("ontouchstart" in document.documentElement) {
      document.documentElement.classList.add("touch");
    } else {
      document.documentElement.classList.add("no-touch");
    }
  },
};
</script>
