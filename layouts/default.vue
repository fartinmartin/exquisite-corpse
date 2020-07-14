<template>
  <div>
    <Nav />
    <Nuxt />
    <CustomCursor />
  </div>
</template>

<script>
import Nav from "~/components/Nav.vue";
import CustomCursor from "~/components/CustomCursor.vue";

export default {
  components: { Nav, CustomCursor },
  mounted() {
    this.$store.dispatch("modules/user/signInAnonymously");
    console.log("default layout");
  }
};
</script>
