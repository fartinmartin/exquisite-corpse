<template>
  <div class="wrap">
    <div class="prev-next">
      <div class="prev border yellow">
        <button
          :disabled="
            isFetching !== 'success' || gallery[0].docId === firstItemId
          "
          @click="prevPage"
          data-tooltip="prev"
        >
          <div class="icon interactive">
            <img src="~/assets/img/toolbar/undo.svg" alt="" />
          </div>
        </button>
      </div>
      <div class="next border yellow">
        <button
          :disabled="isFetching !== 'success' || gallery.length < pageSize"
          @click="nextPage"
          data-tooltip="next"
        >
          <div class="icon interactive">
            <img src="~/assets/img/toolbar/redo.svg" alt="" />
          </div>
        </button>
      </div>
    </div>
    <div class="border yellow info-panel mb mw-canvas filters">
      <form>
        <div>
          <input
            type="radio"
            id="corpse"
            name="collection"
            value="corpse"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label for="corpse" data-tooltip="filter by">
            <h1 class="icon interactive">c<span class="hom">orpses</span></h1>
          </label>
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
          <label for="tops" data-tooltip="filter by">
            <h1 class="icon interactive">t<span class="hom">ops</span></h1>
          </label>
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
          <label for="mids" data-tooltip="filter by">
            <h1 class="icon interactive">m<span class="hom">ids</span></h1>
          </label>
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
          <label for="bots" data-tooltip="filter by">
            <h1 class="icon interactive">b<span class="hom">ots</span></h1>
          </label>
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
          <label for="date" data-tooltip="sort by">
            <h1 class="icon interactive">d<span class="hom">ate</span></h1>
          </label>
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
          <label for="likes" data-tooltip="sort by">
            <h1 class="icon interactive">l<span class="hom">ikes</span></h1>
          </label>
        </div>
      </form>
    </div>
    <Loading v-if="isFetching !== 'success'" subtext="curating masterpieces" />
    <div
      v-if="isFetching === 'success'"
      class="gallery mw-canvas"
      :class="{ section: collection === 'sections' }"
    >
      <nuxt-link
        v-for="drawing in gallery"
        :key="drawing.docId"
        :to="`/${collection === 'corpses' ? 'gallery' : 'gallery/section'}/${
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

// 🚨TODO: break into smaller components

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
      isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
      gallery: [{ docId: "temp" }],
      firstItemId: "",
      lastVisible: null,
      firstVisible: null,
      collection: "corpses", // "corpses", "sections"
      type: "corpse", // "corpse", "top", "mid", and "bot"
      field: "date", // "date", "likes"
      pageSize: 9, // 9, 18
    };
  },
  mounted() {
    this.fetchFirst();
  },
  methods: {
    // https://stackoverflow.com/questions/62639778/paginating-firestore-data-when-using-vuex-and-appending-new-data-to-the-state
    async fetchFirst() {
      this.isFetching = "fetching";
      this.gallery = [{ docId: "temp" }];

      let query = this.$fireStore.collection(this.collection);
      if (this.collection === "sections")
        query = query.where("type", "==", this.type);
      query = query.orderBy(this.field, "desc").limit(this.pageSize);

      const firstResponse = await query.get();
      this.lastVisible = firstResponse.docs[firstResponse.docs.length - 1];
      firstResponse.forEach((doc) => {
        let mydoc = { docId: doc.id, thumb: doc.data().thumb };
        this.gallery.push(mydoc);
      });

      this.firstItemId = firstResponse.docs[0].id;

      this.gallery.shift();
      this.isFetching = "success";
    },

    async nextPage() {
      this.isFetching = "fetching";
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
        let mydoc = { docId: doc.id, thumb: doc.data().thumb };
        this.gallery.push(mydoc);
      });

      this.lastVisible = nextResponse.docs[nextResponse.docs.length - 1];
      this.firstVisible = nextResponse.docs[0];

      this.gallery.shift();
      this.isFetching = "success";
    },

    async prevPage() {
      this.isFetching = "fetching";
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
        let mydoc = { docId: doc.id, thumb: doc.data().thumb };
        this.gallery.push(mydoc);
      });

      this.lastVisible = prevResponse.docs[prevResponse.docs.length - 1];
      this.firstVisible = prevResponse.docs[0];

      this.gallery.shift();
      this.isFetching = "success";
    },

    handleTypeChoice(e) {
      const type = e.target.value;

      if (type === this.type) return;
      this.type = type;

      if (type === "corpse") {
        this.collection = "corpses";
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
  grid-template-columns: repeat(auto-fit, minmax(calc(516px / 3), 1fr));
  grid-template-rows: repeat(auto-fill, minmax(calc(516px / 3), 1fr));
  grid-gap: calc(40px / 3);
  min-height: 542.667px;
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

input:checked + label * {
  font-weight: bold;
  opacity: 1;
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
