<template>
  <div class="wrap">
    <nav class="border yellow info-panel mb mw-canvas">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <NavMenu />
    </nav>
    <Loading
      v-if="isFetching !== 'done'"
      subtext="fetching random corpse"
      style="height: 544px;"
    />
    <Display v-if="isFetching === 'done' && isLoggedIn" :sections="sections" />
    <div class="border yellow info-panel mt mw-canvas title">
      <nuxt-link v-if="isFetching === 'done'" :to="`/gallery/${meta.docId}`">{{
        meta.title
      }}</nuxt-link>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";
import Loading from "~/components/Loading";
import NavMenu from "~/components/NavMenu";
import { mapState } from "vuex";
import asyncForEach from "~/assets/js/asyncForEach";

export default {
  name: "index",
  components: { Display, NavMenu, Loading },
  data: function () {
    return {
      isLoggedIn: false,
      isFetching: "not yet",
      meta: null,
      sections: {},
    };
  },
  mounted() {
    this.logIn();
    this.fetchRandomCompleted();
  },
  methods: {
    async logIn() {
      await this.$store.dispatch("modules/user/signInAnonymously");
      this.isLoggedIn = true;
    },
    async fetchRandomCompleted() {
      this.isFetching = "yes";
      const completedRef = this.$fireStore.collection("completed");

      const randomKey = completedRef.doc().id;
      const query = completedRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .limit(1);

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach((doc) => {
            let completedMeta = {
              docId: doc.id,
              likes: doc.data().likes,
              title: doc.data().title,
              date: doc.data().date,
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
          secondResponse.forEach((doc) => {
            let completedMeta = {
              docId: doc.id,
              likes: doc.data().likes,
              title: doc.data().title,
              date: doc.data().date,
            };

            let vm = this;

            async function handleSections() {
              await vm.getSections(doc.data().sections);
            }

            handleSections();

            return (this.meta = completedMeta);
          });
        }
      } catch (error) {
        console.error(error);
        this.isLoggedIn = false;
        await this.logIn();
        this.fetchRandomCompleted();
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
      return { docId: response.id, ...response.data() };
    },

    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },
  },
};
</script>

<style lang="scss" scoped>
.title {
  justify-content: center;
}
</style>
