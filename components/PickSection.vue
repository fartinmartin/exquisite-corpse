<template>
  <div>
    <Panel class="info-panel">
      <span>pick a section to start drawing!</span>
      <button @click.prevent="openHelp">
        <div class="icon interactive">
          <img src="~/assets/img/icons/info.svg" />
        </div>
      </button>
    </Panel>
    <div class="mw-canvas">
      <Panel
        class="section-template mt"
        @click.native="$emit('picked-type', 'top')"
        color="blue"
        interactive
        no-padding
      >
        <div class="meta-box"><div class="info">top</div></div>
      </Panel>
      <Panel
        class="section-template mt"
        @click.native="$emit('picked-type', 'mid')"
        color="blue"
        interactive
        no-padding
      >
        <div class="meta-box"><div class="info">middle</div></div>
      </Panel>
      <Panel
        class="section-template mt"
        @click.native="$emit('picked-type', 'bot')"
        color="blue"
        interactive
        no-padding
      >
        <div class="meta-box"><div class="info">bottom</div></div>
      </Panel>
    </div>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";

export default {
  name: "PickSection",
  components: { Panel },
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },
  },
};
</script>

<style lang="scss" scoped>
.info-panel {
  height: 60px;
  span {
    margin-right: 0.5rem;
  }
}

.section-template {
  position: relative;
  width: 100%;
  height: 0;

  min-height: initial;
  padding-top: calc(100% / 3) !important;

  &:hover .meta-box {
    display: block;
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
