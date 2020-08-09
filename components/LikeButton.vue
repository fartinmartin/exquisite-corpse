<template>
  <button @click="handleClick">
    <div class="icon interactive" :data-tooltip="isLiked ? 'unlike' : 'like'">
      <span>{{ likes }}</span>
      <div style="width: 25px; height: 25px; pointer-events: none;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
          <defs>
            <style>
              .cls-1 {
                fill: none;
              }
              .cls-2 {
                fill: none;
                stroke: #f54e3b;
                stroke-miterlimit: 10;
                stroke-width: 4px;
              }
              .cls-2.liked {
                fill: #ee74a7;
              }
            </style>
          </defs>
          <g id="Layer_2" data-name="Layer 2">
            <g id="Heart">
              <rect class="cls-1" width="60" height="60" />
              <polygon
                class="cls-2"
                :class="{ liked: isLiked }"
                points="30 46.76 40 39 47 31 49 23 47 15.76 42 12.76 36 13.76 30 18.75 24 13.76 18 12.76 13 15.76 11 23 13 31 20 39 30 46.76"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  </button>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "LikeButton",
  props: {
    collection: { type: String, required: true },
    docId: { type: String, required: true },
  },
  data: () => ({ likes: 0, isLiked: false }),
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
          this.isLiked = doc.data().likedBy.includes(this.id);
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
