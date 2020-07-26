<template>
  <div class="loading border mw-canvas">
    <div class="text-wrap">
      <div class="text">{{ text }}</div>
      <div class="subtext">{{ subtext }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "loading",
  props: {
    text: { type: String, required: false, default: "plz hold" },
    subtext: { type: String, required: false },
  },
};
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--lighter-blue)
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC)
    repeat;
  background-blend-mode: overlay;

  .text-wrap {
    padding: 1rem;
    background: var(--white);
    border: 2px solid var(--light-blue);
    text-align: center;
  }

  .subtext {
    color: #7f7f7f;
  }
}
</style>
