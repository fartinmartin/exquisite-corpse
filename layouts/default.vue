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
  components: { Nav, CustomCursor }
};
</script>
