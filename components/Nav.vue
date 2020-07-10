<template>
  <nav>
    <nuxt-link to="/">home</nuxt-link>
    <nuxt-link to="/gallery">gallery</nuxt-link>
  </nav>
</template>

<style lang="scss" scoped>
nav {
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
