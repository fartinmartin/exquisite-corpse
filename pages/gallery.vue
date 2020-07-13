<template>
  <div class="container">
    <div>
      <h1>Gallery</h1>
      <div v-for="drawing in gallery" :key="drawing">
        <pre>{{ drawing }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "gallery",
  data: function() {
    return {
      gallery: ["this", "is", "a", "test"]
    };
  }
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
