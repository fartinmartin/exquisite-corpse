<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <Display v-if="sections" :sections="sections" />
      </div>
    </div>
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

<style lang="scss" scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
