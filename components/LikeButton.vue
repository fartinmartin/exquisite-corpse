<template>
  <button @click="handleClick">
    <div class="icon interactive" :data-tooltip="isLiked ? 'unlike' : 'like'">
      <span>{{ likes }}</span>
      <img src="~/assets/img/icons/heart.svg" alt="" />
    </div>
  </button>
</template>

<script>
export default {
  name: "LikeButton",
  props: {
    collection: {
      type: String,
      required: true,
    },
    docId: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      likes: 0,
      isLiked: false,
    };
  },
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
        });
      if (destory) return likesRef();
    },
    handleClick() {
      const increment = this.$fireStoreObj.FieldValue.increment(1);
      const decrement = this.$fireStoreObj.FieldValue.increment(-1);

      const docRef = this.$fireStore
        .collection(this.collection)
        .doc(this.docId);

      !this.isLiked && docRef.update({ likes: increment });
      this.isLiked && this.likes !== 0 && docRef.update({ likes: decrement });

      this.isLiked = !this.isLiked;
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
