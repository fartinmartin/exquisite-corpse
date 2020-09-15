<template>
  <div class="menu">
    <button
      @click.prevent="openHelp"
      :class="{ 'look-at-me': this.$route.name === 'index' }"
      data-tooltip="help"
    >
      <div class="icon interactive">
        <img src="~/assets/img/icons/info.svg" />
      </div>
    </button>
    <nuxt-link
      to="/gallery"
      :class="{
        'look-@-me': this.$route.name === 'index',
        active: this.$route.name !== 'gallery'
      }"
      data-tooltip="gallery"
    >
      <div class="icon interactive">
        <img src="~/assets/img/icons/gallery.svg" />
      </div>
    </nuxt-link>
    <nuxt-link
      to="/draw"
      :class="{
        'look-@-me': this.$route.name === 'index',
        active: this.$route.name !== 'draw'
      }"
      data-tooltip="draw"
    >
      <div class="icon interactive">
        <img src="~/assets/img/toolbar/draw.svg" />
      </div>
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
