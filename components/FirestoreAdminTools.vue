<template>
  <div class="info-panel mt">
    <button class="button" @click="updateCompletedThumb">
      Update Completed Thumbnail
    </button>
  </div>
</template>

<script>
import { mergeBase64 } from "~/assets/js/mergeImages";

export default {
  props: {
    sections: Object
  },
  methods: {
    async updateCompletedThumb() {
      let thumbsObject = {};

      const sectionsObj = Object.keys(this.sections);

      sectionsObj.forEach(key => {
        if (key !== this.type) {
          thumbsObject[key] = this.sections[key].thumb;
        }
      });

      const completedThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot
      ]);

      const docId = this.$route.params.id;
      const docRef = this.$fireStore.collection("completed").doc(docId);
      return docRef
        .update({ thumb: completedThumb })
        .then(() => {
          console.log("it worked!", completedThumb);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
};
</script>

<style></style>
