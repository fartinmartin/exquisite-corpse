<template>
  <div class="wrap">
    <Panel class="admin-index">
      <h1>corpse</h1>
      <div class="input-wrap" style="flex-wrap: initial; margin-bottom: 1rem;">
        <Input
          id="section-id-for-corpse"
          v-model="corpse.section"
          placeholder="enter sectionId"
          style="flex: initial;"
        />
        <Button
          @click="makeCorpseFromSingleSection(corpse.section)"
          text="make corpse"
          style="flex: initial;"
        />
      </div>
      <div class="input-wrap">
        <Input
          id="corpse-id"
          v-model="corpse.id"
          placeholder="enter corpseId"
        />
        <Button
          color="red"
          @click="removeCorpseAndItsReferences(corpse.id)"
          text="remove"
        />
        <Button @click="updateCorpseThumb" text="update thumb" />
      </div>
    </Panel>

    <Panel class="admin-index">
      <h1>section</h1>
      <div class="input-wrap">
        <Input
          id="section-id"
          v-model="section.id"
          placeholder="enter sectionId"
          style="width: 100%;"
        />
        <Button
          color="red"
          @click="removeSectionAndItsReferences(section.id)"
          text="remove section"
        />
        <Button @click="fixTimestamp(section.id)" text="fix timestamp" />
        <Button
          @click="downloadSectionPaths(section.id)"
          text="download paths"
        />
      </div>
    </Panel>

    <Panel class="admin-index">
      <Button @click="signOut" text="sign out" />
    </Panel>
  </div>
</template>

<script>
import { mergeBase64 } from "~/assets/js/mergeImages";
import { randomWordFromString } from "~/assets/js/randomWords";

export default {
  name: "admin",

  middleware: ["password-protect"],
  data: () => ({ corpse: { id: null, section: null }, section: { id: null } }),
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

    async removeCorpseAndItsReferences(corpseId, ignoreId = 1) {
      if (process.client) {
        if (!window.confirm("you sure you want to delete corpse?"))
          return this.$router.push("/admin");
      }

      const { corpseRef, sectionRefs } = await this.getSingleCorpse(corpseId);

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
        .then(() => {
          console.log(corpseRefs, sectionRef.id);
          corpseRefs.forEach(async (corpseRef) => {
            await this.removeCorpseAndItsReferences(
              corpseRef.id,
              sectionRef.id
            );
          });
        })
        .catch((error) => console.error(error));
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

    async removeAllSectionsFromDate() {
      // TODO: make this 😈
    },

    async fixTimestamp(sectionId) {
      try {
        const { sectionRef, section } = await this.getSingleSection(sectionId);
        sectionRef.update({
          date: this.$fireStoreObj.Timestamp.fromMillis(
            section.date.seconds * 1000 + section.date.nanoseconds * 1e-6
          ),
        });
        console.log(`${section.docId}'s date updated`);
      } catch (error) {
        console.error(error);
      }
    },

    async downloadSectionPaths(sectionId) {
      try {
        const { sectionRef, section } = await this.getSingleSection(sectionId);
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(section.paths));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", section.docId + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } catch (error) {
        console.error(error);
      }
    },

    signOut() {
      this.$store.dispatch("setIsAdmin", false);
      this.$passwordProtect.removeAuthorisation();
      this.$router.push("/");
    },
  },
};
</script>

<style lang="scss">
.admin-index {
  > .content {
    align-items: stretch;
    flex-direction: column;
  }

  &:not(:first-child) {
    margin-top: 2rem;
  }

  .input-wrap {
    display: flex;
    flex-wrap: wrap;

    input {
      flex: 1 0 50%;
    }

    button {
      flex: 1;
      margin-top: 1rem;
    }

    &:not(:first-child) {
      margin-top: 1rem;
    }
  }
}
</style>
