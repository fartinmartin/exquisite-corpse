<template>
  <div class="loading-wrap mw-canvas">
    <div class="loading border">
      <div class="text-wrap">
        <div class="text">{{ text }}</div>
        <div class="subtext">{{ subtext }}</div>
      </div>
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

  &.yellow .text-wrap {
    border: 2px solid var(--light-yellow);
  }

  &.error {
    --border-color: var(--orange);
    --box-shadow-color: var(--red);

    .text-wrap {
      border: 2px solid var(--orange);
    }
  }

  .subtext {
    color: #7f7f7f;
  }
}
</style>

<style lang="scss" scoped>
.loading-wrap {
  height: 0;
  position: relative;
  overflow: hidden;
  padding-top: 100%;

  > * {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
