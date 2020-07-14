<template>
  <div class="wrap">
    <Display v-if="sections" :sections="sections" />
  </div>
</template>

<script>
import Display from "~/components/Display";
import drawings from "~/assets/js/ecc.json";

export default {
  name: "index",
  components: { Display },
  data: function() {
    return {
      sections: {
        top: drawings[2],
        mid: drawings[1],
        bot: drawings[0]
      }
    };
  },
  mounted() {
    // https://stackoverflow.com/questions/46798981/firestore-how-to-get-random-documents-in-a-collection
    // 🤔 generate random timestamp between date of database "birth" and now.. and find doc with closest date... 🤷‍♂️
  }
};
</script>
