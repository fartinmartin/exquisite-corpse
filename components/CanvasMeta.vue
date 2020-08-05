<template>
  <div ref="bg">
    <div class="info">
      <nuxt-link v-if="docId" :to="`/gallery/section/${docId}`">
        {{ title }}
      </nuxt-link>
      <span v-if="!docId">{{ title }}</span>
      <span>&nbsp;</span>
      <span>by</span>
      <span>&nbsp;</span>
      <a
        v-if="isInstagram"
        :href="`https://www.instagram.com/${artist.substr(1)}/`"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ artist }}
      </a>
      <span v-else>{{ artist }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CanvasMeta",
  props: {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    docId: String,
  },
  computed: {
    isInstagram() {
      return this.artist.startsWith("@");
    },
  },
  methods: {
    bg() {
      this.$refs.bg.style.backgroundColor = "rgba(255, 255, 255, 0)";
    },
  },
};
</script>

<style lang="scss" scoped>
.drawing-meta {
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
    width: 100%;
    max-width: max-content;
    border: 2px solid var(--orange);
    padding: 0 1rem;
  }
}

a {
  text-decoration: underline;

  &:hover {
    color: var(--blue);
  }
}

.drawing-meta.disabled {
  display: block;
  background-color: var(--white);
  /* background-blend-mode: multiply; */

  .info {
    display: none;
  }

  &:hover .info {
    display: flex;
  }
}
</style>
