<template>
  <div class="wrap">
    <Loading v-if="isFetching !== 'success'" subtext="waking up our artists" />
    <Display v-if="isFetching === 'success'" :sections="sections" />
    <div class="border yellow info-panel mt mw-canvas">
      <div class="data-wrap" v-if="isFetching === 'success'">
        <h1>{{ meta.title }}</h1>
        <div class="menu">
          <LikeButton collection="corpses" :docId="this.$route.params.id" />
          <DownloadButton :image="meta.thumb" :title="meta.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "~/components/Loading.vue";
import DownloadButton from "~/components/DownloadButton.vue";
import LikeButton from "~/components/LikeButton.vue";

export default {
  head() {
    return {
      title: `exquisite corpse club • ${this.meta.title}`,
    };
  },
  components: { Loading, DownloadButton, LikeButton },
  data: function () {
    return {
      isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
      meta: { title: "" },
      sections: {},
    };
  },
  mounted() {
    this.getCorpseById(this.$route.params.id);
  },
  methods: {
    async getCorpseById(id) {
      this.isFetching = "fetching";

      const query = this.$fireStore.collection("corpses").doc(id);
      const doc = await query.get();

      this.meta = { docId: doc.id, ...doc.data() };
      await this.getSections(doc.data().sections);

      this.isFetching = "success";
    },

    async getSections(sections) {
      for (const [type, ref] of Object.entries(sections)) {
        this.sections[type] = await this.getSection(ref);
        this.sections[type].paths = Object.values(this.sections[type].drawing);
      }
    },

    async getSection(docRef) {
      const response = await docRef.get();
      return { docId: response.id, ...response.data() };
    },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  align-items: center;

  > * {
    margin-left: 0.25rem;
  }
}
</style>

<style lang="scss" scoped>
.loading-wrap {
  height: 0;
  position: relative;
  overflow: hidden;
  padding-top: 100%;

  > * {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
