<template>
  <div class="wrap">
    <nav class="border yellow">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <div class="links">
        <button @click.prevent="openHelp">
          <div class="icon">
            <img src="~/assets/img/icons/info.svg" />
          </div>
        </button>
        <nuxt-link
          to="/gallery"
          :class="{ active: this.$route.name !== 'gallery' }"
        >
          <div class="icon">
            <img src="~/assets/img/icons/gallery.svg" />
          </div>
        </nuxt-link>
        <nuxt-link to="/draw" :class="{ active: this.$route.name !== 'draw' }">
          <div class="icon">
            <img src="~/assets/img/toolbar/draw.svg" />
          </div>
        </nuxt-link>
      </div>
    </nav>
    <div v-if="isFetching !== 'done'" class="loading mw-canvas">loading</div>
    <Display v-if="isFetching === 'done'" :sections="sections" />
    <div v-if="isFetching === 'done'" class="border yellow title mw-canvas">
      <nuxt-link :to="`/gallery/${meta.docId}`">{{ meta.title }}</nuxt-link>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";
import { mapState } from "vuex";
import asyncForEach from "~/assets/js/asyncForEach";

export default {
  name: "index",
  components: { Display },
  data: function() {
    return {
      isFetching: "not yet",
      meta: null,
      sections: {}
    };
  },
  mounted() {
    this.fetchRandomCompleted();
  },
  methods: {
    async fetchRandomCompleted() {
      this.isFetching = "yes";
      const completedRef = this.$fireStore.collection("completed");

      const randomKey = completedRef.doc().id;
      const query = completedRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .limit(1);
      const firstResponse = await query.get();
      if (firstResponse.size > 0) {
        firstResponse.forEach(doc => {
          let completedMeta = {
            docId: doc.id,
            likes: doc.data().likes,
            title: doc.data().title,
            date: doc.data().date
          };

          let vm = this;

          async function handleSections() {
            await vm.getSections(doc.data().sections);
          }

          handleSections();

          return (this.meta = completedMeta);
        });
      } else {
        const secondQuery = completedRef
          .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
          .limit(1);
        const secondResponse = await secondQuery.get();
        secondResponse.forEach(doc => {
          let completedMeta = {
            docId: doc.id,
            likes: doc.data().likes,
            title: doc.data().title,
            date: doc.data().date
          };

          let vm = this;

          async function handleSections() {
            await vm.getSections(doc.data().sections);
          }

          handleSections();

          return (this.meta = completedMeta);
        });
      }
      return;
    },
    async getSections(sections) {
      const top = await this.getSection(sections.top);
      const mid = await this.getSection(sections.mid);
      const bot = await this.getSection(sections.bot);
      this.sections.top = top;
      this.sections.mid = mid;
      this.sections.bot = bot;
      this.sections.top.paths = Object.values(top.drawing);
      this.sections.mid.paths = Object.values(mid.drawing);
      this.sections.bot.paths = Object.values(bot.drawing);
      this.isFetching = "done";
    },
    async getSection(docRef) {
      const response = await docRef.get();
      return response.data();
    },
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  flex-direction: column;
}

nav {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 544px;
  margin-bottom: calc(40px / 3);
}

h1 {
  font-size: 1rem;
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

.links {
  display: flex;

  > * {
    margin-left: 1rem;
  }
}

.title {
  margin-top: calc(40px / 3);
  padding: 1rem;
  text-align: center;
  height: 60px;
}

.loading {
  height: calc(544px + 60px + (40px / 3));
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
