<template>
  <div class="drawing-item">
    <img :src="drawing.thumb" alt="" class="border" />
    <div class="border yellow meta">
      <h2>{{ drawing.title }}</h2>
      <span>{{ drawing.likes }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    drawing: Object
  }
};
</script>

<style lang="scss" scoped>
.drawing-item {
  width: 100%;
}

h2 {
  font-size: 1rem;
}

.meta {
  display: flex;
  justify-content: space-between;
}
</style>
