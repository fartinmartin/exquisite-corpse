<template>
  <button @click="handleClick">
    <div class="icon interactive" :data-tooltip="isLiked ? 'unlike' : 'like'">
      <span>{{ likes }}</span>
      <div
        style="width: 25px; height: 25px; pointer-events: none;"
        :class="{ liked: isLiked }"
      >
        <div v-html="rawHeart" />
      </div>
    </div>
  </button>
</template>

<script>
import rawHeart from "~/assets/img/icons/heart.svg?raw";
import { mapState } from "vuex";

export default {
  name: "LikeButton",
  props: {
    collection: { type: String, required: true },
    docId: { type: String, required: true },
  },
  data: () => ({ rawHeart, likes: 0, isLiked: false }),
  computed: mapState("modules/user/", ["id"]),
  mounted() {
    this.subscribeToLikes();
  },
  beforeDestroy() {
    this.subscribeToLikes("destory");
  },
  methods: {
    subscribeToLikes(destory) {
      const likesRef = this.$fireStore
        .collection(this.collection)
        .doc(this.docId)
        .onSnapshot((doc) => {
          this.likes = doc.data().likes;
          this.isLiked =
            doc.data().likedBy && doc.data().likedBy.includes(this.id);
        });
      if (destory) return likesRef();
    },

    handleClick() {
      const increment = this.$fireStoreObj.FieldValue.increment(1);
      const decrement = this.$fireStoreObj.FieldValue.increment(-1);
      const likedBy = this.$fireStoreObj.FieldValue.arrayUnion(this.id);
      const dislikedBy = this.$fireStoreObj.FieldValue.arrayRemove(this.id);

      const docRef = this.$fireStore
        .collection(this.collection)
        .doc(this.docId);

      const batch = this.$fireStore.batch();

      if (!this.isLiked) {
        batch.update(docRef, { likes: increment });
        batch.update(docRef, { likedBy });
      } else if (this.isLiked && this.likes !== 0) {
        batch.update(docRef, { likes: decrement });
        batch.update(docRef, { likedBy: dislikedBy });
      }

      batch
        .commit()
        .then(() => console.log("we did it!"))
        .catch((error) => console.error(error));
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  width: auto;
  padding: 0 5px;

  span {
    margin-right: 0.25rem;
    font-size: 0.875rem;
    margin-bottom: 2px;
  }

  img {
    width: 25px;
    height: 25px;
  }
}
</style>
