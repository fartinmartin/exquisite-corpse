<template>
  <div class="wrap">
    <Display v-if="sections" :sections="sections" />
  </div>
</template>

<script>
import Display from "~/components/Display";
import drawings from "~/assets/js/drawings.json";

export default {
  name: "index",
  components: { Display },
  data: function() {
    return {
      sections: {
        top: drawings[1],
        mid: drawings[0],
        bot: drawings[2]
      }
    };
  },
  mounted() {
    // this.$store.dispatch("modules/gallery/fetchSections");
    // https://stackoverflow.com/questions/46798981/firestore-how-to-get-random-documents-in-a-collection
    // 🤔 generate random timestamp between date of database "birth" and now.. and find doc with closest date... 🤷‍♂️
  }
};
</script>
