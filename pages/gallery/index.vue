<template>
  <div class="wrap">
    <div class="prev-next">
      <div class="prev border yellow">
        <button
          :disabled="isFetching !== 'done' || gallery[0].docId === firstItemId"
          @click="prevPage"
          data-tooltip="prev"
        >
          <div class="icon interactive">👈</div>
        </button>
      </div>
      <div class="next border yellow">
        <button
          :disabled="isFetching !== 'done' || gallery.length < pageSize"
          @click="nextPage"
          data-tooltip="next"
        >
          <div class="icon interactive">👉</div>
        </button>
      </div>
    </div>
    <div class="border yellow info-panel mb mw-canvas filters">
      <form>
        <div>
          <input
            type="radio"
            id="corpses"
            name="collection"
            value="corpses"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label for="corpses"><h1 class="icon interactive">corpses</h1></label>
        </div>
        <div>
          <input
            type="radio"
            id="tops"
            name="collection"
            value="top"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label for="tops"><h1 class="icon interactive">tops</h1></label>
        </div>
        <div>
          <input
            type="radio"
            id="mids"
            name="collection"
            value="mid"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label for="mids"><h1 class="icon interactive">mids</h1></label>
        </div>
        <div>
          <input
            type="radio"
            id="bots"
            name="collection"
            value="bot"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label for="bots"><h1 class="icon interactive">bots</h1></label>
        </div>
      </form>
      <form>
        <div>
          <input
            type="radio"
            id="date"
            name="field"
            value="date"
            v-model="field"
            @click="handleSortBy"
          />
          <label for="date"><h1 class="icon interactive">date</h1></label>
        </div>
        <div>
          <input
            type="radio"
            id="likes"
            name="field"
            value="likes"
            v-model="field"
            @click="handleSortBy"
          />
          <label for="likes"><h1 class="icon interactive">likes</h1></label>
        </div>
      </form>
    </div>
    <Loading
      v-if="isFetching !== 'done'"
      subtext="curating masterpieces"
      style="height: 542.667px;"
    />
    <div
      v-if="isFetching === 'done'"
      class="gallery"
      :class="{ section: collection === 'sections' }"
    >
      <nuxt-link
        v-for="drawing in gallery"
        :key="drawing.docId"
        :to="`/${collection === 'completed' ? 'gallery' : 'gallery/section'}/${
          drawing.docId
        }`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Loading from "~/components/Loading.vue";
import Drawing from "~/components/Drawing.vue";
export default {
  name: "gallery",
  components: { Loading, Drawing },
  head() {
    return {
      title: "exquisite corpse club • gallery",
    };
  },
  data: function () {
    return {
      isFetching: "not yet",
      gallery: [{ docId: "temp" }],
      firstItemId: "",
      lastVisible: null,
      firstVisible: null,
      collection: "completed", // switches with "sections"
      type: "corpses", // switches with "top", "mid", and "bot"
      field: "date", // switches with "likes"
      pageSize: 9, // switches with 18?
    };
  },
  mounted() {
    this.fetchFirst();
  },
  methods: {
    // https://stackoverflow.com/questions/62639778/paginating-firestore-data-when-using-vuex-and-appending-new-data-to-the-state
    async fetchFirst() {
      this.isFetching = "yes";
      this.gallery = [{ docId: "temp" }];

      let query = this.$fireStore.collection(this.collection);
      if (this.collection === "sections")
        query = query.where("type", "==", this.type);
      query = query.orderBy(this.field, "desc").limit(this.pageSize);

      const firstResponse = await query.get();
      this.lastVisible = firstResponse.docs[firstResponse.docs.length - 1];
      firstResponse.forEach((doc) => {
        let mydoc = {
          docId: doc.id,
          thumb: doc.data().thumb,
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

      let query = this.$fireStore.collection(this.collection);
      if (this.collection === "sections")
        query = query.where("type", "==", this.type);
      query = query
        .orderBy(this.field, "desc")
        .startAfter(this.lastVisible)
        .limit(this.pageSize);

      const nextResponse = await query.get();
      nextResponse.forEach((doc) => {
        let mydoc = {
          docId: doc.id,
          thumb: doc.data().thumb,
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

      let query = this.$fireStore.collection(this.collection);
      if (this.collection === "sections")
        query = query.where("type", "==", this.type);
      query = query
        .orderBy(this.field, "desc")
        .endBefore(this.firstVisible)
        .limitToLast(this.pageSize);

      const prevResponse = await query.get();
      prevResponse.forEach((doc) => {
        let mydoc = {
          docId: doc.id,
          thumb: doc.data().thumb,
        };
        this.gallery.push(mydoc);
      });

      this.lastVisible = prevResponse.docs[prevResponse.docs.length - 1];
      this.firstVisible = prevResponse.docs[0];

      this.gallery.shift();
      this.isFetching = "done";
    },

    handleTypeChoice(e) {
      const type = e.target.value;

      if (type === this.type) return;
      this.type = type;

      if (type === "corpses") {
        this.collection = "completed";
        this.pageSize = 9;
      } else {
        this.collection = "sections";
        this.pageSize = 18;
      }

      this.fetchFirst();
    },

    handleSortBy(e) {
      const field = e.target.value;
      if (field === this.field) return;

      this.field = field;
      this.fetchFirst();
    },
  },
};
</script>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(3, calc(516px / 3));
  grid-gap: calc(40px / 3);
}

.gallery.section {
  grid-template-rows: repeat(6, max-content);
  min-height: 542.667px;
}
</style>

<style lang="scss" scoped>
.filters {
  padding: 1rem calc(1rem - 7px);
}

form {
  display: flex;

  .icon {
    width: auto;
    padding: 0 5px;
  }

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
