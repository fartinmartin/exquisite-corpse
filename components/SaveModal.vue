<template>
  <div class="save-modal" @click="closeMe">
    <div class="wrap">
      <Canvas
        id="save-preview"
        :section="{ paths: computedPaths, title, artist }"
        mode="display"
        ref="previewCanvas"
      />
      <form class="border yellow mw-canvas">
        <div class="loadal" v-if="isSaving !== 'idle'">
          <Loading
            v-if="isSaving === 'saving'"
            subtext="generating your masterpiece"
            style="height: 100%;"
            class="yellow"
          />
          <Loading
            v-if="isSaving === 'success'"
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
          <label for="title">
            <span class="hom">your section's </span>title:
          </label>
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
            <span class="hom">your *ahem* artist</span> name:
            <span class="note">(@s will link to your instagram)</span>
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
        <div style="margin-top: 2rem;">
          <button @click.prevent="saveDrawing" class="button solid yellow">
            save & show me our masterpiece!
          </button>
        </div>
        <div>
          <button @click.prevent="$emit('close-save')" class="button">
            wait, i'm not done <span class="hom">drawing</span>
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
import { mapState, mapGetters } from "vuex";
import { randomWordFromString } from "~/assets/js/randomWords";

// 🚨 TODO: thumbnail needs to be generated from offscreen canvas at 1080 x 360 res using this.$store.modules.drawing.paths

export default {
  name: "SaveModal",
  components: { Canvas, Loading },
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
    ...mapState("modules/drawing", ["type", "sections"]),
    ...mapGetters(["isMobile"]),
    ...mapGetters("modules/drawing", ["computedPaths"]),
  },
  mounted() {
    // set local state based on store state
    this.title = this.$store.state.modules.drawing.title;
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
      if (
        e.target.className === "save-modal" ||
        e.target.parentNode.className === "save-modal"
      ) {
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
      // TODO: NOPE. this needs to be done with an offscreen canvas
      const currentThumb = this.$refs.previewCanvas.$refs.canvas.toDataURL();
      thumbsObject[this.type] = currentThumb;

      const completedThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      const completedPaylod = {
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

      const sectionPayload = {
        artist: this.artist.substring(0, 30).trim() || this.name || "anonymous",
        date: timestamp,
        drawing: { ...this.computedPaths },
        featuredIn: [this.$fireStore.doc(`completed/${completedId}`)],
        likes: 0,
        thumb: currentThumb,
        title: this.title.substring(0, 17).trim() || "untitled",
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
  height: 100%;

  background: var(--lighter-blue)
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVQImWNgYGD4z0AswK4SAFXuAf8EPy+xAAAAAElFTkSuQmCC)
    repeat;
  background-blend-mode: overlay;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: calc(40px / 3);

  @media screen and (max-width: 1040px) {
    z-index: 955;
  }
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

  .loading-wrap {
    padding-top: initial !important;
  }
}

/* TODO: abstract form styles to (global) SCSS file */
form {
  position: relative;
  margin-top: 40px;
  padding: 1rem;

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

  label {
    @media screen and (max-width: 544px) {
      width: 25%;
      padding-right: 1rem;
    }
  }

  ::placeholder,
  input.temp {
    color: #7f7f7f;
    opacity: 1;
  }

  label span.note {
    width: 100%;
    display: block;

    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate3d(100%, 100%, 0);

    font-size: 10px;
    text-align: center;

    @media screen and (max-width: 544px) {
      transform: translate3d(calc(100% - 4rem), 100%, 0);
      width: 400%;
    }
  }

  button {
    color: var(--orange);
  }
}
</style>
