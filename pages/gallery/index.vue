<template>
  <div class="wrap">
    <PrevNext />
    <div class="border yellow info-panel mb mw-canvas">
      <h1>Gallery</h1>
    </div>
    <div class="gallery">
      <nuxt-link
        v-for="drawing in gallery"
        :key="drawing.docId"
        :to="`/gallery/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Drawing from "~/components/Drawing.vue";
export default {
  name: "gallery",
  head() {
    return {
      title: "exquisite corpse club • gallery"
    };
  },
  data: function() {
    return {
      isFetching: "not yet",
      gallery: [], // this needs to be in the store in order for prev/next nav on individual pages
      lastVisible: null,
      pageSize: 9,
      query: this.$fireStore
        .collection("completed")
        .orderBy("date", "desc")
        .limit(9)
    };
  },
  mounted() {
    this.fetchCompleted();
  },
  methods: {
    //https://stackoverflow.com/questions/62639778/paginating-firestore-data-when-using-vuex-and-appending-new-data-to-the-state
    async fetchCompleted() {
      this.isFetching = "yes";
      const completedRef = this.$fireStore.collection("completed");

      const query = completedRef.orderBy("date", "desc").limit(9);
      const firstResponse = await query.get();
      this.lastVisible = firstResponse.docs[firstResponse.docs.length - 1];
      firstResponse.forEach(doc => {
        let mydoc = {
          docId: doc.id,
          ...doc.data()
        };
        this.gallery.push(mydoc);
      });
      this.isFetching = "done";
    },
    async fetchMore() {
      this.isFetching = "yes";
      const completedRef = this.$fireStore.collection("completed");
      const nextQuery = completedRef
        .orderBy("date")
        .startAfter(this.lastVisible)
        .limit(9);
      const nextResponse = await query.get();
      this.lastVisible = nextResponse.docs[nextResponse.docs.length - 1];
      nextResponse.forEach(doc => {
        let mydoc = {
          docId: doc.id,
          ...doc.data()
        };
        this.gallery.push(mydoc);
      });
      this.isFetching = "done";
    },
    nextPage(lastVisible) {}
  }
};
</script>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(3, calc(516px / 3));
  grid-gap: calc(40px / 3);
}
</style>
