<template>
  <div class="wrap">
    <!-- <Log /> -->
    <PickSection
      v-if="isFetching === 'not yet'"
      @picked-type="handlePickedType"
    />
    <div v-if="isFetching === 'yes'">we r loadings</div>
    <Draw v-if="isFetching === 'done'" />
  </div>
</template>

<script>
// import Log from "~/components/Log";
import Draw from "~/components/Draw";
import PickSection from "~/components/PickSection";
import { mapState } from "vuex";
import asyncForEach from "~/assets/js/asyncForEach";

export default {
  name: "draw",
  components: { Draw, PickSection },
  data: function() {
    return { isFetching: "not yet" };
  },
  mounted() {
    this.$store.dispatch("modules/drawing/clearDrawing");
    this.$store.dispatch("modules/mouse/resetMouse"); // "opinionated" i guess.. i dunno what that means really
  },
  methods: {
    async handlePickedType(type) {
      this.isFetching = "yes";

      const sectionsRef = this.$fireStore.collection("sections");
      const $storeSectionsKeys = Object.keys(this.sections);

      const handleKeys = async () => {
        await asyncForEach($storeSectionsKeys, async key => {
          if (key === type) {
            this.$store.dispatch("modules/drawing/setSections", {
              type,
              sectionData: null
            });
          } else {
            let sectionData = {};

            // https://stackoverflow.com/a/54801398/8703073
            const randomKey = sectionsRef.doc().id;
            const query = sectionsRef
              .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
              .where("type", "==", key)
              .limit(1);
            const section = await query.get();

            if (section.size > 0) {
              section.forEach(doc => {
                sectionData = {
                  docId: doc.id,
                  ...doc.data()
                };
                let payload = {
                  type: sectionData.type,
                  sectionData
                };
                this.$store.dispatch("modules/drawing/setSections", payload);
              });
            } else {
              const secondQuery = sectionsRef
                .where(
                  this.$fireStoreObj.FieldPath.documentId(),
                  "<",
                  randomKey
                )
                .where("type", "==", key)
                .limit(1);
              const secondSection = await secondQuery.get();

              secondSection.forEach(doc => {
                sectionData = {
                  docId: doc.id,
                  ...doc.data()
                };
                let payload = {
                  type: sectionData.type,
                  sectionData
                };
                this.$store.dispatch("modules/drawing/setSections", payload);
              });
            }
          }
        });
      };

      await handleKeys();
      this.$store.dispatch("modules/drawing/setType", type);
      this.isFetching = "done";
    }
  },
  computed: {
    ...mapState("modules/drawing", ["sections"])
  }
};
</script>
