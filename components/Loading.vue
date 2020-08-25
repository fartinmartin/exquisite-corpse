<template>
  <div class="loading-wrap mw-canvas transparent" ref="loadingWrap">
    <Panel
      class="loading body-bg"
      :color="color"
      :style="{ backgroundColor: `var(--lighter-${color}) !important` }"
      no-padding
    >
      <div class="text-wrap">
        <div class="text">{{ text }}</div>
        <div class="subtext">{{ subtext }}</div>
      </div>
    </Panel>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    text: { type: String, required: false, default: "plz hold" },
    subtext: { type: String, required: false },
    color: { type: String, default: "blue" },
    throttle: { type: Number, default: 0 },
  },
  mounted() {
    setTimeout(() => {
      this.$refs.loadingWrap &&
        this.$refs.loadingWrap.classList.remove("transparent");
    }, this.throttle);
  },
};
</script>

<style lang="scss" scoped>
.transparent {
  opacity: 0;
}

.loading-wrap {
  transition: opacity 0.1s ease;

  height: 0;
  position: relative;
  padding-top: 100%;

  .loading {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;

  .text-wrap {
    text-align: center;
    padding: 1rem;
    background: var(--white);
    border: 2px dashed var(--brdr-color);
  }

  .subtext {
    color: #7f7f7f;
  }
}
</style>
