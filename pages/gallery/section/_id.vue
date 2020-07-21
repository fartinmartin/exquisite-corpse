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
    <div v-if="isFetching === 'done'" class="border yellow meta mw-canvas">
      <h1>{{ section.title }}</h1>
      <h1>{{ section.artist }}</h1>
      <div class="menu">
        <span>{{ section.likes }} ❤️</span>
        <span>💾</span>
        <!-- <button class="button" @click="updateThumb">📷</button> -->
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
    },
    async updateThumb() {
      const dataImage = this.$refs.previewCanvas.$refs.canvas.toDataURL();
      const docId = this.$route.params.id;
      const docRef = this.$fireStore.collection("sections").doc(docId);
      return docRef
        .update({ thumb: dataImage })
        .then(() => {
          console.log("it worked!", dataImage);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
#top {
  border-bottom: var(--border-size) solid var(--border-color);
}

h1 {
  font-size: 1rem;
}

.wrap {
  flex-direction: column;
}

.meta {
  margin-top: calc(40px / 3);
  padding: 1rem;
}
</style>
