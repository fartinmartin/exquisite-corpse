<template>
  <div class="about border yellow">
    <div class="top">
      <h1>exquisite corpse club</h1>
      <!-- <h1>exquisite<br />corpse<br />club</h1> -->
    </div>
    <div class="mid">
      <nuxt-link to="/draw" class="button">wait, the what now?</nuxt-link>
      <nuxt-link to="/draw" class="button">peep the gallery</nuxt-link>
    </div>
    <div class="bot">
      <nuxt-link to="/draw" class="button solid yellow"
        >start drawing!</nuxt-link
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "About"
};
</script>

<style lang="scss" scoped>
.about {
  width: 544px;
  height: 544px;

  display: flex;
  flex-direction: column;

  > div {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    padding: 1rem;
  }
}

.mid {
  position: relative;

  &::before,
  &::after {
    position: absolute;
    left: 0;
    /* display: block; */
    content: "";
    width: 100%;
    height: calc(40px / 6);
    background: #ffffff
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
      repeat;
  }

  &::before {
    top: 0;
    transform: translateY(-50%);
  }
  &::after {
    bottom: 0;
    transform: translateY(50%);
  }
}

.button:not(:first-child) {
  margin-top: calc(40px / 3);
}
</style>
