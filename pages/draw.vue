<template>
  <div class="wrap">
    <PickSection
      v-if="isFetching === 'not yet'"
      @picked-type="handlePickedType"
    />
    <div v-if="isFetching === 'yes'">we r loadings</div>
    <Draw v-if="isFetching === 'done'" />
  </div>
</template>

<script>
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
  async fetch({ store, $axios }) {
    const response = await $axios.$get("/randomWords", {
      params: {
        hasDictionaryDef: true,
        includePartOfSpeech: "adjective,noun",
        maxCorpusCount: -1,
        minDictionaryCount: 1,
        maxDictionaryCount: -1,
        minLength: 5,
        maxLength: 8,
        limit: 2,
        api_key: process.env.WORDNIK_API_KEY
      }
    });

    let words = [];
    response.forEach(word => words.push(word.word));
    store.dispatch("modules/drawing/setWords", words);
  },
  mounted() {
    this.$store.dispatch("modules/drawing/clearDrawing");
    this.$store.dispatch("modules/mouse/resetMouse");
  },
  methods: {
    async handlePickedType(type) {
      this.isFetching = "yes";

      const sectionsRef = this.$fireStore.collection("sections");
      const $storeSectionsKeys = Object.keys(this.sections);

      const fetchSectionsPerKey = async () => {
        await asyncForEach($storeSectionsKeys, async key => {
          if (key === type) {
            this.$store.dispatch("modules/drawing/setSections", {
              type,
              isTemp: true
            });
          } else {
            // https://stackoverflow.com/a/54801398/8703073
            const randomKey = sectionsRef.doc().id;
            const query = sectionsRef
              .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
              .where("type", "==", key)
              .limit(1);
            const firstResponse = await query.get();

            if (firstResponse.size > 0) {
              firstResponse.forEach(doc => {
                // https://programmersought.com/article/27791951922/;jsessionid=F1AC9A35FBE8713BA67DF8D0090DE51B
                const payload = {
                  docId: doc.id,
                  paths: Object.values(doc.data().drawing),
                  type: doc.data().type,
                  artist: doc.data().artist,
                  title: doc.data().title
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
              const secondResponse = await secondQuery.get();

              secondResponse.forEach(doc => {
                const payload = {
                  docId: doc.id,
                  paths: Object.values(doc.data().drawing),
                  type: doc.data().type,
                  artist: doc.data().artist,
                  title: doc.data().title
                };
                this.$store.dispatch("modules/drawing/setSections", payload);
              });
            }
          }
        });
      };

      await fetchSectionsPerKey();
      this.$store.dispatch("modules/drawing/setType", type);
      this.isFetching = "done";
    }
  },
  computed: {
    ...mapState("modules/drawing", ["sections"])
  }
};
</script>
