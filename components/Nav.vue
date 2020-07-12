<template>
  <nav class="border yellow">
    <nuxt-link to="/"><span>ecc</span></nuxt-link>
    <button @click="runTutorial">🤔</button>
    <nuxt-link to="/">🖼</nuxt-link>
    <a
      href="https://fartinmartin.github.io/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="~/assets/img/logo/m-light.svg" alt="" />
    </a>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  position: absolute;
  top: calc(40px / 3);
  left: calc(40px / 3);
  padding: 1rem;
  height: 60px;
  display: flex;
  > *:not(:last-child) {
    margin-right: 1rem;
  }
}
</style>

<script>
export default {
  name: "Nav"
};
</script>
