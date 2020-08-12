<template>
  <div class="wrap">
    <Loading
      v-if="isFetching === 'error'"
      text="oh dear"
      subtext="we could not find this section!"
      color="red"
    />

    <Loading
      subtext="preparing our canvas"
      v-else-if="isFetching !== 'success'"
    />

    <Canvas
      :id="section.docId"
      mode="display"
      :section="section"
      ref="previewCanvas"
      v-else-if="isFetching === 'success'"
    />

    <Panel class="mt meta" :is-loading="isFetching">
      <div>
        <h1>
          {{ section.title }} <span><br class="br" />by</span>
          {{ section.artist }}
        </h1>
      </div>
      <MetaMenu collection="sections" :doc="section" />
    </Panel>

    <Panel class="mt mb related" :is-loading="isFetching">
      <form>
        <div>
          <input
            type="radio"
            id="featuredIn"
            name="toggle"
            value="featuredIn"
            v-model="related.toggle"
          />
          <label for="featuredIn">
            <h1 class="icon interactive">
              feat<span class="hom">ured in...</span>
            </h1>
          </label>
        </div>
        <div>
          <input
            type="radio"
            id="moreBy"
            name="toggle"
            value="moreBy"
            v-model="related.toggle"
          />
          <label for="moreBy">
            <h1 class="icon interactive">
              more <span class="hom">&nbsp;by this artist... </span>
            </h1>
          </label>
        </div>
      </form>
    </Panel>

    <Loading
      v-if="isFetching === 'error'"
      text="srsy, sry"
      color="red"
      style="padding-top: 31.6176471% !important;"
    />

    <Loading
      subtext="checkin out the studio"
      v-else-if="isFetching !== 'success' && related.toggle === 'featuredIn'"
      style="padding-top: 31.6176471% !important;"
    />

    <div
      v-else-if="isFetching === 'success' && related.toggle === 'featuredIn'"
      class="gallery mw-canvas"
      :class="{ more: related.toggle === 'moreBy' }"
    >
      <nuxt-link
        v-for="drawing in related.featuredIn"
        :key="drawing.docId"
        :to="`/gallery/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>

    <div
      v-if="isFetching === 'success' && related.toggle === 'moreBy'"
      class="gallery more-by"
    >
      <div v-if="!related.moreBy.length" class="none-found">
        <Panel color="blue" style="width: max-content; margin: 0 auto;">
          no drawings found!
        </Panel>
      </div>
      <nuxt-link
        v-for="drawing in related.moreBy"
        :key="drawing.docId"
        :to="`/gallery/section/${drawing.docId}`"
      >
        <Drawing :drawing="drawing" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Section",
  head() {
    return {
      title: `exquisite corpse club • ${this.section.title} by ${this.section.artist}`,
    };
  },
  data: () => ({
    isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
    section: {},
    related: {
      featuredIn: [],
      moreBy: [],
      toggle: "featuredIn",
    },
  }),
  computed: mapState(["isAdmin"]),
  mounted() {
    this.getSectionById(this.$route.params.id);
  },
  methods: {
    async adminLog() {
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.section.paths));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", this.section.docId + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },

    async getSectionById(id) {
      this.isFetching = "fetching";

      try {
        const query = this.$fireStore.collection("sections").doc(id);
        const doc = await query.get();

        this.section = { docId: doc.id, ...doc.data() };
        this.section.paths = Object.values(this.section.drawing);

        await this.getFeaturedIn();
        await this.getMoreBy();

        this.isAdmin && this.adminLog();

        this.isFetching = "success";
      } catch (error) {
        console.error(error);
        this.isFetching = "error";
      }
    },

    async getFeaturedIn() {
      if (!this.section.featuredIn) return;

      this.section.featuredIn.slice(-3).forEach((ref) => {
        ref.get().then((doc) => {
          const mydoc = { docId: doc.id, thumb: doc.data().thumb };
          this.related.featuredIn.push(mydoc);
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

      moreByDocs.forEach((doc) => {
        const mydoc = { docId: doc.id, thumb: doc.data().thumb };
        if (doc.id !== this.$route.params.id) this.related.moreBy.push(mydoc);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.loading-wrap {
  padding-top: calc(calc(100% + 8px) / 3) !important;
}

h1 {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    font-weight: normal;
  }

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    white-space: normal;
  }
}
</style>

<style lang="scss">
.meta,
.related {
  height: 60px;
}

.meta {
  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    height: auto;
  }

  .br {
    @media screen and (min-width: 444px) {
      display: none;
    }
  }
}

.meta > .content {
  justify-content: space-between;

  > *:nth-child(2) {
    margin-right: -6px;
  }
}

.related > .content {
  justify-content: flex-start;
  margin-left: calc(-1rem - 7px);
}

.related {
  margin-top: 120px;

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    margin-top: calc(40px / 3);
  }
}
</style>

<style lang="scss">
// TODO: below sections should be made into components
</style>

<style lang="scss" scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(1, calc(516px / 3));
  grid-gap: calc(40px / 3);

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: calc(calc(100vw - 40px) / 3);
  }
}

.gallery.more-by {
  grid-template-rows: repeat(2, max-content);
  min-height: 172px;
  position: relative;

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    grid-template-rows: calc(calc(100vw - 40px) / 3);
    min-height: initial;
  }
}

.none-found {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}
</style>

<style lang="scss" scoped>
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
