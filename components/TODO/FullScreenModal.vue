<template>
  <div class="fs-modal"></div>
</template>

<script>
export default {
  name: "FullScreenModal",
};
</script>

<style lang="scss" scoped>
.fs-modal {
  position: absolute;
  z-index: 951;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100%; // switch to percentage?

  @extend .body-bg;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: calc(40px / 3);
}
</style>
