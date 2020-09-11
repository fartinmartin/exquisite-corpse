export const getRandomCorpse = {
  data: () => ({
    corpse: {}
  }),
  methods: {
    async getRandomCorpse() {
      const corpseRef = this.$fireStore.collection("corpses");
      const randomKey = corpseRef.doc().id;
      const query = corpseRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .limit(1);

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach(async doc => {
            this.corpse = { docId: doc.id, ...doc.data() };
          });
        } else {
          const secondQuery = corpseRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .limit(1);
          const secondResponse = await secondQuery.get();
          secondResponse.forEach(async doc => {
            this.corpse = { docId: doc.id, ...doc.data() };
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};
