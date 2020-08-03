<template>
  <div class="wrap">
    <nav class="border yellow info-panel mb mw-canvas">
      <nuxt-link to="/">
        <h1>exquisite corpse club</h1>
      </nuxt-link>
      <NavMenu />
    </nav>
    <Loading v-if="isFetching !== 'success'" subtext="fetching random corpse" />
    <Display
      v-if="isFetching === 'success' && isLoggedIn"
      :sections="sections"
    />
    <div class="border yellow info-panel mt mw-canvas title">
      <nuxt-link v-if="isFetching === 'success'" :to="`/gallery/${meta.docId}`">
        {{ meta.title }}
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";
import Loading from "~/components/Loading";
import NavMenu from "~/components/NavMenu";
import { mapState } from "vuex";

export default {
  name: "index",
  components: { Display, NavMenu, Loading },
  data: function () {
    return {
      logInAttempts: 3,
      isLoggedIn: false,
      isFetching: "idle", // "idle", "fetching", "success", TODO: "error"
      meta: null,
      sections: {},
    };
  },
  mounted() {
    this.logIn();
    this.getRandomCorpse();
  },
  methods: {
    openHelp() {
      this.$store.dispatch("setIsHelping", true);
    },

    async logIn() {
      await this.$store.dispatch("modules/user/signInAnonymously");
      this.isLoggedIn = true;
    },

    async getRandomCorpse() {
      this.isFetching = "fetching";

      const corpseRef = this.$fireStore.collection("corpses");
      const randomKey = corpseRef.doc().id;
      const query = corpseRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .limit(1);

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach(async (doc) => {
            this.meta = { docId: doc.id, ...doc.data() };
            return await this.getSections(doc.data().sections);
          });
        } else {
          const secondQuery = corpseRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .limit(1);
          const secondResponse = await secondQuery.get();
          secondResponse.forEach(async (doc) => {
            this.meta = { docId: doc.id, ...doc.data() };
            return await this.getSections(doc.data().sections);
          });
        }
      } catch (error) {
        console.error(error);
        this.isLoggedIn = false;

        this.logInAttempts--;
        if (this.logInAttempts > 0) {
          await this.logIn();
          this.getRandomCorpse();
        }
      }

      return;
    },

    async getSections(sections) {
      for (const [type, ref] of Object.entries(sections)) {
        this.sections[type] = await this.getSection(ref);
        this.sections[type].paths = Object.values(this.sections[type].drawing);
      }
      this.isFetching = "success";
    },

    async getSection(docRef) {
      const response = await docRef.get();
      return { docId: response.id, ...response.data() };
    },
  },
};
</script>

<style lang="scss" scoped>
.title {
  justify-content: center;

  a:hover {
    text-decoration: underline;
    color: var(--blue);
  }
}
</style>
