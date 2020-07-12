<template>
  <div>
    <div class="toolbar border mw-canvas">
      <div class="tool-group mode">
        <div class="tool draw" :class="{ active: mode === 'draw' }">
          <input
            type="radio"
            name="mode"
            id="draw"
            value="draw"
            v-model="mode"
          />
          <label for="draw">
            <img src="~/assets/img/toolbar/draw.svg" />
          </label>
        </div>

        <div class="tool erase" :class="{ active: mode === 'erase' }">
          <input
            type="radio"
            name="mode"
            id="erase"
            value="erase"
            v-model="mode"
          />
          <label for="erase">
            <img src="~/assets/img/toolbar/erase.svg" />
          </label>
        </div>

        <div class="tool fill" :class="{ active: mode === 'fill' }">
          <input
            type="radio"
            name="mode"
            id="fill"
            value="fill"
            v-model="mode"
          />
          <label for="fill">
            <img src="~/assets/img/toolbar/fill.svg" />
          </label>
        </div>
      </div>

      <div class="tool-group size">
        <button
          class="tool size-down"
          :disabled="!currentSizeMoreThanMin"
          @click="decrementSize"
        >
          <img src="~/assets/img/toolbar/size-down.svg" alt="" />
        </button>
        <span>{{ size.current }}px</span>
        <button
          class="tool size-up"
          :disabled="!currentSizeLessThanMax"
          @click="incrementSize"
        >
          <img src="~/assets/img/toolbar/size-up.svg" alt="" />
        </button>
      </div>

      <div class="tool-group edits">
        <button class="tool undo" :disabled="cantUndo" @click="undoCanvas">
          <img src="~/assets/img/toolbar/undo.svg" alt="" />
        </button>
        <button class="tool redo" :disabled="cantRedo" @click="redoCanvas">
          <img src="~/assets/img/toolbar/redo.svg" alt="" />
        </button>
        <button
          class="tool clear"
          :disabled="isDrawingEmpty"
          @click="clearCanvas"
        >
          <img src="~/assets/img/toolbar/clear.svg" alt="" />
        </button>
        <button
          class="tool save"
          :disabled="isDrawingEmpty"
          @click="saveSection"
        >
          <img src="~/assets/img/toolbar/save.svg" alt="" />
        </button>
      </div>
    </div>

    <div class="border" style="margin: 1rem 0; padding: 1rem ">
      <div class="tool-group palette">
        <button
          class="swatch"
          v-for="(color, index) in palette.colors"
          :key="index"
          :class="{ active: color === palette.current }"
          :style="{ backgroundColor: color }"
          @click="setColor(color)"
        ></button>
        <input
          style="display: none;"
          type="color"
          id="addColor"
          @change="addColor($event)"
        />
        <label for="addColor" class="add-color">+</label>
        <!-- https://github.com/xiaokaike/vue-color (mostly for safari support 🤔) -->
      </div>
    </div>

    <SaveModal
      v-show="isSaving"
      :drawing="paths"
      @cancel-save="isSaving = false"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import SaveModal from "./SaveModal";

