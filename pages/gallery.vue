<template>
  <div class="container">
    <div>
      <h1>Gallery</h1>
      <div v-for="drawing in gallery" :key="drawing[0]">
        <pre>{{ drawing }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "gallery",
  mounted() {
    this.$store.dispatch("modules/gallery/setGallery");
  },
  computed: mapGetters({ gallery: "modules/gallery/getGallery" })
};
</script>

<style lang="scss" scoped>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
