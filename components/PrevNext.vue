<template>
  <div class="prev-next">
    <div class="prev border yellow">
      <button
        :disabled="isFetching !== 'success' || gallery[0].docId === firstItemId"
        @click="prevPage"
        data-tooltip="prev"
      >
        <div class="icon interactive">
          <img src="~/assets/img/toolbar/undo.svg" alt="" />
        </div>
      </button>
    </div>
    <div class="next border yellow">
      <button
        :disabled="isFetching !== 'success' || gallery.length < pageSize"
        @click="nextPage"
        data-tooltip="next"
      >
        <div class="icon interactive">
          <img src="~/assets/img/toolbar/redo.svg" alt="" />
        </div>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrevNext",
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
}

.prev {
  left: calc(40px / 3);
}

.next {
  right: calc(40px / 3);
}
</style>
