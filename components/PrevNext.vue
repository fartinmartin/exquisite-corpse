<template>
  <Panel class="prev-next mt" :class="type">
    <button
      class="prev"
      :disabled="isFirstPage"
      @click="$emit('prev')"
      :data-tooltip="isFirstPage ? `this is the first page! :)` : `go back`"
      :aria-label="isFirstPage ? `this is the first page! :)` : `go back`"
    >
      <Icon>
        <img src="~/assets/img/icons/arrow.svg" alt="" />
        <span>back</span>
      </Icon>
    </button>

    <button
      class="next"
      :disabled="isLastPage"
      @click="$emit('next')"
      :data-tooltip="
        isLastPage ? `no more ${currentType} :(` : `more ${currentType}!`
      "
      :aria-label="
        isLastPage ? `no more ${currentType} :(` : `more ${currentType}!`
      "
    >
      <Icon>
        <span>more!</span>
        <img src="~/assets/img/icons/arrow.svg" alt="" />
      </Icon>
    </button>
  </Panel>
</template>

<script>
export default {
  name: "PrevNext",
  props: { isFirstPage: Boolean, isLastPage: Boolean, type: String },
  computed: {
    currentType() {
      if (this.type === "bot") return `bottoms`;
      else if (this.type === "mid") return `middles`;
      else if (this.type === "top") return `tops`;
      else return this.type;
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

.prev-next:not(.corpses) {
  transform: translateY(calc(calc(40px / 3) + 56.15px * -1));
}

.prev .icon,
.next .icon {
  width: auto !important;

  img {
    width: 25px;
  }
}

.prev span {
  margin-right: 6px;
}

.next span {
  margin-left: 6px;
}

.next .icon img {
  transform: rotate(180deg);
}
</style>
