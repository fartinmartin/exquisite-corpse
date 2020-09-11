export const getSectionById = {
  data: () => ({
    section: {}
  }),
  methods: {
    async getSectionById(id) {
      try {
        const query = this.$fireStore.collection("sections").doc(id);
        const doc = await query.get();
        this.section = { docId: doc.id, ...doc.data() };
        this.section.paths = Object.values(this.section.drawing);
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export const getRelated = {
  data: () => ({
    related: { featuredIn: [], moreBy: [] }
  }),
  methods: {
    async getFeaturedIn() {
      if (!this.section.featuredIn) return;
      this.section.featuredIn.slice(-3).forEach(ref => {
        ref.get().then(doc => {
          const corpse = { docId: doc.id, thumb: doc.data().thumb };
          this.related.featuredIn.push(corpse);
        });
      });
    },
    async getMoreBy() {
      const sectionsRef = this.$fireStore.collection("sections");
      const query = sectionsRef
        .where("artist", "==", this.section.artist)
        .orderBy("likes", "desc")
        .limit(6);
      const moreByDocs = await query.get();
      moreByDocs.forEach(doc => {
        const mydoc = { docId: doc.id, thumb: doc.data().thumb };
        if (doc.id !== this.$route.params.id) this.related.moreBy.push(mydoc);
      });
    }
  }
};
