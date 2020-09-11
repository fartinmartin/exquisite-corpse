export const getCorpseById = {
  data: () => ({
    corpse: {}
  }),
  methods: {
    async getCorpseById(id) {
      try {
        const query = this.$fireStore.collection("corpses").doc(id);
        const doc = await query.get();
        this.corpse = { docId: doc.id, ...doc.data() };
      } catch (error) {
        console.error(error);
      }
    }
  }
};
