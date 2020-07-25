<template>
  <div class="wrap">
    hello
  </div>
</template>

<script>
import sections from "~/assets/js/sections.json";

export default {
  name: "admin",
  mounted() {
    this.runFirebaseCommands();
  },
  methods: {
    async runFirebaseCommands() {
      this.pushToCollection("sections", sections);
    },

    async fetchCollection(collection) {
      let docs = [];

      const ref = this.$fireStore.collection(collection);
      const response = await ref.get();

      response.forEach(doc => {
        docs.push(doc.data());
      });

      return docs;
    },

    async pushToCollection(collection, docsArray) {
      const ref = this.$fireStore.collection(collection);

      docsArray.forEach(doc => {
        ref
          .add(doc)
          .then(docRef => console.log(docRef.id))
          .catch(error => console.error(error));
      });
    }
  }
};
</script>
