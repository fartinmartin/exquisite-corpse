<template>
  <div class="wrap">
    <div class="border yellow admin mw-canvas">
      <h1>corpse</h1>
      <div class="input-wrap">
        <input v-model="corpse.section" placeholder="enter sectionId" />
        <button
          class="button"
          @click="makeCorpseFromSingleSection(corpse.section)"
        >
          make corpse
        </button>
      </div>
      <div class="input-wrap">
        <input v-model="corpse.id" placeholder="enter corpseId" />
        <button
          class="button solid red"
          @click="removeCorpseAndItsReferences(corpse.id)"
        >
          remove
        </button>
        <button class="button" @click="updateCorpseThumb">
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
      corpse: {
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
      // keyCode === 12 = "clear"
      if (e.keyCode === 12) {
        this.$store.dispatch("modules/user/signOut");
      }
    },

    async getCollection(collection) {
      let docs = [];

      const ref = this.$fireStore.collection(collection);
      const response = await ref.get();

      response.forEach((doc) => {
        docs.push(doc.data());
      });

      return { docs, ref };
    },

    async getSingleSection(sectionId) {
      const sectionRef = this.$fireStore.collection("sections").doc(sectionId);
      const doc = await sectionRef.get();
      const { featuredIn, ...docData } = doc.data();
      const section = { docId: doc.id, ...docData };
      return { sectionRef, section };
    },

    async getSingleCorpse(corpseId) {
      const corpseRef = this.$fireStore.collection("corpses").doc(corpseId);
      const doc = await corpseRef.get();
      const corpse = { docId: doc.id, ...doc.data() };
      const sectionRefs = Object.values(corpse.sections);
      return { corpseRef, corpse, sectionRefs };
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

    async makeCorpseFromSingleSection(sectionId) {
      const { sectionRef, section } = await this.getSingleSection(sectionId);

      // get two other section types NOT of section.type
      let types = ["top", "mid", "bot"];
      types = types.filter((t) => t !== section.type);

      // firestore vars
      const timestamp = this.$fireStoreObj.Timestamp.fromDate(new Date());
      const corpseRef = this.$fireStore.collection("corpses").doc();
      const corpseId = corpseRef.id;

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

      const corpseThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      let corpsePaylod = {
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
        thumb: corpseThumb,
      };

      const batch = this.$fireStore.batch();

      batch.set(corpseRef, corpsePaylod);

      batch.update(sectionRef, {
        featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(corpseRef),
      });

      types.forEach((type) => {
        const docRef = this.$fireStore
          .collection("sections")
          .doc(idObject[type]);
        batch.update(docRef, {
          featuredIn: this.$fireStoreObj.FieldValue.arrayUnion(corpseRef),
        });
      });

      batch
        .commit()
        .then(() => console.log("Made corpse drawing"))
        .catch((error) => console.error(error));
    },

    async removeCorpseAndItsReferences(corpseId, isRef, ignoreId = 1) {
      if (process.client && !isRef) {
        if (!window.confirm("you sure you want to delete corpse?"))
          return this.$router.push("/admin");
      }

      let corpseRef, sectionRefs;

      if (!isRef) {
        const { corpseRef: cr, sectionRefs: sr } = await this.getSingleCorpse(
          corpseId
        );
        corpseRef = cr;
        sectionRefs = sr;
      } else {
        corpseRef = corpseId;
        const doc = await corpseRef.get();
        const corpse = { docId: doc.id, ...doc.data() };
        sectionRefs = Object.values(corpse.sections);
      }

      // start batch
      const batch = this.$fireStore.batch();

      // remove ref to corpse in each section
      sectionRefs.forEach((section) => {
        if (section.id !== ignoreId) {
          console.log("updating section:", section.id);
          batch.update(section, {
            featuredIn: this.$fireStoreObj.FieldValue.arrayRemove(corpseRef),
          });
        }
      });

      // remove corpse
      console.log("deleting corpse:", corpseRef.id);
      batch.delete(corpseRef);

      // execute batch
      batch
        .commit()
        .then(() => console.log("Removed corpse drawing and its references"))
        .catch((error) => console.error(error));
    },

    async removeSectionAndItsReferences(sectionId) {
      if (process.client) {
        if (!window.confirm("you sure you want to delete section?"))
          return this.$router.push("/admin");
      }
      // this section
      const sectionRef = this.$fireStore.collection("sections").doc(sectionId);
      const section = await sectionRef.get();

      const corpseRefs = Object.values(section.data().featuredIn);

      sectionRef
        .delete()
        .then(() =>
          corpseRefs.forEach(async (corpseRef) => {
            await this.removeCorpseAndItsReferences(
              corpseRef,
              true,
              sectionRef.id
            );
          })
        )
        .catch((error) => console.error(error));

      // // start batch
      // const batch = this.$fireStore.batch();

      // // for each corpse this section is featured in:
      // //   1. update "featuredIn" array for all sections that reference this corpse
      // //   2. remove the corpse doc
      // section.data().featuredIn.forEach(async (corpseRef) => {
      //   const corpse = await corpseRef.get();
      //   const sectionRefs = Object.values(corpse.data().sections);
      //   // remove ref to corpse in each section
      //   sectionRefs.forEach((section) => {
      //     batch.update(section, {
      //       featuredIn: this.$fireStoreObj.FieldValue.arrayRemove(corpseRef),
      //     });
      //   });
      //   // remove corpse
      //   batch.delete(corpseRef);
      // });

      // batch.delete(sectionRef);

      // // remove section
      // batch
      //   .commit()
      //   .then(() => console.log("removed section and its references"))
      //   .catch((error) => console.error(error));

      // // start transaction
      // this.$fireStore
      //   .runTransaction((transaction) => {
      //     // get this section
      //     transaction.get(sectionRef).then((section) => {
      //       // // for each corpse referenced in featuredIn array
      //       // section.data().featuredIn.forEach(async (corpseRef) => {
      //       //   const doc = await corpseRef.get();
      //       //   const data = { ...doc.data() };
      //       //   const sectionRefs = Object.values(data.sections);
      //       //   // remove ref to corpse in each section
      //       //   sectionRefs.forEach((section) => {
      //       //     transaction.update(section, {
      //       //       featuredIn: this.$fireStoreObj.FieldValue.arrayRemove(
      //       //         corpseRef
      //       //       ),
      //       //     });
      //       //   });
      //       //   transaction.delete(corpseRef);
      //       // });
      //       // transaction.delete(sectionRef);
      //     });
      //   })
      //   .then(() => console.log("Transaction successfully committed!"))
      //   .catch((error) => console.log("Transaction failed: ", error));
    },

    async updateCorpseThumb(corpseId) {
      const { corpseRef, sectionRefs } = await this.getSingleCorpse(corpseId);

      let thumbsObject = {};

      sectionRefs.forEach(async (section) => {
        const doc = await this.getSingleSection(section.id);
        thumbsObject[doc.type] = doc.thumb;
      });

      const corpseThumb = await mergeBase64([
        thumbsObject.top,
        thumbsObject.mid,
        thumbsObject.bot,
      ]);

      corpseRef
        .update({ thumb: corpseThumb })
        .then(() => console.log("it worked!", corpseThumb))
        .catch((error) => console.error(error));
    },

    async removeAllFeaturedInRefs() {
      const batch = this.$fireStore.batch();

      const sectionsRef = this.$fireStore.collection("sections");
      const query = await sectionsRef.get();
      query.forEach((doc) => {
        batch.update(doc.ref, {
          featuredIn: this.$fireStoreObj.FieldValue.delete(),
        });
      });

      batch
        .commit()
        .then(() => console.log("removed section and its references"))
        .catch((error) => console.error(error));
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
