<template>
  <div class="nav-wrap">
    <nav class="border yellow">
      <nuxt-link to="/">
        <h1 v-show="this.$route.name === 'index'">exquisite corpse club</h1>
        <h1 v-show="this.$route.name !== 'index'">ecc</h1>
      </nuxt-link>
      <button @click="runTutorial">
        <div class="icon">🤔</div>
      </button>
      <nuxt-link
        to="/gallery"
        :class="{ active: this.$route.name !== 'gallery' }"
      >
        <div class="icon">🖼</div>
      </nuxt-link>
      <nuxt-link to="/draw" :class="{ active: this.$route.name !== 'draw' }">
        <div class="icon">
          <img src="~/assets/img/toolbar/draw.svg" />
        </div>
      </nuxt-link>
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

<style lang="scss" scoped>
.nav-wrap {
  display: contents;
}

h1 {
  font-size: 1rem;
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
}

.icon {
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  box-sizing: content-box;
  border: 2px solid transparent;

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3d(2px, 2px, 0);
  }
}
</style>

<script>
export default {
  name: "Nav",
  methods: {
    runTutorial() {
      alert("tutorial");
    }
  }
};
</script>
