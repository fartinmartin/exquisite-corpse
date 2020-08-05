<template>
  <div class="wrap">
    <SaveModal v-if="isSaving" @close-save="closeSave" />
    <PickSection v-if="isFetching === 'idle'" @picked-type="handlePickedType" />
    <div v-if="isFetching === 'fetching'" class="mw-canvas">
      <div class="border yellow info-panel mw-canvas"></div>
      <div class="border yellow info-panel mw-canvas mt mb"></div>
      <Loading subtext="preparing your canvas" />
    </div>
    <Draw
      v-if="isFetching === 'success'"
      @start-save="startSave"
      v-show="!isSaving"
    />
  </div>
</template>

<script>
import SaveModal from "~/components/SaveModal";
import Draw from "~/components/Draw";
import PickSection from "~/components/PickSection";
import { mapState, mapGetters } from "vuex";
import { twoRandomWords } from "~/assets/js/randomWords";

export default {
  name: "draw",
  head() {
    return {
      title: "exquisite corpse club • draw",
    };
  },
  components: { Draw, PickSection },
  data: () => ({ isFetching: "idle", isSaving: false }), // "idle", "fetching", "success", TODO: "error"
  async fetch({ store }) {
    // set default random title
    let words = await twoRandomWords();
    store.dispatch("modules/drawing/setTitle", words);
  },
  mounted() {
    // fresh start
    this.$store.dispatch("modules/drawing/clearDrawing");
    this.$store.dispatch("modules/mouse/resetMouse");
  },
  computed: {
    ...mapState("modules/drawing", ["sections"]),
    ...mapGetters(["isMobile"]),
  },
  methods: {
    startSave() {
      if (this.isMobile) this.$store.dispatch("modules/drawing/setMobilePaths");
      this.isSaving = true;
    },
    closeSave(e) {
      this.isSaving = false;
      if (e) {
        this.$router.push({ path: `/gallery/${e}` });
      }
    },
    async handlePickedType(type) {
      this.isFetching = "fetching";

      // get other types
      let types = ["top", "mid", "bot"];
      types = types.filter((t) => t !== type);

      // set drawing state and this section's docId as "temp" in the store
      this.$store.dispatch("modules/drawing/setType", type);
      this.$store.dispatch("modules/drawing/setSections", {
        type,
        docId: "temp",
      });

      // get and set the other two types
      for (const type of types) {
        let payload = await this.getRandomSectionByType(type);
        payload.paths = Object.values(payload.drawing);
        this.$store.dispatch("modules/drawing/setSections", payload);
      }

      this.isFetching = "success";
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
          firstResponse.forEach((doc) => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        } else {
          const secondQuery = sectionsRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .where("type", "==", type)
            .limit(1);
          const secondResponse = await secondQuery.get();

          secondResponse.forEach((doc) => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        }
      } catch (error) {
        console.error(error);
        // this.getRandomSectionByType(type);
      }

      return section;
    },
  },
};
</script>
