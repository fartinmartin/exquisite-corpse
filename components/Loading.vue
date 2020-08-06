<template>
  <div class="loading-wrap mw-canvas">
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
import Panel from "~/components/Panel.vue";

export default {
  name: "Loading",
  components: { Panel },
  props: {
    text: { type: String, required: false, default: "plz hold" },
    subtext: { type: String, required: false },
    color: { type: String, default: "blue" },
  },
};
</script>

<style lang="scss" scoped>
.loading-wrap {
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
