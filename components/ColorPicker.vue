<template>
  <div class="picker-wrap" ref="pickerWrap">
    <Panel class="picker" :style="pickerStyles" ref="picker">
      <div
        class="slider ignore-dbs"
        id="hue"
        ref="hue"
        @mousedown="hueDrag = true"
        @mouseup="hueDrag = false"
        @mouseleave="hueDrag = false"
        @click="handleHueClick"
        @mousemove="handleHueDrag"
      >
        <div class="pointer" ref="huePointer" />
      </div>
      <div
        class="slider mt ignore-dbs"
        id="sat"
        ref="sat"
        @mousedown="satDrag = true"
        @mouseup="satDrag = false"
        @mouseleave="satDrag = false"
        @click="handleSatClick"
        @mousemove="handleSatDrag"
      >
        <div class="pointer" ref="satPointer" />
        <div class="to-white" />
        <div class="to-black" />
      </div>
      <Button
        class="mt"
        text="add color!"
        @click="$emit('add-color', currentColor)"
        :style="buttonStyles"
      />
    </Panel>
  </div>
</template>

<script>
import tinycolor from "tinycolor2";
import { mapGetters } from "vuex";

export default {
  name: "ColorPicker",
  props: {
    color: { type: String }
  },
  data: () => ({
    currentColor: null,
    hueDrag: false,
    satDrag: false,
    pickerStyles: ""
  }),
  mounted() {
    this.currentColor = this.color || "#ff0000";
    this.$refs.huePointer.style.left = `${(this.hsl.h / 360) * 100}%`;
    this.$refs.satPointer.style.left = `${this.hsl.s * 100}%`;
    this.$refs.satPointer.style.top = `${(1 - this.hsl.l) * 100}%`;
    this.handlePickerStyles();
    console.log(this.pickerStyles);
  },
  computed: {
    ...mapGetters(["isMobile"]),
    hsl() {
      return tinycolor(this.currentColor).toHsl();
    },
    borderLight() {
      if (!this.currentColor) return "--lighter-yellow";
      return tinycolor(this.currentColor).lighten();
    },
    borderDark() {
      if (!this.currentColor) return "--yellow";
      return tinycolor(this.currentColor).darken();
    },
    textColor() {
      if (!this.currentColor) return "#000000";
      return tinycolor
        .mostReadable(this.currentColor, ["black", "white"])
        .toHexString();
    },
    buttonStyles() {
      return `
        --background-color: ${this.currentColor};
        --border-bot-right: ${this.borderLight};
        --border-top-left: ${this.borderDark};
        color: ${this.textColor};`;
    }
  },
  watch: {
    currentColor() {
      this.$refs.sat.style.backgroundColor = `hsl(${this.hsl.h}, 100%, 50%)`;
    }
  },
  methods: {
    handleHueClick(e) {
      this.handleHueChange(e);
    },
    handleHueDrag(e) {
      this.hueDrag && this.handleHueChange(e);
    },
    handleHueChange(e) {
      const root = this.$refs.hue;
      const width = root.clientWidth;
      const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
      const left = x - (root.getBoundingClientRect().left + window.pageXOffset);

      let h, p;
      if (left < 0) {
        h = p = 0;
      } else if (left > width) {
        h = 359;
        p = 100;
      } else {
        const percent = (left * 100) / width;
        p = percent;
        h = (360 * percent) / 100;
      }

      if (this.hsl.h !== h) {
        this.$refs.huePointer.style.left = `${p}%`;
        this.currentColor = `#${tinycolor({
          h,
          s: this.hsl.s,
          l: this.hsl.l
        }).toHex()}`;
      }
    },
    handleSatClick(e) {
      this.handleSatChange(e);
    },
    handleSatDrag(e) {
      this.satDrag && this.handleSatChange(e);
    },
    handleSatChange(e) {
      const root = this.$refs.sat;
      const width = root.clientWidth;
      const height = root.clientHeight;

      const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
      const y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
      let left = x - (root.getBoundingClientRect().left + window.pageXOffset);
      let top = y - (root.getBoundingClientRect().top + window.pageYOffset);

      if (left < 0) {
        left = 0;
      } else if (left > width) {
        left = width;
      }

      if (top < 0) {
        top = 0;
      } else if (top > height) {
        top = height;
      }

      const lp = (left * 100) / width;
      const tp = (top * 100) / height;

      const saturation = left / width;
      const bright = 1 - top / height;

      if (this.hsl.s !== saturation && this.hsl.l !== bright) {
        this.$refs.satPointer.style.left = `${lp}%`;
        this.$refs.satPointer.style.top = `${tp}%`;
        this.currentColor = `#${tinycolor({
          h: this.hsl.h,
          s: saturation,
          v: bright
        }).toHex()}`;
      }
    },
    handlePickerStyles() {
      if (!this.isMobile) return;

      const buttonCenter =
        this.$refs.pickerWrap.getBoundingClientRect().left - 10;
      const pickerWidth = this.$refs.picker.$el.offsetWidth / 2;

      const maxRight = window.innerWidth - 40 / 3;
      const maxLeft = 40 / 3;

      // console.log(Math.abs(buttonCenter - pickerWidth), maxLeft);

      if (buttonCenter + pickerWidth > maxRight) {
        this.pickerStyles = `transform: translateX(calc(-50% - ${buttonCenter +
          pickerWidth -
          maxRight}px));`;
      } else if (Math.abs(buttonCenter - pickerWidth) > maxLeft) {
        this.pickerStyles = `transform: translateX(-${buttonCenter -
          maxLeft}px);`;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.picker-wrap {
  position: relative;
  height: 20px;
  width: 0;
  pointer-events: none;
}

.picker {
  position: absolute;
  pointer-events: auto;
  z-index: 1000;
  top: calc((40px / 6) + 20px + 1rem + 4px + 1px);
  left: -10px;
  width: auto;
  max-width: 544px;
  transform: translateX(-50%);
}

.slider {
  height: 1rem;
  width: 200px;
  position: relative;
}

#hue {
  background: rgba(0, 0, 0, 0)
    linear-gradient(
      to right,
      rgb(255, 0, 0) 0%,
      rgb(255, 255, 0) 17%,
      rgb(0, 255, 0) 33%,
      rgb(0, 255, 255) 50%,
      rgb(0, 0, 255) 67%,
      rgb(255, 0, 255) 83%,
      rgb(255, 0, 0) 100%
    )
    repeat scroll 0% 0%;
}

#sat {
  background: rgb(255, 0, 4);
  height: 4rem;
  .to-white,
  .to-black {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }
  .to-white {
    background: rgba(0, 0, 0, 0)
      linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0))
      repeat scroll 0% 0%;
  }
  .to-black {
    background: rgba(0, 0, 0, 0)
      linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)) repeat scroll 0%
      0%;
  }
}

.pointer {
  z-index: 500;
  position: absolute;
  left: 0;
  top: 0;
  box-shadow: 0 0 0 2px var(--black), 0 0 0 4px var(--white);
}

#hue .pointer {
  width: calc(1rem / 3);
  height: calc(1rem + 4px);
  top: -2px;
  transform: translateX(calc(-1rem / 6));
}

#sat .pointer {
  width: 1rem;
  height: 1rem;
  transform: translate3d(-0.5rem, -0.5rem, 0);
}
</style>

<style>
.picker .content {
  flex-direction: column !important;
}
</style>
