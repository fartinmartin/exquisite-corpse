<template>
  <div class="prev-next">
    <Panel class="prev">
      <button
        :disabled="isFirstPage"
        @click="$emit('prev')"
        data-tooltip="prev"
      >
        <div class="icon interactive">
          <img src="~/assets/img/toolbar/undo.svg" alt="" />
        </div>
      </button>
    </Panel>
    <Panel class="next">
      <button :disabled="isLastPage" @click="$emit('next')" data-tooltip="next">
        <div class="icon interactive">
          <img src="~/assets/img/toolbar/redo.svg" alt="" />
        </div>
      </button>
    </Panel>
  </div>
</template>

<script>
export default {
  name: "PrevNext",
  props: { isFirstPage: Boolean, isLastPage: Boolean },
};
</script>

<style lang="scss" scoped>
.prev,
.next {
  width: 60px;
  height: 60px;

  position: fixed;
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
