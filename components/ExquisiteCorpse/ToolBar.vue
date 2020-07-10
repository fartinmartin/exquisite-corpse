<template>
  <div class="toolbar border">
    <div class="tool-group brush">
      <div class="tool">
        <input type="radio" name="mode" id="draw" value="draw" />
        <label for="draw">
          <img src="~/assets/img/toolbar/draw.svg" />
        </label>
      </div>

      <div class="tool">
        <input type="radio" name="mode" id="erase" value="erase" />
        <label for="erase">
          <img src="~/assets/img/toolbar/erase.svg" />
        </label>
      </div>

      <div class="tool">
        <input type="radio" name="mode" id="fill" value="fill" />
        <label for="fill">
          <img src="~/assets/img/toolbar/fill.svg" />
        </label>
      </div>
    </div>

    <div class="tool-group size">
      <button class="tool">
        <img src="~/assets/img/toolbar/sizeDown.gif" alt="" />
      </button>
      <span>5px</span>
      <button class="tool">
        <img src="~/assets/img/toolbar/sizeUp.gif" alt="" />
      </button>
    </div>

    <div class="tool-group edits">
      <button class="tool">
        <img src="~/assets/img/toolbar/undo.gif" alt="" />
      </button>
      <button class="tool">
        <img src="~/assets/img/toolbar/redo.gif" alt="" />
      </button>
      <button class="tool">
        <img src="~/assets/img/toolbar/clear.gif" alt="" />
      </button>
      <button class="tool">
        <img src="~/assets/img/toolbar/save.gif" alt="" />
      </button>
    </div>

    <div class="tool-group palette">
      <button
        class="swatch"
        v-for="(color, index) in colors"
        :key="index"
        :class="{ active: color === currentColor }"
        :style="{ backgroundColor: color }"
      ></button>
      <input style="display: none;" type="color" id="addColor" />
      <label for="addColor" class="add-color">+</label>
    </div>
  </div>
</template>

<script>
export default {
  name: "ToolBar",
  computed: {
    // mode
    colors() {
      return ["#fff", "#000"];
    },
    currentColor() {
      return "#fff";
    }
    // colors, current color
    // currentSize
    // drawingIsEmpty
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  padding: 1rem;
  flex-wrap: wrap;
}

$icon-size: 25px;

.tool {
  width: $icon-size;
  height: $icon-size;

  display: flex;
  align-items: center;
  justify-content: center;

  input {
    display: none;
  }

  label {
    width: 100%;
  }

  svg,
  img {
    width: 100%;
    display: block;
  }
}

.tool-group {
  display: flex;
  align-items: center;
}

.size {
  span {
    width: 4ch;
    text-align: center;
  }
}

.palette {
  width: 100%;
}
</style>
