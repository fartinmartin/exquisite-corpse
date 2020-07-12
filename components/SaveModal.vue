<template>
  <div class="save-modal">
    <div>
      <Canvas :drawing="drawing" is-presenting />
      <form class="border yellow">
        <div>
          <label for="title">your section's title:</label>
          <input type="text" v-model="title" id="title" />
        </div>
        <div>
          <label for="artist">
            your *ahem* artist name:
            <span>(@s will link to your instagram)</span>
          </label>
          <input type="text" v-model="artist" id="artist" />
        </div>
        <div>
          <input
            type="submit"
            value="save & show me our masterpiece!"
            @click.prevent="savedDrawing"
          />
        </div>
        <div>
          <!-- <button> -->
          <button @click.prevent="$emit('cancel-save')">
            wait, i'm not done drawing
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Canvas from "./Canvas.vue";

export default {
  name: "SaveModal",
  props: { drawing: Array },
  components: { Canvas },
  data() {
    return {
      title: null,
      artist: null
    };
  },
  methods: {
    savedDrawing() {
      // should validate form and/or come up with defaults
      // was there going to be a random word as placeholdler for title?? yes do it
      console.log("Saved drawing...");
    }
  }
};
</script>

<style lang="scss" scoped>
.save-modal {
  position: absolute;
  z-index: 900;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: var(--lighter-blue);

  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-wrap::after {
  display: none;
}

form {
  margin-top: 40px;
  padding: 1rem;
  width: 544px;

  > div {
    display: flex;
    align-items: baseline;

    &:not(:first-child) {
      margin-top: calc(40px / 3);
    }
  }

  label,
  input {
    position: relative;
    width: 100%;
    padding: 0.5rem 0;

    font-size: inherit;
    font-family: inherit;

    border: none;
    border-radius: 0;
    background: none;

    border-bottom: 1px dotted var(--orange);
  }

  label span {
    width: 100%;
    display: block;

    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate3D(100%, 100%, 0);

    font-size: 10px;
    text-align: center;
  }

  button,
  input[type="submit"] {
    margin-top: calc(40px / 3 * 2);

    background: var(--light-yellow);
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

  button {
    margin-top: 0;
    padding: 0.5rem;
    width: 100%;
    text-align: center;

    background: none;
    border: 2px solid var(--light-yellow);
    color: var(--orange);
  }
}
</style>
