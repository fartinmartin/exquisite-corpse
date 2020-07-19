<template>
  <div class="wrap">
    {{ $route.params.id }}
  </div>
</template>

<script>
export default {
  data: function() {
    return {};
  },
  async fetch({ store, params }) {
    const completedId = params.id;
    console.log(this);

    // first, look up id in store
    // then go try firestore
    // then display
    // if nothing then tell 'em they effed up
  }
};
</script>

<style></style>
