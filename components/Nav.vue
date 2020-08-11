<template>
  <div class="nav-wrap">
    <Panel v-show="this.$route.name !== 'index'" class="nav" no-padding>
      <nav>
        <nuxt-link to="/" class="logo">
          <h1 v-show="this.$route.name === 'index'">exquisite corpse club</h1>
          <h1 v-show="this.$route.name !== 'index'" data-tooltip="home">ecc</h1>
        </nuxt-link>
        <NavMenu style="margin-right: -6px;" />
      </nav>
    </Panel>

    <Panel class="me" no-padding>
      <a
        href="https://fartinmartin.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip="cool guy"
      >
        <div class="icon interactive">
          <img src="~/assets/img/logo/m-light.svg" alt="" />
        </div>
      </a>
    </Panel>
  </div>
</template>

<script>
export default {
  name: "Nav",

  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-wrap {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.nav,
.me {
  position: absolute;
  top: calc(40px / 3);
  z-index: 950;

  display: flex;
  align-items: center;
  justify-content: center;
}

.nav {
  left: calc(40px / 3);
  width: auto;
  padding: 0 1rem !important;

  .logo {
    margin-right: 1rem;
  }

  nav {
    display: flex;
    align-items: center;
  }
}

.me {
  right: calc(40px / 3);
  width: 60px;
  z-index: 955;
}
</style>
