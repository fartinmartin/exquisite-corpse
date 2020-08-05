<template>
  <div class="drawing-item pointer">
    <img :src="drawing.thumb" alt="" class="border" />
  </div>
</template>

<script>
export default {
  name: "Drawing",
  props: { drawing: Object },
};
</script>

<style lang="scss" scoped>
.drawing-item {
  width: 100%;

  img {
    transition: transform 0.1s ease, box-shadow 0.1s ease, border 0.1s ease;
  }

  &:hover img {
    --border-color: var(--light-yellow);
    --box-shadow-color: var(--orange);
    --box-shadow-size: 6px;
    transform: translate3d(-4px, -4px, 0);
  }
}
</style>
