<template>
  <div class="wrap">
    <div class="prev-next">
      <div class="prev border yellow">👈</div>
      <div class="next border yellow">👉</div>
    </div>
    <div v-if="isFetching !== 'done'">loading</div>
    <Display v-if="isFetching === 'done'" :sections="sections" />
    <div class="border yellow meta mw-canvas" v-if="isFetching === 'done'">
      <h1>{{ meta.title }}</h1>
      <div class="menu">
        <span>{{ meta.likes }} ❤️</span>
        <span>💾</span>
        <!-- <button class="button" @click="updateThumb">📷</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mergeBase64 } from "~/assets/js/mergeImages";

export default {
  data: function() {
    return {
      isFetching: "not yet",
      meta: null,
      sections: {}
    };
  },
  mounted() {
    this.fetchDocById("completed", this.$route.params.id);
  },
  methods: {
    async fetchDocById(collection, id) {
      this.isFetching = "yes";
      const query = this.$fireStore.collection(collection).doc(id);
      const doc = await query.get();

      let completedMeta = {
        docId: doc.id,
        likes: doc.data().likes,
        title: doc.data().title,
        date: doc.data().date,
        thumb: doc.data().thumb
      };

      this.meta = completedMeta;

      let vm = this;

      async function handleSections() {
        await vm.getSections(doc.data().sections);
      }

      handleSections();
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
    async updateThumb() {
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

<style lang="scss" scoped>
.prev,
.next {
  width: 60px;
  height: 60px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 100;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.prev {
  left: calc(40px / 3);
}

.next {
  right: calc(40px / 3);
}

h1 {
  font-size: 1rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  height: 60px;
  padding: 1rem;
  margin-top: calc(40px / 3);
}

.wrap {
  flex-direction: column;
}
</style>
