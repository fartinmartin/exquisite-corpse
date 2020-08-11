<template>
  <div class="menu">
    <LikeButton :collection="collection" :docId="doc.docId" />
    <DownloadButton :image="doc.thumb" :title="doc.title" />
  </div>
</template>

<script>
export default {
  name: "MetaMenu",
  props: {
    collection: { type: String, required: true },
    doc: { type: Object, required: true },
  },
};
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  align-items: center;

  > * {
    margin-left: 0.25rem;
  }
}
</style>
