<template>
  <div class="menu">
    <button
      @click.prevent="openHelp"
      :class="{ 'look-at-me': this.$route.name === 'index' }"
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
    >
      <div class="icon interactive">
        <img src="~/assets/img/toolbar/draw.svg" />
      </div>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  name: "NavMenu",
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    }
  }
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;

  > * {
    margin-left: 1rem;
  }
}
</style>
