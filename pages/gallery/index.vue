<template>
  <div class="wrap">
    <PrevNext
      v-if="!isMobile"
      :isFirstPage="isFirstPage"
      :isLastPage="isLastPage"
      @prev="prevPage"
      @next="nextPage"
    />

    <Panel class="mb filters" :class="{ sticky: isMobile }">
      <form>
        <div class="radio" :class="{ active: type === 'corpses' }">
          <input
            type="radio"
            id="corpse"
            name="collection"
            value="corpses"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label
            class="icon interactive"
            for="corpse"
            data-tooltip="filter by full corpses"
          >
            <img src="~/assets/img/icons/corpses.svg" />
          </label>
        </div>
        <div class="radio" :class="{ active: type === 'top' }">
          <input
            type="radio"
            id="tops"
            name="collection"
            value="top"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label
            class="icon interactive"
            for="tops"
            data-tooltip="filter by tops"
          >
            <img src="~/assets/img/icons/tops.svg" />
          </label>
        </div>
        <div class="radio" :class="{ active: type === 'mid' }">
          <input
            type="radio"
            id="mids"
            name="collection"
            value="mid"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label
            class="icon interactive"
            for="mids"
            data-tooltip="filter by middles"
          >
            <img src="~/assets/img/icons/mids.svg" />
          </label>
        </div>
        <div class="radio" :class="{ active: type === 'bot' }">
          <input
            type="radio"
            id="bots"
            name="collection"
            value="bot"
            v-model="type"
            @click="handleTypeChoice"
          />
          <label
            class="icon interactive"
            for="bots"
            data-tooltip="filter by bottoms"
          >
            <img src="~/assets/img/icons/bots.svg" />
          </label>
        </div>
      </form>
      <form>
        <div class="radio" :class="{ active: field === 'date' }">
          <input
            type="radio"
            id="date"
            name="field"
            value="date"
            v-model="field"
            @click="handleSortBy"
          />
          <label
            class="icon interactive"
            for="date"
            data-tooltip="sort by date"
          >
            <Date />
          </label>
        </div>
        <div class="radio" :class="{ active: field === 'likes' }">
          <input
            type="radio"
            id="likes"
            name="field"
            value="likes"
            v-model="field"
            @click="handleSortBy"
          />
          <label
            class="icon interactive"
            for="likes"
            data-tooltip="sort by likes"
          >
            <img src="~/assets/img/icons/heart_.svg" alt="" />
          </label>
        </div>
      </form>
    </Panel>

    <Loading
      v-if="isFetching === 'error'"
      color="red"
      text="oh no"
      subtext="we have misplaced our corpses!"
    />

    <Loading
      v-else-if="isFetching !== 'success'"
      subtext="curating masterpieces"
      :throttle="500"
    />

    <div
      v-else-if="isFetching === 'success'"
      class="gallery mw-canvas"
      :class="{ section: collection === 'sections' }"
      ref="gallery"
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
    <Observer v-if="isMobile" @intersect="nextPage" />
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";
import Loading from "~/components/Loading.vue";
import Drawing from "~/components/Drawing.vue";
import PrevNext from "~/components/PrevNext.vue";
import Date from "~/components/Date.vue";
import Observer from "~/components/Observer.vue";

