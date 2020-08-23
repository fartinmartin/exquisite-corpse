<template>
  <div
    class="fs-modal save-modal"
    @click="closeMe"
    v-touch="(e) => e.changedTouches[0].touchType === 'stylus' && closeMe(e)"
  >
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
          <Input
            id="title"
            v-model="title"
            label="your section's title:"
            :placeholder="title"
            :class="{ temp: isTempTitle }"
            @focus="isTempTitle = false"
            :maxlength="17"
          />
          <Input
            class="mt"
            id="artist"
            v-model="artist"
            label="your *ahem* artist name:"
            note="(@s will link to your instagram)"
            :placeholder="artist"
            :class="{ temp: isTempArtist }"
            @focus="isTempArtist = false"
            :maxlength="30"
          />

          <div style="margin-top: 2rem;">
            <Button
              @click="saveDrawing"
              color="yellow"
              text="save & show me our masterpiece!"
            />
          </div>
          <div class="mt">
            <Button
              @click="$emit('close-save')"
              text="wait, i'm not done drawing"
              style="color: var(--orange);"
            />
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
import { mergeBase64 } from "~/assets/js/mergeImages";
import { mapState, mapGetters } from "vuex";
import { randomWordFromString } from "~/assets/js/randomWords";

export default {
  name: "SaveModal",

  data: () => ({
    title: "",
    artist: "",
    isTempTitle: true,
    isTempArtist: true,
    isSaving: "idle", // "idle", "saving", "success", "error"
  }),
  computed: {
    ...mapState("user", ["name"]),
    ...mapState("drawing", ["type", "sections", "paths"]),
    ...mapGetters(["isMobile"]),
    ...mapGetters("drawing", ["computedPaths"]),
  },
  mounted() {
    // set local state based on store state
    this.title = this.$store.state.drawing.title;
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
        this.$store.dispatch("user/updateUserName", this.artist);

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
</style>
