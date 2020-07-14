<template>
  <div class="save-modal" @click="closeMe">
    <div>
      <Canvas id="save-preview" :section="section" />
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
            @click.prevent="saveDrawing"
          />
        </div>
        <div>
          <button @click.prevent="$emit('close-save')">
            wait, i'm not done drawing
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Canvas from "./Canvas.vue";
import { mapState } from "vuex";

export default {
  name: "SaveModal",
  components: { Canvas },
  data() {
    return {
      title: null,
      artist: null
    };
  },
  computed: {
    ...mapState("modules/user", ["id", "displayName"]),
    ...mapState("modules/drawing", ["type", "paths"]),
    section() {
      return { drawing: this.paths };
    }
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  methods: {
    handleShortcuts(e) {
      if (e.keyCode === 27) this.$emit("close-save"); // esc
    },
    closeMe(e) {
      if (e.target.className === "save-modal") {
        this.$emit("close-save");
      }
    },
    saveDrawing() {
      // TODO: should validate form and/or come up with defaults
      //       was there going to be a random word/phrase as placeholdler for title?? yes do it
      //       also the completed drawing's title should be a junble of the three names

      let payload = {
        artist: this.artist || this.displayName,
        date: this.$fireStoreObj.Timestamp.fromDate(new Date()),
        drawing: { ...this.paths }, // POTENTIAL WARNING 🚨 : could this be saving the drawing out of order ?!
        featuredIn: "", // TOOD: on drawing start, generate a new completed doc and set a local references to that docs name for use on this line, also set all three drawings featuredin array to reference the new collection
        likes: 0,
        permalink: "", // TODO: learn how to do this...
        thumb: "", // TODO: learn how to do this...
        title: this.title || "untitled", // TODO: random phrase from Wordnik API
        type: this.type,
        userId: this.id
      };

      // TODO: start loading component

      this.$fireStore
        .collection("sections")
        .add(payload)
        .then(() => {
          // TODO: tell loading component to show success then route to the completed drawing!
          alert("You did it! Ur drawing was saved!");
          this.$emit("close-save");
        })
        .catch(error => {
          alert("Oops, there was an error.. try again?");
          console.error("Error writing document: ", error);
          // TODO: tell loading component to deal with error
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.close-me {
  position: absolute;
  z-index: 950;
  background: green;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.save-modal {
  position: absolute;
  z-index: 900;

  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: var(--lighter-blue)
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC)
    repeat;
  background-blend-mode: overlay;

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
    transform: translate3d(100%, 100%, 0);

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

    /* TODO: this function could/should be a global class 🤔 */
    &:active {
      border: 2px solid var(--lighter-yellow);
      border-top: 2px solid var(--yellow);
      border-left: 2px solid var(--yellow);
      transform: translate3d(2px, 2px, 0);
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
