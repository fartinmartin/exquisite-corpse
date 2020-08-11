<template>
  <div class="drawing-meta" :class="{ disabled: !docId }" ref="bg">
    <div class="info" :class="{ disabled: !docId }">
      <nuxt-link v-if="docId" :to="`/gallery/section/${docId}`">{{
        title
      }}</nuxt-link>
      <span v-if="!docId">{{ title }}</span>
      <span>by</span>
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
    text-align: center;
    background: var(--white);
    padding: 1rem;
    min-width: 33%;
    border: 2px solid var(--orange);
  }
}

.canvas-wrap:hover .drawing-meta {
  display: grid;
  place-items: center;
}

a {
  text-decoration: underline;

  &:hover {
    color: var(--blue);
  }
}

.drawing-meta.disabled {
  display: grid;
  place-items: center;

  .info {
    display: none;
  }

  &:hover .info {
    display: block;
  }
}
</style>
