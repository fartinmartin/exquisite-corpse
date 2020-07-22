<template>
  <div class="wrap">
    <div v-if="isFetching !== 'done'">loading</div>
    <div class="mw-canvas">
      <Canvas
        v-if="isFetching === 'done'"
        id="top"
        mode="display"
        :section="section"
        ref="previewCanvas"
      />
    </div>
    <div
      v-if="isFetching === 'done'"
      class="border yellow info-panel mt mw-canvas"
    >
      <div>
        <h1>{{ section.title }} <span>by</span>{{ section.artist }}</h1>
      </div>
      <div class="menu">
        <span>{{ section.likes }} ❤️</span>
        <DownloadButton :image="section.thumb" :title="section.title" />
      </div>
    </div>
  </div>
</template>

<script>
import Canvas from "~/components/Canvas.vue";

export default {
  name: "Section",
  components: { Canvas },
  data: function() {
    return {
      isFetching: "not yet",
      section: {}
    };
  },
  mounted() {
    this.fetchDocById("sections", this.$route.params.id);
  },
  methods: {
    async fetchDocById(collection, id) {
      this.isFetching = "yes";
      const query = this.$fireStore.collection(collection).doc(id);
      const doc = await query.get();
      this.section = { ...doc.data() };
      this.section.paths = Object.values(doc.data().drawing);

      this.isFetching = "done";
      console.log(this.section);
    }
  }
};
</script>

<style lang="scss" scoped>
#top,
#mid,
#bot {
  border: var(--border-size) solid var(--border-color);
}

h1 span {
  font-weight: normal;
  margin-right: 1ch;
}
</style>
