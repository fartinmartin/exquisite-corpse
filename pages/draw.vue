<template>
  <div class="wrap">
    <SaveModal v-if="isSaving !== 'idle'" @close-save="closeSave" />

    <PickSection v-if="isFetching === 'idle'" @picked-type="handlePickedType" />

    <div v-if="isFetching === 'fetching'" class="mw-canvas">
      <Panel class="mb" />
      <Panel class="mb" />
      <Loading subtext="preparing your canvas" />
    </div>

    <Draw
      v-if="isFetching === 'success'"
      @start-save="startSave"
      v-show="isSaving === 'idle'"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { twoRandomWords } from "~/assets/js/randomWords";

export default {
  name: "draw",
  head() {
    return {
      title: "exquisite corpse club ▪ draw",
      meta: [
        {
          hid: "description",
          name: "description",
          content: `create your very own masterpiece!`
        },
        {
          name: "og:title",
          hid: "og:title",
          content: `exquisite corpse club ▪ draw`
        },
        {
          name: "og:description",
          hid: "og:description",
          content: `create your very own masterpiece!`
        }
      ]
    };
  },
  data: () => ({ isFetching: "idle" }), // "idle", "fetching", "success", TODO: "error"
  async fetch({ store }) {
    // set default random title
    let words = await twoRandomWords();
    store.dispatch("drawing/setTitle", words);
    store.dispatch("setIsHelping", false);
  },
  mounted() {
    // fresh start
    this.$store.dispatch("drawing/clearDrawing");
    this.$store.dispatch("mouse/resetMouse");
  },
  computed: {
    ...mapState("drawing", ["isSaving", "sections"]),
    ...mapGetters(["isMobile"])
  },
  methods: {
    startSave() {
      if (this.isMobile) this.$store.dispatch("drawing/setMobilePaths");
      this.$store.dispatch("drawing/setIsSaving", "modal-open");
    },

    closeSave(e) {
      if (e) this.$router.push({ path: `/gallery/corpse/${e}` });
      this.$store.dispatch("drawing/setIsSaving", "idle");
    },

    async handlePickedType(type) {
      this.isFetching = "fetching";
      this.$store.dispatch("setIsLoading", true);

      // get other types
      const types = ["top", "mid", "bot"].filter(t => t !== type);

      // set drawing state and this section's docId as "temp" in the store
      this.$store.dispatch("drawing/setType", type);
      this.$store.dispatch("drawing/setSections", {
        type,
        docId: "temp"
      });

      // get and set the other two types
      for (const type of types) {
        let payload = await this.getRandomSectionByType(type);
        payload.paths = Object.values(payload.drawing);
        this.$store.dispatch("drawing/setSections", payload);
      }

      this.isFetching = "success";
      this.$store.dispatch("setIsLoading", false);
    },

    async getRandomSectionByType(type) {
      // https://stackoverflow.com/a/54801398/8703073
      const sectionsRef = this.$fireStore.collection("sections");
      const randomKey = sectionsRef.doc().id;
      const query = sectionsRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .where("type", "==", type)
        .limit(1);

      let section;

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach(doc => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        } else {
          const secondQuery = sectionsRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .where("type", "==", type)
            .limit(1);
          const secondResponse = await secondQuery.get();

          secondResponse.forEach(doc => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        }
      } catch (error) {
        console.error(error);
        // this.getRandomSectionByType(type);
      }

      return section;
    }
  }
};
</script>