import { mapGetters } from "vuex";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export default {
  name: "gallery",
  components: { Panel, Loading, Drawing, PrevNext, Date, Observer },
  head() {
    return {
      title: "exquisite corpse club • gallery",
    };
  },
  data: () => ({
    isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
    gallery: [],
    firstItemId: "",
    lastVisible: null,
    firstVisible: null,
    collection: "corpses", // "corpses", "sections"
    type: "corpses", // "corpses", "top", "mid", and "bot"
    field: "date", // "date", "likes"
    pageSize: 9, // 9, 18
    emptyNextResults: null,
    emptyPrevResults: null,
    scrollY: 0,
  }),
  computed: {
    isFirstPage() {
      if (this.gallery.length > 0)
        return (
          this.emptyPrevResults || this.gallery[0].docId === this.firstItemId
        );
    },
    isLastPage() {
      return this.emptyNextResults || this.gallery.length < this.pageSize;
    },
    ...mapGetters(["isMobile"]),
  },
  mounted() {
    this.fetchFirst();

    const tino = document.getElementById("__tino");
    enableBodyScroll(tino);
  },
  beforeDestroy() {
    const tino = document.getElementById("__tino");
    disableBodyScroll(tino, {
      allowTouchMove: (el) => el.tagName === "CANVAS",
    });
  },
  methods: {
    // https://stackoverflow.com/questions/62639778/paginating-firestore-data-when-using-vuex-and-appending-new-data-to-the-state
    async fetchFirst() {
      try {
        this.isFetching = "fetching";
        this.gallery = [];
        this.emptyPrevResults = false;
        this.emptyNextResults = false;

        let query = this.$fireStore.collection(this.collection);
        if (this.collection === "sections")
          query = query.where("type", "==", this.type);
        query = query.orderBy(this.field, "desc").limit(this.pageSize);

        const firstResponse = await query.get();
        this.firstVisible = firstResponse.docs[0];
        this.lastVisible = firstResponse.docs[firstResponse.docs.length - 1];

        firstResponse.forEach((doc) => {
          let mydoc = { docId: doc.id, thumb: doc.data().thumb };
          this.gallery.push(mydoc);
        });

        this.firstItemId = firstResponse.docs[0].id; // how necessary is this 🤔
        this.isFetching = "success";
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
      }
    },

    async nextPage() {
      try {
        this.isFetching = "fetching";
        // if (this.isMobile)
        //   this.$refs.gallery.style.minHeight = this.$refs.gallery.offsetHeight;

        let query = this.$fireStore.collection(this.collection);
        if (this.collection === "sections")
          query = query.where("type", "==", this.type);
        query = query
          .orderBy(this.field, "desc")
          .startAfter(this.lastVisible)
          .limit(this.pageSize);

        const nextResponse = await query.get();
        if (!nextResponse.empty) {
          if (!this.isMobile) this.gallery = [];
          this.emptyPrevResults = false;

          this.lastVisible = nextResponse.docs[nextResponse.docs.length - 1];
          this.firstVisible = nextResponse.docs[0];

          nextResponse.forEach((doc) => {
            let mydoc = { docId: doc.id, thumb: doc.data().thumb };
            this.gallery.push(mydoc);
          });
        } else {
          this.emptyNextResults = true;
        }

        this.isFetching = "success";
        // if (this.isMobile) this.$refs.gallery.style.minHeight = "initial";
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
      }
    },

    async prevPage() {
      try {
        this.isFetching = "fetching";

        let query = this.$fireStore.collection(this.collection);
        if (this.collection === "sections")
          query = query.where("type", "==", this.type);
        query = query
          .orderBy(this.field, "desc")
          .endBefore(this.firstVisible)
          .limitToLast(this.pageSize);

        const prevResponse = await query.get();
        if (!prevResponse.empty) {
          this.gallery = [];
          this.emptyNextResults = false;

          this.lastVisible = prevResponse.docs[prevResponse.docs.length - 1];
          this.firstVisible = prevResponse.docs[0];

          prevResponse.forEach((doc) => {
            let mydoc = { docId: doc.id, thumb: doc.data().thumb };
            this.gallery.push(mydoc);
          });
        } else {
          this.emptyPrevResults = true;
        }

        this.isFetching = "success";
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
      }
    },

    handleTypeChoice(e) {
      const type = e.target.value;

      if (type === this.type) return;
      this.type = type;

      if (type === "corpses") {
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

<style lang="scss">
.filters {
  height: 60px;

  &.sticky {
    position: sticky;
    top: calc(40px / 3);
  }

  .content {
    justify-content: space-between;

    > *:nth-child(1) {
      margin-left: -6px;
    }

    > *:nth-child(2) {
      margin-right: -6px;
    }
  }
}
</style>

<style lang="scss">
// TODO: below sections should be components
</style>

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
form {
  display: flex;

  input {
    display: none;
  }

  > *:not(:last-child) {
    margin-right: 1rem;
  }
}

.radio:not(.active) {
  filter: grayscale(1);
  opacity: 0.6;
}
</style>
