<template>
  <div>
    {{ $route.params.id }}
  </div>
</template>

<script>
export default {
  data: function() {
    return {};
  }
  // async fetch({ store, params }) {
  //   const completedId = params.id;

  //   await store.dispatc("fetchCompletedFromFirebase", { docId: completedId });
  // }
};
</script>

<style></style>
