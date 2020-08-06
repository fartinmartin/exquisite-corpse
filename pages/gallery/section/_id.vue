<template>
  <div class="wrap">
    <Loading subtext="getting paint ready" v-if="isFetching !== 'success'" />
    <Canvas
      mode="display"
      :section="section"
      ref="previewCanvas"
      v-if="isFetching === 'success'"
    />

    <Panel class="mt meta" :is-loading="isFetching">
      <div>
        <h1>{{ section.title }} <span>by</span> {{ section.artist }}</h1>
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
      subtext="checkin out the studio"
      v-if="isFetching !== 'success' && related.toggle === 'featuredIn'"
      style="padding-top: 31.6176471% !important;"
    />
    <div
      v-if="isFetching === 'success' && related.toggle === 'featuredIn'"
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
        <span class="border">no drawings found!</span>
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
import Panel from "~/components/Panel.vue";
import Canvas from "~/components/Canvas.vue";
import MetaMenu from "~/components/MetaMenu.vue";

export default {
  name: "Section",
  head() {
    return {
      title: `exquisite corpse club • ${this.section.title} by ${this.section.artist}`,
    };
  },
  components: { Panel, Canvas, MetaMenu },
  data: () => ({
    isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
    section: {},
    related: {
      featuredIn: [],
      moreBy: [],
      toggle: "featuredIn",
    },
  }),
  mounted() {
    this.getSectionById(this.$route.params.id);
  },
  methods: {
    async getSectionById(id) {
      this.isFetching = "fetching";

      const query = this.$fireStore.collection("sections").doc(id);
      const doc = await query.get();

      this.section = { docId: doc.id, ...doc.data() };
      this.section.paths = Object.values(this.section.drawing);

      await this.getFeaturedIn();
      await this.getMoreBy();

      this.isFetching = "success";
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
}
</style>

<style lang="scss">
.meta,
.related {
  height: 60px;
}

.meta > .content {
  justify-content: space-between;
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

  @media screen and (max-width: calc(544px + calc(40px / 2))) {
    grid-template-rows: calc(calc(100vw - 40px) / 3);
    min-height: initial;
  }
}

.none-found {
  text-align: center;
  grid-column: 1 / -1;
  margin-top: 60px;

  span {
    padding: 1rem;
    background: var(--white);
    border: 2px solid var(--light-blue);
  }
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
