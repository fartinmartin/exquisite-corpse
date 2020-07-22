<template>
  <div class="nav-wrap">
    <nav v-show="this.$route.name !== 'index'" class="border yellow">
      <nuxt-link to="/">
        <h1 v-show="this.$route.name === 'index'">exquisite corpse club</h1>
        <h1 v-show="this.$route.name !== 'index'">ecc</h1>
      </nuxt-link>
      <NavMenu />
    </nav>

    <div class="border yellow me">
      <a
        href="https://fartinmartin.github.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="icon">
          <img src="~/assets/img/logo/m-light.svg" alt="" />
        </div>
      </a>
    </div>
  </div>
</template>

<script>
import NavMenu from "~/components/NavMenu.vue";
export default {
  name: "Nav",
  components: { NavMenu },
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-wrap {
  display: contents;
}

nav,
.me {
  position: absolute;
  top: calc(40px / 3);
  left: calc(40px / 3);
  z-index: 950;

  padding: 1rem;
  height: 60px;

  display: flex;

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}

.me {
  left: initial;
  right: calc(40px / 3);
  z-index: 955;
}
</style>
