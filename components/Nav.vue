<template>
  <div class="nav-wrap">
    <Panel v-show="!isIndex" class="nav" no-padding>
      <nav>
        <nuxt-link to="/" class="logo">
          <h1 data-tooltip="home">ecc</h1>
        </nuxt-link>
        <NavMenu />
      </nav>
    </Panel>

    <Panel class="me" no-padding>
      <a
        href="https://fartinmartin.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip="cool guy"
      >
        <Icon svg="logo/m-light" />
      </a>
    </Panel>
  </div>
</template>

<script>
import { openHelp } from "~/mixins/openHelpMixin";

export default {
  name: "Nav",
  mixins: [openHelp],
  computed: {
    isIndex() {
      return this.$route.name === "index";
    }
  }
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
}

.nav {
  left: calc(40px / 3);
  width: auto;
  padding: 0 1rem !important;

  .logo {
    margin-right: 1rem;
    text-decoration: none;
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
