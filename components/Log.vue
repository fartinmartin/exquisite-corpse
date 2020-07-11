<template>
  <Draggable
    :x="0"
    :y="0"
    :w="350"
    style="position: absolute; z-index: 1000"
    :style="{ display: isHidden ? 'none' : 'block' }"
  >
    <div class="log">
      <span
        >{{ drawing.history.step }} / {{ drawing.history.paths.length }} /
        {{ drawing.paths.length }}</span
      >

      <div class="current-path">
        <h2>currentPath</h2>
        <pre
          v-for="(path, i) in drawing.currentPath"
          :key="i"
          style="text-align: left;"
          class="log-item"
          :class="{ active: i + 1 === drawing.history.step }"
        >
        <strong>{{i + 1}}</strong>{{ path }}
      </pre>
      </div>
      <div class="drawing">
        <h2>drawing</h2>
        <pre
          v-for="(path, i) in drawing.history.paths"
          :key="i"
          style="text-align: left;"
          class="log-item"
          :class="{ active: i + 1 === drawing.history.step }"
        >
        <strong>{{i + 1}}</strong>{{ path }}
      </pre>
      </div>
    </div>
  </Draggable>
</template>

<script>
import Draggable from "vue-draggable-resizable";
import { mapState } from "vuex";

export default {
  name: "Log",
  components: { Draggable },
  data: function() {
    return {
      isHidden: true
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  methods: {
    handleShortcuts(e) {
      if (e.keyCode === 76) {
        this.isHidden = !this.isHidden;
      }
    }
  },
  computed: mapState({
    drawing: state => state.modules.drawing
  })
};
</script>

<style lang="scss" scoped>
.log {
  background: #fff;
  padding: 1rem;
}

h2 {
  font-size: 1rem;
}

strong {
  margin-right: 1rem;
}

pre {
  height: 1.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  margin: 0;
  border: 2px solid transparent;
}

pre.active {
  border: 2px solid goldenrod;
}

pre:nth-child(odd) {
  background: #eee;
}
</style>
