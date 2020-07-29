<template>
  <div class="save-modal" @click="closeMe">
    <div>
      <Canvas
        id="save-preview"
        :section="section"
        mode="display"
        ref="previewCanvas"
      />
      <form class="border yellow">
        <div class="loadal" v-if="isSaving !== 'idle'">
          <Loading
            v-if="isSaving === 'success'"
            subtext="generating your masterpiece"
            style="height: 100%;"
            class="yellow"
          />
          <Loading
            v-if="isSaving === 'saved'"
            text="you did it!"
            subtext="your drawing was saved"
            style="height: 100%;"
            class="yellow"
          />
          <Loading
            v-if="isSaving === 'error'"
            text="oop!"
            subtext="there was an error.. try again?"
            style="height: 100%;"
            class="error"
            @click.native="closeMe"
          />
        </div>
        <div>
          <label for="title">your section's title:</label>
          <input
            type="text"
            v-model="title"
            id="title"
            :placeholder="title"
            :class="{ temp: isTempTitle }"
            @focus="isTempTitle = false"
            maxlength="17"
          />
        </div>
        <div>
          <label for="artist">
            your *ahem* artist name:
            <span>(@s will link to your instagram)</span>
          </label>
          <input
            type="text"
            v-model="artist"
            id="artist"
            :placeholder="artist"
            :class="{ temp: isTempArtist }"
            @focus="isTempArtist = false"
            maxlength="30"
          />
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
import Loading from "./Loading.vue";
import { mergeBase64 } from "~/assets/js/mergeImages";
import { mapState } from "vuex";
import { randomWordFromString } from "~/assets/js/randomWords";

export default {
  name: "SaveModal",
  components: { Canvas },
  data() {
    return {
      title: "",
      artist: "",
      isTempTitle: true,
      isTempArtist: true,
      isSaving: "idle", // "idle", "saving", "success", "error"
    };
  },
  computed: {
    ...mapState("modules/user", ["name"]),
    ...mapState("modules/drawing", ["type", "paths", "sections"]),
    tempTitle: () => this.$store.state.modules.drawing.title,
    section: () => ({
      paths: this.paths,
      title: this.title,
      artist: this.artist,
    }),
  },
  mounted() {
    // set local state based on store state
    this.title = this.tempTitle;
    this.artist = this.name;

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
        this.isSaving = "idle";
      }
    },

    async saveDrawing() {
      this.isSaving = "saving";

      // if they changed their name, update their profile + our local state
      if (this.artist !== this.name)
        this.$store.dispatch("modules/user/updateUserName", this.artist);

      // firebase vars
      let timestamp = this.$fireStoreObj.Timestamp.fromDate(new Date());
      const completedRef = this.$fireStore.collection("completed").doc();
      const completedId = completedRef.id;
      const sectionsRef = this.$fireStore.collection("sections").doc();
      const sectionId = sectionsRef.id;

      // meta info "contrustors"
      let thumbsObject = {};
      let titleArray = [randomWordFromString(this.title)];
      const sectionsObj = Object.keys(this.sections);

      sectionsObj.forEach((key) => {
        if (key !== this.type) {
          titleArray.push(randomWordFromString(this.sections[key].title));
          thumbsObject[key] = this.sections[key].thumb;
        }
      });

      // create thumb for completed drawing based on preveiwCanvas
      const currentThumb = this.$refs.previewCanvas.$refs.canvas.toDataURL();
      thumbsObject[this.type] = currentThumb;

      const completedThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      let completePaylod = {
        title: titleArray.join(" "), // jumble of all three names
        date: timestamp,
        likes: 0,
        sections: {
          top: this.$fireStore.doc(
            `sections/${
              this.type === "top" ? sectionId : this.sections.top.docId
            }`
          ),
          mid: this.$fireStore.doc(
            `sections/${
              this.type === "mid" ? sectionId : this.sections.mid.docId
            }`
          ),
          bot: this.$fireStore.doc(
            `sections/${
              this.type === "bot" ? sectionId : this.sections.bot.docId
            }`
          ),
        },
        thumb: completedThumb,
      };

      let sectionPayload = {
        artist: this.artist.substring(0, 30).trim() || this.name || "anonymous",
        date: timestamp,
        drawing: { ...this.paths },
        featuredIn: [this.$fireStore.doc(`completed/${completedId}`)],
        likes: 0,
        thumb: currentThumb,
        title:
          this.title.substring(0, 17).trim() || this.tempTitle || "untitled",
        type: this.type,
      };

      const batch = this.$fireStore.batch();

      batch.set(completedRef, completedPaylod);
      batch.set(sectionsRef, sectionPayload);

      // for each drawing that is NOT active type, push the "completedId" to their "featuredIn" array
      sectionsObj.forEach((key) => {
        if (key !== this.type) {
          const docId = this.sections[key].docId;
          const docRef = this.$fireStore.collection("sections").doc(docId);
          batch.update(docRef, {
            featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(
              this.$fireStore.doc(`completed/${completedId}`)
            ),
          });
        }
      });

      batch
        .commit()
        .then(() => {
          this.isSaving = "success";
          setTimeout(() => {
            this.$emit("close-save", completedId);
          }, 1500);
        })
        .catch((error) => {
          this.isSaving = "error";
          console.error("Error writing document: ", error);
          setTimeout(() => {
            this.$emit("close-save");
          }, 2000);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.save-modal {
  position: absolute;
  z-index: 951;

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

.loadal {
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  background: var(--white);
  z-index: 5;
}

/* TODO: abstract form styles to (global) SCSS file */
form {
  position: relative;
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

  ::placeholder,
  input.temp {
    color: #7f7f7f;
    opacity: 1;
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
