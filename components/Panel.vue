<template>
  <div
    class="panel mw-canvas"
    :class="[color, interactive && 'i pointer', noPadding && 'np']"
  >
    <div class="content" v-if="isLoading === 'success'"><slot /></div>
  </div>
</template>

<script>
export default {
  name: "Panel",
  props: {
    color: { type: String, default: "yellow" }, // "yellow", "blue", "red", "green"
    interactive: { type: Boolean, default: false },
    noPadding: { type: Boolean, default: false },
    isLoading: { type: String, default: "success" },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  min-height: 60px;
  padding: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  &.np {
    padding: 0;
  }

  --brdr-size: 2px;
  --bx-s-size: 2px;

  border: var(--brdr-size) solid var(--brdr-color);
  box-shadow: var(--bx-s-size) var(--bx-s-size) 0 0 var(--bx-s-color);
  background: var(--white);

  transition: transform 0.1s ease, box-shadow 0.1s ease, border 0.1s ease;

  &.yellow {
    --brdr-color: var(--light-yellow);
    --bx-s-color: var(--orange);
  }

  &.blue {
    --brdr-color: var(--light-blue);
    --bx-s-color: var(--blue);
  }

  &.red {
    --brdr-color: var(--orange);
    --bx-s-color: var(--red);
  }

  &.green {
    --brdr-color: var(--light-green);
    --bx-s-color: var(--green);
  }

  &.i:hover {
    --brdr-color: var(--light-yellow);
    --bx-s-color: var(--orange);
    --bx-s-size: 6px;
    transform: translate3d(-4px, -4px, 0);
  }

  &.i:active {
    --bx-s-size: 4px;
    transform: translate3d(-2px, -2px, 0);
    transition: transform 0.05s ease, box-shadow 0.05s ease, border 0.05s ease;
  }
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
