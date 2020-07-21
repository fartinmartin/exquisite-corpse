<template>
  <div class="wrap">
    <div class="border yellow mw-canvas header">
      <h1>Gallery</h1>
      <!-- <div class="menu">
        <div class="icon">
          <div class="sections">
            <div class="sec top"></div>
            <div class="sec bot"></div>
            <div class="sec mid"></div>
          </div>
        </div>
        <div class="icon">
          <div class="date">📅</div>
          <div class="likes">❤️</div>
        </div>
      </div> -->
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
  data: function() {
    return {
      isFetching: "not yet",
      gallery: [], // this needs to be in the store in order for prev/next nav on individual pages
      lastVisible: null
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
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  flex-direction: column;
}

h1 {
  font-size: 1rem;
}

.header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.icon {
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  box-sizing: content-box;
  border: 2px solid transparent;

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3d(2px, 2px, 0);
  }
}

.menu {
  display: flex;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(3, calc(516px / 3));
  grid-gap: calc(40px / 3);
  margin-top: calc(40px / 3);
}

.sections {
  width: 100%;
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  display: none;
}

.sec {
  width: 100%;
  height: calc(12px / 3);
  background: var(--light-blue);
  &:not(:first-child) {
    margin-top: 2px;
  }
}
</style>
