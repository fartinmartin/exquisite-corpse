<template>
  <div class="debug">
    <div class="debug-heading">
      <div>
        <pre>
          drawing.history.step: {{ drawing.history.step }}
        </pre>
        <pre>
          drawing.history.paths.length: {{ drawing.history.paths.length }}
        </pre>
      </div>
      <div>
        <pre>isDrawing: {{ isDrawing }}</pre>
        <pre>drawing.paths.length: {{ drawing.paths.length }}</pre>
      </div>
    </div>
    <div class="log">
      <h2>currentPath log</h2>
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
    <div class="log">
      <h2>drawing log</h2>
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
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Log",
  setup() {
    const store = useStore();
    const drawing = computed(() => store.state.drawing);
    const isDrawing = computed(() => store.state.mouse.isDrawing);

    return { drawing, isDrawing };
  },
};
</script>

<style lang="scss" scoped>
.debug {
  width: 100%;
  align-self: start;
}

.debug-heading {
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-align: left;
}

.log-item {
  max-width: 562px;
}

.log strong {
  margin-right: 1rem;
}

.log pre {
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

.log pre.active {
  border: 2px solid goldenrod;
}

.log pre:nth-child(odd) {
  background: #eee;
}
</style>
