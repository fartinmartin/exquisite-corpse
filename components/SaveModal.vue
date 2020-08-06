<template>
  <div class="fs-modal save-modal" @click="closeMe">
    <div class="wrap">
      <Canvas
        id="save-preview"
        :section="{ paths: computedPaths, title, artist }"
        mode="display"
        ref="previewCanvas"
      />
      <CanvasThumb :section="computedPaths" ref="thumbCanvas" />
      <Panel class="save-form">
        <form>
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
          <div class="mt">
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
          <div class="mt" style="margin-top: 2rem;">
            <button @click.prevent="saveDrawing" class="button solid yellow">
              save & show me our masterpiece!
            </button>
          </div>
          <div class="mt">
            <button @click.prevent="$emit('close-save')" class="button">
              wait, i'm not done <span class="hom">drawing</span>
            </button>
          </div>
        </form>
        <div class="loadal" v-show="isSaving !== 'idle'">
          <Loading
            v-if="isSaving === 'saving'"
            subtext="generating your masterpiece"
            style="height: 100%;"
            color="yellow"
            :throttle="0"
          />
          <Loading
            v-if="isSaving === 'success'"
            text="you did it!"
            subtext="your drawing was saved"
            style="height: 100%;"
            color="green"
            :throttle="0"
          />
          <Loading
            v-if="isSaving === 'error'"
            text="oop!"
            subtext="there was an error.. try again?"
            style="height: 100%;"
            color="red"
            :throttle="0"
            @click.native="closeMe"
          />
        </div>
      </Panel>
    </div>
  </div>
</template>

<script>
import Canvas from "~/components/Canvas.vue";
import CanvasThumb from "~/components/CanvasThumb.vue";
import Loading from "~/components/Loading.vue";
import { mergeBase64 } from "~/assets/js/mergeImages";
import { mapState, mapGetters } from "vuex";
import { randomWordFromString } from "~/assets/js/randomWords";

export default {
  name: "SaveModal",
  components: { Canvas, CanvasThumb, Loading },
  data: () => ({
    title: "",
    artist: "",
    isTempTitle: true,
    isTempArtist: true,
    isSaving: "idle", // "idle", "saving", "success", "error"
  }),
  computed: {
    ...mapState("modules/user", ["name"]),
    ...mapState("modules/drawing", ["type", "sections", "paths"]),
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
      const targets = [e.target, e.target.parentNode];
      const isSaveModal = (t) => t.classList.contains("save-modal");

      if (targets.some(isSaveModal)) {
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
      const corpseRef = this.$fireStore.collection("corpses").doc();
      const corpseId = corpseRef.id;
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

      // create thumb for corpse drawing based on preveiwCanvas
      const currentThumb = this.$refs.thumbCanvas.$refs.canvasThumb.toDataURL();
      thumbsObject[this.type] = currentThumb;

      const corpseThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      const corpsePaylod = {
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
        thumb: corpseThumb,
      };

      const sectionPayload = {
        artist: this.artist.substring(0, 30).trim() || this.name || "anonymous",
        date: timestamp,
        drawing: { ...this.computedPaths },
        featuredIn: [corpseRef],
        likes: 0,
        thumb: currentThumb,
        title: this.title.substring(0, 17).trim() || "untitled",
        type: this.type,
      };

      const batch = this.$fireStore.batch();

      batch.set(corpseRef, corpsePaylod);
      batch.set(sectionsRef, sectionPayload);

      // for each drawing that is NOT active type, push the "corpseId" to their "featuredIn" array
      sectionsObj.forEach((key) => {
        if (key !== this.type) {
          const docId = this.sections[key].docId;
          const docRef = this.$fireStore.collection("sections").doc(docId);
          batch.update(docRef, {
            featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(corpseRef),
          });
        }
      });

      batch
        .commit()
        .then(() => {
          this.isSaving = "success";
          setTimeout(() => {
            this.$emit("close-save", corpseId);
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

<style lang="scss">
.save-form {
  position: relative;
  margin-top: 40px;

  > .content {
    display: block;
  }
}
</style>

<style lang="scss" scoped>
.save-modal {
  z-index: 951 !important;

  @media screen and (max-width: 1040px) {
    z-index: 955;
  }
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

/* TODO: abstract form elements into their own components */
form {
  > div {
    display: flex;
    align-items: baseline;
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
