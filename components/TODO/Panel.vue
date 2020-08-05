<template>
  <div class="panel border mw-canvas">
    <div class="content"><slot /></div>
  </div>
</template>

<script>
export default {
  name: "Panel",
  props: {
    color: { type: String, default: "yellow" }, // "yellow", "blue", "red", "green"
    hover: { type: Boolean, default: false },
    padding: { type: Boolean, default: true },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  min-height: 60px;
  padding: 1rem;

  --brdr-size: 2px;
  --bx-s-size: 2px;

  border: var(--brdr-size) solid var(--brdr-color);
  box-shadow: var(--bx-s-size) var(--bx-s-size) 0 0 var(--bx-s-color);
  background: var(--white);

  &.yellow {
    --brdr-color: var(--light-yellow);
    --bx-s-color: var(--orange);
  }

  &.blue {
    --brdr-color: var(--light-blue);
    --bx-s-color: var(--blue);
  }

  &.red {
    --brdr-color: var(--light-yellow);
    --bx-s-color: var(--orange);
  }

  &.green {
    --brdr-color: var(--light-yellow);
    --bx-s-color: var(--orange);
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
