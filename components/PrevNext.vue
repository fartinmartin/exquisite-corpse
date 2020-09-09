<template>
  <Panel class="prev-next mt" :class="type">
    <div class="prev">
      <button
        :disabled="isFirstPage"
        @click="$emit('prev')"
        :data-tooltip="isFirstPage ? `this is the first page! :)` : `go back`"
      >
        <div class="icon interactive">
          <img src="~/assets/img/icons/arrow.svg" alt="" />
        </div>
        back
      </button>
    </div>
    <div class="next">
      <button
        :disabled="isLastPage"
        @click="$emit('next')"
        :data-tooltip="
          isLastPage ? `no more ${viewing} :(` : `more ${viewing}!`
        "
      >
        more!
        <div class="icon interactive">
          <img
            src="~/assets/img/icons/arrow.svg"
            alt=""
            style="transform: rotate(180deg)"
          />
        </div>
      </button>
    </div>
  </Panel>
</template>

<script>
export default {
  name: "PrevNext",
  props: { isFirstPage: Boolean, isLastPage: Boolean, type: String },
  computed: {
    viewing() {
      console.log(this.type);
      switch (this.type) {
        case "bot":
          return `bottoms`;
          break;
        case "mid":
          return `middles`;
          break;
        case "top":
          return `tops`;
          break;
        default:
          return this.type;
          break;
      }
    }
  }
};
</script>

<style lang="scss">
.prev-next .content {
  display: flex;
  /* justify-content: center; */
  justify-content: space-between !important;
}

.prev-next button {
  display: flex;
  height: 25px;
  align-items: center;
}

.prev-next:not(.corpses) {
  transform: translateY(calc(calc(40px / 3) + 56.15px * -1));
}
</style>
