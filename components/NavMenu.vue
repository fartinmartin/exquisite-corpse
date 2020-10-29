<template>
  <div class="menu">
    <button @click.prevent="openHelp" data-tooltip="help" aria-label="help">
      <Icon svg="icons/info" :shimmer="this.$route.name === 'index'" />
    </button>
    <nuxt-link to="/gallery" data-tooltip="gallery">
      <Icon svg="icons/gallery" />
    </nuxt-link>
    <nuxt-link to="/draw" data-tooltip="draw">
      <Icon svg="toolbar/draw" />
    </nuxt-link>
  </div>
</template>

<script>
import { openHelp } from "~/mixins/openHelpMixin";

export default {
  name: "NavMenu",
  mixins: [openHelp]
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  margin-right: -6px; // optically counter's icon padding

  > * {
    margin-left: 1rem;
  }
}
</style>
