<template>
  <button @click="handleClick">
    <div class="icon interactive" :class="{ 'border liked': isLiked }">
      <span>{{ likes }}</span> ❤️
    </div>
  </button>
</template>

<script>
export default {
  name: "LikeButton",
  props: {
    collection: {
      type: String,
      required: true
    },
    docId: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      likes: 0,
      isLiked: false
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
        .onSnapshot(doc => {
          this.likes = doc.data().likes;
        });
      if (destory) return likesRef();
    },
    handleClick() {
      this.liked = !this.liked;

      const increment = this.$fireStoreObj.FieldValue.increment(1);
      const decrement = this.$fireStoreObj.FieldValue.increment(-1);

      const docRef = this.$fireStore
        .collection(this.collection)
        .doc(this.docId);

      this.liked && docRef.update({ likes: increment });
      !this.liked && docRef.update({ likes: decrement });
    }
  }
};
</script>

<style lang="scss" scoped>
.icon {
  width: auto;
  padding: 0 5px;

  span {
    margin-right: 0.5rem;
  }
}

.liked {
}
</style>
