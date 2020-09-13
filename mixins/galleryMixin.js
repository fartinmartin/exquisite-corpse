export const galleryMethods = {
  data: () => ({
    gallery: [],
    lastVisible: null,
    firstVisible: null,
    emptyPrevResults: null,
    emptyNextResults: null,
    firstDocId: ""
  }),
  computed: {
    isFirstPage() {
      return (
        this.emptyPrevResults || this.gallery[0]?.docId === this.firstDocId
      );
    },
    isLastPage() {
      return this.emptyNextResults || this.gallery.length < this.pageSize;
    }
  },
  methods: {
    async getCollection() {
      try {
        this.gallery = [];
        this.emptyPrevResults = false;
        this.emptyNextResults = false;

        let query = this.myQuery();
        query = query.orderBy(this.field, "desc").limit(this.pageSize);

        const response = await query.get();
        this.setFirstAndLast(response);
        response.forEach(doc => this.pushDocToGallery(doc));

        this.firstDocId = response.docs[0].id;
      } catch (error) {
        console.error(error);
      }
    },

    async appendNextPage() {
      // don't run if fetchFirst() hasn't run yet:
      if (!this.lastVisible) return;

      try {
        let query = this.myQuery();
        query = query
          .orderBy(this.field, "desc")
          .startAfter(this.lastVisible)
          .limit(this.pageSize);

        const response = await query.get();
        if (!response.empty) {
          this.emptyNextResults = false;
          this.setFirstAndLast(response);
          response.forEach(doc => this.pushDocToGallery(doc));
        } else if (response.empty) {
          this.emptyNextResults = true;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async getNextPage() {
      try {
        let query = this.myQuery();
        query = query
          .orderBy(this.field, "desc")
          .startAfter(this.lastVisible)
          .limit(this.pageSize);

        const response = await query.get();
        if (!response.empty) {
          this.gallery = [];
          this.emptyNextResults = false;
          this.setFirstAndLast(response);
          response.forEach(doc => this.pushDocToGallery(doc));
        } else {
          this.emptyNextResults = true;
        }
      } catch (error) {
        console.error(error);
      }
    },

    async getPrevPage() {
      try {
        let query = this.myQuery();
        query = query
          .orderBy(this.field, "desc")
          .endBefore(this.firstVisible)
          .limitToLast(this.pageSize);

        const response = await query.get();
        if (!response.empty) {
          this.gallery = [];
          this.emptyPrevResults = false;
          this.setFirstAndLast(response);
          response.forEach(doc => this.pushDocToGallery(doc));
        } else {
          this.emptyPrevResults = true;
        }
      } catch (error) {
        console.error(error);
      }
    },

    myQuery() {
      let query = this.$fireStore.collection(this.collection);
      if (this.collection === "sections")
        query = query.where("type", "==", this.type);
      return query;
    },

    pushDocToGallery(doc) {
      let mydoc = { docId: doc.id, thumb: doc.data().thumb };
      this.gallery.push(mydoc);
    },

    setFirstAndLast(response) {
      this.firstVisible = response.docs[0];
      this.lastVisible = response.docs[response.docs.length - 1];
    }
  }
};
