<template>
  <div class="wrap">
    <div class="prev-next">
      <div class="prev border yellow">
        <button :disabled="gallery[0].docId === firstItemId" @click="prevPage">
          <div class="icon interactive">👈</div>
        </button>
      </div>
      <div class="next border yellow">
        <button :disabled="gallery.length < 9" @click="nextPage">
          <div class="icon interactive">👉</div>
        </button>
      </div>
    </div>
    <div class="border yellow info-panel mb mw-canvas">
      <!-- <h1>gallery</h1> -->
      <form>
        <div>
          <input
            type="radio"
            id="corpses"
            name="drone"
            value="corpses"
            checked
          />
          <label for="corpses"><h1>corpses</h1></label>
        </div>
        <div>
          <input type="radio" id="tops" name="drone" value="tops" />
          <label for="tops"><h1>tops</h1></label>
        </div>
        <div>
          <input type="radio" id="mids" name="drone" value="mids" />
          <label for="mids"><h1>mids</h1></label>
        </div>
        <div>
          <input type="radio" id="bots" name="drone" value="bots" />
          <label for="bots"><h1>bots</h1></label>
        </div>
      </form>
      <form>
        <div>
          <input type="radio" id="date" name="drone" value="date" checked />
          <label for="date"><h1>date</h1></label>
        </div>
        <div>
          <input type="radio" id="likes" name="drone" value="likes" />
          <label for="likes"><h1>likes</h1></label>
        </div>
      </form>
    </div>
    <div v-if="isFetching !== 'done'" class="loading">we is loading</div>
    <div v-if="isFetching === 'done'" class="gallery">
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
      gallery: [{ docId: "temp" }],
      firstItemId: "",
      lastVisible: null,
      firstVisible: null,
      completedRef: this.$fireStore.collection("completed")
      // collection: "completed" // switches with "sections"
      // type: "full" // switches with "top", "mid", and "bot"
      // field: "date" // switches with "likes"
      // pageSize: 9 // switches with 18?
      // 🤔 should these be separate components or could this state dynamically influence the pagination?
    };
  },
  mounted() {
    this.fetchCompleted();
  },
  methods: {
    //https://stackoverflow.com/questions/62639778/paginating-firestore-data-when-using-vuex-and-appending-new-data-to-the-state
    async fetchCompleted() {
      this.isFetching = "yes";

      const query = this.completedRef.orderBy("date", "desc").limit(9);
      const firstResponse = await query.get();
      this.lastVisible = firstResponse.docs[firstResponse.docs.length - 1];
      firstResponse.forEach(doc => {
        let mydoc = {
          docId: doc.id,
          ...doc.data()
        };
        this.gallery.push(mydoc);
      });

      this.firstItemId = firstResponse.docs[0].id;

      this.gallery.shift();
      this.isFetching = "done";
    },

    async nextPage() {
      this.isFetching = "yes";
      this.gallery = [{ docId: "temp" }];

      const query = this.completedRef
        .orderBy("date", "desc")
        .startAfter(this.lastVisible)
        .limit(9);
      const nextResponse = await query.get();
      nextResponse.forEach(doc => {
        let mydoc = {
          docId: doc.id,
          ...doc.data()
        };
        this.gallery.push(mydoc);
      });
      this.lastVisible = nextResponse.docs[nextResponse.docs.length - 1];
      this.firstVisible = nextResponse.docs[0];

      this.gallery.shift();
      this.isFetching = "done";
    },

    async prevPage() {
      this.isFetching = "yes";
      this.gallery = [{ docId: "temp" }];

      const query = this.completedRef
        .orderBy("date", "desc")
        .endBefore(this.firstVisible)
        .limitToLast(9);
      const prevResponse = await query.get();
      prevResponse.forEach(doc => {
        let mydoc = {
          docId: doc.id,
          ...doc.data()
        };
        this.gallery.push(mydoc);
      });
      this.lastVisible = prevResponse.docs[prevResponse.docs.length - 1];
      this.firstVisible = prevResponse.docs[0];

      this.gallery.shift();
      this.isFetching = "done";
    }
  }
};
</script>

<style lang="scss" scoped>
.loading {
  height: 542.667px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(3, calc(516px / 3));
  grid-gap: calc(40px / 3);
}
</style>

<style lang="scss" scoped>
form {
  display: flex;

  input {
    display: none;
  }

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}

input:not(:checked) + label h1 {
  font-weight: normal;
  opacity: 0.5;
}
</style>

<style lang="scss" scoped>
.prev,
.next {
  width: 60px;
  height: 60px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 100;
  top: 50%;
  transform: translateY(-50%);
}

.prev {
  left: calc(40px / 3);
}

.next {
  right: calc(40px / 3);
}
</style>
