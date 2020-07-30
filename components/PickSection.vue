<template>
  <div>
    <div class="border yellow info-panel">
      <span>pick a section to start drawing!</span>
      <button @click.prevent="openHelp">
        <div class="icon interactive">
          <img src="~/assets/img/icons/info.svg" />
        </div>
      </button>
    </div>
    <div class="mw-canvas">
      <div
        class="section-template border pointer"
        @click="$emit('picked-type', 'top')"
      >
        <div class="meta-box"><div class="info">top</div></div>
      </div>
      <div
        class="section-template border pointer"
        @click="$emit('picked-type', 'mid')"
      >
        <div class="meta-box"><div class="info">middle</div></div>
      </div>
      <div
        class="section-template border pointer"
        @click="$emit('picked-type', 'bot')"
      >
        <div class="meta-box"><div class="info">bottom</div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PickSection",
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },
  },
};
</script>

<style lang="scss" scoped>
.info-panel {
  justify-content: center;
  span {
    margin-right: 0.5rem;
  }
}

.section-template {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: calc(100% / 3);
  margin: calc(40px / 3) 0;

  transition: transform 0.1s ease, box-shadow 0.1s ease, border 0.1s ease;

  &:hover {
    --border-color: var(--light-yellow);
    --box-shadow-color: var(--orange);
    --box-shadow-size: 6px;
    transform: translate3d(-4px, -4px, 0);

    .meta-box {
      display: block;
    }
  }
}

// TODO: abstract meta-box styles
.meta-box {
  display: none;
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // http://www.patternify.com/
  background: transparent
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAFUlEQVQYlWNgoAb4N4HhP2UKhoUVAL3oD0/YmVPIAAAAAElFTkSuQmCC)
    repeat;

  .info {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    background: var(--white);
    height: 60px;
    min-width: 33%;
    border: 2px solid var(--orange);
    padding: 0 1rem;
  }
}
</style>
