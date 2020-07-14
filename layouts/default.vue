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
  mounted() {
    this.$store.dispatch("modules/user/signInAnonymously");
  },
  computed: mapState(["isHelping"])
};
</script>
