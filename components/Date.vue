<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 60"
    class="calendar-icon pointer"
  >
    <g id="Layer_2" data-name="Layer 2" style="pointer-events: none;">
      <g id="Date">
        <rect class="cls-1" width="60" height="60" />
        <rect class="cls-2" x="10" y="10" width="40" height="14" />
        <rect class="cls-3" x="12" y="12" width="36" height="36" />
        <text
          class="cls-4"
          text-anchor="middle"
          x="29.5"
          y="41.5"
          ref="dateRef"
        >
          31
        </text>
        <rect class="cls-1" y="0" width="60" height="60" />
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: "Date",
  mounted() {
    this.$refs.dateRef.innerHTML = new Date().getDate();
  },
};
</script>

<style lang="scss">
.calendar-icon {
  .cls-1,
  .cls-3 {
    fill: none;
  }
  .cls-2 {
    fill: #f54e3b;
  }
  .cls-3 {
    stroke: #595959;
    stroke-miterlimit: 10;
    stroke-width: 4px;
  }
  .cls-4 {
    font-size: 20px;
    font-family: SpaceMono-Bold, Space Mono;
    font-weight: 700;
    user-select: none;
  }
}
</style>
