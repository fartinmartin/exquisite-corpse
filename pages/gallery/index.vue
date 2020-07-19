<template>
  <div class="wrap">
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
