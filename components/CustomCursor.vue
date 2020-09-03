<template>
  <div id="cursor" ref="cursorRef">
    <img v-show="isLoading" src="~/assets/img/cursor/loading.svg" />
    <img
      v-show="!isLoading && state === 'auto'"
      src="~/assets/img/cursor/auto.svg"
    />
    <img
      v-show="!isLoading && state === 'pointer'"
      src="~/assets/img/cursor/pointer.svg"
    />
    <img
      v-show="!isLoading && state === 'disabled'"
      src="~/assets/img/cursor/disabled.svg"
    />
    <img
      v-show="!isLoading && state === 'grab'"
      src="~/assets/img/cursor/grab.svg"
    />
    <img
      v-show="!isLoading && state === 'draw'"
      src="~/assets/img/cursor/draw.svg"
    />
    <img
      v-show="!isLoading && state === 'erase'"
      src="~/assets/img/cursor/erase.svg"
    />
    <img
      v-show="!isLoading && state === 'fill'"
      src="~/assets/img/cursor/fill.svg"
    />
    <div v-show="tooltip" class="tooltip" ref="tooltip">{{ tooltip }}</div>
  </div>
</template>

<script>
export default {
  name: "CustomCursor",
  data: () => ({ x: null, y: null, state: "auto", tooltip: null }),
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
  },
  mounted() {
    window.addEventListener("mousemove", this.cursorMove);
    window.addEventListener("mousedown", this.cursorDown);
    window.addEventListener("mouseup", this.cursorUp);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.cursorMove);
    window.removeEventListener("mousedown", this.cursorDown);
    window.removeEventListener("mouseup", this.cursorUp);
  },
  methods: {
    cursorMove(e) {
      // hotspot offsets based on state
      let offset = {
        ...(this.state === "loading" && { x: 0, y: 0 }),
        ...(this.state === "auto" && { x: -3, y: 0 }),
        ...(this.state === "pointer" && { x: 0, y: 0 }),
        ...(this.state === "disabled" && { x: -5, y: -5 }),
        ...(this.state === "grab" && { x: 0, y: 0 }),
        ...(this.state === "draw" && { x: 1, y: -24 }),
        ...(this.state === "erase" && { x: -12, y: -21 }),
        ...(this.state === "fill" && { x: -1, y: -22 }),
      };

      // cursor pos
      this.x = e.clientX + offset.x;
      this.y = e.clientY + offset.y;

      //move custom cursor
      const cursor = this.$refs.cursorRef;
      if (cursor) cursor.style.transform = `translate(${this.x}px,${this.y}px)`;

      //change state based on hovered targets
      const hasTooltip = (t) => t.dataset.tooltip;
      const isDisabled = (t) => t.disabled || t.classList.contains("disabled");
      const isCanvas = (t) => t.tagName === "CANVAS";
      const isClickable = (t) =>
        t.tagName === "BUTTON" ||
        t.tagName === "LABEL" ||
        t.tagName === "INPUT" ||
        t.tagName === "A" ||
        t.classList.contains("pointer");

      const targets = [e.target, e.target.parentNode];

      if (this.isLoading) {
        this.state = "loading";
      } else if (targets.some(isDisabled)) {
        this.state = "disabled";
      } else if (targets.some(isCanvas)) {
        this.state = this.$store.state.mouse.mode;
      } else if (targets.some(isClickable)) {
        this.state = "pointer";
      } else {
        this.state = "auto";
      }

      // tooltip state:
      if (targets.some(hasTooltip)) {
        this.tooltip = targets[0].dataset.tooltip || targets[1].dataset.tooltip;
      } else {
        this.tooltip = null;
      }

      if (process.client) {
        if (targets.some(hasTooltip)) {
          if (window.innerWidth - e.clientX < this.$refs.tooltip.offsetWidth) {
            this.$refs.tooltip.style.transform = `translateX(-100%) translateX(-30px)`;
          } else {
            this.$refs.tooltip.style.transform = `translateX(0)`;
          }
        }
      }
    },
    cursorDown(e) {
      if (e.target.tagName !== "CANVAS") this.state = "grab";
    },
    cursorUp(e) {
      if (e.target.tagName !== "CANVAS") {
        this.cursorMove(e);
        this.tooltip = null;
      }
    },
  },
};
</script>

<style>
* {
  cursor: none;
}

.touch #cursor {
  display: none;
}
</style>

<style lang="scss" scoped>
.tooltip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem 0.4rem 0.5rem;
  line-height: 1;
  width: max-content;
  background: #eeeeee;
  border: 2px solid var(--black);

  position: absolute;
  top: 30px;
  left: 30px;
  z-index: -1;
  pointer-events: none;
}
</style>

<style lang="scss" scoped>
#cursor {
  cursor: none;
  pointer-events: none;

  z-index: 1000;

  width: 25px;
  height: 25px;

  position: fixed;
  top: 0;
  left: 0;

  transform: translate(-100%, -100%);
}

img {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
