<template>
  <button :class="color" @click.prevent="handleClick">
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: "Button",
  props: { text: { type: String }, color: { type: String } },
  methods: {
    handleClick() {
      this.$emit("click");
    }
  }
};
</script>

<style lang="scss" scoped>
button {
  width: 100%;
  padding: 0.5rem 0;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  --background-color: var(--white);
  --border-top-left: var(--yellow);
  --border-bot-right: var(--lighter-yellow);

  background-color: var(--background-color);
  border: 2px solid var(--border-top-left);
  border-top: 2px solid var(--border-bot-right);
  border-left: 2px solid var(--border-bot-right);

  &:focus {
    outline: 2px dashed var(--background-color);
  }

  &:active {
    border: 2px solid var(--border-bot-right);
    border-top: 2px solid var(--border-top-left);
    border-left: 2px solid var(--border-top-left);
    transform: translate3d(2px, 2px, 0);
  }

  &.yellow {
    --background-color: var(--light-yellow);
    color: var(--black);
  }

  &.red {
    --background-color: var(--red);
    color: var(--white);
  }

  a {
    text-decoration: none;
    &:hover {
      color: var(--black);
    }
  }
}
</style>
