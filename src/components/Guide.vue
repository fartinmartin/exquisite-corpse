<template>
  <span
    class="border"
    v-bind:id="label"
    :style="style"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseLeave"
    >{{ label }}</span
  >
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";

export default {
  name: "Guide",
  props: {
    label: String,
    position: String,
    limits: Object,
  },
  setup(props) {
    const store = useStore();
    const guides = store.state.drawing.guides;
    const style = computed(() => `top: ${props.position}`);

    const oppositeGuide = parseInt(
      guides[Object.keys(guides).filter((key) => key !== props.label)],
      10
    );
    const pickedUp = ref(false);

    const between = (num, min, max) => num >= min && num <= max;

    const onMouseDown = (e) => {
      pickedUp.value = true;
    };

    const onMouseMove = (e) => {
      let bounds = e.target.parentNode.getBoundingClientRect();
      let offset = e.target.offsetHeight / 2;
      let y = e.clientY - bounds.top - offset;

      if (
        pickedUp.value &&
        y > 50 &&
        y < 450 &&
        !between(y, oppositeGuide - 50, oppositeGuide + 50)
      ) {
        e.target.style.top = `${y}px`;
      }
    };

    const onMouseLeave = (e) => {
      // pickedUp.value = false;
    };

    const onMouseUp = (e) => {
      pickedUp.value = false;
      let id = e.target.id;
      let y = e.target.style.top;
      store.dispatch("setGuidePosition", { id, y });
    };

    return { style, onMouseDown, onMouseUp, onMouseMove, onMouseLeave };
  },
};
</script>

<style lang="scss" scoped>
span {
  background: #eee;
  width: 40px;
  height: 40px;
  font-size: 10px;

  cursor: ns-resize;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  left: -50px;
  top: 0;

  &:target {
    cursor: grab;
  }

  &::after {
    content: "";
    position: absolute;
    width: 540px;
    border-bottom: 3px dotted #000;
    left: calc(100% + 10px + 2px);
    opacity: 0.5;
    /* mix-blend-mode: color-burn; */
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
    border-bottom: 3px dotted #000;
  }
}
</style>
