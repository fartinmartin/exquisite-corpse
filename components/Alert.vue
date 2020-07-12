<template>
  <div class="border yellow mw-canvas">
    <span>This VueJS app is a WIP—check back soon!</span>
    <a
      href="https://fartinmartin.github.io/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="~/assets/img/logo/m-light.svg" alt="" />
    </a>
  </div>
</template>

<script>
export default {
  name: "Alert"
};
</script>

<style lang="scss" scoped>
.border {
  padding: 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;

  display: flex;
  justify-content: space-between;
}

img {
  width: 25px;
  display: block;
}
</style>
