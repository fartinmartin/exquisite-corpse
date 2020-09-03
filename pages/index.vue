<template>
  <div class="wrap">
    <Panel class="mb index-nav">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <NavMenu style="margin-right: -6px" />
    </Panel>

    <Loading
      v-if="isFetching !== 'success'"
      subtext="digging up a random corpse"
    />
    <Display v-if="isFetching === 'success'" :sections="sections" />

    <Panel class="mt index-title">
      <nuxt-link v-if="isFetching === 'success'" :to="`/gallery/${meta.docId}`">
        {{ meta.title }}
      </nuxt-link>
    </Panel>
  </div>
</template>

<script>
// TODO: make all data fetches from pages asyncData() methods???

export default {
  name: "index",
  data: () => ({
    isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
    meta: null,
    sections: {},
  }),
  mounted() {
    this.getRandomCorpse();
  },
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },

    async getRandomCorpse() {
      this.isFetching = "fetching";
      this.$store.dispatch("setIsLoading", true);

      const corpseRef = this.$fireStore.collection("corpses");
      const randomKey = corpseRef.doc().id;
      const query = corpseRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .limit(1);

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach(async (doc) => {
            this.meta = { docId: doc.id, ...doc.data() };
            return await this.getSections(doc.data().sections);
          });
        } else {
          const secondQuery = corpseRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .limit(1);
          const secondResponse = await secondQuery.get();
          secondResponse.forEach(async (doc) => {
            this.meta = { docId: doc.id, ...doc.data() };
            return await this.getSections(doc.data().sections);
          });
        }
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
        this.$store.dispatch("setIsLoading", false);
      }

      return;
    },

    async getSections(sections) {
      for (const [type, ref] of Object.entries(sections)) {
        this.sections[type] = await this.getSection(ref);
        this.sections[type].paths = Object.values(this.sections[type].drawing);
      }
      this.isFetching = "success";
      this.$store.dispatch("setIsLoading", false);
    },

    async getSection(docRef) {
      const response = await docRef.get();
      return { docId: response.id, ...response.data() };
    },
  },
};
</script>

<style lang="scss">
.index-nav,
.index-title {
  height: 60px;
}

.index-nav > .content {
  justify-content: space-between;
}

.index-title a:hover {
  text-decoration: underline;
  color: var(--blue);
}
</style>
