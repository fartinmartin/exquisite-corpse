<template>
  <Panel class="prev-next mt" :class="type">
    <button
      class="prev"
      :disabled="isFirstPage"
      @click="$emit('prev')"
      :data-tooltip="isFirstPage ? `this is the first page! :)` : `go back`"
    >
      <div class="icon interactive">
        <div class="icon">
          <img src="~/assets/img/icons/arrow.svg" alt="" />
        </div>
        <span>back</span>
      </div>
    </button>

    <button
      class="next"
      :disabled="isLastPage"
      @click="$emit('next')"
      :data-tooltip="
        isLastPage ? `no more ${currentType} :(` : `more ${currentType}!`
      "
    >
      <div class="icon interactive">
        <span>more!</span>
        <div class="icon">
          <img
            src="~/assets/img/icons/arrow.svg"
            alt=""
            style="transform: rotate(180deg)"
          />
        </div>
      </div>
    </button>
  </Panel>
</template>

<script>
export default {
  name: "PrevNext",
  props: { isFirstPage: Boolean, isLastPage: Boolean, type: String },
  computed: {
    currentType() {
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
  justify-content: space-between !important;
  height: 25px;
}

.prev-next button .interactive {
  display: flex;
  width: auto;
  height: 25px;
  align-items: center;
}

/* 🚨 TODO: could tweak loading component to match new height too */
.prev-next:not(.corpses) {
  transform: translateY(calc(calc(40px / 3) + 56.15px * -1));
}

.prev span {
  margin-right: 6px;
}

.next span {
  margin-left: 6px;
}
</style>
