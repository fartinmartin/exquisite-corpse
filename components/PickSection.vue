<template>
  <div>
    <div class="toolbar border yellow">
      Pick a section to start drawing!
    </div>
    <div
      class="section-template border pointer"
      @click="$emit('picked-type', 'top')"
    ></div>
    <div
      class="section-template border pointer"
      @click="$emit('picked-type', 'mid')"
    ></div>
    <div
      class="section-template border pointer"
      @click="$emit('picked-type', 'bot')"
    ></div>
  </div>
</template>

<script>
export default {
  name: "PickSection"
};
</script>

<style lang="scss" scoped>
.toolbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-template {
  width: 544px;
  height: 180px;
  margin: calc(40px / 3) 0;

  transition: transform 0.1s ease, box-shadow 0.1s ease, border 0.1s ease;

  &:hover {
    --border-color: var(--light-yellow);
    --box-shadow-color: var(--orange);
    --box-shadow-size: 6px;
    transform: translate3d(-4px, -4px, 0);
  }
}
</style>
