<template>
  <button @click="handleClick">
    <div class="icon interactive"><span>0</span> ❤️</div>
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
    id: {
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
  mounted() {},
  methods: {
    handleClick() {}
  }
};
</script>

<style></style>
