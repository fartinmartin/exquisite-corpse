<template>
  <div class="observer" />
</template>

<script>
// https://vueschool.io/articles/vuejs-tutorials/build-an-infinite-scroll-component-using-intersection-observer-api/
export default {
  props: ["options"],
  data: () => ({ observer: null }),
  mounted() {
    if (process.client) {
      const options = this.options || {};
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry && entry.isIntersecting) {
          this.$emit("intersect");
        }
      }, options);

      this.observer.observe(this.$el);
    }
  },
  destroyed() {
    this.observer.disconnect();
  },
};
</script>
