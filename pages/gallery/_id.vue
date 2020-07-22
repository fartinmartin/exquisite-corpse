<template>
  <div class="wrap">
    <!-- <PrevNext /> -->
    <div v-if="isFetching !== 'done'">loading</div>
    <Display v-if="isFetching === 'done'" :sections="sections" />
    <div
      v-if="isFetching === 'done'"
      class="border yellow info-panel mt mw-canvas"
    >
      <h1>{{ meta.title }}</h1>
      <div class="menu">
        <LikeButton collection="completed" :docId="this.$route.params.id" />
        <DownloadButton :image="meta.thumb" :title="meta.title" />
      </div>
    </div>
  </div>
</template>

<script>
import PrevNext from "~/components/PrevNext.vue";
import DownloadButton from "~/components/DownloadButton.vue";
import LikeButton from "~/components/LikeButton.vue";

export default {
  head() {
    return {
      title: `exquisite corpse club • ${this.meta.title}`
    };
  },
  data: function() {
    return {
      isFetching: "not yet",
      meta: { title: "" },
      sections: {}
    };
  },
  mounted() {
    this.fetchDocById("completed", this.$route.params.id);
  },
  methods: {
    async fetchDocById(collection, id) {
      this.isFetching = "yes";
      const query = this.$fireStore.collection(collection).doc(id);
      const doc = await query.get();

      let completedMeta = {
        docId: doc.id,
        likes: doc.data().likes,
        title: doc.data().title,
        date: doc.data().date,
        thumb: doc.data().thumb
      };

      this.meta = completedMeta;

      let vm = this;

      async function handleSections() {
        await vm.getSections(doc.data().sections);
      }

      handleSections();
    },

    async getSections(sections) {
      const top = await this.getSection(sections.top);
      const mid = await this.getSection(sections.mid);
      const bot = await this.getSection(sections.bot);
      this.sections.top = top;
      this.sections.mid = mid;
      this.sections.bot = bot;
      this.sections.top.paths = Object.values(top.drawing);
      this.sections.mid.paths = Object.values(mid.drawing);
      this.sections.bot.paths = Object.values(bot.drawing);
      this.isFetching = "done";
    },

    async getSection(docRef) {
      const response = await docRef.get();
      return { docId: response.id, ...response.data() };
    }
  }
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  align-items: center;

  > * {
    margin-left: 1rem;
  }
}
</style>
