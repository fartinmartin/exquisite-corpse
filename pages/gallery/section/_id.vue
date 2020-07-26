<template>
  <div class="wrap">
    <Loading
      v-if="isFetching !== 'done'"
      subtext="getting paint ready"
      style="height: 184px;"
    />
    <div class="mw-canvas" v-if="isFetching === 'done'">
      <Canvas id="top" mode="display" :section="section" ref="previewCanvas" />
    </div>
    <div class="border yellow info-panel mt mw-canvas">
      <div class="data-wrap" v-if="isFetching === 'done'">
        <div>
          <h1>{{ section.title }} <span>by</span>{{ section.artist }}</h1>
        </div>
        <div class="menu">
          <LikeButton collection="sections" :docId="this.$route.params.id" />
          <DownloadButton
            :image="section.thumb"
            :title="section.title"
            :artist="section.artist"
          />
        </div>
      </div>
    </div>

    <div class="border yellow info-panel mt mb mw-canvas related">
      <div class="data-wrap" v-if="isFetching === 'done'">
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
              <h1 class="icon interactive">featured in...</h1>
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
              <h1 class="icon interactive">more by this artist...</h1>
            </label>
          </div>
        </form>
      </div>
    </div>
    <Loading
      v-if="isFetching !== 'done' && related.toggle === 'featuredIn'"
      subtext="checkin out the studio"
      style="height: 172px;"
    />
    <div
      v-if="isFetching === 'done' && related.toggle === 'featuredIn'"
      class="gallery"
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
      v-if="isFetching === 'done' && related.toggle === 'moreBy'"
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
import Canvas from "~/components/Canvas.vue";
import LikeButton from "~/components/LikeButton.vue";
import DownloadButton from "~/components/DownloadButton.vue";

export default {
  name: "Section",
  head() {
    return {
      title: `exquisite corpse club • ${this.section.title} by ${this.section.artist}`,
    };
  },
  components: { Canvas, LikeButton, DownloadButton },
  data: function () {
    return {
      isFetching: "not yet",
      section: {},
      related: {
        featuredIn: [],
        moreBy: [],
        toggle: "featuredIn",
      },
    };
  },
  mounted() {
    this.fetchDocById("sections", this.$route.params.id);
  },
  methods: {
    async fetchDocById(collection, id) {
      this.isFetching = "yes";
      const query = this.$fireStore.collection(collection).doc(id);
      const doc = await query.get();
      this.section = { ...doc.data() };
      this.section.paths = Object.values(doc.data().drawing);

      this.fetchRelated();
    },

    async fetchRelated() {
      if (!this.section.featuredIn) {
        this.isFetching = "done";
        return;
      }

      let featuredInLimit = 3;
      this.section.featuredIn.forEach((ref) => {
        featuredInLimit--;
        if (featuredInLimit < 0) return;

        ref.get().then((doc) => {
          const mydoc = {
            docId: doc.id,
            thumb: doc.data().thumb,
          };
          this.related.featuredIn.push(mydoc);
        });
      });

      const sectionsRef = this.$fireStore.collection("sections");
      const query = sectionsRef
        .where("artist", "==", this.section.artist)
        .orderBy("likes", "desc")
        .limit(6);
      const moreByDocs = await query.get();

      moreByDocs.forEach((doc) => {
        const mydoc = {
          docId: doc.id,
          thumb: doc.data().thumb,
        };
        if (doc.id !== this.$route.params.id) {
          this.related.moreBy.push(mydoc);
        }
      });

      this.isFetching = "done";
    },
  },
};
</script>

<style lang="scss" scoped>
#top,
#mid,
#bot {
  border: var(--border-size) solid var(--border-color);
}

h1 {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    font-weight: normal;
    margin-right: 1ch;
  }
}
</style>

<style lang="scss" scoped>
.related {
  margin-top: 120px;
  padding: 1rem calc(1rem - 7px);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, calc(516px / 3));
  grid-template-rows: repeat(1, calc(516px / 3));
  grid-gap: calc(40px / 3);
}

.gallery.more-by {
  grid-template-rows: repeat(2, max-content);
  min-height: 172px;
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

input:not(:checked) + label h1 {
  font-weight: normal;
  opacity: 0.5;
}
</style>
