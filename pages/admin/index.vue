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
          class="button"
          @click="removeCompletedAndItsReferences(completed.id)"
        >
          remove completed
        </button>
      </div>
    </div>
    <div class="border yellow admin mw-canvas">
      <h1>section</h1>
      <div class="input-wrap">
        <input v-model="section.id" placeholder="enter docId" />
        <button
          class="button"
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
  methods: {
    async fetchCollection(collection) {
      let docs = [];

      const ref = this.$fireStore.collection(collection);
      const response = await ref.get();

      response.forEach((doc) => {
        docs.push(doc.data());
      });

      return docs;
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
      return { docId: doc.id, ...docData };
    },

    async getRandomSectionByType(type) {
      // https://stackoverflow.com/a/54801398/8703073
      const sectionsRef = this.$fireStore.collection("sections");
      const randomKey = sectionsRef.doc().id;
      const query = sectionsRef
        .where(this.$fireStoreObj.FieldPath.documentId(), ">=", randomKey)
        .where("type", "==", type)
        .limit(1);
      const firstResponse = await query.get();

      let section;

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

      return section;
    },

    async makeCompletedFromSingleSection(sectionId) {
      const section = await this.getSingleSection(sectionId);

      // get two other section types NOT of section.type
      let types = ["top", "mid", "bot"];
      types = types.filter((t) => t !== section.type);

      // firestore vars
      const timestamp = this.$fireStoreObj.Timestamp.fromDate(new Date());
      const completedRef = this.$fireStore.collection("completed").doc();
      const completedId = completedRef.id;

      // meta info "contrustors"
      let thumbsObject = {};
      let titleArray = [this.randomWordFromString(section.title)];
      let idObject = {};

      // get random docs and push their meta info to those "constructors"
      await Promise.all(
        types.map(async (type) => {
          const otherSection = await this.getRandomSectionByType(type);
          thumbsObject[type] = otherSection.thumb;
          idObject[type] = otherSection.docId;
          titleArray.push(this.randomWordFromString(otherSection.title));
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

      types.forEach((type) => {
        const docRef = this.$fireStore
          .collection("sections")
          .doc(idObject[type]);
        batch.update(docRef, {
          featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(
            this.$fireStore.doc(`completed/${completedId}`)
          ),
        });
      });

      batch
        .commit()
        .then(() => console.log("Made completed drawing"))
        .catch((error) => console.error(error));
    },

    async removeCompletedAndItsReferences(completedId) {
      // get ref to this completed
      const completedRef = this.$fireStore
        .collection("completed")
        .doc(completedId);
      const completed = await completedRef.get();
      const sections = Object.values(completed.data().sections);

      // start batch
      const batch = this.$fireStore.batch();

      sections.forEach((section) => {
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
      // this section
      const sectionRef = this.$fireStore.collection("sections").doc(sectionId);
      const section = await sectionRef.get();

      // start batch
      const batch = this.$fireStore.batch();

      // remove each completed doc this section is featured in
      section.data().featuredIn.forEach((completedRef) => {
        batch.delete(completedRef);
      });

      // remove section
      batch.delete(sectionRef);

      // execute batch
      batch
        .commit()
        .then(() => console.log("Removed section and its references"))
        .catch((error) => console.error(error));
    },

    randomWordFromString(string) {
      const stringAsArray = string.split(" ");
      return stringAsArray[Math.floor(Math.random() * stringAsArray.length)];
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
