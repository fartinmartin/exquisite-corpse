<template>
  <div id="cursor" ref="cursor">
    <img
      v-show="state === 'auto'"
      src="~/assets/img/cursor/cursor-default.svg"
      alt=""
    />
    <img
      v-show="state === 'pointer'"
      src="~/assets/img/cursor/cursor-pointer.svg"
      alt=""
    />
    <img
      v-show="state === 'notAllowed'"
      src="~/assets/img/cursor/cursor-not-allowed.svg"
      alt=""
    />
    <img
      v-show="state === 'grabbing'"
      src="~/assets/img/cursor/cursor-grabbing.svg"
      alt=""
    />
    <img v-show="state === 'draw'" src="~/assets/img/cursor/draw.svg" alt="" />
    <img
      v-show="state === 'erase'"
      src="~/assets/img/cursor/erase.svg"
      alt=""
    />
    <img v-show="state === 'fill'" src="~/assets/img/cursor/fill.svg" alt="" />
  </div>
</template>

<script>
export default {
  name: "CustomCursor",
  data() {
    return {
      x: null,
      y: null,
      state: "auto"
    };
  },
  mounted() {
    window.addEventListener("mousemove", this.customCursorMove);
    window.addEventListener("mousedown", this.customCursorDown);
    window.addEventListener("mouseup", this.customCursorUp);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.customCursorMove);
    window.addEventListener("mousedown", this.customCursorDown);
    window.addEventListener("mouseup", this.customCursorUp);
  },
  methods: {
    customCursorMove(e) {
      // console.log(e.target.parentNode.tagName);
      // hotspot offsets based on state
      let offset = {
        ...(this.state === "auto" && { x: -3, y: 0 }),
        ...(this.state === "pointer" && { x: 0, y: 0 }),
        ...(this.state === "notAllowed" && { x: -5, y: -5 }),
        ...(this.state === "grabbing" && { x: 0, y: 0 }),
        ...(this.state === "draw" && { x: 0, y: -25 }),
        ...(this.state === "erase" && { x: -13, y: -23 }),
        ...(this.state === "fill" && { x: -2, y: -24 })
      };

      // cursor pos
      this.x = e.clientX + offset.x;
      this.y = e.clientY + offset.y;

      //change state based on hovered targets
      if (e.target.tagName === "CANVAS") {
        this.state = this.$store.state.modules.mouse.mode;
      } else if (
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "LABEL" ||
        e.target.parentNode.tagName === "BUTTON" ||
        e.target.parentNode.tagName === "LABEL"
      ) {
        this.state = "pointer";
      } else if (e.target.parentNode.disabled) {
        this.state = "notAllowed";
      } else {
        this.state = "auto";
      }

      // this.state = "auto";

      //move custom cursor
      const cursor = this.$refs.cursor;
      cursor.style.transform = `translate(${this.x}px,${this.y}px)`;
    },
    customCursorDown(e) {
      if (e.target.tagName === "CANVAS") {
        return;
      } else {
        this.state = "grabbing";
      }
    },
    customCursorUp(e) {
      if (e.target.tagName === "CANVAS") {
        return;
      } else {
        this.state = "auto";
      }
    }
  }
};
</script>

<style>
* {
  cursor: none;
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
