<template>
  <div class="wrap">
    <div class="border yellow admin mw-canvas">
      <h1>completed</h1>
      <div class="input-wrap">
        <input v-model="completed.section" placeholder="enter sectionId" />
        <button
          class="button"
          @click="makeCompletedFromSingleSection(completed.section)"
        >
          make completed
        </button>
      </div>
      <div class="input-wrap">
        <input v-model="completed.id" placeholder="enter completedId" />
        <button
          class="button solid red"
          @click="removeCompletedAndItsReferences(completed.id)"
        >
          remove
        </button>
        <button class="button" @click="updateCompletedThumb">
          update thumb
        </button>
      </div>
    </div>
    <div class="border yellow admin mw-canvas">
      <h1>section</h1>
      <div class="input-wrap">
        <input v-model="section.id" placeholder="enter sectionId" />
        <button
          class="button solid red"
          @click="removeSectionAndItsReferences(section.id)"
        >
          remove section
        </button>
      </div>
    </div>
    <div class="border yellow admin mw-canvas">
      <button class="button" @click="signOut">
        sign out
      </button>
    </div>
  </div>
</template>

<script>
import { mergeBase64 } from "~/assets/js/mergeImages";
import { randomWordFromString } from "~/assets/js/randomWords";

export default {
  name: "admin",
  middleware: ["password-protect"],
  data: function () {
    return {
      completed: {
        id: null,
        section: null,
      },
      section: {
        id: null,
      },
    };
  },
  mounted() {
    document.addEventListener("keydown", this.handleShortcuts);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleShortcuts);
  },
  methods: {
    handleShortcuts(e) {
      // if (e.keyCode === 76) { // "l"
      if (e.keyCode === 12) {
        this.$store.dispatch("modules/user/signOut");
      }
    },

    async fetchCollection(collection) {
      let docs = [];

      const ref = this.$fireStore.collection(collection);
      const response = await ref.get();

      response.forEach((doc) => {
        docs.push(doc.data());
      });

      return { docs, ref };
    },

    async pushArrayOfDocsToCollection(collection, docsArray) {
      const ref = this.$fireStore.collection(collection);

      docsArray.forEach((doc) => {
        ref
          .add(doc)
          .then((docRef) => console.log(docRef.id))
          .catch((error) => console.error(error));
      });
    },

    async getSingleSection(sectionId) {
      const sectionRef = this.$fireStore.collection("sections").doc(sectionId);
      const doc = await sectionRef.get();
      const { featuredIn, ...docData } = doc.data();
      const section = { docId: doc.id, ...docData };
      return { sectionRef, section };
    },

    async getSingleCompleted(completedId) {
      const completedRef = this.$fireStore
        .collection("completed")
        .doc(completedId);
      const doc = await completedRef.get();
      const completed = { docId: doc.id, ...doc.data() };
      const sectionRefs = Object.values(completed.sections);
      return { completedRef, completed, sectionRefs };
    },

    async getRandomSectionByType(type) {
      // https://stackoverflow.com/a/54801398/8703073
      const sectionsRef = this.$fireStore.collection("sections");
      const randomKey = sectionsRef.doc().id;
      const query = sectionsRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .where("type", "==", type)
        .limit(1);

      let section;

      try {
        const firstResponse = await query.get();
        if (firstResponse.size > 0) {
          firstResponse.forEach((doc) => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        } else {
          const secondQuery = sectionsRef
            .where(this.$fireStoreObj.FieldPath.documentId(), "<", randomKey)
            .where("type", "==", type)
            .limit(1);
          const secondResponse = await secondQuery.get();

          secondResponse.forEach((doc) => {
            const { featuredIn, ...docData } = doc.data();
            section = { docId: doc.id, ...docData };
          });
        }
      } catch (error) {
        console.error(error);
        // this.getRandomSectionByType(type);
      }

      return section;
    },

    async makeCompletedFromSingleSection(sectionId) {
      const { sectionRef, section } = await this.getSingleSection(sectionId);

      // get two other section types NOT of section.type
      let types = ["top", "mid", "bot"];
      types = types.filter((t) => t !== section.type);

      // firestore vars
      const timestamp = this.$fireStoreObj.Timestamp.fromDate(new Date());
      const completedRef = this.$fireStore.collection("completed").doc();
      const completedId = completedRef.id;

      // meta info "contrustors"
      let thumbsObject = {};
      let titleArray = [randomWordFromString(section.title)];
      let idObject = {};

      // get random docs and push their meta info to those "constructors"
      await Promise.all(
        types.map(async (type) => {
          const otherSection = await this.getRandomSectionByType(type);
          thumbsObject[type] = otherSection.thumb;
          idObject[type] = otherSection.docId;
          titleArray.push(randomWordFromString(otherSection.title));
        })
      );

      // push the passed section's meta info to those "constrcutors"
      thumbsObject[section.type] = section.thumb;

      const completedThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      let completedPaylod = {
        title: titleArray.join(" "),
        date: timestamp,
        likes: 0,
        sections: {
          top: this.$fireStore.doc(
            `sections/${section.type === "top" ? section.docId : idObject.top}`
          ),
          mid: this.$fireStore.doc(
            `sections/${section.type === "mid" ? section.docId : idObject.mid}`
          ),
          bot: this.$fireStore.doc(
            `sections/${section.type === "bot" ? section.docId : idObject.bot}`
          ),
        },
        thumb: completedThumb,
      };

      const batch = this.$fireStore.batch();

      batch.set(completedRef, completedPaylod);

      batch.update(sectionRef, {
        featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(completedRef),
      });

      types.forEach((type) => {
        const docRef = this.$fireStore
          .collection("sections")
          .doc(idObject[type]);
        batch.update(docRef, {
          featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(completedRef),
        });
      });

      batch
        .commit()
        .then(() => console.log("Made completed drawing"))
        .catch((error) => console.error(error));
    },

    async removeCompletedAndItsReferences(completedId) {
      if (process.client) {
        if (!window.confirm("you sure?")) return this.$router.push("/admin");
      }
      // 🚨 HAVE NOT TESTED
      // get ref to this completed
      const { completedRef, sectionRefs } = await this.getSingleCompleted(
        completedId
      );

      // start batch
      const batch = this.$fireStore.batch();

      // remove ref to completed in each section
      sectionRefs.forEach((section) => {
        batch.update(section, {
          featuredIn: this.$fireStoreObj.FieldValue.arrayRemove(completedRef),
        });
      });

      // remove completed
      batch.delete(completedRef);

      // execute batch
      batch
        .commit()
        .then(() => console.log("Removed completed drawing and its references"))
        .catch((error) => console.error(error));
    },

    async removeSectionAndItsReferences(sectionId) {
      if (process.client) {
        if (!window.confirm("you sure?")) return this.$router.push("/admin");
      }
      // this section
      const sectionRef = this.$fireStore.collection("sections").doc(sectionId);
      const section = await sectionRef.get();

      // start batch
      const batch = this.$fireStore.batch();

      // remove each completed doc this section is featured in
      section.data().featuredIn.forEach((completedRef) => {
        this.removeCompletedAndItsReferences(completedRef);
      });

      // remove section
      batch.delete(sectionRef);

      // execute batch
      batch
        .commit()
        .then(() => console.log("removed section and its references"))
        .catch((error) => console.error(error));
    },

    async updateCompletedThumb(completedId) {
      // 🚨 HAVE NOT TESTED
      const { completedRef, sectionRefs } = await this.getSingleCompleted(
        completedId
      );

      let thumbsObject = {};

      sectionRefs.forEach(async (section) => {
        const doc = await this.getSingleSection(section.id);
        thumbsObject[doc.type] = doc.thumb;
      });

      const completedThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      completedRef
        .update({ thumb: completedThumb })
        .then(() => console.log("it worked!", completedThumb))
        .catch((error) => console.error(error));
    },

    signOut() {
      this.$passwordProtect.removeAuthorisation();
      this.$router.push("/");
    },
  },
};
</script>

<style lang="scss" scoped>
.admin {
  padding: 1rem;
  &:not(:first-child) {
    margin-top: 2rem;
  }
}

.input-wrap {
  display: flex;

  > * {
    width: 50%;
  }

  &:not(:first-child) {
    margin-top: 1rem;
  }
}

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
</style>