export default {
  name: "ToolBar",
  components: { SaveModal },
  data: function() {
    return {
      isSaving: false
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  computed: {
    mode: {
      get() {
        return this.$store.state.modules.mouse.mode;
      },
      set(value) {
        this.$store.dispatch("modules/mouse/setMode", value);
      }
    },
    ...mapState("modules/mouse", ["palette", "size"]),
    ...mapState("modules/drawing", ["paths"]),
    ...mapGetters("modules/mouse", [
      "currentSizeLessThanMax",
      "currentSizeMoreThanMin"
    ]),
    ...mapGetters("modules/drawing", ["cantUndo", "cantRedo", "isDrawingEmpty"])
  },
  methods: {
    handleShortcuts(e) {
      // console.log("keydown", e.key, e.keyCode);
      if (!isNaN(e.key)) {
        this.setColor(this.palette.colors[e.key - 1]);
      }

      switch (e.keyCode) {
        case 68: // "d"
          this.mode = "draw";
          break;
        case 69: // "e"
          this.mode = "erase";
          break;
        case 70: // "e"
          this.mode = "fill";
          break;

        case 219: // "["
          this.decrementSize();
          break;
        case 221: // "]"
          this.incrementSize();
          break;

        case 90: // "z"
          this.undoCanvas();
          break;
        case 88: // "x"
          this.redoCanvas();
          break;

        case 67: // "c" OR
        case 8: // "backspace"
          this.clearCanvas(e); // sent with event in order to log in history
          break;

        case 83: // "s"
          this.saveSection();
          break;
      }
    },
    addColor(e) {
      this.$store.dispatch("modules/mouse/addColor", e.target.value);
    },
    setColor(e) {
      this.$store.dispatch("modules/mouse/setColor", e);
    },
    decrementSize() {
      this.$store.dispatch("modules/mouse/decrementSize");
    },
    incrementSize() {
      this.$store.dispatch("modules/mouse/incrementSize");
    },
    undoCanvas() {
      this.$store.dispatch("modules/drawing/undoCanvas");
    },
    redoCanvas() {
      this.$store.dispatch("modules/drawing/redoCanvas");
    },
    clearCanvas(e) {
      this.$store.dispatch("modules/drawing/clearCanvas", e);
    },
    saveSection() {
      this.isSaving = true;
      // let section = {
      //   title: "",
      //   artist: "",
      //   date: null,
      //   type: String, // 🚨
      //   likes: 0,
      //   permalink: "",
      //   thumbnail: this.$store.state.modules.drawing.ctx, // (?)
      //   drawing: this.$store.state.modules.drawing.paths,
      //   featuredIn: []
      // };
      // this.$store.dispatch("modules/drawing/saveSection", section);
    }

    // saveImage(name) {
    //   // https://github.com/Eraince/firebase-pic-json/blob/a4a56e89c3310148382b91e6a762049bbe28ff29/script.js
    //   // change canvas data to Blob so it can be submitted
    //   this.$store.state.modules.drawing.canvas.toBlob(function(blob) {
    //     var image = new Image();
    //     image.src = blob;
    //     var metadata = {
    //       contentType: "image/png"
    //     };

    //     storageRef
    //       // create or access a folder called "images",and put the new image under that folder
    //       // TODO: figure out where to store this 🤔
    //       .child("images/" + name)
    //       .put(blob, metadata)
    //       .then(function(snapshot) {
    //         console.log("Uploaded", snapshot.totalBytes, "bytes.");
    //         window.location.href = "gallery.html";
    //       })
    //       .catch(function(error) {
    //         console.error("Upload failed:", error);
    //       });
    //   });
    // }
  }
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  padding: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.tool-group {
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }
}

$icon-size: 25px;

.tool {
  width: $icon-size;
  height: $icon-size;

  box-sizing: content-box;
  border: 2px solid transparent;

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

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3D(2px, 2px, 0);
  }
}

.mode .tool.active {
  border: 2px solid var(--yellow);
  border-top: 2px solid var(--lighter-yellow);
  border-left: 2px solid var(--lighter-yellow);

  &:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3D(2px, 2px, 0);
  }
}

.mode .tool:not(.active) {
  filter: grayscale(1);
  opacity: 0.6;
}

.fill {
  margin-left: 0.6rem !important;
}

.size {
  span {
    width: 4ch;
    text-align: center;
    pointer-events: none;
  }
}

.palette {
  width: 100%;

  > *:not(:first-child) {
    margin-left: 0;
  }
}

.add-color,
.swatch {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid transparent;
}

.swatch.active {
  border: 2px solid rgba(255, 255, 255, 0.75);
}

.add-color {
  /* cursor: pointer; */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
