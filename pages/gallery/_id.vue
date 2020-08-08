<template>
  <div class="wrap">
    <Loading
      v-if="isFetching === 'error'"
      text="oh dear"
      subtext="we could not find this corpse!"
      color="red"
    />

    <Loading
      v-else-if="isFetching !== 'success'"
      subtext="waking up our artists"
    />

    <Display v-else-if="isFetching === 'success'" :sections="sections" />

    <Panel class="mt corpse-meta" :is-loading="isFetching">
      <h1>{{ meta.title }}</h1>
      <MetaMenu collection="corpses" :doc="meta" />
    </Panel>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";
import Loading from "~/components/Loading.vue";
import MetaMenu from "~/components/MetaMenu.vue";

export default {
  name: "Corpse",
  head() {
    return {
      title: `exquisite corpse club • ${this.meta.title}`,
    };
  },
  components: { Panel, Loading, MetaMenu },
  data: () => ({
    isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
    meta: { title: "" },
    sections: {},
  }),
  mounted() {
    this.getCorpseById(this.$route.params.id);
  },
  methods: {
    async getCorpseById(id) {
      this.isFetching = "fetching";

      try {
        const query = this.$fireStore.collection("corpses").doc(id);
        const doc = await query.get();

        this.meta = { docId: doc.id, ...doc.data() };
        await this.getSections(doc.data().sections);

        this.isFetching = "success";
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
      }
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

<style lang="scss">
.corpse-meta {
  height: 60px;

  > .content {
    justify-content: space-between;
  }
}
</style>
